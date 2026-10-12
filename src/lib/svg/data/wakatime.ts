import { bucketDurations, type Matrix } from "@/lib/svg/data/activity";

const TIMEOUT_MS = 5000;

const API = "https://wakatime.com/api/v1/users/current";

interface DurationsResponse {
  data: { time: number; duration: number }[];
  timezone?: string;
}

async function wakatime<T>(path: string, key: string): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { Authorization: `Basic ${Buffer.from(key).toString("base64")}` },
  });
  if (!res.ok) throw new Error(`WakaTime ${path} responded ${res.status}`);
  return res.json() as Promise<T>;
}

function recentDates(days: number, now = new Date()) {
  return Array.from({ length: days }, (_, offset) => {
    const date = new Date(now);
    date.setUTCDate(date.getUTCDate() - offset);
    return date.toISOString().slice(0, 10);
  });
}

export async function loadCodingTime(
  days: number,
): Promise<{ matrix: Matrix; seconds: number; days: number }> {
  const key = process.env.WAKATIME_API_KEY;
  if (!key) throw new Error("WAKATIME_API_KEY is not set");

  const responses = await Promise.all(
    recentDates(days).map((date) =>
      wakatime<DurationsResponse>(`/durations?date=${date}`, key),
    ),
  );
  const timeZone = responses.find((res) => res.timezone)?.timezone ?? "UTC";
  const durations = responses.flatMap((res) => res.data);

  return {
    matrix: bucketDurations(durations, timeZone),
    seconds: durations.reduce((sum, { duration }) => sum + duration, 0),
    days,
  };
}
