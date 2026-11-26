import type { Route } from "next";
import Link from "next/link";
import {
  BookOpenIcon,
  ChatCircleIcon,
  HeartIcon,
  LinkIcon,
  SmileyMehIcon,
} from "@repo/icons";
import { Badge } from "@repo/ui/components/badge";
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
import { analyticsWindow, parseRange } from "@/lib/admin-analytics/range";
import { AdminPage } from "@/app/admin/_components/admin-page";
import { DonutChart, RankedBars, StackedBars } from "@/app/admin/_components/charts";
import { PanelCard } from "@/app/admin/_components/panel-card";
import { RangePicker } from "@/app/admin/_components/range-picker";
import { StatCard, StatGrid } from "@/app/admin/_components/stat-card";

export default async function AdminContentPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await assertAdmin();
  const window = analyticsWindow(parseRange((await searchParams).range));
  const content = await getContentAnalytics(window);
  const reactionTotal = content.moods.reduce((sum, row) => sum + row.count, 0);

  return (
    <AdminPage
      title="Content"
      description={`Reads, reactions, comments, and links from the site database for the last ${window.label}.`}
      actions={<RangePicker />}
    >
      <StatGrid>
        <StatCard
          label="New blog readers"
          value={formatNumber(content.inRange.reads)}
          current={content.inRange.reads}
          previous={content.previous.reads}
          hint={`${formatNumber(content.totals.reads)} all time`}
          icon={<BookOpenIcon />}
        />
        <StatCard
          label="Reactions"
          value={formatNumber(content.inRange.reactions)}
          current={content.inRange.reactions}
          previous={content.previous.reactions}
          hint={`${formatNumber(content.totals.reactions)} all time`}
          icon={<SmileyMehIcon />}
        />
        <StatCard
          label="Comments"
          value={formatNumber(content.inRange.comments)}
          current={content.inRange.comments}
          previous={content.previous.comments}
          hint={`${content.inRange.commenters} commenters`}
          icon={<ChatCircleIcon />}
        />
        <StatCard
          label="Guestbook signatures"
          value={formatNumber(content.inRange.guestbook)}
          current={content.inRange.guestbook}
          previous={content.previous.guestbook}
          hint={`${content.inRange.signers} people`}
          icon={<ChatCircleIcon />}
        />
        <StatCard
          label="Likes"
          value={formatNumber(content.inRange.likes)}
          hint={`${formatNumber(content.totals.likes)} all time`}
          icon={<HeartIcon />}
        />
      </StatGrid>

      <PanelCard title="Daily activity" description="Everything people did that the database records">
        <StackedBars
          className="h-72"
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

      <div className="grid min-w-0 gap-4 xl:grid-cols-3">
        <PanelCard
          title="Posts"
          description={`New readers in the last ${window.label}, then all-time totals`}
          className="xl:col-span-2"
          contentClassName="px-0"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Post</TableHead>
                <TableHead className="text-right">New</TableHead>
                <TableHead className="text-right">Readers</TableHead>
                <TableHead className="hidden text-right sm:table-cell">
                  Reactions
                </TableHead>
                <TableHead className="hidden pr-4 text-right sm:table-cell">
                  Comments
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {content.topPosts.map((post) => (
                <TableRow key={post.slug}>
                  <TableCell className="max-w-0 min-w-32 pl-4">
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
                  <TableCell className="w-20 text-right font-mono tabular-nums">
                    {formatNumber(post.reads)}
                  </TableCell>
                  <TableCell className="hidden w-20 text-right font-mono tabular-nums sm:table-cell">
                    {formatNumber(post.reactions)}
                  </TableCell>
                  <TableCell className="hidden w-20 pr-4 text-right font-mono tabular-nums sm:table-cell">
                    {formatNumber(post.comments)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </PanelCard>

        <PanelCard title="How posts land" description="Every reaction, all time">
          <DonutChart
            data={content.moods.map((row) => ({ label: row.label, value: row.count }))}
            total={formatNumber(reactionTotal)}
            caption="reactions"
            empty="No reactions yet."
          />
        </PanelCard>
      </div>

      <PanelCard
        title="Short links"
        description="Clicks per link, all time"
        action={
          <Badge variant="outline" className="gap-1">
            <LinkIcon aria-hidden="true" />
            {formatNumber(content.totals.linkClicks)} clicks
          </Badge>
        }
      >
        <RankedBars
          data={content.topLinks.map((link) => ({
            label: link.path,
            value: link.clicks,
          }))}
          label="Clicks"
          color="var(--chart-4)"
          labelWidth={120}
          empty="No short links yet."
        />
      </PanelCard>
    </AdminPage>
  );
}
