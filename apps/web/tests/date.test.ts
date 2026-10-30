import { describe, expect, it } from "vitest";
import { toISOString, toRFC822 } from "@/lib/date";

describe("toRFC822", () => {
    it("formats a Date as RFC-822/1123", () => {
        expect(toRFC822(new Date("2025-03-22T00:00:00Z"))).toBe(
            "Sat, 22 Mar 2025 00:00:00 GMT",
        );
    });

    it("accepts an ISO string as well as a Date", () => {
        expect(toRFC822("2026-04-28T00:00:00Z")).toBe(
            "Tue, 28 Apr 2026 00:00:00 GMT",
        );
    });

    it("agrees for a Date and its ISO string", () => {
        const iso = "2026-03-19T12:34:56Z";
        expect(toRFC822(iso)).toBe(toRFC822(new Date(iso)));
    });

    it("normalizes an offset date to GMT", () => {
        expect(toRFC822("2026-03-07T05:30:00+05:30")).toBe(
            "Sat, 07 Mar 2026 00:00:00 GMT",
        );
    });

    it("always ends in GMT, never an ISO offset", () => {
        const formatted = toRFC822(new Date("2026-04-28T00:00:00Z"));
        expect(formatted.endsWith("GMT")).toBe(true);
        expect(formatted).not.toMatch(/\d{4}-\d{2}-\d{2}T/);
    });

    it("differs from toISOString, which RSS validators reject for pubDate", () => {
        const date = new Date("2026-04-28T00:00:00Z");
        expect(toRFC822(date)).not.toBe(toISOString(date));
        expect(toRFC822(date)).toMatch(
            /^[A-Z][a-z]{2}, \d{2} [A-Z][a-z]{2} \d{4} \d{2}:\d{2}:\d{2} GMT$/,
        );
    });
});
