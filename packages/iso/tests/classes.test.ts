import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import * as classes from "@repo/iso/classes";

const tokens = readFileSync(
  new URL("../../styles/src/tokens.css", import.meta.url),
  "utf8",
);

function literals(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(literals);
  if (value && typeof value === "object") {
    return Object.values(value).flatMap(literals);
  }
  return [];
}

const all = Object.values(classes).flatMap(literals);

describe("iso class maps", () => {
  it("exports only non-empty literal strings", () => {
    expect(all.length).toBeGreaterThan(0);
    for (const value of all) {
      expect(value.length).toBeGreaterThan(0);
      expect(value).not.toContain("${");
    }
  });

  it("covers every dot tone", () => {
    expect(Object.keys(classes.DOT_TONE).sort()).toEqual(["faint", "hi", "lo", "mid"]);
  });

  it("offers the two plates, paper and the blend helpers", () => {
    expect(Object.keys(classes.PLATE).sort()).toEqual(["blend", "green", "ink", "isolate", "paper", "register", "void"]);
    expect(classes.PLATE.blend).toContain("mix-blend-multiply");
    expect(classes.PLATE.blend).toContain("dark:mix-blend-screen");
  });

  it("offers six theme swatches for the fan deck", () => {
    expect(classes.SWATCH).toHaveLength(6);
  });

  it("only references colors declared in the theme tokens", () => {
    const used = new Set(
      all.flatMap((value) =>
        [...value.matchAll(/(?:fill|stroke)-iso-([a-z0-9-]+)/g)].map(
          (match) => match[1]!,
        ),
      ),
    );
    expect(used.size).toBeGreaterThan(0);
    const missing = [...used].filter(
      (name) => !tokens.includes(`--color-iso-${name}:`),
    );
    expect(missing).toEqual([]);
  });
});
