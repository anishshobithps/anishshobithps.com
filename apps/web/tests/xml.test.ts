import { describe, expect, it } from "vitest";
import { escapeXml } from "@/lib/xml";

describe("escapeXml", () => {
    it("escapes an ampersand", () => {
        expect(escapeXml("A & B")).toBe("A &amp; B");
    });

    it("escapes a less-than sign", () => {
        expect(escapeXml("a < b")).toBe("a &lt; b");
    });

    it("escapes a greater-than sign", () => {
        expect(escapeXml("a > b")).toBe("a &gt; b");
    });

    it("escapes a double quote", () => {
        expect(escapeXml('say "hi"')).toBe("say &quot;hi&quot;");
    });

    it("escapes an apostrophe", () => {
        expect(escapeXml("it's")).toBe("it&apos;s");
    });

    it("replaces the ampersand first so entities are not double-escaped", () => {
        expect(escapeXml("A & B")).not.toBe("A &amp;amp; B");
    });

    it("escapes the ampersand of an already-escaped-looking input", () => {
        expect(escapeXml("&lt;")).toBe("&amp;lt;");
        expect(escapeXml("&amp;")).toBe("&amp;amp;");
    });

    it("escapes every entity in one pass without double-escaping", () => {
        expect(escapeXml(`& < > " '`)).toBe("&amp; &lt; &gt; &quot; &apos;");
    });

    it("escapes a tag-like string into inert text", () => {
        expect(escapeXml("<script>alert('x')</script>")).toBe(
            "&lt;script&gt;alert(&apos;x&apos;)&lt;/script&gt;",
        );
    });

    it("escapes the apostrophe in a real corpus title and leaves the em-dash alone", () => {
        expect(
            escapeXml(
                "I Never Thought I'd Code — Until This One Moment Changed Everything",
            ),
        ).toBe(
            "I Never Thought I&apos;d Code — Until This One Moment Changed Everything",
        );
    });

    it("returns an empty string unchanged", () => {
        expect(escapeXml("")).toBe("");
    });

    it("returns a string with no special characters unchanged", () => {
        expect(escapeXml("The Hidden Architecture of Emoji")).toBe(
            "The Hidden Architecture of Emoji",
        );
    });

    it("leaves non-ASCII characters untouched", () => {
        expect(escapeXml("café — 🎉 日本語")).toBe("café — 🎉 日本語");
    });
});
