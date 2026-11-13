import { and, desc, eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { db } from "@repo/db";
import { guestbookEntries } from "@repo/db/schema";
import { getClerkUserMap, resolveUser } from "@/lib/clerk-users";
import { safeQuery } from "@/lib/safe-query";

export const GUESTBOOK_PREVIEW_TAG = "guestbook-preview";

export interface GuestbookPreviewEntry {
  id: number;
  message: string;
  createdAt: string;
  user: {
    name: string;
    imageUrl: string;
  };
}

const POOL_SIZE = 60;

const cachedPool = unstable_cache(
  async (): Promise<GuestbookPreviewEntry[]> => {
    const rows = await db
      .select({
        id: guestbookEntries.id,
        clerkUserId: guestbookEntries.clerkUserId,
        message: guestbookEntries.message,
        createdAt: guestbookEntries.createdAt,
      })
      .from(guestbookEntries)
      .where(
        and(
          eq(guestbookEntries.isDeleted, false),
          eq(guestbookEntries.isPinned, false),
        ),
      )
      .orderBy(desc(guestbookEntries.createdAt))
      .limit(POOL_SIZE);

    if (rows.length === 0) return [];

    const userMap = await getClerkUserMap(rows.map((r) => r.clerkUserId));

    return rows.map((row) => {
      const user = resolveUser(userMap, row.clerkUserId);
      return {
        id: row.id,
        message: row.message,
        createdAt: row.createdAt.toISOString(),
        user: { name: user.name, imageUrl: user.imageUrl },
      };
    });
  },
  ["guestbook-preview-pool"],
  { revalidate: 600, tags: [GUESTBOOK_PREVIEW_TAG] },
);

export function getGuestbookPreviewPool(): Promise<GuestbookPreviewEntry[]> {
  return safeQuery("getGuestbookPreviewPool", () => cachedPool(), []);
}

export function pickRandom<T>(list: readonly T[], count: number): T[] {
  return list
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .slice(0, count)
    .map(({ item }) => item);
}
