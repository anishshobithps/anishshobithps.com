import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import * as classes from "../src/classes";

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

  it("styles every line tone", () => {
    expect(Object.keys(classes.TONE_STROKE).sort()).toEqual([
      "faint",
      "hi",
      "lit",
      "lo",
      "mid",
    ]);
  });

  it("has exactly three halo layers", () => {
    expect(classes.HALO_OPACITY).toHaveLength(3);
  });

  it("covers every face fill the scenes can ask for", () => {
    expect(Object.keys(classes.FACE_FILL).sort()).toEqual([
      "0",
      "1",
      "2",
      "3",
      "ink",
      "lit",
      "paper",
      "sheet",
      "top",
    ]);
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
