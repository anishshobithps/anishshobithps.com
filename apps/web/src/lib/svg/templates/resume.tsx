import { z } from "zod";
import { siteConfig } from "@/lib/config";
import { formatMonthYear, timeAgo } from "@/lib/date";
import { loadReleases, type ReleaseHistory } from "@/lib/svg/data/github";
import { palette } from "@/lib/svg/palette";
import {
  Body,
  CardHeader,
  Cell,
  Figure,
  Frame,
  GUTTER,
  HAIRLINE,
  HEADER_HEIGHT,
  Label,
  Stats,
  STATS_HEIGHT,
} from "@/lib/svg/primitives";
import { CARD_WIDTH, defineTemplate, HOUR, type Theme } from "@/lib/svg/template";

const CHART_HEIGHT = 96;
const MAX_BARS = 12;
const BODY_HEIGHT = GUTTER + CHART_HEIGHT + 10 + 11 + GUTTER;
const SIZE = {
  width: CARD_WIDTH,
  height: 4 * HAIRLINE + HEADER_HEIGHT + BODY_HEIGHT + STATS_HEIGHT,
};

/** owner/name of the repo behind the résumé's "latest release" download link. */
const RESUME_REPO =
  siteConfig.resumeURL.match(/github\.com\/([^/]+\/[^/]+)\/releases/)?.[1] ?? "";

function Downloads({ theme, history }: { theme: Theme; history: ReleaseHistory }) {
  const c = palette(theme);
  const bars = history.releases.slice(-MAX_BARS);
  const most = Math.max(1, ...bars.map((release) => release.downloads));
  return (
    <div style={{ display: "flex", flex: 1, alignItems: "flex-end", gap: 10 }}>
      {bars.map((release, index) => {
        const latest = index === bars.length - 1;
        return (
          <div
            key={release.tag}
            style={{
              display: "flex",
              flex: 1,
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                width: "100%",
                height: CHART_HEIGHT,
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: Math.max(3, Math.round((release.downloads / most) * CHART_HEIGHT)),
                  borderRadius: 3,
                  backgroundColor: latest ? c.brandText : c.ramp[2],
                }}
              />
            </div>
            <Label theme={theme} tone={latest ? "accent" : "faint"} size={10}>
              {release.tag}
            </Label>
          </div>
        );
      })}
    </div>
  );
}

const FIXTURE: ReleaseHistory = {
  repo: "anishshobithps/resume",
  createdAt: "2024-05-31T19:12:20Z",
  builds: 37,
  releases: [
    { tag: "v28", publishedAt: "2025-01-12T01:16:02Z", downloads: 132 },
    { tag: "v29", publishedAt: "2025-05-14T20:38:30Z", downloads: 9 },
    { tag: "v30", publishedAt: "2025-05-15T09:18:41Z", downloads: 128 },
    { tag: "v31", publishedAt: "2025-11-22T20:51:42Z", downloads: 191 },
    { tag: "v32", publishedAt: "2026-03-06T16:50:20Z", downloads: 1 },
    { tag: "v33", publishedAt: "2026-03-06T16:59:27Z", downloads: 757 },
    { tag: "v34", publishedAt: "2026-07-14T20:06:21Z", downloads: 4 },
    { tag: "v35", publishedAt: "2026-07-14T20:12:42Z", downloads: 55 },
    { tag: "v36", publishedAt: "2026-07-21T09:44:04Z", downloads: 14 },
    { tag: "v37", publishedAt: "2026-07-22T20:12:21Z", downloads: 661 },
  ],
};

export const resume = defineTemplate({
  params: z.object({}),
  size: () => SIZE,
  load: () => loadReleases(RESUME_REPO),
  revalidate: 6 * HOUR,
  fixtures: [{ label: "Default", query: {}, data: FIXTURE }],
  render: ({ data, theme }) => {
    const first = data.releases.at(0);
    const latest = data.releases.at(-1);
    const total = data.releases.reduce((sum, release) => sum + release.downloads, 0);

    return (
      <Frame theme={theme} {...SIZE}>
        <CardHeader theme={theme} label="Résumé" meta="LaTeX · Docker · GitHub Actions" />
        <Cell
          theme={theme}
          style={{ flexShrink: 0, height: BODY_HEIGHT, gap: 40, padding: GUTTER }}
        >
          <div
            style={{
              display: "flex",
              flexShrink: 0,
              width: 220,
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Figure theme={theme} size={48} tone="accent">
                {latest?.tag ?? "—"}
              </Figure>
              <Body theme={theme} lines={1}>
                {latest ? `Built ${timeAgo(latest.publishedAt)}` : "No release yet"}
              </Body>
            </div>
            <Label theme={theme} tone="faint">
              Downloads per build
            </Label>
          </div>
          <Downloads theme={theme} history={data} />
        </Cell>
        <Stats
          theme={theme}
          items={[
            { label: "Builds", value: data.builds.toLocaleString("en-US") },
            {
              label: first && latest ? `Downloads · ${first.tag}–${latest.tag}` : "Downloads",
              value: total.toLocaleString("en-US"),
              accent: true,
            },
            {
              label: "This version",
              value: (latest?.downloads ?? 0).toLocaleString("en-US"),
            },
            { label: "Since", value: formatMonthYear(data.createdAt) },
          ]}
        />
      </Frame>
    );
  },
});
