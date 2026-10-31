import {
  type Color,
  formatHex,
  formatHex8,
  interpolateWithPremultipliedAlpha,
  parse,
  toGamut,
} from "culori";
import { DARK_TOKENS, ROOT_TOKENS } from "./tokens.generated";

type Theme = "light" | "dark";
type Tokens = Record<string, string>;

const THEMES: Record<Theme, Tokens> = {
  light: ROOT_TOKENS,
  dark: { ...ROOT_TOKENS, ...DARK_TOKENS },
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

const MIX_HEAD = /^color-mix\(in (oklab|oklch),/;

function isAmount(text: string) {
  return (
    /^[0-9.]+$/.test(text) &&
    text.split(".").length <= 2 &&
    /[0-9]$/.test(text)
  );
}

function mixStop(stop: string) {
  if (!stop.endsWith("%")) return { color: stop, amount: undefined };
  const body = stop.slice(0, -1);
  let start = body.length;
  while (start > 0 && !/\s/.test(body[start - 1])) start--;
  const color = body.slice(0, start).trimEnd();
  const amount = body.slice(start);
  return color && start < body.length && isAmount(amount)
    ? { color, amount: Number(amount) / 100 }
    : { color: stop, amount: undefined };
}

function resolve(expression: string, tokens: Tokens): Color {
  const reference = expression.match(/^var\(--([\w-]+)\)$/);
  if (reference) {
    const value = tokens[reference[1]];
    if (!value) throw new Error(`Unknown color token --${reference[1]}`);
    return resolve(value, tokens);
  }

  const mixHead = MIX_HEAD.exec(expression);
  const mixArguments =
    mixHead && expression.endsWith(")")
      ? expression.slice(mixHead[0].length, -1).trim()
      : "";
  if (mixHead && mixArguments) {
    const [first, second] = splitArguments(mixArguments).map(mixStop);
    const amount = first.amount ?? 1 - (second.amount ?? 0.5);
    const interpolate = interpolateWithPremultipliedAlpha(
      [resolve(first.color, tokens), resolve(second.color, tokens)],
      mixHead[1] as "oklab" | "oklch",
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
