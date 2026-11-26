import type { Route } from "next";
import Link from "next/link";
import {
  BookOpenIcon,
  ChatCircleIcon,
  EyeIcon,
  LinkIcon,
  UsersIcon,
} from "@repo/icons";
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
import { assertAdmin } from "@/lib/assert-admin";
import { getContentAnalytics } from "@/lib/admin-analytics/database";
import { formatNumber, slugTitle } from "@/lib/admin-analytics/format";
import {
  getBehaviorSeries,
  getBehaviorSummary,
  getPageEngagement,
  getRecentVisitors,
} from "@/lib/admin-analytics/posthog";
import { analyticsWindow, parseRange } from "@/lib/admin-analytics/range";
import { AdminPage } from "@/app/admin/_components/admin-page";
import { RankedBars, StackedBars, TrendChart } from "@/app/admin/_components/charts";
import { PanelCard, SourceNotice } from "@/app/admin/_components/panel-card";
import { RangePicker } from "@/app/admin/_components/range-picker";
import { StatCard, StatGrid } from "@/app/admin/_components/stat-card";
import { ResumeRefresh } from "@/app/admin/resume-refresh";

export default async function AdminPageRoute({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await assertAdmin();
  const window = analyticsWindow(parseRange((await searchParams).range));

  const [content, summary, series, pages, recent] = await Promise.all([
    getContentAnalytics(window),
    getBehaviorSummary(window),
    getBehaviorSeries(window),
    getPageEngagement(window),
    getRecentVisitors(),
  ]);

  const traffic = summary.status === "ok" ? summary.data : null;

  return (
    <AdminPage
      title="Overview"
      description={`Everything from the last ${window.label}: traffic, reading, and the community.`}
      actions={
        <>
          {recent.status === "ok" && (
            <Badge variant="outline" className="gap-1.5">
              <span className="size-1.5 rounded-full bg-(--brand)" aria-hidden="true" />
              {recent.data} in the last 30 min
            </Badge>
          )}
          <RangePicker />
        </>
      }
    >
      <StatGrid>
        <StatCard
          label="Visitors"
          value={traffic ? formatNumber(traffic.visitors) : "—"}
          current={traffic?.visitors}
          previous={traffic?.previous.visitors}
          hint={traffic ? `${formatNumber(traffic.sessions)} sessions` : "PostHog isn't connected"}
          icon={<UsersIcon />}
        />
        <StatCard
          label="Pageviews"
          value={traffic ? formatNumber(traffic.pageviews) : "—"}
          current={traffic?.pageviews}
          previous={traffic?.previous.pageviews}
          icon={<EyeIcon />}
        />
        <StatCard
          label="New blog readers"
          value={formatNumber(content.inRange.reads)}
          current={content.inRange.reads}
          previous={content.previous.reads}
          hint={`${formatNumber(content.totals.reads)} all time`}
          icon={<BookOpenIcon />}
        />
        <StatCard
          label="Conversations"
          value={formatNumber(content.inRange.comments + content.inRange.guestbook)}
          current={content.inRange.comments + content.inRange.guestbook}
          previous={content.previous.comments + content.previous.guestbook}
          hint={`${content.inRange.commenters + content.inRange.signers} people`}
          icon={<ChatCircleIcon />}
        />
        <StatCard
          label="Short link clicks"
          value={formatNumber(content.totals.linkClicks)}
          hint={`across ${content.totals.links} links, all time`}
          icon={<LinkIcon />}
        />
      </StatGrid>

      <div className="grid min-w-0 gap-4 xl:grid-cols-5">
        <PanelCard
          title="Traffic"
          description="Daily pageviews and visitors from PostHog"
          className="xl:col-span-3"
        >
          {series.status === "ok" ? (
            <TrendChart
              data={series.data.map(({ date, pageviews, visitors }) => ({
                date,
                pageviews,
                visitors,
              }))}
              series={[
                { key: "pageviews", label: "Pageviews", color: "var(--chart-1)" },
                { key: "visitors", label: "Visitors", color: "var(--chart-2)" },
              ]}
            />
          ) : (
            <SourceNotice
              source="PostHog"
              result={series}
              envVars={["POSTHOG_PERSONAL_API_KEY"]}
            />
          )}
        </PanelCard>
        <PanelCard
          title="Top pages"
          description="Most viewed paths"
          className="xl:col-span-2"
          action={
            <Button variant="ghost" size="sm" asChild>
              <Link href={"/admin/behavior" as Route}>All behavior</Link>
            </Button>
          }
        >
          {pages.status === "ok" ? (
            <RankedBars
              data={pages.data
                .slice(0, 8)
                .map((page) => ({ label: page.path, value: page.views }))}
              label="Views"
            />
          ) : (
            <SourceNotice
              source="PostHog"
              result={pages}
              envVars={["POSTHOG_PERSONAL_API_KEY"]}
            />
          )}
        </PanelCard>
      </div>

      <div className="grid min-w-0 gap-4 xl:grid-cols-5">
        <PanelCard
          title="Community activity"
          description="New readers, reactions, comments, signatures, and likes per day"
          className="xl:col-span-3"
        >
          <StackedBars
            data={content.activity.map((day) => ({ ...day }))}
            series={[
              { key: "reads", label: "Readers", color: "var(--chart-2)" },
              { key: "reactions", label: "Reactions", color: "var(--chart-4)" },
              { key: "comments", label: "Comments", color: "var(--chart-1)" },
              { key: "guestbook", label: "Guestbook", color: "var(--chart-5)" },
              { key: "likes", label: "Likes", color: "var(--chart-3)" },
            ]}
          />
        </PanelCard>
        <PanelCard
          title="Top posts"
          description={`New readers in the last ${window.label}`}
          className="xl:col-span-2"
          contentClassName="px-0"
          action={
            <Button variant="ghost" size="sm" asChild>
              <Link href={"/admin/content" as Route}>All content</Link>
            </Button>
          }
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Post</TableHead>
                <TableHead className="text-right">New</TableHead>
                <TableHead className="pr-4 text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {content.topPosts.slice(0, 6).map((post) => (
                <TableRow key={post.slug}>
                  <TableCell className="max-w-0 pl-4">
                    <Link
                      href={post.slug as Route}
                      target="_blank"
                      className="block truncate hover:underline"
                      title={slugTitle(post.slug)}
                    >
                      {slugTitle(post.slug)}
                    </Link>
                  </TableCell>
                  <TableCell className="w-16 text-right font-mono tabular-nums">
                    {formatNumber(post.readsInRange)}
                  </TableCell>
                  <TableCell className="w-16 pr-4 text-right font-mono tabular-nums text-muted-foreground">
                    {formatNumber(post.reads)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </PanelCard>
      </div>

      <ResumeRefresh />
    </AdminPage>
  );
}
