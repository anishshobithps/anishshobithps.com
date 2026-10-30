import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  type Color,
  formatHex,
  formatHex8,
  interpolateWithPremultipliedAlpha,
  parse,
  toGamut,
} from "culori";

type Theme = "light" | "dark";
type Tokens = Record<string, string>;

const globalCss = readFileSync(
  join(process.cwd(), "src/app/global.css"),
  "utf8",
);

function declarations(selector: string): Tokens {
  const escaped = selector.replace(".", "\\.");
  const block =
    globalCss.match(new RegExp(`^${escaped} \\{([^}]*)\\}`, "m"))?.[1] ?? "";
  const entries = block.matchAll(/--([\w-]+):\s*([^;]+);/g);
  return Object.fromEntries(
    Array.from(entries, ([, name, value]) => [name, value.trim()]),
  );
}

const rootTokens = declarations(":root");

const THEMES: Record<Theme, Tokens> = {
  light: rootTokens,
  dark: { ...rootTokens, ...declarations(".dark") },
};

const toSrgb = toGamut("rgb", "oklch");

function splitArguments(list: string) {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < list.length; i++) {
    if (list[i] === "(") depth++;
    else if (list[i] === ")") depth--;
    else if (list[i] === "," && depth === 0) {
      parts.push(list.slice(start, i).trim());
      start = i + 1;
    }
  }
  parts.push(list.slice(start).trim());
  return parts;
}

function mixStop(stop: string) {
  const match = stop.match(/^(.+?)\s+(\d*\.?\d+)%$/);
  return match
    ? { color: match[1], amount: Number(match[2]) / 100 }
    : { color: stop, amount: undefined };
}

function resolve(expression: string, tokens: Tokens): Color {
  const reference = expression.match(/^var\(--([\w-]+)\)$/);
  if (reference) {
    const value = tokens[reference[1]];
    if (!value) throw new Error(`Unknown color token --${reference[1]}`);
    return resolve(value, tokens);
  }

  const mix = expression.match(/^color-mix\(in (oklab|oklch),\s*(.+)\)$/);
  if (mix) {
    const [first, second] = splitArguments(mix[2]).map(mixStop);
    const amount = first.amount ?? 1 - (second.amount ?? 0.5);
    const interpolate = interpolateWithPremultipliedAlpha(
      [resolve(first.color, tokens), resolve(second.color, tokens)],
      mix[1] as "oklab" | "oklch",
    );
    return interpolate(1 - amount);
  }

  const color = parse(expression);
  if (!color) throw new Error(`Unsupported color "${expression}"`);
  return color;
}

export function themeColor(expression: string, theme: Theme = "dark") {
  const color = toSrgb(resolve(expression.trim(), THEMES[theme]));
  return (color.alpha ?? 1) < 1 ? formatHex8(color) : formatHex(color);
}
