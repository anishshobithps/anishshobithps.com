import {
  ArrowSquareOutIcon,
  BugIcon,
  CursorClickIcon,
  EyeIcon,
  GaugeIcon,
  UsersIcon,
} from "@repo/ui/icons";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
import { Text, TypographyMuted } from "@repo/ui/components/typography";
import { assertAdmin } from "@/lib/admin";
import {
  formatDuration,
  formatNumber,
  formatPercent,
  slugTitle,
} from "@/lib/admin-analytics/format";
import {
  getBehaviorActivity,
  getBehaviorDetail,
  getBehaviorSummary,
  posthogAppUrl,
  type PostHogResult,
  type WebVitals,
} from "@/lib/admin-analytics/posthog";
import { analyticsWindow, parseRange } from "@/lib/admin-analytics/range";
import { AdminPage } from "@/app/admin/_components/admin-page";
import {
  DonutChart,
  RankedBars,
  TrendChart,
} from "@/app/admin/_components/charts";
import { PanelCard, SourceNotice } from "@/app/admin/_components/panel-card";
import { RangePicker } from "@/app/admin/_components/range-picker";
import { StatCard, StatGrid } from "@/app/admin/_components/stat-card";

const EVENT_LABELS: Record<string, string> = {
  post_read: "Post opened",
  post_finished: "Post finished",
  post_reaction_set: "Reaction",
  comment_posted: "Comment posted",
  guestbook_signed: "Guestbook signed",
  outbound_link_clicked: "Outbound click",
  email_copied: "Email copied",
  command_menu_opened: "Command menu opened",
  command_menu_command: "Command run",
  theme_changed: "Theme changed",
  sound_toggled: "Sound toggled",
  blog_list_filtered: "Blog searched",
  logo_downloaded: "Logo downloaded",
  sign_in_opened: "Sign-in opened",
  short_link_followed: "Short link followed",
  resume_downloaded: "Resume downloaded",
};

const VITALS: Array<{
  key: keyof Omit<WebVitals, "samples">;
  label: string;
  good: number;
  poor: number;
  unit: "ms" | "score";
}> = [
  { key: "lcp", label: "Largest Contentful Paint", good: 2500, poor: 4000, unit: "ms" },
  { key: "inp", label: "Interaction to Next Paint", good: 200, poor: 500, unit: "ms" },
  { key: "cls", label: "Cumulative Layout Shift", good: 0.1, poor: 0.25, unit: "score" },
  { key: "fcp", label: "First Contentful Paint", good: 1800, poor: 3000, unit: "ms" },
];

function vitalRating(value: number, good: number, poor: number) {
  if (value <= good) return { label: "Good", variant: "secondary" as const };
  if (value <= poor) return { label: "Needs work", variant: "outline" as const };
  return { label: "Poor", variant: "destructive" as const };
}

function pick<T, U>(
  result: PostHogResult<T>,
  select: (data: T) => U,
): PostHogResult<U> {
  return result.status === "ok"
    ? { status: "ok", data: select(result.data) }
    : result;
}

export default async function AdminBehaviorPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await assertAdmin();
  const window = analyticsWindow(parseRange((await searchParams).range));

  const [summary, activity, detail] = await Promise.all([
    getBehaviorSummary(window),
    getBehaviorActivity(window),
    getBehaviorDetail(window),
  ]);
  const vitals = pick(summary, (data) => data.vitals);
  const series = pick(activity, (data) => data.series);
  const events = pick(activity, (data) => data.events);
  const completion = pick(activity, (data) => data.completion);
  const pages = pick(detail, (data) => data.pages);
  const referrers = pick(detail, (data) => data.referrers);
  const devices = pick(detail, (data) => data.devices);
  const themes = pick(detail, (data) => data.themes);
  const outbound = pick(detail, (data) => data.outbound);
  const errors = pick(detail, (data) => data.errors);

  const links = (
    <>
      <Button variant="outline" size="sm" asChild>
        <a href={posthogAppUrl("/heatmaps")} target="_blank" rel="noopener noreferrer">
          Heatmaps
          <ArrowSquareOutIcon data-icon="inline-end" aria-hidden="true" />
        </a>
      </Button>
      <Button variant="outline" size="sm" asChild>
        <a href={posthogAppUrl("/replay/home")} target="_blank" rel="noopener noreferrer">
          Replays
          <ArrowSquareOutIcon data-icon="inline-end" aria-hidden="true" />
        </a>
      </Button>
    </>
  );

  return (
    <AdminPage
      title="Behavior"
      description={`What visitors do on the site, from PostHog, for the last ${window.label}.`}
      actions={
        <>
          {links}
          <RangePicker />
        </>
      }
    >
      {summary.status !== "ok" ? (
        <SourceNotice
          source="PostHog"
          result={summary}
          envVars={["POSTHOG_PERSONAL_API_KEY", "POSTHOG_PROJECT_ID"]}
        />
      ) : (
        <>
          <StatGrid>
            <StatCard
              label="Visitors"
              value={formatNumber(summary.data.visitors)}
              current={summary.data.visitors}
              previous={summary.data.previous.visitors}
              icon={<UsersIcon />}
            />
            <StatCard
              label="Sessions"
              value={formatNumber(summary.data.sessions)}
              current={summary.data.sessions}
              previous={summary.data.previous.sessions}
              icon={<CursorClickIcon />}
            />
            <StatCard
              label="Pageviews"
              value={formatNumber(summary.data.pageviews)}
              current={summary.data.pageviews}
              previous={summary.data.previous.pageviews}
              icon={<EyeIcon />}
            />
            <StatCard
              label="Frustrated clicks"
              value={formatNumber(summary.data.rageClicks + summary.data.deadClicks)}
              hint={`${summary.data.rageClicks} rage, ${summary.data.deadClicks} dead`}
              icon={<CursorClickIcon />}
            />
            <StatCard
              label="JS errors"
              value={formatNumber(summary.data.exceptions)}
              hint="captured exceptions"
              icon={<BugIcon />}
            />
          </StatGrid>

          <PanelCard title="Activity" description="Pageviews, visitors, and errors per day">
            {series.status === "ok" ? (
              <TrendChart
                className="h-72"
                data={series.data.map((day) => ({ ...day }))}
                series={[
                  { key: "pageviews", label: "Pageviews", color: "var(--chart-1)" },
                  { key: "visitors", label: "Visitors", color: "var(--chart-2)" },
                  { key: "errors", label: "Errors", color: "var(--chart-5)" },
                ]}
              />
            ) : (
              <SourceNotice source="PostHog" result={series} envVars={["POSTHOG_PERSONAL_API_KEY"]} />
            )}
          </PanelCard>

          <PanelCard
            title="Core Web Vitals"
            description={
              vitals.status === "ok"
                ? `75th percentile across ${formatNumber(vitals.data.samples)} page loads`
                : "75th percentile of real page loads"
            }
            action={<GaugeIcon aria-hidden="true" className="text-muted-foreground" />}
          >
            {vitals.status === "ok" ? (
              <div className="grid min-w-0 grid-cols-2 gap-3 lg:grid-cols-4">
                {VITALS.map((vital) => {
                  const value = vitals.data[vital.key];
                  const rating =
                    value === null ? null : vitalRating(value, vital.good, vital.poor);
                  return (
                    <div
                      key={vital.key}
                      className="flex min-w-0 flex-col gap-2 rounded-lg border p-3"
                    >
                      <Text variant="caption" className="truncate">
                        {vital.label}
                      </Text>
                      <Text variant="none" className="font-display text-xl font-bold tabular-nums">
                        {value === null
                          ? "—"
                          : vital.unit === "ms"
                            ? `${Math.round(value)} ms`
                            : value.toFixed(3)}
                      </Text>
                      {rating && (
                        <Badge variant={rating.variant} className="w-fit">
                          {rating.label}
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <SourceNotice source="PostHog" result={vitals} envVars={["POSTHOG_PERSONAL_API_KEY"]} />
            )}
          </PanelCard>

          <div className="grid min-w-0 gap-4 lg:grid-cols-2">
            <PanelCard title="Actions" description="Custom events and how many people triggered them">
              {events.status === "ok" ? (
                <RankedBars
                  data={events.data.map((row) => ({
                    label: EVENT_LABELS[row.event] ?? row.event,
                    value: row.count,
                  }))}
                  label="Events"
                  color="var(--chart-1)"
                />
              ) : (
                <SourceNotice source="PostHog" result={events} envVars={["POSTHOG_PERSONAL_API_KEY"]} />
              )}
            </PanelCard>
            <PanelCard title="Post completion" description="Readers who opened a post and reached its end">
              {completion.status === "ok" ? (
                completion.data.length === 0 ? (
                  <Text variant="caption" className="py-10 text-center">
                    Nothing recorded in this range.
                  </Text>
                ) : (
                  <div className="flex min-w-0 flex-col gap-3">
                    {completion.data.map((post) => {
                      const rate = post.readers ? post.finishers / post.readers : 0;
                      return (
                        <div key={post.slug} className="flex min-w-0 flex-col gap-1.5">
                          <div className="flex min-w-0 items-baseline justify-between gap-3">
                            <Text
                              variant="small"
                              as="span"
                              className="min-w-0 truncate"
                              title={slugTitle(post.slug)}
                            >
                              {slugTitle(post.slug)}
                            </Text>
                            <TypographyMuted className="shrink-0 font-mono text-xs tabular-nums">
                              {post.finishers}/{post.readers} {formatPercent(rate)}
                            </TypographyMuted>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-chart-2"
                              style={{ width: `${Math.min(rate, 1) * 100}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : (
                <SourceNotice source="PostHog" result={completion} envVars={["POSTHOG_PERSONAL_API_KEY"]} />
              )}
            </PanelCard>
          </div>

          <PanelCard
            title="Page engagement"
            description="Views, how far people scroll, and how long they stay"
            contentClassName="px-0"
          >
            {pages.status === "ok" ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Page</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                    <TableHead className="text-right">Visitors</TableHead>
                    <TableHead className="text-right">Scroll</TableHead>
                    <TableHead className="pr-4 text-right">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pages.data.map((page) => (
                    <TableRow key={page.path}>
                      <TableCell
                        className="max-w-48 truncate pl-4 font-mono text-xs sm:max-w-md"
                        title={page.path}
                      >
                        {page.path}
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums">
                        {formatNumber(page.views)}
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums">
                        {formatNumber(page.visitors)}
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums">
                        {page.scroll === null ? "—" : formatPercent(page.scroll)}
                      </TableCell>
                      <TableCell className="pr-4 text-right font-mono tabular-nums">
                        {page.seconds === null ? "—" : formatDuration(page.seconds)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="px-4">
                <SourceNotice source="PostHog" result={pages} envVars={["POSTHOG_PERSONAL_API_KEY"]} />
              </div>
            )}
          </PanelCard>

          <div className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <PanelCard title="Referring sites" description="People per source">
              {referrers.status === "ok" ? (
                <RankedBars
                  data={referrers.data.map((row) => ({
                    ...row,
                    label: row.label === "$direct" ? "Direct" : row.label,
                  }))}
                  label="People"
                />
              ) : (
                <SourceNotice source="PostHog" result={referrers} envVars={["POSTHOG_PERSONAL_API_KEY"]} />
              )}
            </PanelCard>
            <PanelCard title="Outbound clicks" description="Links people left through">
              {outbound.status === "ok" ? (
                <RankedBars data={outbound.data} label="Clicks" color="var(--chart-4)" />
              ) : (
                <SourceNotice source="PostHog" result={outbound} envVars={["POSTHOG_PERSONAL_API_KEY"]} />
              )}
            </PanelCard>
            <PanelCard title="Devices" description="People by device type">
              {devices.status === "ok" ? (
                <DonutChart data={devices.data} />
              ) : (
                <SourceNotice source="PostHog" result={devices} envVars={["POSTHOG_PERSONAL_API_KEY"]} />
              )}
            </PanelCard>
            <PanelCard title="Theme" description="Light or dark, as rendered">
              {themes.status === "ok" ? (
                <DonutChart data={themes.data} />
              ) : (
                <SourceNotice source="PostHog" result={themes} envVars={["POSTHOG_PERSONAL_API_KEY"]} />
              )}
            </PanelCard>
          </div>

          <PanelCard
            title="Top errors"
            description="Grouped by message"
            action={
              <Button variant="ghost" size="sm" asChild>
                <a href={posthogAppUrl("/error_tracking")} target="_blank" rel="noopener noreferrer">
                  Error tracking
                  <ArrowSquareOutIcon data-icon="inline-end" aria-hidden="true" />
                </a>
              </Button>
            }
            contentClassName="px-0"
          >
            {errors.status === "ok" ? (
              errors.data.length === 0 ? (
                <Text variant="caption" className="px-4 py-6 text-center">
                  No errors in this range.
                </Text>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-4">Message</TableHead>
                      <TableHead className="text-right">Count</TableHead>
                      <TableHead className="pr-4 text-right">Last seen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {errors.data.map((error) => (
                      <TableRow key={error.message}>
                        <TableCell className="max-w-0 truncate pl-4 font-mono text-xs" title={error.message}>
                          {error.message}
                        </TableCell>
                        <TableCell className="w-20 text-right font-mono tabular-nums">
                          {formatNumber(error.count)}
                        </TableCell>
                        <TableCell className="w-28 pr-4 text-right text-xs text-muted-foreground">
                          {error.lastSeen.slice(0, 10)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )
            ) : (
              <div className="px-4">
                <SourceNotice source="PostHog" result={errors} envVars={["POSTHOG_PERSONAL_API_KEY"]} />
              </div>
            )}
          </PanelCard>
        </>
      )}
    </AdminPage>
  );
}
