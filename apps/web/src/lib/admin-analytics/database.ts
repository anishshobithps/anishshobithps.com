import { db } from "@repo/db";
import {
  blogCommentLikes,
  blogComments,
  blogPosts,
  blogReactions,
  blogReads,
  guestbookEntries,
  guestbookLikes,
  linkSlugs,
  links,
} from "@repo/db/schema";
import { and, count, countDistinct, desc, eq, gte, sql, sum } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import {
  ANALYTICS_TIMEZONE,
  fillDays,
  type AnalyticsWindow,
} from "@/lib/admin-analytics/range";
import { safeQuery } from "@/lib/safe-query";

const MOOD_LABELS: Record<string, string> = {
  terrible: "Not for me",
  bad: "Meh",
  good: "Liked it",
  amazing: "Loved it",
};

interface ActivityDay {
  date: string;
  reads: number;
  reactions: number;
  comments: number;
  guestbook: number;
  likes: number;
}

interface TopPost {
  slug: string;
  reads: number;
  readsInRange: number;
  reactions: number;
  comments: number;
}

interface TopLink {
  path: string;
  target: string;
  clicks: number;
  enabled: boolean;
}

export interface ContentAnalytics {
  totals: {
    reads: number;
    reactions: number;
    comments: number;
    guestbook: number;
    likes: number;
    linkClicks: number;
    posts: number;
    links: number;
  };
  inRange: {
    reads: number;
    reactions: number;
    comments: number;
    guestbook: number;
    likes: number;
    commenters: number;
    signers: number;
  };
  previous: {
    reads: number;
    reactions: number;
    comments: number;
    guestbook: number;
  };
  activity: ActivityDay[];
  topPosts: TopPost[];
  moods: Array<{ mood: string; label: string; count: number }>;
  topLinks: TopLink[];
}

const EMPTY_DAY = { reads: 0, reactions: 0, comments: 0, guestbook: 0, likes: 0 };

function dayOf(column: AnyPgColumn) {
  return sql<string>`to_char(${column} at time zone ${ANALYTICS_TIMEZONE}, 'YYYY-MM-DD')`;
}

function between(column: AnyPgColumn, from: Date, to?: Date) {
  return to
    ? and(gte(column, from), sql`${column} < ${to}`)
    : gte(column, from);
}

async function perDay(
  column: AnyPgColumn,
  table: Parameters<ReturnType<typeof db.select>["from"]>[0],
  from: Date,
  extra?: ReturnType<typeof eq>,
) {
  return db
    .select({ date: dayOf(column), n: count() })
    .from(table)
    .where(extra ? and(gte(column, from), extra) : gte(column, from))
    .groupBy(sql`1`);
}

function toNumber(value: unknown): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

async function loadContentAnalytics(
  window: AnalyticsWindow,
): Promise<ContentAnalytics> {
  const { from, previousFrom } = window;
  const liveComment = eq(blogComments.isDeleted, false);
  const liveEntry = eq(guestbookEntries.isDeleted, false);

  const [
    [readsAll],
    [reactionsAll],
    [commentsAll],
    [guestbookAll],
    [guestbookLikesAll],
    [commentLikesAll],
    [linkTotals],
    [postsAll],
    [readsRange],
    [reactionsRange],
    [commentsRange],
    [guestbookRange],
    [readsPrev],
    [reactionsPrev],
    [commentsPrev],
    [guestbookPrev],
    readDays,
    reactionDays,
    commentDays,
    guestbookDays,
    guestbookLikeDays,
    commentLikeDays,
    readsByPost,
    readsByPostRange,
    reactionsByPost,
    commentsByPost,
    moods,
    linkRows,
  ] = await Promise.all([
    db.select({ n: count() }).from(blogReads),
    db.select({ n: count() }).from(blogReactions),
    db.select({ n: count() }).from(blogComments).where(liveComment),
    db.select({ n: count() }).from(guestbookEntries).where(liveEntry),
    db.select({ n: count() }).from(guestbookLikes),
    db.select({ n: count() }).from(blogCommentLikes),
    db.select({ clicks: sum(links.clicks), n: count() }).from(links),
    db.select({ n: count() }).from(blogPosts),
    db.select({ n: count() }).from(blogReads).where(gte(blogReads.createdAt, from)),
    db
      .select({ n: count() })
      .from(blogReactions)
      .where(gte(blogReactions.updatedAt, from)),
    db
      .select({ n: count(), people: countDistinct(blogComments.clerkUserId) })
      .from(blogComments)
      .where(and(gte(blogComments.createdAt, from), liveComment)),
    db
      .select({ n: count(), people: countDistinct(guestbookEntries.clerkUserId) })
      .from(guestbookEntries)
      .where(and(gte(guestbookEntries.createdAt, from), liveEntry)),
    db
      .select({ n: count() })
      .from(blogReads)
      .where(between(blogReads.createdAt, previousFrom, from)),
    db
      .select({ n: count() })
      .from(blogReactions)
      .where(between(blogReactions.updatedAt, previousFrom, from)),
    db
      .select({ n: count() })
      .from(blogComments)
      .where(and(between(blogComments.createdAt, previousFrom, from), liveComment)),
    db
      .select({ n: count() })
      .from(guestbookEntries)
      .where(and(between(guestbookEntries.createdAt, previousFrom, from), liveEntry)),
    perDay(blogReads.createdAt, blogReads, from),
    perDay(blogReactions.updatedAt, blogReactions, from),
    perDay(blogComments.createdAt, blogComments, from, liveComment),
    perDay(guestbookEntries.createdAt, guestbookEntries, from, liveEntry),
    perDay(guestbookLikes.createdAt, guestbookLikes, from),
    perDay(blogCommentLikes.createdAt, blogCommentLikes, from),
    db
      .select({ postId: blogReads.postId, n: count() })
      .from(blogReads)
      .groupBy(blogReads.postId),
    db
      .select({ postId: blogReads.postId, n: count() })
      .from(blogReads)
      .where(gte(blogReads.createdAt, from))
      .groupBy(blogReads.postId),
    db
      .select({ postId: blogReactions.postId, n: count() })
      .from(blogReactions)
      .groupBy(blogReactions.postId),
    db
      .select({ postId: blogComments.postId, n: count() })
      .from(blogComments)
      .where(liveComment)
      .groupBy(blogComments.postId),
    db
      .select({ mood: blogReactions.mood, n: count() })
      .from(blogReactions)
      .groupBy(blogReactions.mood),
    db
      .select({
        tag: linkSlugs.tag,
        slug: linkSlugs.slug,
        target: links.target,
        clicks: links.clicks,
        enabled: links.enabled,
      })
      .from(links)
      .innerJoin(
        linkSlugs,
        and(eq(linkSlugs.linkId, links.id), eq(linkSlugs.isPrimary, true)),
      )
      .orderBy(desc(links.clicks))
      .limit(10),
  ]);

  const posts = await db
    .select({ id: blogPosts.id, slug: blogPosts.slug })
    .from(blogPosts);

  const lookup = (rows: Array<{ postId: number; n: number }>) =>
    new Map(rows.map((row) => [row.postId, row.n]));
  const reads = lookup(readsByPost);
  const readsRangeByPost = lookup(readsByPostRange);
  const reactions = lookup(reactionsByPost);
  const comments = lookup(commentsByPost);

  const topPosts = posts
    .map((post) => ({
      slug: post.slug,
      reads: reads.get(post.id) ?? 0,
      readsInRange: readsRangeByPost.get(post.id) ?? 0,
      reactions: reactions.get(post.id) ?? 0,
      comments: comments.get(post.id) ?? 0,
    }))
    .filter((post) => post.reads + post.reactions + post.comments > 0)
    .toSorted((a, b) => b.readsInRange - a.readsInRange || b.reads - a.reads)
    .slice(0, 10);

  const merge = (
    key: keyof typeof EMPTY_DAY,
    rows: Array<{ date: string; n: number }>,
  ) => rows.map((row) => ({ date: row.date, [key]: row.n }));

  const byDate = new Map<string, Partial<ActivityDay>>();
  for (const row of [
    ...merge("reads", readDays),
    ...merge("reactions", reactionDays),
    ...merge("comments", commentDays),
    ...merge("guestbook", guestbookDays),
  ]) {
    byDate.set(row.date, { ...byDate.get(row.date), ...row });
  }
  for (const row of [...guestbookLikeDays, ...commentLikeDays]) {
    const current = byDate.get(row.date) ?? { date: row.date };
    byDate.set(row.date, { ...current, likes: (current.likes ?? 0) + row.n });
  }

  return {
    totals: {
      reads: readsAll?.n ?? 0,
      reactions: reactionsAll?.n ?? 0,
      comments: commentsAll?.n ?? 0,
      guestbook: guestbookAll?.n ?? 0,
      likes: (guestbookLikesAll?.n ?? 0) + (commentLikesAll?.n ?? 0),
      linkClicks: toNumber(linkTotals?.clicks),
      posts: postsAll?.n ?? 0,
      links: linkTotals?.n ?? 0,
    },
    inRange: {
      reads: readsRange?.n ?? 0,
      reactions: reactionsRange?.n ?? 0,
      comments: commentsRange?.n ?? 0,
      guestbook: guestbookRange?.n ?? 0,
      likes: [...guestbookLikeDays, ...commentLikeDays].reduce(
        (total, row) => total + row.n,
        0,
      ),
      commenters: commentsRange?.people ?? 0,
      signers: guestbookRange?.people ?? 0,
    },
    previous: {
      reads: readsPrev?.n ?? 0,
      reactions: reactionsPrev?.n ?? 0,
      comments: commentsPrev?.n ?? 0,
      guestbook: guestbookPrev?.n ?? 0,
    },
    activity: fillDays(
      window,
      [...byDate.entries()].map(([date, row]) => ({ ...row, date })),
      EMPTY_DAY,
    ),
    topPosts,
    moods: Object.keys(MOOD_LABELS).map((mood) => ({
      mood,
      label: MOOD_LABELS[mood] ?? mood,
      count: moods.find((row) => row.mood === mood)?.n ?? 0,
    })),
    topLinks: linkRows.map((row) => ({
      path: `/${row.tag ? `${row.tag}/` : ""}${row.slug}`,
      target: row.target,
      clicks: row.clicks,
      enabled: row.enabled,
    })),
  };
}

const EMPTY_CONTENT: Omit<ContentAnalytics, "activity"> = {
  totals: {
    reads: 0,
    reactions: 0,
    comments: 0,
    guestbook: 0,
    likes: 0,
    linkClicks: 0,
    posts: 0,
    links: 0,
  },
  inRange: {
    reads: 0,
    reactions: 0,
    comments: 0,
    guestbook: 0,
    likes: 0,
    commenters: 0,
    signers: 0,
  },
  previous: { reads: 0, reactions: 0, comments: 0, guestbook: 0 },
  topPosts: [],
  moods: [],
  topLinks: [],
};

export function getContentAnalytics(
  window: AnalyticsWindow,
): Promise<ContentAnalytics> {
  return safeQuery("getContentAnalytics", () => loadContentAnalytics(window), {
    ...EMPTY_CONTENT,
    activity: fillDays(window, [], EMPTY_DAY),
  });
}
