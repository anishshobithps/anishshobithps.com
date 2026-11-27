import { count, desc, eq } from "drizzle-orm";
import { getClerkUserMap, resolveUser } from "@/lib/clerk-users";
import { db } from "@repo/db";
import { guestbookEntries } from "@repo/db/schema";

const AVATAR_SIZE = 64;

const IMAGE_TIMEOUT_MS = 5000;
const IMAGE_MAX_BYTES = 120 * 1024;

async function toDataUri(url: string | null | undefined) {
  if (!url) return null;
  try {
    const res = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(IMAGE_TIMEOUT_MS),
      headers: { Accept: "image/jpeg,image/png;q=0.9" },
    });
    const type = res.headers.get("content-type")?.split(";")[0] ?? "";
    if (!res.ok || !type.startsWith("image/")) return null;
    const bytes = Buffer.from(await res.arrayBuffer());
    if (bytes.byteLength > IMAGE_MAX_BYTES) return null;
    return `data:${type};base64,${bytes.toString("base64")}`;
  } catch {
    return null;
  }
}

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
