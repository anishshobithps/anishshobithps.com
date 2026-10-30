import { z } from "zod";
import { formatMonthDay, formatMonthYear } from "@repo/core/date";
import {
  type Calendar,
  type CalendarDay,
  loadCalendar,
  summarizeCalendar,
} from "@/lib/svg/data/github";
import {
  CardHeader,
  Cell,
  Frame,
  Grid,
  GUTTER,
  HAIRLINE,
  HEADER_HEIGHT,
  Label,
  Legend,
  plural,
  Stats,
  STATS_HEIGHT,
} from "@repo/svg-kit/primitives";
import { CARD_WIDTH, defineTemplate, HOUR, type Theme } from "@repo/svg-kit/template";

const CELL = 11;
const GAP = 3;
const STEP = CELL + GAP;
const AXIS = 36;
const GRID_HEIGHT = 7 * STEP - GAP;
const BODY_HEIGHT = GUTTER + 11 + 12 + GRID_HEIGHT + 16 + 10 + GUTTER;
const SIZE = {
  width: CARD_WIDTH,
  height: 4 * HAIRLINE + HEADER_HEIGHT + BODY_HEIGHT + STATS_HEIGHT,
};

const WEEKDAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

function levels(weeks: CalendarDay[][]) {
  return WEEKDAY_LABELS.map((_, weekday) =>
    weeks.map((week) => week.find((day) => day.weekday === weekday)?.level ?? -1),
  );
}

const MONTH = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" });

function months(weeks: CalendarDay[][]) {
  const spans: { label: string; columns: number }[] = [];
  for (const week of weeks) {
    const label = week[0] ? MONTH.format(new Date(week[0].date)) : "";
    const last = spans.at(-1);
    if (last?.label === label) last.columns += 1;
    else spans.push({ label, columns: 1 });
  }
  return spans;
}

function MonthAxis({ theme, weeks }: { theme: Theme; weeks: CalendarDay[][] }) {
  return (
    <div style={{ display: "flex", paddingLeft: AXIS + 12 }}>
      {months(weeks).map(({ label, columns }, index) => (
        <div key={index} style={{ display: "flex", flexShrink: 0, width: columns * STEP }}>
          {columns > 1 && (
            <Label theme={theme} tone="faint">
              {label}
            </Label>
          )}
        </div>
      ))}
    </div>
  );
}

function fixture(seed: number, weekCount = 53): Calendar {
  const start = Date.UTC(2025, 9, 12);
  const days: CalendarDay[] = [];
  for (let i = 0; i < weekCount * 7 - 5; i++) {
    const date = new Date(start + i * 86_400_000);
    const weekday = date.getUTCDay();
    const wave = Math.sin(seed * i) + Math.sin(i / 9) + (weekday === 0 ? -1.2 : 0.4);
    const level = Math.max(0, Math.min(4, Math.round(wave * 1.6)));
    days.push({
      date: date.toISOString().slice(0, 10),
      weekday,
      count: level === 0 ? 0 : level * 3 + (i % 3),
      level,
    });
  }
  const weeks: CalendarDay[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  return { total: days.reduce((sum, day) => sum + day.count, 0), weeks };
}

export const calendar = defineTemplate({
  params: z.object({}),
  size: () => SIZE,
  load: () => loadCalendar(),
  revalidate: 6 * HOUR,
  fixtures: [
    { label: "A busy year", query: {}, data: fixture(1.3) },
    {
      label: "Quiet year, no streak",
      query: {},
      data: {
        total: 0,
        weeks: fixture(0.7).weeks.map((week) =>
          week.map((day) => ({ ...day, count: 0, level: 0 })),
        ),
      },
    },
  ],
  render: ({ data, theme }) => {
    const days = data.weeks.flat();
    const { current, longest, best, active } = summarizeCalendar(days);
    const first = days.at(0)?.date;
    const last = days.at(-1)?.date;

    return (
      <Frame theme={theme} {...SIZE}>
        <CardHeader
          theme={theme}
          label="Last 12 months"
          meta={`${plural(data.total, "contribution")} on GitHub`}
        />
        <Cell
          theme={theme}
          style={{
            flexShrink: 0,
            height: BODY_HEIGHT,
            flexDirection: "column",
            gap: 12,
            padding: GUTTER,
          }}
        >
          <MonthAxis theme={theme} weeks={data.weeks} />
          <div style={{ display: "flex", gap: 12 }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                width: AXIS,
                height: GRID_HEIGHT,
                paddingTop: STEP,
                paddingBottom: STEP,
              }}
            >
              {WEEKDAY_LABELS.filter(Boolean).map((label) => (
                <Label key={label} theme={theme} tone="faint" size={10}>
                  {label}
                </Label>
              ))}
            </div>
            <Grid theme={theme} levels={levels(data.weeks)} cell={CELL} gap={GAP} />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingLeft: AXIS + 12,
              marginTop: 4,
            }}
          >
            <Label theme={theme} tone="faint">
              {first && last ? `${formatMonthYear(first)} – ${formatMonthYear(last)}` : ""}
            </Label>
            <Legend theme={theme} />
          </div>
        </Cell>
        <Stats
          theme={theme}
          items={[
            {
              label: "Current streak",
              value: plural(current, "day"),
              accent: current > 0,
            },
            { label: "Longest streak", value: plural(longest, "day") },
            {
              label: best ? `Best day · ${formatMonthDay(best.date)}` : "Best day",
              value: best ? best.count.toLocaleString("en-US") : "—",
            },
            { label: "Active days", value: active.toLocaleString("en-US") },
          ]}
        />
      </Frame>
    );
  },
});
