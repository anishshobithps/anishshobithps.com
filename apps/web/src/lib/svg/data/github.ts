import { ENV } from "varlock/env";
import { siteConfig } from "@repo/site-config";

const GITHUB_USER = siteConfig.githubRepo.split("/")[0];

const TIMEOUT_MS = 5000;

const API = "https://api.github.com";
const PAGE_SIZE = 100;

async function github<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": siteConfig.domain,
      ...(ENV.GITHUB_TOKEN
        ? { Authorization: `Bearer ${ENV.GITHUB_TOKEN}` }
        : {}),
    },
  });
  if (!res.ok) throw new Error(`GitHub ${path} responded ${res.status}`);
  return res.json() as Promise<T>;
}

interface SearchPage<T> {
  total_count: number;
  items: T[];
}

async function searchCommits<T>(query: string, pages: number) {
  const fetchPage = (page: number) => {
    const params = new URLSearchParams({
      q: query,
      per_page: String(PAGE_SIZE),
      page: String(page),
      sort: "author-date",
      order: "desc",
    });
    return github<SearchPage<T>>(`/search/commits?${params}`);
  };

  const first = await fetchPage(1);
  const available = Math.ceil(first.total_count / PAGE_SIZE);
  const rest = await Promise.all(
    Array.from({ length: Math.min(pages, available) - 1 }, (_, i) =>
      fetchPage(i + 2),
    ),
  );
  return [first, ...rest].flatMap((page) => page.items);
}

interface CommitSearchItem {
  commit: { author: { date: string } };
}

export async function loadCommitTimes(pages: number) {
  const items = await searchCommits<CommitSearchItem>(
    `author:${GITHUB_USER} is:public`,
    pages,
  );
  return items.map((item) => item.commit.author.date);
}

async function graphql<T>(query: string, variables: Record<string, unknown>) {
  const token = ENV.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN is not set");

  const res = await fetch(`${API}/graphql`, {
    method: "POST",
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": siteConfig.domain,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`GitHub GraphQL responded ${res.status}`);
  const json = (await res.json()) as { data?: T; errors?: { message: string }[] };
  if (!json.data || json.errors?.length) {
    throw new Error(`GitHub GraphQL: ${json.errors?.[0]?.message ?? "no data"}`);
  }
  return json.data;
}

const CALENDAR_QUERY = `query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date weekday contributionCount contributionLevel } }
      }
    }
  }
}`;

const LEVELS: Record<string, number> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

export interface CalendarDay {
  date: string;
  weekday: number;
  count: number;
  level: number;
}

export interface Calendar {
  total: number;
  weeks: CalendarDay[][];
}

interface CalendarResponse {
  user: {
    contributionsCollection: {
      contributionCalendar: {
        totalContributions: number;
        weeks: {
          contributionDays: {
            date: string;
            weekday: number;
            contributionCount: number;
            contributionLevel: string;
          }[];
        }[];
      };
    };
  } | null;
}

async function calendarFromGraphQL(): Promise<Calendar> {
  const { user } = await graphql<CalendarResponse>(CALENDAR_QUERY, {
    login: GITHUB_USER,
  });
  if (!user) throw new Error(`No GitHub user ${GITHUB_USER}`);
  const calendar = user.contributionsCollection.contributionCalendar;
  return {
    total: calendar.totalContributions,
    weeks: calendar.weeks.map((week) =>
      week.contributionDays.map((day) => ({
        date: day.date,
        weekday: day.weekday,
        count: day.contributionCount,
        level: LEVELS[day.contributionLevel] ?? 0,
      })),
    ),
  };
}

const TOOLTIP = /<tool-tip\b[^>]*\bfor="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g;
const DAY_CELL = /<td\b[^>]*\bdata-date="[^"]+"[^>]*>/g;

/**
 * Reads the contribution graph GitHub renders on profile pages: one cell per
 * day with its date and level, and a tooltip per cell with the count
 * ("12 contributions on March 4th.", "No contributions on …").
 */
export function parseContributionsPage(html: string): Calendar {
  const counts = new Map<string, number>();
  for (const [, id = "", text = ""] of html.matchAll(TOOLTIP)) {
    const count = text.match(/^\s*([\d,]+) contributions?\b/)?.[1];
    counts.set(id, count ? Number(count.replace(/,/g, "")) : 0);
  }

  const days: CalendarDay[] = [];
  for (const [cell] of html.matchAll(DAY_CELL)) {
    const date = cell.match(/\bdata-date="(\d{4}-\d{2}-\d{2})"/)?.[1];
    const id = cell.match(/\bid="([^"]+)"/)?.[1];
    if (!date) continue;
    days.push({
      date,
      weekday: new Date(`${date}T00:00:00Z`).getUTCDay(),
      count: id ? (counts.get(id) ?? 0) : 0,
      level: Number(cell.match(/\bdata-level="(\d)"/)?.[1] ?? 0),
    });
  }
  if (!days.length || !counts.size) {
    throw new Error("GitHub's contribution graph has changed shape");
  }

  days.sort((a, b) => a.date.localeCompare(b.date));
  const weeks: CalendarDay[][] = [];
  for (const day of days) {
    if (day.weekday === 0 || !weeks.length) weeks.push([]);
    weeks.at(-1)?.push(day);
  }
  return { total: days.reduce((sum, day) => sum + day.count, 0), weeks };
}

async function calendarFromProfile(): Promise<Calendar> {
  const res = await fetch(`https://github.com/users/${GITHUB_USER}/contributions`, {
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { "User-Agent": siteConfig.domain },
  });
  if (!res.ok) throw new Error(`GitHub contributions page responded ${res.status}`);
  return parseContributionsPage(await res.text());
}

/**
 * GraphQL when a token is set, since it's the documented API. Without one, or
 * if the token is rejected, the public profile graph has the same numbers.
 */
export async function loadCalendar(): Promise<Calendar> {
  if (ENV.GITHUB_TOKEN) {
    try {
      return await calendarFromGraphQL();
    } catch (error) {
      console.warn("[svg] calendar: GraphQL failed, reading the profile graph instead:", error);
    }
  }
  return calendarFromProfile();
}

/**
 * Streaks over a calendar that ends today. An empty today doesn't break the
 * current streak, since the day isn't over yet.
 */
export function summarizeCalendar(days: CalendarDay[]) {
  let longest = 0;
  let run = 0;
  let best: CalendarDay | null = null;
  let active = 0;
  for (const day of days) {
    run = day.count > 0 ? run + 1 : 0;
    longest = Math.max(longest, run);
    if (day.count > 0) active += 1;
    if (day.count > 0 && (!best || day.count > best.count)) best = day;
  }

  const end = days.at(-1)?.count === 0 ? days.length - 1 : days.length;
  let current = 0;
  for (let i = end - 1; i >= 0 && days[i].count > 0; i--) current += 1;

  return { current, longest, best, active };
}

interface Release {
  tag: string;
  publishedAt: string;
  downloads: number;
}

export interface ReleaseHistory {
  repo: string;
  createdAt: string;
  builds: number;
  releases: Release[];
}

interface ReleaseResponse {
  tag_name: string;
  published_at: string | null;
  draft: boolean;
  assets: { download_count: number }[];
}

export async function loadReleases(fullName: string): Promise<ReleaseHistory> {
  const [repo, list] = await Promise.all([
    github<{ created_at: string }>(`/repos/${fullName}`),
    github<ReleaseResponse[]>(`/repos/${fullName}/releases?per_page=${PAGE_SIZE}`),
  ]);
  const releases = list
    .filter((release) => !release.draft && release.published_at)
    .map((release) => ({
      tag: release.tag_name,
      publishedAt: release.published_at as string,
      downloads: release.assets.reduce((sum, asset) => sum + asset.download_count, 0),
    }))
    .sort((a, b) => a.publishedAt.localeCompare(b.publishedAt));

  const latestNumber = Number(releases.at(-1)?.tag.match(/\d+/)?.[0]);
  return {
    repo: fullName,
    createdAt: repo.created_at,
    builds: Number.isFinite(latestNumber) && latestNumber >= releases.length
      ? latestNumber
      : releases.length,
    releases,
  };
}
