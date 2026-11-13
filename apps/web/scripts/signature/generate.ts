import { readFileSync, writeFileSync } from "node:fs";
import * as opentype from "opentype.js";
import { siteConfig } from "@repo/site-config";

const FONT_SIZE = 14;
const HEIGHT = 100;

const fontFile = readFileSync(
  new URL("./LastoriaBoldRegular.otf", import.meta.url),
);
const font = opentype.parse(
  fontFile.buffer.slice(
    fontFile.byteOffset,
    fontFile.byteOffset + fontFile.byteLength,
  ) as ArrayBuffer,
);

const padding = FONT_SIZE * 0.1;
const topMargin = Math.max(5, (HEIGHT - FONT_SIZE) / 2);
const baseline = Math.min(HEIGHT - 5, topMargin + FONT_SIZE);

let x = padding;
const entries: { d: string; key: string }[] = [];

for (const char of siteConfig.name) {
  const glyph = font.charToGlyph(char);
  entries.push({
    d: glyph.getPath(x, baseline, FONT_SIZE).toPathData(3),
    key: `${char}@${Math.round(x)}`,
  });
  x += (glyph.advanceWidth ?? font.unitsPerEm) * (FONT_SIZE / font.unitsPerEm);
}

const width = Number((x + padding).toFixed(3));

const paths = `export const signatureEntries: { d: string; key: string }[] = ${JSON.stringify(entries, null, 2)};
`;

const size = `export const signatureFontSize = ${FONT_SIZE};

export const signatureWidth = ${width};
`;

writeFileSync(new URL("../../src/lib/signature-path.ts", import.meta.url), paths);
writeFileSync(new URL("../../src/lib/signature-size.ts", import.meta.url), size);
console.log(`signature: ${entries.length} glyphs, width ${width}`);
