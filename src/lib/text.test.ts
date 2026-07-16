import { describe, expect, it } from "vitest";
import { sanitizeText, slugify, validateLength } from "@/lib/text";

describe("slugify", () => {
    it.each([
        ["Hello World", "hello-world"],
        ["hello-world", "hello-world"],
        ["--a--", "a"],
        ["---", ""],
        ["!!!", ""],
        ["", ""],
        ["  Mixed CASE, punctuation!  ", "mixed-case-punctuation"],
        ["Rock & Roll", "rock-roll"],
        ["a  b", "a-b"],
    ])("maps %o to %o", (input, expected) => {
        expect(slugify(input)).toBe(expected);
    });

    it("is idempotent on already-slugged input", () => {
        const once = slugify("Hello World");
        expect(slugify(once)).toBe(once);
    });

    it("strips accented characters rather than transliterating them", () => {
        expect(slugify("café")).toBe("caf");
        expect(slugify("naïve")).toBe("na-ve");
    });
});

describe("sanitizeText", () => {
    it.each([
        ["  hello   world  ", "hello world"],
        ["a\n\nb", "a b"],
        ["a\t\tb", "a b"],
        ["a \n\t b", "a b"],
        ["", ""],
        ["   ", ""],
        ["single", "single"],
    ])("maps %o to %o", (input, expected) => {
        expect(sanitizeText(input)).toBe(expected);
    });
});

describe("validateLength", () => {
    const bounds = { min: 2, max: 5, label: "Message" };

    it("does not throw inside the bounds", () => {
        expect(() => validateLength("abc", bounds)).not.toThrow();
    });

    it.each([["ab"], ["abcde"]])(
        "does not throw at the boundary value %o",
        (text) => {
            expect(() => validateLength(text, bounds)).not.toThrow();
        },
    );

    it("throws below min", () => {
        expect(() => validateLength("a", bounds)).toThrow(
            "Message must be at least 2 characters.",
        );
    });

    it("throws above max", () => {
        expect(() => validateLength("abcdef", bounds)).toThrow(
            "Message must be 5 characters or fewer.",
        );
    });
});
