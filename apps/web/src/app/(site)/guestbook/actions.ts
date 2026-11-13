"use server";

import { ENV } from "varlock/env";
import { getClerkUserMap, resolveUser, type PublicUser } from "@/lib/clerk-users";
import { db } from "@repo/db";
import { guestbookEntries, guestbookLikes } from "@repo/db/schema";
import { resolvePagination } from "@repo/core/pagination";
import { safeQuery } from "@/lib/safe-query";
import { sanitizeText, ValidationError, validateLength } from "@repo/core/text";
import { auth } from "@clerk/nextjs/server";
import { and, count, desc, eq, sql } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { GUESTBOOK_PREVIEW_TAG } from "@/lib/guestbook-preview";

function refreshPublicPreview() {
    updateTag(GUESTBOOK_PREVIEW_TAG);
    revalidatePath("/");
    revalidatePath("/guestbook");
}

const MAX_MESSAGE_LENGTH = 280;
const MIN_MESSAGE_LENGTH = 2;

const GUESTBOOK_PAGE_SIZE = 20;
const GUESTBOOK_MAX_PAGE_SIZE = 50;

export interface GuestbookEntryWithMeta {
    id: number;
    message: string;
    isPinned: boolean;
    createdAt: string;
    likeCount: number;
    likedByMe: boolean;
    user: PublicUser;
    number?: number;
    visit?: number;
}

export interface GetEntriesResult {
    entries: GuestbookEntryWithMeta[];
    total: number;
    hasMore: boolean;
    viewerId: string | null;
}

export async function getGuestbookEntries(
    options: { limit?: number; offset?: number } = {},
): Promise<GetEntriesResult> {
    return safeQuery("getGuestbookEntries", () => loadGuestbookEntries(options), {
        entries: [],
        total: 0,
        hasMore: false,
        viewerId: null,
    });
}

async function loadGuestbookEntries(
    { limit, offset }: { limit?: number; offset?: number } = {},
): Promise<GetEntriesResult> {
    const { userId } = await auth();

    const page = resolvePagination(
        { limit, offset },
        { defaultLimit: GUESTBOOK_PAGE_SIZE, maxLimit: GUESTBOOK_MAX_PAGE_SIZE },
    );

    const likeCount = sql<number>`(select count(*)::int from ${guestbookLikes} where ${guestbookLikes.entryId} = ${guestbookEntries.id})`;
    const likedByMe = userId
        ? sql<boolean>`exists (select 1 from ${guestbookLikes} where ${guestbookLikes.entryId} = ${guestbookEntries.id} and ${guestbookLikes.clerkUserId} = ${userId})`
        : sql<boolean>`false`;

    const [rows, [totalRow]] = await db.batch([
        db
            .select({
                id: guestbookEntries.id,
                clerkUserId: guestbookEntries.clerkUserId,
                message: guestbookEntries.message,
                isPinned: guestbookEntries.isPinned,
                createdAt: guestbookEntries.createdAt,
                likeCount,
                likedByMe,
                number: sql<number>`(row_number() over (order by ${guestbookEntries.createdAt}, ${guestbookEntries.id}))::int`,
                visit: sql<number>`(row_number() over (partition by ${guestbookEntries.clerkUserId} order by ${guestbookEntries.createdAt}, ${guestbookEntries.id}))::int`,
            })
            .from(guestbookEntries)
            .where(eq(guestbookEntries.isDeleted, false))
            .orderBy(desc(guestbookEntries.isPinned), desc(guestbookEntries.createdAt))
            .limit(page.limit)
            .offset(page.offset),
        db.select({ count: count() }).from(guestbookEntries).where(eq(guestbookEntries.isDeleted, false)),
    ]);

    const total = totalRow?.count ?? 0;
    if (rows.length === 0) return { entries: [], total, hasMore: false, viewerId: userId };

    const userMap = await getClerkUserMap(rows.map((r) => r.clerkUserId));

    const entries: GuestbookEntryWithMeta[] = rows.map((row) => ({
        id: row.id,
        message: row.message,
        isPinned: row.isPinned,
        createdAt: row.createdAt.toISOString(),
        likeCount: row.likeCount,
        likedByMe: row.likedByMe,
        user: resolveUser(userMap, row.clerkUserId),
        number: row.number,
        visit: row.visit,
    }));

    return { entries, total, hasMore: page.offset + entries.length < total, viewerId: userId };
}

export async function submitGuestbookEntry(
    rawMessage: string,
): Promise<{ success: true; id: number; visit: number } | { success: false; error: string }> {
    try {
        const { userId } = await auth();
        if (!userId) return { success: false, error: "You must be signed in to leave a message." };

        const message = sanitizeText(rawMessage);
        validateLength(message, { min: MIN_MESSAGE_LENGTH, max: MAX_MESSAGE_LENGTH, label: "Message" });

        const result = await db.execute<{ id: number; visits: number }>(sql`
            with inserted as (
                insert into guestbook_entries (clerk_user_id, message)
                values (${userId}, ${message})
                returning id
            )
            select
                id,
                ((select count(*) from guestbook_entries where clerk_user_id = ${userId} and is_deleted = false) + 1)::int as visits
            from inserted
        `);
        const inserted = result.rows[0];
        if (!inserted) throw new Error("Insert returned no row");

        refreshPublicPreview();
        return { success: true, id: inserted.id, visit: inserted.visits };
    } catch (err) {
        if (err instanceof ValidationError) return { success: false, error: err.message };
        console.error("[submitGuestbookEntry]", err);
        return { success: false, error: "Something went wrong. Please try again." };
    }
}

export async function deleteGuestbookEntry(
    entryId: number,
): Promise<{ success: true } | { success: false; error: string }> {
    try {
        const { userId } = await auth();
        if (!userId) return { success: false, error: "Not authenticated." };

        const isSiteOwner = userId === ENV.OWNER_CLERK_USER_ID;

        const updated = await db
            .update(guestbookEntries)
            .set({ isDeleted: true, updatedAt: new Date() })
            .where(
                and(
                    eq(guestbookEntries.id, entryId),
                    eq(guestbookEntries.isDeleted, false),
                    isSiteOwner ? undefined : eq(guestbookEntries.clerkUserId, userId),
                ),
            )
            .returning({ id: guestbookEntries.id });

        if (updated.length === 0) {
            const [exists] = await db
                .select({ id: guestbookEntries.id })
                .from(guestbookEntries)
                .where(and(eq(guestbookEntries.id, entryId), eq(guestbookEntries.isDeleted, false)))
                .limit(1);
            return exists
                ? { success: false, error: "You don't have permission to delete this entry." }
                : { success: false, error: "Entry not found." };
        }

        refreshPublicPreview();
        return { success: true };
    } catch {
        return { success: false, error: "Something went wrong." };
    }
}

export async function togglePinEntry(
    entryId: number,
): Promise<{ success: true } | { success: false; error: string }> {
    try {
        const { userId } = await auth();
        if (!userId || userId !== ENV.OWNER_CLERK_USER_ID) {
            return { success: false, error: "Not authorized." };
        }

        const updated = await db
            .update(guestbookEntries)
            .set({ isPinned: sql`not ${guestbookEntries.isPinned}`, updatedAt: new Date() })
            .where(eq(guestbookEntries.id, entryId))
            .returning({ id: guestbookEntries.id });

        if (updated.length === 0) return { success: false, error: "Entry not found." };

        refreshPublicPreview();
        return { success: true };
    } catch {
        return { success: false, error: "Something went wrong." };
    }
}

export async function toggleLike(
    entryId: number,
): Promise<{ success: true; liked: boolean } | { success: false; error: string }> {
    try {
        const { userId } = await auth();
        if (!userId) return { success: false, error: "You must be signed in to like entries." };

        const removed = await db
            .delete(guestbookLikes)
            .where(and(eq(guestbookLikes.entryId, entryId), eq(guestbookLikes.clerkUserId, userId)))
            .returning({ entryId: guestbookLikes.entryId });

        if (removed.length > 0) return { success: true, liked: false };

        await db.insert(guestbookLikes).values({ entryId, clerkUserId: userId }).onConflictDoNothing();
        return { success: true, liked: true };
    } catch {
        return { success: false, error: "Something went wrong." };
    }
}
