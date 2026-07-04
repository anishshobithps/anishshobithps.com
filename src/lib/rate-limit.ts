import { db } from "@/lib/db";
import { rateLimits } from "@/lib/schema";
import { and, eq, lt, sql } from "drizzle-orm";

const RATE_LIMIT = {
    COMMENT: { limit: 5, windowMs: 60_000 },
    GUESTBOOK: { limit: 3, windowMs: 60_000 },
    LIKE: { limit: 30, windowMs: 60_000 },
    REACTION: { limit: 20, windowMs: 60_000 },
    READ_TRACK: { limit: 60, windowMs: 60_000 },
} as const;

type RateLimitAction = keyof typeof RATE_LIMIT;

// Small LRU to short-circuit already-over-limit windows without a DB round trip.
// Source of truth is always Postgres; this only avoids the trip when we know
// the window is already full.
const LRU_MAX = 500;
const cache = new Map<string, { count: number; windowStart: number }>();

function lruSet(cacheKey: string, count: number, windowStart: number) {
    if (cache.size >= LRU_MAX) {
        cache.delete(cache.keys().next().value!);
    }
    cache.set(cacheKey, { count, windowStart });
}

export async function checkRateLimit(
    action: RateLimitAction,
    identifier: string,
): Promise<{ ok: boolean }> {
    const { limit, windowMs } = RATE_LIMIT[action];
    const now = Date.now();
    const windowStart = now - (now % windowMs);
    const key = `${action}:${identifier}`;
    const cacheKey = `${key}:${windowStart}`;

    // Fast path: if we already know this window is over-limit, skip DB.
    const cached = cache.get(cacheKey);
    if (cached && cached.count > limit) {
        return { ok: false };
    }

    try {
        const windowDate = new Date(windowStart);

        const [row] = await db
            .insert(rateLimits)
            .values({ key, windowStart: windowDate, count: 1 })
            .onConflictDoUpdate({
                target: [rateLimits.key, rateLimits.windowStart],
                set: { count: sql`${rateLimits.count} + 1` },
            })
            .returning({ count: rateLimits.count });

        const count = row?.count ?? 1;
        lruSet(cacheKey, count, windowStart);

        // Opportunistic cleanup ~2% of the time to prune old windows.
        if (Math.random() < 0.02) {
            const oneHourAgo = new Date(now - 3_600_000);
            void db
                .delete(rateLimits)
                .where(lt(rateLimits.windowStart, oneHourAgo))
                .catch(() => undefined);
        }

        return { ok: count <= limit };
    } catch {
        // Fail open — never block a user because of a rate-limit DB error.
        return { ok: true };
    }
}

export function rateLimitError(): string {
    return "You're doing that too fast — try again in a minute.";
}
