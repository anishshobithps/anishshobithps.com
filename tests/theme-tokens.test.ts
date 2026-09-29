import { describe, expect, it } from "vitest";
import { themeColor } from "@/lib/theme-tokens";

describe("themeColor", () => {
  it("converts dark theme tokens to hex", () => {
    expect(themeColor("var(--background)")).toBe("#09090b");
    expect(themeColor("var(--foreground)")).toBe("#fafafa");
    expect(themeColor("var(--muted-foreground)")).toBe("#9f9fa9");
    expect(themeColor("var(--brand-text)")).toBe("#43c07a");
  });

  it("falls back to :root for tokens the dark theme does not override", () => {
    expect(themeColor("var(--brand)")).toBe("#0e9254");
  });

  it("reads the light theme", () => {
    expect(themeColor("var(--background)", "light")).not.toBe("#09090b");
  });

  it("keeps alpha as an 8-digit hex", () => {
    expect(themeColor("var(--border)")).toBe("#ffffff1a");
  });

  it("resolves nested var() and color-mix()", () => {
    expect(themeColor("var(--line)")).toBe("#1c1c1e");
    expect(
      themeColor("color-mix(in oklab, var(--foreground) 45%, transparent)"),
    ).toBe("#fafafa73");
  });

  it("throws on unknown tokens", () => {
    expect(() => themeColor("var(--missing)")).toThrow("--missing");
  });
});
