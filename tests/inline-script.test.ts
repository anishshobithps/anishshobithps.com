import { describe, expect, it } from "vitest";
import { escapeInlineScript } from "@/lib/inline-script";

const LINE_SEPARATOR = String.fromCharCode(0x2028);
const PARAGRAPH_SEPARATOR = String.fromCharCode(0x2029);

describe("escapeInlineScript", () => {
    it("escapes the angle bracket that would close a script tag", () => {
        const payload = JSON.stringify({ name: "</script><img src=x onerror=alert(1)>" });
        const escaped = escapeInlineScript(payload);

        expect(escaped).not.toContain("</script>");
        expect(escaped).not.toContain("<");
        expect(escaped).toContain("\\u003C");
    });

    it("escapes line and paragraph separators", () => {
        const escaped = escapeInlineScript(
            JSON.stringify({ a: LINE_SEPARATOR, b: PARAGRAPH_SEPARATOR }),
        );

        expect(escaped).not.toContain(LINE_SEPARATOR);
        expect(escaped).not.toContain(PARAGRAPH_SEPARATOR);
        expect(escaped).toContain("\\u2028");
        expect(escaped).toContain("\\u2029");
    });

    it("round-trips back to the original value", () => {
        const original = {
            name: "</script>",
            separators: `${LINE_SEPARATOR}${PARAGRAPH_SEPARATOR}`,
            nested: { url: "https://example.com/a?b=1&c=<2>" },
        };

        const escaped = escapeInlineScript(JSON.stringify(original));

        expect(JSON.parse(escaped)).toEqual(original);
        expect(eval(`(${escaped})`)).toEqual(original);
    });

    it("leaves payloads without dangerous characters untouched", () => {
        const payload = JSON.stringify({ title: "Plain title", count: 3 });
        expect(escapeInlineScript(payload)).toBe(payload);
    });
});
