import { describe, expect, it } from "vitest";
import { resolvePagination } from "@/lib/pagination";

const bounds = { defaultLimit: 20, maxLimit: 50 };

describe("resolvePagination", () => {
    it("uses the defaults when nothing is supplied", () => {
        expect(resolvePagination({}, bounds)).toEqual({ limit: 20, offset: 0 });
    });

    it("passes through a valid limit and offset", () => {
        expect(resolvePagination({ limit: 10, offset: 40 }, bounds)).toEqual({
            limit: 10,
            offset: 40,
        });
    });

    it("clamps a limit above the maximum", () => {
        expect(resolvePagination({ limit: 1_000_000 }, bounds).limit).toBe(50);
    });

    it("clamps a limit at exactly the maximum", () => {
        expect(resolvePagination({ limit: 50 }, bounds).limit).toBe(50);
    });

    it("clamps a zero or negative limit up to the minimum", () => {
        expect(resolvePagination({ limit: 0 }, bounds).limit).toBe(1);
        expect(resolvePagination({ limit: -5 }, bounds).limit).toBe(1);
    });

    it("clamps a negative offset to zero", () => {
        expect(resolvePagination({ offset: -10 }, bounds).offset).toBe(0);
    });

    it("caps an absurd offset", () => {
        expect(resolvePagination({ offset: 9_999_999_999 }, bounds).offset).toBe(
            100_000,
        );
    });

    it("truncates a fractional limit", () => {
        expect(resolvePagination({ limit: 10.9 }, bounds).limit).toBe(10);
    });

    it.each([
        [Number.NaN],
        [Number.POSITIVE_INFINITY],
        [Number.NEGATIVE_INFINITY],
        ["50"],
        ["abc"],
        [null],
        [{}],
        [[]],
        [true],
    ])("falls back to the default limit for %o", (value) => {
        expect(resolvePagination({ limit: value }, bounds).limit).toBe(20);
    });

    it.each([[Number.NaN], ["10"], [null], [{}]])(
        "falls back to offset 0 for %o",
        (value) => {
            expect(resolvePagination({ offset: value }, bounds).offset).toBe(0);
        },
    );

    it("never returns a limit that could pull an unbounded number of rows", () => {
        const hostile = [1e9, Number.MAX_SAFE_INTEGER, Number.POSITIVE_INFINITY];
        for (const limit of hostile) {
            expect(resolvePagination({ limit }, bounds).limit).toBeLessThanOrEqual(
                bounds.maxLimit,
            );
        }
    });
});
