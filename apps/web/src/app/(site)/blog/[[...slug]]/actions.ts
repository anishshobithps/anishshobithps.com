"use server";

import { ENV } from "varlock/env";
import { getClerkUserMap, resolveUser, type PublicUser } from "@/lib/clerk-users";
import { db } from "@repo/db";
import { getClientIp, hashIp } from "@/lib/ip";
import { safeQuery } from "@/lib/safe-query";
import { blogCommentLikes, blogComments, blogPosts, blogReactions } from "@repo/db/schema";
import { source } from "@/lib/source";
import { sanitizeText, ValidationError, validateLength } from "@repo/core/text";
import { auth } from "@clerk/nextjs/server";
import { and, desc, eq, sql } from "drizzle-orm";
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

const postIds = new Map<string, number>();

const isKnownPost = cache(async (slug: string): Promise<boolean> => {
    return source.getPages().some((page) => page.url === slug);
});

const getPostIdBySlug = cache(async (slug: string): Promise<number | null> => {
    const known = postIds.get(slug);
    if (known !== undefined) return known;

    const [post] = await db
        .select({ id: blogPosts.id })
        .from(blogPosts)
        .where(eq(blogPosts.slug, slug))
        .limit(1);
    if (post) postIds.set(slug, post.id);
    return post?.id ?? null;
});

async function getOrCreatePost(slug: string): Promise<number | null> {
    if (!(await isKnownPost(slug))) return null;

    const known = postIds.get(slug);
    if (known !== undefined) return known;

    const [existing] = await db
        .select({ id: blogPosts.id })
        .from(blogPosts)
        .where(eq(blogPosts.slug, slug))
        .limit(1);

    if (existing) {
        postIds.set(slug, existing.id);
        return existing.id;
    }

    const [inserted] = await db
        .insert(blogPosts)
        .values({ slug })
        .onConflictDoNothing()
        .returning({ id: blogPosts.id });

    if (inserted) {
        postIds.set(slug, inserted.id);
        return inserted.id;
    }

    const [retry] = await db
        .select({ id: blogPosts.id })
        .from(blogPosts)
        .where(eq(blogPosts.slug, slug))
        .limit(1);

    if (retry) postIds.set(slug, retry.id);
    return retry?.id ?? null;
}

export interface PostStats {
    reads: number;
    commentCount: number;
}

export async function viewPost(slug: string): Promise<PostStats> {
    return safeQuery("viewPost", () => loadPostStats(slug), { reads: 0, commentCount: 0 });
}

async function loadPostStats(slug: string): Promise<PostStats> {
    const [postId, ipHash] = await Promise.all([getOrCreatePost(slug), getIpHash()]);
    if (postId === null) return { reads: 0, commentCount: 0 };

    const result = await db.execute<{ reads: number; comments: number }>(sql`
        with inserted as (
            insert into blog_reads (post_id, ip_hash)
            values (${postId}, ${ipHash})
            on conflict do nothing
            returning 1
        )
        select
            ((select count(*) from blog_reads where post_id = ${postId}) + (select count(*) from inserted))::int as reads,
            (select count(*) from blog_comments where post_id = ${postId} and is_deleted = false)::int as comments
    `);

    const row = result.rows[0];
    return { reads: row?.reads ?? 0, commentCount: row?.comments ?? 0 };
}

export async function getReactions(slug: string): Promise<ReactionsData> {
    return safeQuery("getReactions", () => loadReactions(slug), {
        counts: {},
        userMood: null,
    });
}

async function loadReactions(slug: string): Promise<ReactionsData> {
    const [ipHash, postId] = await Promise.all([
        getIpHash(),
        getPostIdBySlug(slug),
    ]);

    if (postId === null) return { counts: {}, userMood: null };

    const rows = await db
        .select({
            mood: blogReactions.mood,
            count: sql<number>`count(*)::int`,
            mine: sql<boolean>`coalesce(bool_or(${blogReactions.ipHash} = ${ipHash}), false)`,
        })
        .from(blogReactions)
        .where(eq(blogReactions.postId, postId))
        .groupBy(blogReactions.mood);

    const counts = rows.reduce<ReactionCounts>((acc, { mood, count }) => {
        if (isValidMood(mood)) acc[mood] = count;
        return acc;
    }, {});

    const userMood = rows.find((row) => row.mine)?.mood;

    return {
        counts,
        userMood: isValidMood(userMood) ? userMood : null,
    };
}

export async function submitReaction(slug: string, mood: MoodId | null): Promise<void> {
    return safeQuery("submitReaction", () => recordReaction(slug, mood), undefined);
}

async function recordReaction(slug: string, mood: MoodId | null): Promise<void> {
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
    viewerId: string | null;
}

export async function getComments(slug: string): Promise<GetCommentsResult> {
    return safeQuery("getComments", () => loadComments(slug), {
        comments: [],
        total: 0,
        viewerId: null,
    });
}

async function loadComments(slug: string): Promise<GetCommentsResult> {
    const { userId } = await auth();

    const postId = await getPostIdBySlug(slug);

    if (postId === null) return { comments: [], total: 0, viewerId: userId };

    const likedByMe = userId
        ? sql<boolean>`exists (select 1 from ${blogCommentLikes} where ${blogCommentLikes.commentId} = ${blogComments.id} and ${blogCommentLikes.clerkUserId} = ${userId})`
        : sql<boolean>`false`;

    const rows = await db
        .select({
            id: blogComments.id,
            postId: blogComments.postId,
            parentId: blogComments.parentId,
            clerkUserId: blogComments.clerkUserId,
            body: blogComments.body,
            isPinned: blogComments.isPinned,
            createdAt: blogComments.createdAt,
            likeCount: sql<number>`(select count(*)::int from ${blogCommentLikes} where ${blogCommentLikes.commentId} = ${blogComments.id})`,
            likedByMe,
        })
        .from(blogComments)
        .where(and(eq(blogComments.postId, postId), eq(blogComments.isDeleted, false)))
        .orderBy(desc(blogComments.isPinned), desc(blogComments.createdAt));

    if (rows.length === 0) return { comments: [], total: 0, viewerId: userId };

    const userMap = await getClerkUserMap(rows.map((r) => r.clerkUserId));

    const flat: CommentWithMeta[] = rows.map((row) => ({
        id: row.id,
        slug,
        parentId: row.parentId,
        body: row.body,
        isPinned: row.isPinned,
        createdAt: row.createdAt.toISOString(),
        likeCount: row.likeCount,
        likedByMe: row.likedByMe,
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

    return { comments: roots, total: flat.length, viewerId: userId };
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

        let resolvedParentId: number | null = null;
        if (parentId !== undefined && parentId !== null) {
            if (!Number.isInteger(parentId)) {
                return { success: false, error: "Invalid parent comment." };
            }

            const [parent] = await db
                .select({ id: blogComments.id })
                .from(blogComments)
                .where(
                    and(
                        eq(blogComments.id, parentId),
                        eq(blogComments.postId, postId),
                        eq(blogComments.isDeleted, false),
                    ),
                )
                .limit(1);

            if (!parent) return { success: false, error: "Parent comment not found." };
            resolvedParentId = parent.id;
        }

        const [inserted] = await db
            .insert(blogComments)
            .values({ postId, clerkUserId: userId, body: trimmed, parentId: resolvedParentId })
            .returning({ id: blogComments.id });

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

        const isSiteOwner = userId === ENV.OWNER_CLERK_USER_ID;

        const updated = await db
            .update(blogComments)
            .set({ isDeleted: true, updatedAt: new Date() })
            .where(
                and(
                    eq(blogComments.id, commentId),
                    eq(blogComments.isDeleted, false),
                    isSiteOwner ? undefined : eq(blogComments.clerkUserId, userId),
                ),
            )
            .returning({ id: blogComments.id });

        if (updated.length === 0) {
            const [exists] = await db
                .select({ id: blogComments.id })
                .from(blogComments)
                .where(and(eq(blogComments.id, commentId), eq(blogComments.isDeleted, false)))
                .limit(1);
            return exists
                ? { success: false, error: "You don't have permission to delete this comment." }
                : { success: false, error: "Comment not found." };
        }

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
        if (!userId || userId !== ENV.OWNER_CLERK_USER_ID)
            return { success: false, error: "Not authorized." };

        const updated = await db
            .update(blogComments)
            .set({ isPinned: sql`not ${blogComments.isPinned}`, updatedAt: new Date() })
            .where(eq(blogComments.id, commentId))
            .returning({ id: blogComments.id });

        if (updated.length === 0) return { success: false, error: "Comment not found." };

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

        const removed = await db
            .delete(blogCommentLikes)
            .where(and(eq(blogCommentLikes.commentId, commentId), eq(blogCommentLikes.clerkUserId, userId)))
            .returning({ commentId: blogCommentLikes.commentId });

        if (removed.length > 0) return { success: true, liked: false };

        await db.insert(blogCommentLikes).values({ commentId, clerkUserId: userId }).onConflictDoNothing();
        return { success: true, liked: true };
    } catch {
        return { success: false, error: "Something went wrong." };
    }
}
