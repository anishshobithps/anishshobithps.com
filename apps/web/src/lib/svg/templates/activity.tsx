import { z } from "zod";
import { formatMonthYear } from "@/lib/date";
import {
  bucketTimestamps,
  combine,
  emptyMatrix,
  formatHour,
  type Matrix,
  summarize,
  toLevels,
  WEEKDAYS,
} from "@/lib/svg/data/activity";
import { loadCommitTimes } from "@/lib/svg/data/github";
import { loadCodingTime } from "@/lib/svg/data/wakatime";
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
  Stats,
  STATS_HEIGHT,
} from "@/lib/svg/primitives";
import { CARD_WIDTH, defineTemplate, HOUR } from "@/lib/svg/template";

const COMMIT_PAGES = 5;
const WAKATIME_DAYS = 7;

const CELL = 27;
const GAP = 4;
const AXIS = 36;
const GRID_HEIGHT = 7 * CELL + 6 * GAP;
const BODY_HEIGHT = GUTTER + 11 + 12 + GRID_HEIGHT + 16 + 10 + GUTTER;
const SIZE = {
  width: CARD_WIDTH,
  height: 4 * HAIRLINE + HEADER_HEIGHT + BODY_HEIGHT + STATS_HEIGHT,
};

const HOUR_MARKS = [0, 3, 6, 9, 12, 15, 18, 21];

const SOURCES = z.enum(["github", "wakatime", "both"]);

interface GitHubActivity {
  matrix: Matrix;
  commits: number;
  since: string | null;
}

interface WakaTimeActivity {
  matrix: Matrix;
  seconds: number;
  days: number;
}

interface Data {
  github?: GitHubActivity;
  wakatime?: WakaTimeActivity;
}

async function loadGitHub(): Promise<GitHubActivity> {
  const stamps = await loadCommitTimes(COMMIT_PAGES);
  return {
    matrix: bucketTimestamps(stamps),
    commits: stamps.length,
    since: stamps.at(-1) ?? null,
  };
}

function meta({ github, wakatime }: Data) {
  if (github && wakatime) return "GitHub + WakaTime · local time";
  if (wakatime) {
    return `${Math.round(wakatime.seconds / HOUR)} hrs coded · last ${wakatime.days} days`;
  }
  if (github) {
    const since = github.since ? ` since ${formatMonthYear(github.since)}` : "";
    return `${github.commits} commits${since}`;
  }
  return "";
}

function fixtureMatrix(seed: number) {
  return emptyMatrix().map((row, day) =>
    row.map((_, hour) => {
      const night = hour >= 21 || hour < 2 ? 3 : 0;
      const work = hour >= 10 && hour < 18 ? 2 : 0;
      const weekend = day >= 5 ? -1 : 0;
      const noise = Math.sin(seed * (day + 1) * (hour + 3)) * 2;
      return Math.max(0, Math.round(night + work + weekend + noise));
    }),
  );
}

export const activity = defineTemplate({
  params: z.object({ source: SOURCES.default("github") }),
  size: () => SIZE,
  load: async ({ source }): Promise<Data> => {
    const [github, wakatime] = await Promise.all([
      source === "wakatime" ? undefined : loadGitHub(),
      source === "github" ? undefined : loadCodingTime(WAKATIME_DAYS),
    ]);
    return { github, wakatime };
  },
  revalidate: 6 * HOUR,
  fixtures: [
    {
      label: "GitHub commits",
      query: {},
      data: {
        github: {
          matrix: fixtureMatrix(1.7),
          commits: 500,
          since: "2026-05-02T23:41:00+05:30",
        },
      },
    },
    {
      label: "GitHub + WakaTime",
      query: { source: "both" },
      data: {
        github: { matrix: fixtureMatrix(1.7), commits: 500, since: null },
        wakatime: { matrix: fixtureMatrix(2.3), seconds: 86_400, days: 7 },
      },
    },
  ],
  render: ({ data, theme }) => {
    const matrix = combine(
      [data.github?.matrix, data.wakatime?.matrix].filter(
        (m): m is Matrix => Boolean(m),
      ),
    );
    const summary = summarize(matrix);

    return (
      <Frame theme={theme} {...SIZE}>
        <CardHeader theme={theme} label="When I code" meta={meta(data)} />
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
          <div style={{ display: "flex", paddingLeft: AXIS + 12 }}>
            {HOUR_MARKS.map((hour) => (
              <div key={hour} style={{ display: "flex", width: 3 * (CELL + GAP) }}>
                <Label theme={theme} tone="faint">
                  {formatHour(hour)}
                </Label>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                width: AXIS,
                height: GRID_HEIGHT,
                paddingTop: 8,
                paddingBottom: 8,
              }}
            >
              {WEEKDAYS.map((day) => (
                <Label key={day} theme={theme} tone="faint">
                  {day}
                </Label>
              ))}
            </div>
            <Grid theme={theme} levels={toLevels(matrix)} cell={CELL} gap={GAP} />
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
              Local time
            </Label>
            <Legend theme={theme} />
          </div>
        </Cell>
        <Stats
          theme={theme}
          items={[
            { label: "Peak hour", value: summary.empty ? "—" : summary.peak },
            {
              label: "9 PM–2 AM · one more commit",
              value: `${summary.lateShare}%`,
              accent: true,
            },
            { label: "Busiest day", value: summary.empty ? "—" : summary.busiestDay },
          ]}
        />
      </Frame>
    );
  },
});
