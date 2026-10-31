import { describe, expect, it } from "vitest";
import { themeColor } from "../src/theme-tokens";

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

  it("reads fractional and missing mix amounts", () => {
    expect(themeColor("color-mix(in oklab, #ffffff 25.5%, #000000)")).toBe(
      themeColor("color-mix(in oklab, #ffffff 25.5%, #000000 74.5%)"),
    );
    expect(themeColor("color-mix(in oklab, #ffffff, #000000)")).toBe("#636363");
  });

  it("rejects pathological color-mix input without backtracking", () => {
    const started = performance.now();
    expect(() =>
      themeColor(`color-mix(in oklab,${" ".repeat(100_000)})x`),
    ).toThrow("Unsupported color");
    expect(() =>
      themeColor(`color-mix(in oklab, ${"1".repeat(100_000)}x%)`),
    ).toThrow();
    expect(performance.now() - started).toBeLessThan(1000);
  });
});
