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
import { adminMutation } from "@/lib/admin-action";
import type { ActionResult } from "@/lib/action-result";
import { assertAdmin } from "@/lib/assert-admin";
import { getClerkUserMap, resolveUser } from "@/lib/clerk-users";
import { PROJECTS_CACHE_TAG } from "@/lib/projects";
import { safeQuery } from "@/lib/safe-query";
import { projectInputSchema, type ProjectInput } from "@/lib/projects-schema";
import { RESUME_CACHE_TAG } from "@/lib/resume";
import { asc, count, desc, eq, sql } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import type { GuestbookEntryWithMeta } from "@/app/(site)/guestbook/actions";
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

const EMPTY_STATS = {
    guestbook: { total: 0, active: 0 },
    comments: { total: 0, active: 0 },
    reads: 0,
    reactions: 0,
};

export async function getAdminStats() {
    await assertAdmin();
    return safeQuery("getAdminStats", loadAdminStats, EMPTY_STATS);
}

async function loadAdminStats() {
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

export async function refreshResume(): Promise<ActionResult> {
    return adminMutation("refresh resume", async () => {
        updateTag(RESUME_CACHE_TAG);
    });
}

export async function getAllAdminGuestbookEntries(): Promise<GuestbookEntryWithMeta[]> {
    await assertAdmin();
    return safeQuery("getAllAdminGuestbookEntries", loadAdminGuestbookEntries, []);
}

async function loadAdminGuestbookEntries(): Promise<GuestbookEntryWithMeta[]> {
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

    const userMap = await getClerkUserMap(rows.map((r) => r.clerkUserId));

    return rows.map((row) => ({
        id: row.id,
        message: row.message,
        isPinned: row.isPinned,
        createdAt: row.createdAt.toISOString(),
        likeCount: row.likeCount,
        likedByMe: false,
        user: resolveUser(userMap, row.clerkUserId),
    }));
}

export async function getAllAdminComments(): Promise<AdminCommentRow[]> {
    await assertAdmin();
    return safeQuery("getAllAdminComments", loadAdminComments, []);
}

async function loadAdminComments(): Promise<AdminCommentRow[]> {
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

    const userMap = await getClerkUserMap(rows.map((r) => r.clerkUserId));

    return rows.map((row) => ({
        id: row.id,
        postSlug: row.postSlug ?? "unknown",
        parentId: row.parentId,
        body: row.body,
        isPinned: row.isPinned,
        createdAt: row.createdAt.toISOString(),
        likeCount: row.likeCount,
        user: resolveUser(userMap, row.clerkUserId),
    }));
}

export type { ProjectInput };

function revalidateProjects() {
    revalidatePath("/projects");
    revalidatePath("/");
    revalidatePath("/admin/projects");
    updateTag(PROJECTS_CACHE_TAG);
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
    return safeQuery("getAdminProjects", loadAdminProjects, []);
}

async function loadAdminProjects(): Promise<ProjectRow[]> {
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

export async function createProject(raw: unknown): Promise<ActionResult> {
    return adminMutation("create project", async () => {
        const parsed = projectInputSchema.safeParse(raw);
        if (!parsed.success) {
            return parsed.error.issues[0]?.message ?? "Invalid project input.";
        }

        const [last] = await db
            .select({ max: sql<number>`coalesce(max(${projects.sortOrder}), -1)` })
            .from(projects);
        await db.insert(projects).values({
            ...parsed.data,
            sortOrder: (last?.max ?? -1) + 1,
            enabled: true,
        });
    }, revalidateProjects);
}

export async function updateProject(
    id: number,
    raw: unknown,
): Promise<ActionResult> {
    return adminMutation("update project", async () => {
        const parsed = projectInputSchema.safeParse(raw);
        if (!parsed.success) {
            return parsed.error.issues[0]?.message ?? "Invalid project input.";
        }

        await db
            .update(projects)
            .set({ ...parsed.data, updatedAt: new Date() })
            .where(eq(projects.id, id));
    }, revalidateProjects);
}

export async function toggleProjectEnabled(id: number): Promise<ActionResult> {
    return adminMutation("toggle project visibility", async () => {
        await db
            .update(projects)
            .set({ enabled: sql`NOT ${projects.enabled}`, updatedAt: new Date() })
            .where(eq(projects.id, id));
    }, revalidateProjects);
}

export async function deleteProject(id: number): Promise<ActionResult> {
    return adminMutation("delete project", async () => {
        await db.delete(projects).where(eq(projects.id, id));
    }, revalidateProjects);
}

export async function moveProject(
    id: number,
    direction: "up" | "down",
): Promise<ActionResult> {
    return adminMutation("reorder projects", async () => {
        const all = await db
            .select({ id: projects.id, sortOrder: projects.sortOrder })
            .from(projects)
            .orderBy(asc(projects.sortOrder), asc(projects.id));

        const index = all.findIndex((p) => p.id === id);
        if (index === -1) return "Project not found.";

        const swapIndex = direction === "up" ? index - 1 : index + 1;
        if (swapIndex < 0 || swapIndex >= all.length) return;

        const current = all[index]!;
        const swap = all[swapIndex]!;
        await db
            .update(projects)
            .set({ sortOrder: swap.sortOrder, updatedAt: new Date() })
            .where(eq(projects.id, current.id));
        await db
            .update(projects)
            .set({ sortOrder: current.sortOrder, updatedAt: new Date() })
            .where(eq(projects.id, swap.id));
    }, revalidateProjects);
}
