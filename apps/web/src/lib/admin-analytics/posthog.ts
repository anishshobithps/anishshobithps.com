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

const runQuery = unstable_cache(
  async (query: string): Promise<PostHogResult<Row[]>> => {
    const creds = credentials();
    if (!creds) return { status: "unconfigured" };
    const host = posthogHosts(posthogRegion(ENV.NEXT_PUBLIC_POSTHOG_REGION)).ui;
    try {
      const response = await fetch(
        `${host}/api/projects/${creds.projectId}/query/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${creds.apiKey}`,
          },
          body: JSON.stringify({
            name: "admin dashboard",
            query: { kind: "HogQLQuery", query },
          }),
        },
      );
      if (!response.ok) {
        return {
          status: "error",
          message: `PostHog answered ${response.status}`,
        };
      }
      const body = (await response.json()) as { results?: Row[] };
      return { status: "ok", data: body.results ?? [] };
    } catch (error) {
      return {
        status: "error",
        message:
          error instanceof Error ? error.message : "PostHog request failed",
      };
    }
  },
  ["admin-posthog-query"],
  { revalidate: REVALIDATE_SECONDS, tags: ["admin-analytics"] },
);

function seconds(date: Date): number {
  return Math.floor(date.getTime() / 1000);
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

function map<T>(
  result: PostHogResult<Row[]>,
  transform: (rows: Row[]) => T,
): PostHogResult<T> {
  return result.status === "ok"
    ? { status: "ok", data: transform(result.data) }
    : result;
}

export interface BehaviorSummary {
  pageviews: number;
  visitors: number;
  sessions: number;
  previous: { pageviews: number; visitors: number; sessions: number };
  exceptions: number;
  rageClicks: number;
  deadClicks: number;
}

export async function getBehaviorSummary(
  window: AnalyticsWindow,
): Promise<PostHogResult<BehaviorSummary>> {
  const from = seconds(window.from);
  const result = await runQuery(`
    SELECT
      countIf(event = '$pageview' AND timestamp >= fromUnixTimestamp(${from})),
      uniqIf(person_id, event = '$pageview' AND timestamp >= fromUnixTimestamp(${from})),
      uniqIf(properties.$session_id, timestamp >= fromUnixTimestamp(${from})),
      countIf(event = '$pageview' AND timestamp < fromUnixTimestamp(${from})),
      uniqIf(person_id, event = '$pageview' AND timestamp < fromUnixTimestamp(${from})),
      uniqIf(properties.$session_id, timestamp < fromUnixTimestamp(${from})),
      countIf(event = '$exception' AND timestamp >= fromUnixTimestamp(${from})),
      countIf(event = '$rageclick' AND timestamp >= fromUnixTimestamp(${from})),
      countIf(event = '$dead_click' AND timestamp >= fromUnixTimestamp(${from}))
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
  }));
}

export async function getRecentVisitors(): Promise<PostHogResult<number>> {
  const result = await runQuery(`
    SELECT uniq(person_id)
    FROM events
    WHERE timestamp >= now() - INTERVAL 30 MINUTE AND ${siteFilter()}
  `);
  return map(result, ([row = []]) => num(row[0]));
}

export interface BehaviorDay {
  date: string;
  pageviews: number;
  visitors: number;
  errors: number;
}

export async function getBehaviorSeries(
  window: AnalyticsWindow,
): Promise<PostHogResult<BehaviorDay[]>> {
  const result = await runQuery(`
    SELECT
      toString(toDate(toTimeZone(timestamp, '${ANALYTICS_TIMEZONE}'))) AS day,
      countIf(event = '$pageview'),
      uniqIf(person_id, event = '$pageview'),
      countIf(event = '$exception')
    FROM events
    WHERE ${since(window.from)} AND ${siteFilter()}
    GROUP BY day
    ORDER BY day
  `);
  return map(result, (rows) =>
    fillDays(
      window,
      rows.map((row) => ({
        date: String(row[0]),
        pageviews: num(row[1]),
        visitors: num(row[2]),
        errors: num(row[3]),
      })),
      { pageviews: 0, visitors: 0, errors: 0 },
    ),
  );
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

export interface EventCount {
  event: string;
  count: number;
  people: number;
}

export async function getEventCounts(
  window: AnalyticsWindow,
): Promise<PostHogResult<EventCount[]>> {
  const names = TRACKED_EVENTS.map((name) => `'${name}'`).join(", ");
  const result = await runQuery(`
    SELECT event, count(), uniq(person_id)
    FROM events
    WHERE ${since(window.from)} AND ${siteFilter()} AND event IN (${names})
    GROUP BY event
    ORDER BY count() DESC
  `);
  return map(result, (rows) =>
    rows.map((row) => ({
      event: String(row[0]),
      count: num(row[1]),
      people: num(row[2]),
    })),
  );
}

export interface WebVitals {
  lcp: number | null;
  inp: number | null;
  cls: number | null;
  fcp: number | null;
  samples: number;
}

export async function getWebVitals(
  window: AnalyticsWindow,
): Promise<PostHogResult<WebVitals>> {
  const p75 = (metric: string) =>
    `quantile(0.75)(toFloat(properties.$web_vitals_${metric}_value))`;
  const result = await runQuery(`
    SELECT ${p75("LCP")}, ${p75("INP")}, ${p75("CLS")}, ${p75("FCP")}, count()
    FROM events
    WHERE event = '$web_vitals' AND ${since(window.from)} AND ${siteFilter()}
  `);
  const maybe = (value: string | number | null | undefined) => {
    if (value === null || value === undefined) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };
  return map(result, ([row = []]) => ({
    lcp: maybe(row[0]),
    inp: maybe(row[1]),
    cls: maybe(row[2]),
    fcp: maybe(row[3]),
    samples: num(row[4]),
  }));
}

export interface PageEngagement {
  path: string;
  views: number;
  visitors: number;
  scroll: number | null;
  seconds: number | null;
}

export async function getPageEngagement(
  window: AnalyticsWindow,
): Promise<PostHogResult<PageEngagement[]>> {
  const result = await runQuery(`
    SELECT
      properties.$pathname AS path,
      countIf(event = '$pageview') AS views,
      uniqIf(person_id, event = '$pageview'),
      avgIf(toFloat(properties.$prev_pageview_max_scroll_percentage), event = '$pageleave'),
      avgIf(toFloat(properties.$prev_pageview_duration), event = '$pageleave')
    FROM events
    WHERE event IN ('$pageview', '$pageleave') AND ${since(window.from)} AND ${siteFilter()}
    GROUP BY path
    ORDER BY views DESC
    LIMIT 10
  `);
  return map(result, (rows) =>
    rows.map((row) => ({
      path: text(row[0]),
      views: num(row[1]),
      visitors: num(row[2]),
      scroll: row[3] === null ? null : num(row[3]),
      seconds: row[4] === null ? null : num(row[4]),
    })),
  );
}

export interface PostCompletion {
  slug: string;
  readers: number;
  finishers: number;
}

export async function getPostCompletion(
  window: AnalyticsWindow,
): Promise<PostHogResult<PostCompletion[]>> {
  const result = await runQuery(`
    SELECT
      properties.slug AS slug,
      uniqIf(person_id, event = 'post_read') AS readers,
      uniqIf(person_id, event = 'post_finished')
    FROM events
    WHERE event IN ('post_read', 'post_finished') AND ${since(window.from)} AND ${siteFilter()}
    GROUP BY slug
    ORDER BY readers DESC
    LIMIT 10
  `);
  return map(result, (rows) =>
    rows.map((row) => ({
      slug: text(row[0]),
      readers: num(row[1]),
      finishers: num(row[2]),
    })),
  );
}

export interface Breakdown {
  label: string;
  value: number;
}

export async function getBreakdown(
  window: AnalyticsWindow,
  property:
    | "$referring_domain"
    | "$device_type"
    | "$browser"
    | "$geoip_country_code"
    | "theme_resolved"
    | "sound_enabled",
  event = "$pageview",
): Promise<PostHogResult<Breakdown[]>> {
  const result = await runQuery(`
    SELECT toString(properties.${property}) AS label, uniq(person_id) AS people
    FROM events
    WHERE event = '${event}' AND ${since(window.from)} AND ${siteFilter()}
    GROUP BY label
    ORDER BY people DESC
    LIMIT 8
  `);
  return map(result, (rows) =>
    rows.map((row) => ({ label: text(row[0]), value: num(row[1]) })),
  );
}

export async function getOutboundLinks(
  window: AnalyticsWindow,
): Promise<PostHogResult<Breakdown[]>> {
  const result = await runQuery(`
    SELECT toString(properties.host) AS host, count() AS clicks
    FROM events
    WHERE event = 'outbound_link_clicked' AND ${since(window.from)} AND ${siteFilter()}
    GROUP BY host
    ORDER BY clicks DESC
    LIMIT 8
  `);
  return map(result, (rows) =>
    rows.map((row) => ({ label: text(row[0]), value: num(row[1]) })),
  );
}

export interface ErrorGroup {
  message: string;
  count: number;
  lastSeen: string;
}

export async function getTopErrors(
  window: AnalyticsWindow,
): Promise<PostHogResult<ErrorGroup[]>> {
  const result = await runQuery(`
    SELECT
      coalesce(
        nullIf(JSONExtractString(properties.$exception_values, 1), ''),
        nullIf(toString(properties.$exception_message), ''),
        'Unknown error'
      ) AS message,
      count() AS occurrences,
      toString(max(timestamp))
    FROM events
    WHERE event = '$exception' AND ${since(window.from)} AND ${siteFilter()}
    GROUP BY message
    ORDER BY occurrences DESC
    LIMIT 6
  `);
  return map(result, (rows) =>
    rows.map((row) => ({
      message: text(row[0]),
      count: num(row[1]),
      lastSeen: String(row[2] ?? ""),
    })),
  );
}
