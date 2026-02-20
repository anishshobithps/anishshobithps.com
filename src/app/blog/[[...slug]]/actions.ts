"use server";

import { db } from "@/lib/db";
import { hashIp, getClientIp } from "@/lib/ip";
import { blogReactions, blogReads } from "@/lib/schema";
import { and, eq, sql } from "drizzle-orm";
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
