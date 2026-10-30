import { eq, inArray, sql } from "drizzle-orm";
import { toTimestamp } from "@repo/core/date";
import { db } from "@/lib/db";
import { blogPosts, blogReads } from "@/lib/schema";
import { getLatestPost, source } from "@/lib/source";

export interface PostCard {
  url: string;
  title: string;
  description: string;
  date: string | null;
  readingMinutes: number | null;
  tags: string[];
}

type Page = NonNullable<ReturnType<typeof getLatestPost>>;

export function findPost(slug?: string): Page | undefined {
  return slug ? source.getPage(slug.split("/")) : getLatestPost();
}

function readingMinutes(page: Page) {
  const exports = (page.data as { _exports?: { readingTime?: { minutes?: number } } })
    ._exports;
  const minutes = exports?.readingTime?.minutes;
  return typeof minutes === "number" ? Math.max(1, Math.round(minutes)) : null;
}

export async function loadPostCard(slug?: string): Promise<PostCard> {
  const page = findPost(slug);
  if (!page) throw new Error(`No post for slug "${slug ?? ""}"`);

  return {
    url: page.url,
    title: page.data.title,
    description: page.data.description ?? "",
    date: page.data.date ? new Date(page.data.date).toISOString() : null,
    readingMinutes: readingMinutes(page),
    tags: (page.data.tags as string[] | undefined) ?? [],
  };
}

export interface PostRow {
  url: string;
  title: string;
  date: string | null;
  readingMinutes: number | null;
  views: number;
}

export async function loadRecentPosts(
  limit: number,
): Promise<{ total: number; posts: PostRow[] }> {
  const pages = source
    .getPages()
    .sort((a, b) => toTimestamp(b.data.date) - toTimestamp(a.data.date));
  const recent = pages.slice(0, limit);
  if (recent.length === 0) return { total: 0, posts: [] };

  const reads = await db
    .select({
      slug: blogPosts.slug,
      count: sql<number>`count(${blogReads.postId})::int`,
    })
    .from(blogPosts)
    .leftJoin(blogReads, eq(blogReads.postId, blogPosts.id))
    .where(inArray(blogPosts.slug, recent.map((page) => page.url)))
    .groupBy(blogPosts.slug);
  const views = new Map(reads.map(({ slug, count }) => [slug, count]));

  return {
    total: pages.length,
    posts: recent.map((page) => ({
      url: page.url,
      title: page.data.title,
      date: page.data.date ? new Date(page.data.date).toISOString() : null,
      readingMinutes: readingMinutes(page),
      views: views.get(page.url) ?? 0,
    })),
  };
}
