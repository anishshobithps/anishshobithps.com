import { readFileSync, writeFileSync } from "node:fs";
import { extractTokens } from "./extract-tokens";

const css = readFileSync(new URL("../src/tokens.css", import.meta.url), "utf8");
const { root, dark } = extractTokens(css);

const body = (name: string, tokens: Record<string, string>) =>
  `export const ${name} = ${JSON.stringify(tokens, null, 2)} as const;\n`;

writeFileSync(
  new URL("../src/tokens.generated.ts", import.meta.url),
  `${body("ROOT_TOKENS", root)}\n${body("DARK_TOKENS", dark)}`,
);
