"use server";

import { db } from "@/lib/db";
import { getClientIp, hashIp } from "@/lib/ip";
import { blogCommentLikes, blogComments, blogReactions, blogReads } from "@/lib/schema";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { and, desc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export type MoodId = "terrible" | "bad" | "good" | "amazing";
export type ReactionCounts = Partial<Record<MoodId, number>>;

export interface ReactionsData {
    counts: ReactionCounts;
    userMood: MoodId | null;
}

const VALID_MOODS = new Set<MoodId>(["terrible", "bad", "good", "amazing"]);

function isValidMood(mood: unknown): mood is MoodId {
    return typeof mood === "string" && VALID_MOODS.has(mood as MoodId);
}

async function getIpHash(): Promise<string> {
    const hdrs = await headers();
    return hashIp(getClientIp(hdrs));
}

export async function trackRead(slug: string): Promise<void> {
    const ipHash = await getIpHash();
    await db
        .insert(blogReads)
        .values({ slug, ipHash })
        .onConflictDoNothing();
}

export async function getBlogReadsCount(slug: string): Promise<number> {
    const count = await db
        .select({ count: blogReads.slug })
        .from(blogReads)
        .where(eq(blogReads.slug, slug));
    return count.length;
}

export async function getReactions(slug: string): Promise<ReactionsData> {
    const ipHash = await getIpHash();

    const [countRows, userRows] = await Promise.all([
        db
            .select({
                mood: blogReactions.mood,
                count: sql<number>`count(*)::int`,
            })
            .from(blogReactions)
            .where(eq(blogReactions.slug, slug))
            .groupBy(blogReactions.mood),

        db
            .select({ mood: blogReactions.mood })
            .from(blogReactions)
            .where(
                and(
                    eq(blogReactions.slug, slug),
                    eq(blogReactions.ipHash, ipHash)
                )
            )
            .limit(1),
    ]);

    const counts = countRows.reduce<ReactionCounts>((acc, { mood, count }) => {
        if (isValidMood(mood)) acc[mood] = count;
        return acc;
    }, {});

    const userMood = userRows[0]?.mood;

    return {
        counts,
        userMood: isValidMood(userMood) ? userMood : null,
    };
}

export async function submitReaction(
    slug: string,
    mood: MoodId | null
): Promise<void> {
    if (mood !== null && !isValidMood(mood)) {
        throw new Error(`Invalid mood: ${mood}`);
    }

    const ipHash = await getIpHash();

    if (mood === null) {
        await db
            .delete(blogReactions)
            .where(
                and(
                    eq(blogReactions.slug, slug),
                    eq(blogReactions.ipHash, ipHash)
                )
            );
    } else {
        const now = new Date();
        await db
            .insert(blogReactions)
            .values({ slug, ipHash, mood, updatedAt: now })
            .onConflictDoUpdate({
                target: [blogReactions.slug, blogReactions.ipHash],
                set: { mood, updatedAt: now },
            });
    }
}


const MAX_BODY_LENGTH = 1000;
const MIN_BODY_LENGTH = 2;

export interface CommentUser {
    id: string;
    name: string;
    username: string | null;
    imageUrl: string;
}

export interface CommentWithMeta {
    id: number;
    slug: string;
    parentId: number | null;
    body: string;
    isPinned: boolean;
    createdAt: string;
    likeCount: number;
    likedByMe: boolean;
    user: CommentUser;
    replies: CommentWithMeta[];
}

export interface GetCommentsResult {
    comments: CommentWithMeta[];
    total: number;
}

function sanitize(body: string): string {
    return body.trim().replace(/\s+/g, " ");
}

function validateBody(body: string): void {
    if (body.length < MIN_BODY_LENGTH)
        throw new Error(`Comment must be at least ${MIN_BODY_LENGTH} characters.`);
    if (body.length > MAX_BODY_LENGTH)
        throw new Error(`Comment must be ${MAX_BODY_LENGTH} characters or fewer.`);
}

export async function getComments(slug: string): Promise<GetCommentsResult> {
    const { userId } = await auth();

    const rows = await db
        .select({
            id: blogComments.id,
            slug: blogComments.slug,
            parentId: blogComments.parentId,
            clerkUserId: blogComments.clerkUserId,
            body: blogComments.body,
            isPinned: blogComments.isPinned,
            createdAt: blogComments.createdAt,
            likeCount: sql<number>`count(${blogCommentLikes.commentId})::int`,
        })
        .from(blogComments)
        .leftJoin(blogCommentLikes, eq(blogComments.id, blogCommentLikes.commentId))
        .where(and(eq(blogComments.slug, slug), eq(blogComments.isDeleted, false)))
        .groupBy(blogComments.id)
        .orderBy(desc(blogComments.isPinned), desc(blogComments.createdAt));

    if (rows.length === 0) return { comments: [], total: 0 };

    let likedIds = new Set<number>();
    if (userId) {
        const likes = await db
            .select({ commentId: blogCommentLikes.commentId })
            .from(blogCommentLikes)
            .where(eq(blogCommentLikes.clerkUserId, userId));
        likedIds = new Set(likes.map((l) => l.commentId));
    }

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

    const flat: CommentWithMeta[] = rows.map((row) => ({
        id: row.id,
        slug: row.slug,
        parentId: row.parentId,
        body: row.body,
        isPinned: row.isPinned,
        createdAt: row.createdAt.toISOString(),
        likeCount: row.likeCount,
        likedByMe: likedIds.has(row.id),
        user: userMap.get(row.clerkUserId) ?? {
            id: row.clerkUserId,
            name: "Unknown User",
            username: null,
            imageUrl: "",
        },
        replies: [],
    }));

    const map = new Map(flat.map((c) => [c.id, c]));
    const roots: CommentWithMeta[] = [];

    for (const comment of flat) {
        if (comment.parentId && map.has(comment.parentId)) {
            map.get(comment.parentId)!.replies.push(comment);
        } else {
            roots.push(comment);
        }
    }

    return { comments: roots, total: flat.length };
}

export async function submitComment(
    slug: string,
    body: string,
    parentId?: number,
): Promise<{ success: true; id: number } | { success: false; error: string }> {
    try {
        const { userId } = await auth();
        if (!userId) return { success: false, error: "You must be signed in to leave a comment." };

        const trimmed = sanitize(body);
        validateBody(trimmed);

        const [inserted] = await db
            .insert(blogComments)
            .values({ slug, clerkUserId: userId, body: trimmed, parentId: parentId ?? null })
            .returning({ id: blogComments.id });

        revalidatePath(`/blog/${slug}`);
        return { success: true, id: inserted.id };
    } catch (err) {
        console.error("[submitComment]", err);
        return { success: false, error: err instanceof Error ? err.message : "Something went wrong." };
    }
}

export async function deleteComment(
    commentId: number,
): Promise<{ success: true } | { success: false; error: string }> {
    try {
        const { userId } = await auth();
        if (!userId) return { success: false, error: "Not authenticated." };

        const [comment] = await db
            .select({ clerkUserId: blogComments.clerkUserId, slug: blogComments.slug })
            .from(blogComments)
            .where(and(eq(blogComments.id, commentId), eq(blogComments.isDeleted, false)))
            .limit(1);

        if (!comment) return { success: false, error: "Comment not found." };

        const isOwner = comment.clerkUserId === userId;
        const isSiteOwner = userId === process.env.OWNER_CLERK_USER_ID;

        if (!isOwner && !isSiteOwner)
            return { success: false, error: "You don't have permission to delete this comment." };

        await db
            .update(blogComments)
            .set({ isDeleted: true, updatedAt: new Date() })
            .where(eq(blogComments.id, commentId));

        revalidatePath(`/blog/${comment.slug}`);
        return { success: true };
    } catch {
        return { success: false, error: "Something went wrong." };
    }
}

export async function togglePinComment(
    commentId: number,
): Promise<{ success: true } | { success: false; error: string }> {
    try {
        const { userId } = await auth();
        if (!userId || userId !== process.env.OWNER_CLERK_USER_ID)
            return { success: false, error: "Not authorized." };

        const [comment] = await db
            .select({ isPinned: blogComments.isPinned, slug: blogComments.slug })
            .from(blogComments)
            .where(eq(blogComments.id, commentId))
            .limit(1);

        if (!comment) return { success: false, error: "Comment not found." };

        await db
            .update(blogComments)
            .set({ isPinned: !comment.isPinned, updatedAt: new Date() })
            .where(eq(blogComments.id, commentId));

        revalidatePath(`/blog/${comment.slug}`);
        return { success: true };
    } catch {
        return { success: false, error: "Something went wrong." };
    }
}

export async function toggleCommentLike(
    commentId: number,
): Promise<{ success: true; liked: boolean } | { success: false; error: string }> {
    try {
        const { userId } = await auth();
        if (!userId) return { success: false, error: "You must be signed in to like comments." };

        const [existing] = await db
            .select()
            .from(blogCommentLikes)
            .where(and(eq(blogCommentLikes.commentId, commentId), eq(blogCommentLikes.clerkUserId, userId)))
            .limit(1);

        if (existing) {
            await db
                .delete(blogCommentLikes)
                .where(and(eq(blogCommentLikes.commentId, commentId), eq(blogCommentLikes.clerkUserId, userId)));
            return { success: true, liked: false };
        }

        await db.insert(blogCommentLikes).values({ commentId, clerkUserId: userId });
        return { success: true, liked: true };
    } catch {
        return { success: false, error: "Something went wrong." };
    }
}
