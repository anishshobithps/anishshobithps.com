import { count, desc, eq } from "drizzle-orm";
import { getClerkUserMap, resolveUser } from "@/lib/clerk-users";
import { db } from "@/lib/db";
import { guestbookEntries } from "@/lib/schema";
import { toDataUri } from "@/lib/svg/data/image";

const AVATAR_SIZE = 64;

interface Signature {
  number: number;
  name: string;
  message: string;
  createdAt: string;
  avatar: string | null;
}

export interface Guestbook {
  total: number;
  signatures: Signature[];
}

function avatarUrl(imageUrl: string) {
  if (!imageUrl) return null;
  const params = new URLSearchParams({
    width: String(AVATAR_SIZE),
    height: String(AVATAR_SIZE),
    fit: "crop",
    quality: "80",
  });
  return `${imageUrl}${imageUrl.includes("?") ? "&" : "?"}${params}`;
}

export async function loadGuestbook(limit: number): Promise<Guestbook> {
  const visible = eq(guestbookEntries.isDeleted, false);
  const [rows, [totalRow]] = await Promise.all([
    db
      .select({
        clerkUserId: guestbookEntries.clerkUserId,
        message: guestbookEntries.message,
        createdAt: guestbookEntries.createdAt,
      })
      .from(guestbookEntries)
      .where(visible)
      .orderBy(desc(guestbookEntries.createdAt), desc(guestbookEntries.id))
      .limit(limit),
    db.select({ count: count() }).from(guestbookEntries).where(visible),
  ]);

  const total = totalRow?.count ?? 0;
  const users = await getClerkUserMap(rows.map((row) => row.clerkUserId));

  const signatures = await Promise.all(
    rows.map(async (row, index) => {
      const user = resolveUser(users, row.clerkUserId);
      return {
        number: total - index,
        name: user.name,
        message: row.message,
        createdAt: row.createdAt.toISOString(),
        avatar: await toDataUri(avatarUrl(user.imageUrl)),
      };
    }),
  );
  return { total, signatures };
}
