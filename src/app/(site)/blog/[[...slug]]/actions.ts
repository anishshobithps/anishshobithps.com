"use server";

import { getClerkUserMap, resolveUser, type PublicUser } from "@/lib/clerk-users";
import { db } from "@/lib/db";
import { getClientIp, hashIp } from "@/lib/ip";
import { blogCommentLikes, blogComments, blogPosts, blogReactions, blogReads } from "@/lib/schema";
import { source } from "@/lib/source";
import { sanitizeText, ValidationError, validateLength } from "@/lib/text";
import { auth } from "@clerk/nextjs/server";
import { and, count, desc, eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { cache } from "react";

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

const isKnownPost = cache(async (slug: string): Promise<boolean> => {
    return source.getPages().some((page) => page.url === slug);
});

const getPostIdBySlug = cache(async (slug: string): Promise<number | null> => {
    const [post] = await db
        .select({ id: blogPosts.id })
        .from(blogPosts)
        .where(eq(blogPosts.slug, slug))
        .limit(1);
    return post?.id ?? null;
});

async function getOrCreatePost(slug: string): Promise<number | null> {
    if (!(await isKnownPost(slug))) return null;

    const [existing] = await db
        .select({ id: blogPosts.id })
        .from(blogPosts)
        .where(eq(blogPosts.slug, slug))
        .limit(1);

    if (existing) return existing.id;

    const [inserted] = await db
        .insert(blogPosts)
        .values({ slug })
        .onConflictDoNothing()
        .returning({ id: blogPosts.id });

    if (inserted) return inserted.id;

    const [retry] = await db
        .select({ id: blogPosts.id })
        .from(blogPosts)
        .where(eq(blogPosts.slug, slug))
        .limit(1);

    return retry.id;
}

export async function trackRead(slug: string): Promise<void> {
    const [postId, ipHash] = await Promise.all([getOrCreatePost(slug), getIpHash()]);
    if (postId === null) return;
    await db.insert(blogReads).values({ postId, ipHash }).onConflictDoNothing();
}

export async function getBlogReadsCount(slug: string): Promise<number> {
    const postId = await getPostIdBySlug(slug);

    if (postId === null) return 0;

    const rows = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(blogReads)
        .where(eq(blogReads.postId, postId));

    return rows[0]?.count ?? 0;
}

export async function getReactions(slug: string): Promise<ReactionsData> {
    const [ipHash, postId] = await Promise.all([
        getIpHash(),
        getPostIdBySlug(slug),
    ]);

    if (postId === null) return { counts: {}, userMood: null };

    const [countRows, userRows] = await Promise.all([
        db
            .select({
                mood: blogReactions.mood,
                count: sql<number>`count(*)::int`,
            })
            .from(blogReactions)
            .where(eq(blogReactions.postId, postId))
            .groupBy(blogReactions.mood),

        db
            .select({ mood: blogReactions.mood })
            .from(blogReactions)
            .where(and(eq(blogReactions.postId, postId), eq(blogReactions.ipHash, ipHash)))
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

export async function submitReaction(slug: string, mood: MoodId | null): Promise<void> {
    if (mood !== null && !isValidMood(mood)) {
        throw new Error(`Invalid mood: ${mood}`);
    }

    const [postId, ipHash] = await Promise.all([getOrCreatePost(slug), getIpHash()]);
    if (postId === null) return;

    if (mood === null) {
        await db
            .delete(blogReactions)
            .where(and(eq(blogReactions.postId, postId), eq(blogReactions.ipHash, ipHash)));
    } else {
        const now = new Date();
        await db
            .insert(blogReactions)
            .values({ postId, ipHash, mood, updatedAt: now })
            .onConflictDoUpdate({
                target: [blogReactions.postId, blogReactions.ipHash],
                set: { mood, updatedAt: now },
            });
    }
}

const MAX_BODY_LENGTH = 1000;
const MIN_BODY_LENGTH = 2;

export type CommentUser = PublicUser;

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

export async function getCommentCount(slug: string): Promise<number> {
    const postId = await getPostIdBySlug(slug);

    if (postId === null) return 0;

    const [row] = await db
        .select({ count: count() })
        .from(blogComments)
        .where(and(eq(blogComments.postId, postId), eq(blogComments.isDeleted, false)));

    return row?.count ?? 0;
}

export async function getComments(slug: string): Promise<GetCommentsResult> {
    const { userId } = await auth();

    const postId = await getPostIdBySlug(slug);

    if (postId === null) return { comments: [], total: 0 };

    const rows = await db
        .select({
            id: blogComments.id,
            postId: blogComments.postId,
            parentId: blogComments.parentId,
            clerkUserId: blogComments.clerkUserId,
            body: blogComments.body,
            isPinned: blogComments.isPinned,
            createdAt: blogComments.createdAt,
            likeCount: sql<number>`count(${blogCommentLikes.commentId})::int`,
        })
        .from(blogComments)
        .leftJoin(blogCommentLikes, eq(blogComments.id, blogCommentLikes.commentId))
        .where(and(eq(blogComments.postId, postId), eq(blogComments.isDeleted, false)))
        .groupBy(blogComments.id)
        .orderBy(desc(blogComments.isPinned), desc(blogComments.createdAt));

    if (rows.length === 0) return { comments: [], total: 0 };

    let likedIds = new Set<number>();
    if (userId) {
        const likes = await db
            .select({ commentId: blogCommentLikes.commentId })
            .from(blogCommentLikes)
            .where(
                and(
                    eq(blogCommentLikes.clerkUserId, userId),
                    inArray(blogCommentLikes.commentId, rows.map((r) => r.id)),
                ),
            );
        likedIds = new Set(likes.map((l) => l.commentId));
    }

    const userMap = await getClerkUserMap(rows.map((r) => r.clerkUserId));

    const flat: CommentWithMeta[] = rows.map((row) => ({
        id: row.id,
        slug,
        parentId: row.parentId,
        body: row.body,
        isPinned: row.isPinned,
        createdAt: row.createdAt.toISOString(),
        likeCount: row.likeCount,
        likedByMe: likedIds.has(row.id),
        user: resolveUser(userMap, row.clerkUserId),
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

        const trimmed = sanitizeText(body);
        validateLength(trimmed, { min: MIN_BODY_LENGTH, max: MAX_BODY_LENGTH, label: "Comment" });

        const postId = await getOrCreatePost(slug);
        if (postId === null) return { success: false, error: "Post not found." };

        const [inserted] = await db
            .insert(blogComments)
            .values({ postId, clerkUserId: userId, body: trimmed, parentId: parentId ?? null })
            .returning({ id: blogComments.id });

        revalidatePath(`/blog/${slug}`);
        return { success: true, id: inserted.id };
    } catch (err) {
        if (err instanceof ValidationError) return { success: false, error: err.message };
        console.error("[submitComment]", err);
        return { success: false, error: "Something went wrong. Please try again." };
    }
}

export async function deleteComment(
    commentId: number,
): Promise<{ success: true } | { success: false; error: string }> {
    try {
        const { userId } = await auth();
        if (!userId) return { success: false, error: "Not authenticated." };

        const [comment] = await db
            .select({ clerkUserId: blogComments.clerkUserId, postId: blogComments.postId })
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

        const [post] = await db
            .select({ slug: blogPosts.slug })
            .from(blogPosts)
            .where(eq(blogPosts.id, comment.postId))
            .limit(1);

        if (post) revalidatePath(`/blog/${post.slug}`);
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
            .select({ isPinned: blogComments.isPinned, postId: blogComments.postId })
            .from(blogComments)
            .where(eq(blogComments.id, commentId))
            .limit(1);

        if (!comment) return { success: false, error: "Comment not found." };

        await db
            .update(blogComments)
            .set({ isPinned: !comment.isPinned, updatedAt: new Date() })
            .where(eq(blogComments.id, commentId));

        const [post] = await db
            .select({ slug: blogPosts.slug })
            .from(blogPosts)
            .where(eq(blogPosts.id, comment.postId))
            .limit(1);

        if (post) revalidatePath(`/blog/${post.slug}`);
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
