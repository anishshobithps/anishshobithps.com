import { ENV } from "varlock/env";
import { unstable_cache } from "next/cache";
import { siteConfig } from "@repo/site-config";
import { posthogHosts, posthogRegion } from "@/lib/analytics/hosts";
import type { AnalyticsEvents } from "@/lib/analytics/events";
import {
  ANALYTICS_TIMEZONE,
  fillDays,
  type AnalyticsWindow,
} from "@/lib/admin-analytics/range";

const REVALIDATE_SECONDS = 300;

export type PostHogResult<T> =
  | { status: "ok"; data: T }
  | { status: "unconfigured" }
  | { status: "error"; message: string };

type Row = Array<string | number | null>;

function credentials() {
  const apiKey = ENV.POSTHOG_PERSONAL_API_KEY;
  const projectId = ENV.POSTHOG_PROJECT_ID;
  return apiKey && projectId ? { apiKey, projectId } : null;
}

export function posthogAppUrl(path = ""): string {
  const host = posthogHosts(posthogRegion(ENV.NEXT_PUBLIC_POSTHOG_REGION)).ui;
  const projectId = ENV.POSTHOG_PROJECT_ID;
  return projectId ? `${host}/project/${projectId}${path}` : host;
}

const MAX_CONCURRENT_QUERIES = 3;
const QUERY_TIMEOUT_MS = 9_000;
const WINDOW_STEP_SECONDS = 300;

let activeQueries = 0;
const waitingQueries: Array<() => void> = [];

async function withQuerySlot<T>(task: () => Promise<T>): Promise<T> {
  if (activeQueries < MAX_CONCURRENT_QUERIES) {
    activeQueries++;
  } else {
    await new Promise<void>((resolve) => waitingQueries.push(resolve));
  }
  try {
    return await task();
  } finally {
    const next = waitingQueries.shift();
    if (next) next();
    else activeQueries--;
  }
}

class PostHogQueryError extends Error {}

const cachedQuery = unstable_cache(
  async (query: string): Promise<Row[]> => {
    const creds = credentials();
    if (!creds) throw new PostHogQueryError("PostHog isn't configured");
    const host = posthogHosts(posthogRegion(ENV.NEXT_PUBLIC_POSTHOG_REGION)).ui;
    const response = await withQuerySlot(() =>
      fetch(`${host}/api/projects/${creds.projectId}/query/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${creds.apiKey}`,
        },
        body: JSON.stringify({
          name: "admin dashboard",
          query: { kind: "HogQLQuery", query },
        }),
        signal: AbortSignal.timeout(QUERY_TIMEOUT_MS),
      }),
    );
    if (response.status === 401 || response.status === 403) {
      throw new PostHogQueryError(
        "PostHog rejected the API key. Check that POSTHOG_PERSONAL_API_KEY has the Query: Read scope for this project.",
      );
    }
    if (response.status === 429) {
      throw new PostHogQueryError(
        "PostHog's query limit was reached. Try again in a minute.",
      );
    }
    if (!response.ok) {
      throw new PostHogQueryError(`PostHog answered ${response.status}`);
    }
    const body = (await response.json()) as { results?: Row[] };
    return body.results ?? [];
  },
  ["admin-posthog-query"],
  { revalidate: REVALIDATE_SECONDS, tags: ["admin-analytics"] },
);

async function runQuery(query: string): Promise<PostHogResult<Row[]>> {
  if (!credentials()) return { status: "unconfigured" };
  try {
    return { status: "ok", data: await cachedQuery(query) };
  } catch (error) {
    const timedOut =
      error instanceof Error &&
      (error.name === "TimeoutError" || error.name === "AbortError");
    return {
      status: "error",
      message: timedOut
        ? "PostHog took too long to answer. Try again in a minute."
        : error instanceof Error
          ? error.message
          : "PostHog request failed",
    };
  }
}

function seconds(date: Date): number {
  const exact = Math.floor(date.getTime() / 1000);
  return exact - (exact % WINDOW_STEP_SECONDS);
}

function siteFilter(): string {
  const hosts = [siteConfig.domain, `www.${siteConfig.domain}`]
    .map((host) => `'${host.replace(/'/g, "")}'`)
    .join(", ");
  return `(properties.$host IN (${hosts}) OR properties.source = 'server')`;
}

function since(date: Date): string {
  return `timestamp >= fromUnixTimestamp(${seconds(date)})`;
}

function num(value: string | number | null | undefined): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function text(value: string | number | null | undefined): string {
  return value === null || value === undefined || value === ""
    ? "(none)"
    : String(value);
}

function map<I, T>(
  result: PostHogResult<I>,
  transform: (data: I) => T,
): PostHogResult<T> {
  return result.status === "ok"
    ? { status: "ok", data: transform(result.data) }
    : result;
}

export interface WebVitals {
  lcp: number | null;
  inp: number | null;
  cls: number | null;
  fcp: number | null;
  samples: number;
}

export interface BehaviorSummary {
  pageviews: number;
  visitors: number;
  sessions: number;
  previous: { pageviews: number; visitors: number; sessions: number };
  exceptions: number;
  rageClicks: number;
  deadClicks: number;
  recentVisitors: number;
  vitals: WebVitals;
}

function maybeNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function getBehaviorSummary(
  window: AnalyticsWindow,
): Promise<PostHogResult<BehaviorSummary>> {
  const from = `fromUnixTimestamp(${seconds(window.from)})`;
  const vital = (metric: string) =>
    `quantileIf(0.75)(toFloat(properties.$web_vitals_${metric}_value), event = '$web_vitals' AND timestamp >= ${from})`;
  const result = await runQuery(`
    SELECT
      countIf(event = '$pageview' AND timestamp >= ${from}),
      uniqIf(person_id, event = '$pageview' AND timestamp >= ${from}),
      uniqIf(properties.$session_id, timestamp >= ${from}),
      countIf(event = '$pageview' AND timestamp < ${from}),
      uniqIf(person_id, event = '$pageview' AND timestamp < ${from}),
      uniqIf(properties.$session_id, timestamp < ${from}),
      countIf(event = '$exception' AND timestamp >= ${from}),
      countIf(event = '$rageclick' AND timestamp >= ${from}),
      countIf(event = '$dead_click' AND timestamp >= ${from}),
      uniqIf(person_id, timestamp >= now() - INTERVAL 30 MINUTE),
      ${vital("LCP")},
      ${vital("INP")},
      ${vital("CLS")},
      ${vital("FCP")},
      countIf(event = '$web_vitals' AND timestamp >= ${from})
    FROM events
    WHERE ${since(window.previousFrom)} AND ${siteFilter()}
  `);
  return map(result, ([row = []]) => ({
    pageviews: num(row[0]),
    visitors: num(row[1]),
    sessions: num(row[2]),
    previous: {
      pageviews: num(row[3]),
      visitors: num(row[4]),
      sessions: num(row[5]),
    },
    exceptions: num(row[6]),
    rageClicks: num(row[7]),
    deadClicks: num(row[8]),
    recentVisitors: num(row[9]),
    vitals: {
      lcp: maybeNumber(row[10]),
      inp: maybeNumber(row[11]),
      cls: maybeNumber(row[12]),
      fcp: maybeNumber(row[13]),
      samples: num(row[14]),
    },
  }));
}

interface Part {
  kind: string;
  sql: string;
}

interface PackedRow {
  label: string;
  a: number | null;
  b: number | null;
  c: number | null;
  d: number | null;
}

function part(
  kind: string,
  columns: { label: string; a: string; b?: string; c?: string; d?: string },
  rest: string,
): Part {
  return {
    kind,
    sql: `
      SELECT
        '${kind}' AS kind,
        toString(${columns.label}) AS label,
        toFloat(${columns.a}) AS a,
        toFloat(${columns.b ?? "0"}) AS b,
        toFloat(${columns.c ?? "0"}) AS c,
        toFloat(${columns.d ?? "0"}) AS d
      ${rest}`,
  };
}

async function runPacked(
  parts: Part[],
): Promise<PostHogResult<Map<string, PackedRow[]>>> {
  const result = await runQuery(`
    SELECT kind, label, a, b, c, d FROM (
      ${parts.map((item) => item.sql).join("\n      UNION ALL\n")}
    )
  `);
  return map(result, (rows) => {
    const grouped = new Map<string, PackedRow[]>(
      parts.map((item) => [item.kind, []]),
    );
    for (const row of rows) {
      grouped.get(String(row[0]))?.push({
        label: text(row[1]),
        a: maybeNumber(row[2]),
        b: maybeNumber(row[3]),
        c: maybeNumber(row[4]),
        d: maybeNumber(row[5]),
      });
    }
    return grouped;
  });
}

function rowsOf(packed: Map<string, PackedRow[]>, kind: string): PackedRow[] {
  return packed.get(kind) ?? [];
}

function byA(rows: PackedRow[]): PackedRow[] {
  return rows.toSorted((x, y) => num(y.a) - num(x.a));
}

function scope(window: AnalyticsWindow): string {
  return `${since(window.from)} AND ${siteFilter()}`;
}

const TRACKED_EVENTS = [
  "post_read",
  "post_finished",
  "post_reaction_set",
  "comment_posted",
  "guestbook_signed",
  "outbound_link_clicked",
  "email_copied",
  "command_menu_opened",
  "command_menu_command",
  "theme_changed",
  "sound_toggled",
  "blog_list_filtered",
  "logo_downloaded",
  "sign_in_opened",
  "short_link_followed",
  "resume_downloaded",
] as const satisfies ReadonlyArray<
  keyof AnalyticsEvents | "short_link_followed" | "resume_downloaded"
>;

const seriesPart = (window: AnalyticsWindow) =>
  part(
    "series",
    {
      label: `toDate(toTimeZone(timestamp, '${ANALYTICS_TIMEZONE}'))`,
      a: "countIf(event = '$pageview')",
      b: "uniqIf(person_id, event = '$pageview')",
      c: "countIf(event = '$exception')",
    },
    `FROM events WHERE ${scope(window)} GROUP BY label`,
  );

const eventsPart = (window: AnalyticsWindow) =>
  part(
    "events",
    { label: "event", a: "count()", b: "uniq(person_id)" },
    `FROM events WHERE ${scope(window)} AND event IN (${TRACKED_EVENTS.map((name) => `'${name}'`).join(", ")}) GROUP BY label`,
  );

const completionPart = (window: AnalyticsWindow) =>
  part(
    "completion",
    {
      label: "properties.slug",
      a: "uniqIf(person_id, event = 'post_read')",
      b: "uniqIf(person_id, event = 'post_finished')",
    },
    `FROM events WHERE event IN ('post_read', 'post_finished') AND ${scope(window)} GROUP BY label ORDER BY a DESC LIMIT 10`,
  );

const pagesPart = (window: AnalyticsWindow) =>
  part(
    "pages",
    {
      label: "properties.$pathname",
      a: "countIf(event = '$pageview')",
      b: "uniqIf(person_id, event = '$pageview')",
      c: "avgIf(toFloat(properties.$prev_pageview_max_scroll_percentage), event = '$pageleave')",
      d: "avgIf(toFloat(properties.$prev_pageview_duration), event = '$pageleave')",
    },
    `FROM events WHERE event IN ('$pageview', '$pageleave') AND ${scope(window)} GROUP BY label ORDER BY a DESC LIMIT 10`,
  );

const peoplePart = (kind: string, property: string, window: AnalyticsWindow) =>
  part(
    kind,
    { label: `properties.${property}`, a: "uniq(person_id)" },
    `FROM events WHERE event = '$pageview' AND ${scope(window)} GROUP BY label ORDER BY a DESC LIMIT 8`,
  );

const outboundPart = (window: AnalyticsWindow) =>
  part(
    "outbound",
    { label: "properties.host", a: "count()" },
    `FROM events WHERE event = 'outbound_link_clicked' AND ${scope(window)} GROUP BY label ORDER BY a DESC LIMIT 8`,
  );

const errorsPart = (window: AnalyticsWindow) =>
  part(
    "errors",
    {
      label:
        "coalesce(nullIf(JSONExtractString(properties.$exception_values, 1), ''), nullIf(toString(properties.$exception_message), ''), 'Unknown error')",
      a: "count()",
      d: "toUnixTimestamp(max(timestamp))",
    },
    `FROM events WHERE event = '$exception' AND ${scope(window)} GROUP BY label ORDER BY a DESC LIMIT 6`,
  );

interface BehaviorDay {
  date: string;
  pageviews: number;
  visitors: number;
  errors: number;
}

interface EventCount {
  event: string;
  count: number;
  people: number;
}

interface PageEngagement {
  path: string;
  views: number;
  visitors: number;
  scroll: number | null;
  seconds: number | null;
}

interface PostCompletion {
  slug: string;
  readers: number;
  finishers: number;
}

interface Breakdown {
  label: string;
  value: number;
}

interface ErrorGroup {
  message: string;
  count: number;
  lastSeen: string;
}

function toSeries(window: AnalyticsWindow, rows: PackedRow[]): BehaviorDay[] {
  return fillDays(
    window,
    rows.map((row) => ({
      date: row.label,
      pageviews: num(row.a),
      visitors: num(row.b),
      errors: num(row.c),
    })),
    { pageviews: 0, visitors: 0, errors: 0 },
  );
}

function toPages(rows: PackedRow[]): PageEngagement[] {
  return byA(rows).map((row) => ({
    path: row.label,
    views: num(row.a),
    visitors: num(row.b),
    scroll: row.c,
    seconds: row.d,
  }));
}

function toBreakdown(rows: PackedRow[]): Breakdown[] {
  return byA(rows).map((row) => ({ label: row.label, value: num(row.a) }));
}

export interface Traffic {
  series: BehaviorDay[];
  pages: PageEngagement[];
}

export async function getTraffic(
  window: AnalyticsWindow,
): Promise<PostHogResult<Traffic>> {
  const result = await runPacked([seriesPart(window), pagesPart(window)]);
  return map(result, (packed) => ({
    series: toSeries(window, rowsOf(packed, "series")),
    pages: toPages(rowsOf(packed, "pages")),
  }));
}

export interface BehaviorActivity {
  series: BehaviorDay[];
  events: EventCount[];
  completion: PostCompletion[];
}

export async function getBehaviorActivity(
  window: AnalyticsWindow,
): Promise<PostHogResult<BehaviorActivity>> {
  const result = await runPacked([
    seriesPart(window),
    eventsPart(window),
    completionPart(window),
  ]);
  return map(result, (packed) => ({
    series: toSeries(window, rowsOf(packed, "series")),
    events: byA(rowsOf(packed, "events")).map((row) => ({
      event: row.label,
      count: num(row.a),
      people: num(row.b),
    })),
    completion: byA(rowsOf(packed, "completion")).map((row) => ({
      slug: row.label,
      readers: num(row.a),
      finishers: num(row.b),
    })),
  }));
}

export interface BehaviorDetail {
  pages: PageEngagement[];
  referrers: Breakdown[];
  devices: Breakdown[];
  themes: Breakdown[];
  outbound: Breakdown[];
  errors: ErrorGroup[];
}

export async function getBehaviorDetail(
  window: AnalyticsWindow,
): Promise<PostHogResult<BehaviorDetail>> {
  const result = await runPacked([
    pagesPart(window),
    peoplePart("referrers", "$referring_domain", window),
    peoplePart("devices", "$device_type", window),
    peoplePart("themes", "theme_resolved", window),
    outboundPart(window),
    errorsPart(window),
  ]);
  return map(result, (packed) => ({
    pages: toPages(rowsOf(packed, "pages")),
    referrers: toBreakdown(rowsOf(packed, "referrers")),
    devices: toBreakdown(rowsOf(packed, "devices")),
    themes: toBreakdown(rowsOf(packed, "themes")),
    outbound: toBreakdown(rowsOf(packed, "outbound")),
    errors: byA(rowsOf(packed, "errors")).map((row) => ({
      message: row.label,
      count: num(row.a),
      lastSeen: row.d ? new Date(row.d * 1000).toISOString() : "",
    })),
  }));
}
