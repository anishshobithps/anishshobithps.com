"use server";

import { getClerkUserMap, resolveUser, type PublicUser } from "@/lib/clerk-users";
import { db } from "@/lib/db";
import { guestbookEntries, guestbookLikes } from "@/lib/schema";
import { sanitizeText, ValidationError, validateLength } from "@/lib/text";
import { auth } from "@clerk/nextjs/server";
import { and, count, desc, eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const MAX_MESSAGE_LENGTH = 280;
const MIN_MESSAGE_LENGTH = 2;

const GUESTBOOK_PAGE_SIZE = 20;

export interface GuestbookEntryWithMeta {
    id: number;
    message: string;
    isPinned: boolean;
    createdAt: string;
    likeCount: number;
    likedByMe: boolean;
    user: PublicUser;
}

export interface GetEntriesResult {
    entries: GuestbookEntryWithMeta[];
    total: number;
    hasMore: boolean;
}

export async function getGuestbookEntries(
    { limit = GUESTBOOK_PAGE_SIZE, offset = 0 }: { limit?: number; offset?: number } = {},
): Promise<GetEntriesResult> {
    const { userId } = await auth();

    const [rows, [totalRow]] = await Promise.all([
        db
            .select({
                id: guestbookEntries.id,
                clerkUserId: guestbookEntries.clerkUserId,
                message: guestbookEntries.message,
                isPinned: guestbookEntries.isPinned,
                createdAt: guestbookEntries.createdAt,
                likeCount: sql<number>`count(${guestbookLikes.entryId})::int`,
            })
            .from(guestbookEntries)
            .leftJoin(guestbookLikes, eq(guestbookEntries.id, guestbookLikes.entryId))
            .where(eq(guestbookEntries.isDeleted, false))
            .groupBy(guestbookEntries.id)
            .orderBy(desc(guestbookEntries.isPinned), desc(guestbookEntries.createdAt))
            .limit(limit)
            .offset(offset),
        db.select({ count: count() }).from(guestbookEntries).where(eq(guestbookEntries.isDeleted, false)),
    ]);

    const total = totalRow?.count ?? 0;
    if (rows.length === 0) return { entries: [], total, hasMore: false };

    let likedEntryIds = new Set<number>();
    if (userId) {
        const likes = await db
            .select({ entryId: guestbookLikes.entryId })
            .from(guestbookLikes)
            .where(
                and(
                    eq(guestbookLikes.clerkUserId, userId),
                    inArray(guestbookLikes.entryId, rows.map((r) => r.id)),
                ),
            );
        likedEntryIds = new Set(likes.map((l) => l.entryId));
    }

    const userMap = await getClerkUserMap(rows.map((r) => r.clerkUserId));

    const entries: GuestbookEntryWithMeta[] = rows.map((row) => ({
        id: row.id,
        message: row.message,
        isPinned: row.isPinned,
        createdAt: row.createdAt.toISOString(),
        likeCount: row.likeCount,
        likedByMe: likedEntryIds.has(row.id),
        user: resolveUser(userMap, row.clerkUserId),
    }));

    return { entries, total, hasMore: offset + entries.length < total };
}

export interface GuestbookPreviewEntry {
    id: number;
    message: string;
    createdAt: string;
    user: {
        name: string;
        imageUrl: string;
    };
}

export async function getGuestbookPreview(limit = 15): Promise<GuestbookPreviewEntry[]> {
    const pool = await db
        .select({
            id: guestbookEntries.id,
            clerkUserId: guestbookEntries.clerkUserId,
            message: guestbookEntries.message,
            isPinned: guestbookEntries.isPinned,
            createdAt: guestbookEntries.createdAt,
        })
        .from(guestbookEntries)
        .where(and(eq(guestbookEntries.isDeleted, false), eq(guestbookEntries.isPinned, false)))
        .orderBy(desc(guestbookEntries.createdAt))
        .limit(60);

    const rows = pool
        .map((row) => ({ row, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .slice(0, limit)
        .map(({ row }) => row);

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
}

export async function submitGuestbookEntry(
    rawMessage: string,
): Promise<{ success: true; id: number } | { success: false; error: string }> {
    try {
        const { userId } = await auth();
        if (!userId) return { success: false, error: "You must be signed in to leave a message." };

        const message = sanitizeText(rawMessage);
        validateLength(message, { min: MIN_MESSAGE_LENGTH, max: MAX_MESSAGE_LENGTH, label: "Message" });

        const [inserted] = await db
            .insert(guestbookEntries)
            .values({ clerkUserId: userId, message })
            .returning({ id: guestbookEntries.id });

        revalidatePath("/guestbook");
        return { success: true, id: inserted.id };
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

        const [entry] = await db
            .select({ clerkUserId: guestbookEntries.clerkUserId })
            .from(guestbookEntries)
            .where(and(eq(guestbookEntries.id, entryId), eq(guestbookEntries.isDeleted, false)))
            .limit(1);

        if (!entry) return { success: false, error: "Entry not found." };

        const isOwner = entry.clerkUserId === userId;
        const isSiteOwner = userId === process.env.OWNER_CLERK_USER_ID;

        if (!isOwner && !isSiteOwner) {
            return { success: false, error: "You don't have permission to delete this entry." };
        }

        await db
            .update(guestbookEntries)
            .set({ isDeleted: true, updatedAt: new Date() })
            .where(eq(guestbookEntries.id, entryId));

        revalidatePath("/guestbook");
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
        if (!userId || userId !== process.env.OWNER_CLERK_USER_ID) {
            return { success: false, error: "Not authorized." };
        }

        const [entry] = await db
            .select({ isPinned: guestbookEntries.isPinned })
            .from(guestbookEntries)
            .where(eq(guestbookEntries.id, entryId))
            .limit(1);

        if (!entry) return { success: false, error: "Entry not found." };

        await db
            .update(guestbookEntries)
            .set({ isPinned: !entry.isPinned, updatedAt: new Date() })
            .where(eq(guestbookEntries.id, entryId));

        revalidatePath("/guestbook");
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

        const [existing] = await db
            .select()
            .from(guestbookLikes)
            .where(and(eq(guestbookLikes.entryId, entryId), eq(guestbookLikes.clerkUserId, userId)))
            .limit(1);

        if (existing) {
            await db
                .delete(guestbookLikes)
                .where(and(eq(guestbookLikes.entryId, entryId), eq(guestbookLikes.clerkUserId, userId)));
            revalidatePath("/guestbook");
            return { success: true, liked: false };
        }

        await db.insert(guestbookLikes).values({ entryId, clerkUserId: userId });
        revalidatePath("/guestbook");
        return { success: true, liked: true };
    } catch {
        return { success: false, error: "Something went wrong." };
    }
}
