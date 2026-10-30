export type PaginationBounds = {
    defaultLimit: number;
    maxLimit: number;
};

export type Pagination = {
    limit: number;
    offset: number;
};

const MAX_OFFSET = 100_000;

function clampInteger(
    value: unknown,
    { min, max, fallback }: { min: number; max: number; fallback: number },
): number {
    if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
    return Math.min(Math.max(Math.trunc(value), min), max);
}

export function resolvePagination(
    { limit, offset }: { limit?: unknown; offset?: unknown },
    { defaultLimit, maxLimit }: PaginationBounds,
): Pagination {
    return {
        limit: clampInteger(limit ?? defaultLimit, {
            min: 1,
            max: maxLimit,
            fallback: defaultLimit,
        }),
        offset: clampInteger(offset ?? 0, {
            min: 0,
            max: MAX_OFFSET,
            fallback: 0,
        }),
    };
}
