export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const LEVELS = 4;

export type Matrix = number[][];

export function emptyMatrix(): Matrix {
  return WEEKDAYS.map(() => Array.from({ length: 24 }, () => 0));
}

const LOCAL_STAMP = /^(\d{4})-(\d{2})-(\d{2})T(\d{2})/;

export function bucketTimestamps(stamps: string[]): Matrix {
  const matrix = emptyMatrix();
  for (const stamp of stamps) {
    const match = stamp.match(LOCAL_STAMP);
    if (!match) continue;
    const [, year, month, day, hour] = match.map(Number);
    const weekday = (new Date(Date.UTC(year, month - 1, day)).getUTCDay() + 6) % 7;
    matrix[weekday][hour] += 1;
  }
  return matrix;
}

const WEEKDAY_INDEX: Record<string, number> = Object.fromEntries(
  WEEKDAYS.map((day, index) => [day, index]),
);

function localSlot(seconds: number, format: Intl.DateTimeFormat) {
  const parts = Object.fromEntries(
    format
      .formatToParts(new Date(seconds * 1000))
      .map(({ type, value }) => [type, value]),
  );
  return {
    weekday: WEEKDAY_INDEX[parts.weekday] ?? 0,
    hour: Number(parts.hour) % 24,
    elapsed: Number(parts.minute) * 60 + Number(parts.second),
  };
}

export function bucketDurations(
  durations: { time: number; duration: number }[],
  timeZone: string,
): Matrix {
  const matrix = emptyMatrix();
  const format = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hourCycle: "h23",
  });

  for (const { time, duration } of durations) {
    let cursor = time;
    const end = time + duration;
    while (cursor < end) {
      const { weekday, hour, elapsed } = localSlot(cursor, format);
      const chunk = Math.min(3600 - elapsed, end - cursor);
      matrix[weekday][hour] += chunk;
      cursor += Math.max(chunk, 1);
    }
  }
  return matrix;
}

function total(matrix: Matrix) {
  return matrix.flat().reduce((sum, value) => sum + value, 0);
}

export function combine(matrices: Matrix[]): Matrix {
  const shares = matrices
    .map((matrix) => ({ matrix, sum: total(matrix) }))
    .filter(({ sum }) => sum > 0);
  return emptyMatrix().map((row, day) =>
    row.map((_, hour) =>
      shares.reduce(
        (value, { matrix, sum }) => value + matrix[day][hour] / sum / shares.length,
        0,
      ),
    ),
  );
}

export function toLevels(matrix: Matrix): number[][] {
  const max = Math.max(...matrix.flat());
  return matrix.map((row) =>
    row.map((value) =>
      value > 0 && max > 0
        ? Math.max(1, Math.ceil(Math.sqrt(value / max) * LEVELS))
        : 0,
    ),
  );
}

export function formatHour(hour: number) {
  const suffix = hour < 12 ? "AM" : "PM";
  return `${hour % 12 || 12} ${suffix}`;
}

const LATE_HOURS = new Set([21, 22, 23, 0, 1]);

export function summarize(matrix: Matrix) {
  const sum = total(matrix);
  let peak = { day: 0, hour: 0, value: -1 };
  matrix.forEach((row, day) =>
    row.forEach((value, hour) => {
      if (value > peak.value) peak = { day, hour, value };
    }),
  );

  const daySums = matrix.map((row) => row.reduce((a, b) => a + b, 0));
  const busiestDay = daySums.indexOf(Math.max(...daySums));
  const late = matrix.reduce(
    (acc, row) =>
      acc + row.reduce((a, value, hour) => a + (LATE_HOURS.has(hour) ? value : 0), 0),
    0,
  );

  return {
    empty: sum === 0,
    peak: `${WEEKDAYS[peak.day]} ${formatHour(peak.hour)}`,
    busiestDay: WEEKDAYS[busiestDay],
    lateShare: sum > 0 ? Math.round((late / sum) * 100) : 0,
  };
}
