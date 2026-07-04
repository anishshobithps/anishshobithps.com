"use server";

import { db } from "@/lib/db";
import {
    blogCommentLikes,
    blogComments,
    blogPosts,
    blogReactions,
    blogReads,
    guestbookEntries,
    guestbookLikes,
    projects,
} from "@/lib/schema";
import { clerkClient } from "@clerk/nextjs/server";
import { assertAdmin } from "@/lib/assert-admin";
import { asc, count, desc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { GuestbookUser, GuestbookEntryWithMeta } from "@/app/(site)/guestbook/actions";
import type { CommentUser } from "@/app/(site)/blog/[[...slug]]/actions";

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
    await assertAdmin();
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
    await assertAdmin();
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
    await assertAdmin();
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

// ── Projects ─────────────────────────────────────────────────────────────────

const URL_PATTERN = /^https?:\/\/.+/;

function validateProjectInput(data: {
    title: string;
    description: string;
    highlights: string[];
    live: string | null;
    github: string | null;
}): { valid: true } | { valid: false; error: string } {
    if (!data.title || data.title.length > 256)
        return { valid: false, error: "Title must be 1–256 characters." };
    if (!data.description || data.description.length > 2000)
        return { valid: false, error: "Description must be 1–2000 characters." };
    if (data.highlights.length > 10)
        return { valid: false, error: "A project can have at most 10 highlights." };
    for (const h of data.highlights) {
        if (!h || h.length > 500)
            return { valid: false, error: "Each highlight must be 1–500 characters." };
    }
    if (data.live !== null && (data.live.length > 512 || !URL_PATTERN.test(data.live)))
        return { valid: false, error: "Live URL must be a valid http(s) URL (max 512 chars)." };
    if (data.github !== null && (data.github.length > 512 || !URL_PATTERN.test(data.github)))
        return { valid: false, error: "GitHub URL must be a valid http(s) URL (max 512 chars)." };
    return { valid: true };
}

export type ProjectRow = {
    id: number;
    title: string;
    description: string;
    highlights: string[];
    live: string | null;
    github: string | null;
    enabled: boolean;
    sortOrder: number;
};

export async function getAdminProjects(): Promise<ProjectRow[]> {
    await assertAdmin();
    return db
        .select({
            id: projects.id,
            title: projects.title,
            description: projects.description,
            highlights: projects.highlights,
            live: projects.live,
            github: projects.github,
            enabled: projects.enabled,
            sortOrder: projects.sortOrder,
        })
        .from(projects)
        .orderBy(asc(projects.sortOrder), asc(projects.id));
}

export async function createProject(data: {
    title: string;
    description: string;
    highlights: string[];
    live: string | null;
    github: string | null;
}): Promise<{ success: boolean; error?: string }> {
    try {
        await assertAdmin();
        const validation = validateProjectInput(data);
        if (!validation.valid) return { success: false, error: validation.error };
        const [last] = await db
            .select({ max: sql<number>`coalesce(max(${projects.sortOrder}), -1)` })
            .from(projects);
        await db.insert(projects).values({
            ...data,
            sortOrder: (last?.max ?? -1) + 1,
            enabled: true,
        });
        revalidatePath("/projects");
        revalidatePath("/");
        revalidatePath("/admin/projects");
        return { success: true };
    } catch {
        return { success: false, error: "Failed to create project." };
    }
}

export async function updateProject(
    id: number,
    data: {
        title: string;
        description: string;
        highlights: string[];
        live: string | null;
        github: string | null;
    },
): Promise<{ success: boolean; error?: string }> {
    try {
        await assertAdmin();
        const validation = validateProjectInput(data);
        if (!validation.valid) return { success: false, error: validation.error };
        await db
            .update(projects)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(projects.id, id));
        revalidatePath("/projects");
        revalidatePath("/");
        revalidatePath("/admin/projects");
        return { success: true };
    } catch {
        return { success: false, error: "Failed to update project." };
    }
}

export async function toggleProjectEnabled(
    id: number,
): Promise<{ success: boolean; error?: string }> {
    try {
        await assertAdmin();
        await db
            .update(projects)
            .set({ enabled: sql`NOT ${projects.enabled}`, updatedAt: new Date() })
            .where(eq(projects.id, id));
        revalidatePath("/projects");
        revalidatePath("/");
        revalidatePath("/admin/projects");
        return { success: true };
    } catch {
        return { success: false, error: "Failed to toggle project visibility." };
    }
}

export async function deleteProject(
    id: number,
): Promise<{ success: boolean; error?: string }> {
    try {
        await assertAdmin();
        await db.delete(projects).where(eq(projects.id, id));
        revalidatePath("/projects");
        revalidatePath("/");
        revalidatePath("/admin/projects");
        return { success: true };
    } catch {
        return { success: false, error: "Failed to delete project." };
    }
}

export async function moveProject(
    id: number,
    direction: "up" | "down",
): Promise<{ success: boolean; error?: string }> {
    try {
        await assertAdmin();
        const all = await db
            .select({ id: projects.id, sortOrder: projects.sortOrder })
            .from(projects)
            .orderBy(asc(projects.sortOrder), asc(projects.id));
        const idx = all.findIndex((p) => p.id === id);
        if (idx === -1) return { success: false, error: "Project not found." };
        const swapIdx = direction === "up" ? idx - 1 : idx + 1;
        if (swapIdx < 0 || swapIdx >= all.length) return { success: true };
        const current = all[idx]!;
        const swap = all[swapIdx]!;
        await db
            .update(projects)
            .set({ sortOrder: swap.sortOrder, updatedAt: new Date() })
            .where(eq(projects.id, current.id));
        await db
            .update(projects)
            .set({ sortOrder: current.sortOrder, updatedAt: new Date() })
            .where(eq(projects.id, swap.id));
        revalidatePath("/projects");
        revalidatePath("/");
        revalidatePath("/admin/projects");
        return { success: true };
    } catch {
        return { success: false, error: "Failed to reorder projects." };
    }
}
