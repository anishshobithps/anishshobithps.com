"use server";

import { db } from "@/lib/db";
import { guestbookEntries, guestbookLikes } from "@/lib/schema";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { and, desc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const MAX_MESSAGE_LENGTH = 280;
const MIN_MESSAGE_LENGTH = 2;

export interface GuestbookUser {
    id: string;
    name: string;
    username: string | null;
    imageUrl: string;
}

export interface GuestbookEntryWithMeta {
    id: number;
    message: string;
    isPinned: boolean;
    createdAt: string;
    likeCount: number;
    likedByMe: boolean;
    user: GuestbookUser;
}

export interface GetEntriesResult {
    entries: GuestbookEntryWithMeta[];
    total: number;
}

function sanitize(message: string): string {
    return message.trim().replace(/\s+/g, " ");
}

function validateMessage(message: string): void {
    if (message.length < MIN_MESSAGE_LENGTH) {
        throw new Error("Message must be at least " + MIN_MESSAGE_LENGTH + " characters.");
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
        throw new Error("Message must be " + MAX_MESSAGE_LENGTH + " characters or fewer.");
    }
}

export async function getGuestbookEntries(): Promise<GetEntriesResult> {
    const { userId } = await auth();

    const rows = await db
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
        .orderBy(desc(guestbookEntries.isPinned), desc(guestbookEntries.createdAt));

    if (rows.length === 0) return { entries: [], total: 0 };

    let likedEntryIds = new Set<number>();
    if (userId) {
        const likes = await db
            .select({ entryId: guestbookLikes.entryId })
            .from(guestbookLikes)
            .where(eq(guestbookLikes.clerkUserId, userId));
        likedEntryIds = new Set(likes.map((l) => l.entryId));
    }

    const uniqueUserIds = [...new Set(rows.map((r) => r.clerkUserId))];
    const client = await clerkClient();
    const clerkUsers = await client.users.getUserList({ userId: uniqueUserIds, limit: 500 });

    const userMap = new Map<string, GuestbookUser>(
        clerkUsers.data.map((u) => [
            u.id,
            {
                id: u.id,
                name: [u.firstName, u.lastName].filter(Boolean).join(" ") || u.username || "Anonymous",
                username: u.username,
                imageUrl: u.imageUrl,
            },
        ]),
    );

    const entries: GuestbookEntryWithMeta[] = rows.map((row) => ({
        id: row.id,
        message: row.message,
        isPinned: row.isPinned,
        createdAt: row.createdAt.toISOString(),
        likeCount: row.likeCount,
        likedByMe: likedEntryIds.has(row.id),
        user: userMap.get(row.clerkUserId) ?? {
            id: row.clerkUserId,
            name: "Unknown User",
            username: null,
            imageUrl: "",
        },
    }));

    return { entries, total: entries.length };
}

export async function submitGuestbookEntry(
    rawMessage: string,
): Promise<{ success: true; id: number } | { success: false; error: string }> {
    try {
        const { userId } = await auth();
        if (!userId) return { success: false, error: "You must be signed in to leave a message." };

        const message = sanitize(rawMessage);
        validateMessage(message);

        const [inserted] = await db
            .insert(guestbookEntries)
            .values({ clerkUserId: userId, message })
            .returning({ id: guestbookEntries.id });

        revalidatePath("/guestbook");
        return { success: true, id: inserted.id };
    } catch (err) {
        const message = err instanceof Error ? err.message : "Something went wrong.";
        return { success: false, error: message };
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
