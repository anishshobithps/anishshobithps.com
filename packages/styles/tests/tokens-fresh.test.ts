import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { extractTokens } from "../scripts/extract-tokens";
import { DARK_TOKENS, ROOT_TOKENS } from "../src/tokens.generated";

const css = readFileSync(
  new URL("../src/tokens.css", import.meta.url),
  "utf8",
);

describe("tokens.generated", () => {
  it("matches the :root and .dark blocks of tokens.css", () => {
    const { root, dark } = extractTokens(css);
    expect(Object.keys(root).length).toBeGreaterThan(0);
    expect(Object.keys(dark).length).toBeGreaterThan(0);
    expect(root).toEqual(ROOT_TOKENS);
    expect(dark).toEqual(DARK_TOKENS);
  });
});
