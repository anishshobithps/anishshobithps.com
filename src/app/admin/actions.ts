import { db } from "@/lib/db";
import {
    blogCommentLikes,
    blogComments,
    blogPosts,
    blogReactions,
    blogReads,
    guestbookEntries,
    guestbookLikes,
} from "@/lib/schema";
import { clerkClient } from "@clerk/nextjs/server";
import { count, desc, eq, sql } from "drizzle-orm";
import type { GuestbookUser, GuestbookEntryWithMeta } from "@/app/(site)/guestbook/actions";
import type { CommentUser } from "@/app/(site)/blog/[[...slug]]/actions";

export type { GuestbookEntryWithMeta };

export interface AdminCommentRow {
    id: number;
    postSlug: string;
    parentId: number | null;
    body: string;
    isPinned: boolean;
    createdAt: string;
    likeCount: number;
    user: CommentUser;
}

export async function getAdminStats() {
    const [
        [guestbookTotal],
        [guestbookActive],
        [commentsTotal],
        [commentsActive],
        [reads],
        [reactions],
    ] = await Promise.all([
        db.select({ count: count() }).from(guestbookEntries),
        db.select({ count: count() }).from(guestbookEntries).where(eq(guestbookEntries.isDeleted, false)),
        db.select({ count: count() }).from(blogComments),
        db.select({ count: count() }).from(blogComments).where(eq(blogComments.isDeleted, false)),
        db.select({ count: count() }).from(blogReads),
        db.select({ count: count() }).from(blogReactions),
    ]);

    return {
        guestbook: { total: guestbookTotal?.count ?? 0, active: guestbookActive?.count ?? 0 },
        comments: { total: commentsTotal?.count ?? 0, active: commentsActive?.count ?? 0 },
        reads: reads?.count ?? 0,
        reactions: reactions?.count ?? 0,
    };
}

export async function getAllAdminGuestbookEntries(): Promise<GuestbookEntryWithMeta[]> {
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

    if (rows.length === 0) return [];

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

    return rows.map((row) => ({
        id: row.id,
        message: row.message,
        isPinned: row.isPinned,
        createdAt: row.createdAt.toISOString(),
        likeCount: row.likeCount,
        likedByMe: false,
        user: userMap.get(row.clerkUserId) ?? { id: row.clerkUserId, name: "Unknown User", username: null, imageUrl: "" },
    }));
}

export async function getAllAdminComments(): Promise<AdminCommentRow[]> {
    const rows = await db
        .select({
            id: blogComments.id,
            postSlug: blogPosts.slug,
            parentId: blogComments.parentId,
            clerkUserId: blogComments.clerkUserId,
            body: blogComments.body,
            isPinned: blogComments.isPinned,
            createdAt: blogComments.createdAt,
            likeCount: sql<number>`count(${blogCommentLikes.commentId})::int`,
        })
        .from(blogComments)
        .leftJoin(blogPosts, eq(blogComments.postId, blogPosts.id))
        .leftJoin(blogCommentLikes, eq(blogComments.id, blogCommentLikes.commentId))
        .where(eq(blogComments.isDeleted, false))
        .groupBy(blogComments.id, blogPosts.slug)
        .orderBy(desc(blogComments.createdAt));

    if (rows.length === 0) return [];

    const uniqueUserIds = [...new Set(rows.map((r) => r.clerkUserId))];
    const client = await clerkClient();
    const clerkUsers = await client.users.getUserList({ userId: uniqueUserIds, limit: 500 });

    const userMap = new Map<string, CommentUser>(
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

    return rows.map((row) => ({
        id: row.id,
        postSlug: row.postSlug ?? "unknown",
        parentId: row.parentId,
        body: row.body,
        isPinned: row.isPinned,
        createdAt: row.createdAt.toISOString(),
        likeCount: row.likeCount,
        user: userMap.get(row.clerkUserId) ?? { id: row.clerkUserId, name: "Unknown User", username: null, imageUrl: "" },
    }));
}
