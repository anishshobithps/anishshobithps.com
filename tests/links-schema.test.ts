import { describe, expect, it } from "vitest";
import {
  formatPath,
  hasPreview,
  isHttpUrl,
  isValidTarget,
  linkInputSchema,
  slugPairSchema,
} from "@/lib/links-schema";

describe("isHttpUrl", () => {
  it.each([
    ["http://example.com", true],
    ["https://example.com/path?q=1", true],
    ["ftp://example.com", false],
    ["mailto:someone@example.com", false],
    ["javascript:alert(1)", false],
    ["not a url", false],
    ["", false],
  ])("maps %o to %o", (input, expected) => {
    expect(isHttpUrl(input)).toBe(expected);
  });
});

describe("isValidTarget", () => {
  it.each([
    ["https://example.com", true],
    ["http://example.com", true],
    ["mailto:someone@example.com", true],
    ["MAILTO:someone@example.com", true],
    ["ftp://example.com", false],
    ["mailto:", false],
    ["", false],
  ])("maps %o to %o", (input, expected) => {
    expect(isValidTarget(input)).toBe(expected);
  });

  it("accepts any non-empty mailto payload because it only length-checks", () => {
    expect(isValidTarget("mailto:x")).toBe(true);
  });
});

describe("formatPath", () => {
  it("returns the bare slug when there is no tag", () => {
    expect(formatPath({ tag: "", slug: "a" })).toBe("a");
  });

  it("joins tag and slug with a slash", () => {
    expect(formatPath({ tag: "t", slug: "a" })).toBe("t/a");
  });
});

describe("hasPreview", () => {
  const none = { title: null, description: null, ogEnabled: false };

  it.each([
    [{ ...none, title: "A title" }, true],
    [{ ...none, description: "A description" }, true],
    [{ ...none, ogEnabled: true }, true],
    [none, false],
    [{ title: "", description: "", ogEnabled: false }, false],
  ])("maps %o to %o", (input, expected) => {
    expect(hasPreview(input)).toBe(expected);
  });
});

describe("slugPairSchema", () => {
  it("accepts an ordinary bare slug", () => {
    expect(slugPairSchema.safeParse({ tag: "", slug: "my-link" }).success).toBe(
      true,
    );
  });

  it("rejects a reserved segment as a bare slug", () => {
    expect(slugPairSchema.safeParse({ tag: "", slug: "admin" }).success).toBe(
      false,
    );
  });

  it("rejects a reserved segment as a tag", () => {
    expect(slugPairSchema.safeParse({ tag: "admin", slug: "x" }).success).toBe(
      false,
    );
  });

  it("accepts a reserved word as a slug when a tag is present", () => {
    expect(slugPairSchema.safeParse({ tag: "news", slug: "admin" }).success).toBe(
      true,
    );
  });

  it("slugifies its input before validating", () => {
    const parsed = slugPairSchema.parse({ tag: "My Tag", slug: "My Slug" });
    expect(parsed).toEqual({ tag: "my-tag", slug: "my-slug" });
  });
});

describe("linkInputSchema", () => {
  const base = {
    target: "https://example.com",
    title: "",
    description: "",
    ogEnabled: false,
    ogImage: "",
    permanent: false,
    enabled: true,
    primary: { tag: "", slug: "one" },
    aliases: [] as { tag: string; slug: string }[],
  };

  it("accepts distinct paths", () => {
    const result = linkInputSchema.safeParse({
      ...base,
      aliases: [
        { tag: "", slug: "two" },
        { tag: "t", slug: "two" },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a duplicate path across primary and aliases", () => {
    const result = linkInputSchema.safeParse({
      ...base,
      primary: { tag: "", slug: "dup" },
      aliases: [{ tag: "", slug: "dup" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a duplicate path between two aliases", () => {
    const result = linkInputSchema.safeParse({
      ...base,
      aliases: [
        { tag: "t", slug: "same" },
        { tag: "t", slug: "same" },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("accepts exactly 24 aliases", () => {
    const aliases = Array.from({ length: 24 }, (_, i) => ({
      tag: "",
      slug: `alias-${i}`,
    }));
    expect(linkInputSchema.safeParse({ ...base, aliases }).success).toBe(true);
  });

  it("rejects more than 24 aliases", () => {
    const aliases = Array.from({ length: 25 }, (_, i) => ({
      tag: "",
      slug: `alias-${i}`,
    }));
    expect(linkInputSchema.safeParse({ ...base, aliases }).success).toBe(false);
  });

  it("rejects an invalid target", () => {
    expect(
      linkInputSchema.safeParse({ ...base, target: "ftp://example.com" }).success,
    ).toBe(false);
  });
});
