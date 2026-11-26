export const ANALYTICS_TIMEZONE = "Asia/Kolkata";

export const RANGE_OPTIONS = [
  { key: "7d", label: "7 days", days: 7 },
  { key: "30d", label: "30 days", days: 30 },
  { key: "90d", label: "90 days", days: 90 },
] as const;

export type RangeKey = (typeof RANGE_OPTIONS)[number]["key"];

export interface AnalyticsWindow {
  key: RangeKey;
  label: string;
  days: number;
  from: Date;
  to: Date;
  previousFrom: Date;
}

const DAY_MS = 86_400_000;

const dayFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: ANALYTICS_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function parseRange(value: string | string[] | undefined): RangeKey {
  const raw = Array.isArray(value) ? value[0] : value;
  return RANGE_OPTIONS.find((option) => option.key === raw)?.key ?? "30d";
}

export function analyticsWindow(key: RangeKey): AnalyticsWindow {
  const option =
    RANGE_OPTIONS.find((candidate) => candidate.key === key) ??
    RANGE_OPTIONS[1];
  const to = new Date();
  const from = new Date(to.getTime() - option.days * DAY_MS);
  return {
    key: option.key,
    label: option.label,
    days: option.days,
    from,
    to,
    previousFrom: new Date(from.getTime() - option.days * DAY_MS),
  };
}

function dayKey(date: Date): string {
  return dayFormatter.format(date);
}

function windowDays(window: AnalyticsWindow): string[] {
  const keys: string[] = [];
  for (let i = window.days - 1; i >= 0; i--) {
    const key = dayKey(new Date(window.to.getTime() - i * DAY_MS));
    if (keys.at(-1) !== key) keys.push(key);
  }
  return keys;
}

export function fillDays<T extends Record<string, number>>(
  window: AnalyticsWindow,
  rows: Array<{ date: string } & Partial<T>>,
  empty: T,
): Array<{ date: string } & T> {
  const byDate = new Map(rows.map((row) => [row.date, row]));
  return windowDays(window).map((date) => ({
    ...empty,
    ...byDate.get(date),
    date,
  }));
}
