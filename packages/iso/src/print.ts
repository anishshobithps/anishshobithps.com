import { PLATE, PRINT_LINE, PRINT_LINE_ATTRS, PRINT_TEXT, SCREEN_DOT } from "@repo/iso/classes";
import type { Figure, Flat } from "@repo/iso/figure";
import { k } from "@repo/iso/figure";

type SolidPaths = ReturnType<typeof k.slabOf>;

export const REGISTER: Flat = [1.6, 1.1];
export const SETTLE_FROM: Flat = [6, 4];
export const SETTLE_TIME = 0.7;
export const PITCH = 4.2;
export const OBLIQUE = 0.8;

export type Screen = "hi" | "mid" | "lo";

const COVERAGE: Record<Screen, number> = { hi: 0.418, mid: 0.309, lo: 0.195 };

export type ShadeScreens = [Screen | null, Screen | null, Screen | null, Screen | null];

export const SIDE_SCREENS: ShadeScreens = ["hi", "mid", "lo", null];

const num = (value: number) => String(Math.round(value * 100) / 100);

const escape = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function screens(f: Figure) {
  if (f.defs.some((def) => def.includes(`id="${f.id}-scr-hi"`))) return;
  for (const level of Object.keys(COVERAGE) as Screen[]) {
    const radius = num(COVERAGE[level] * PITCH);
    f.defs.push(
      `<pattern id="${f.id}-scr-${level}" width="${PITCH}" height="${PITCH}" patternUnits="userSpaceOnUse" patternTransform="rotate(15)"><circle class="${SCREEN_DOT}" cx="${PITCH / 2}" cy="${PITCH / 2}" r="${radius}"/></pattern>`,
    );
  }
}

const settles = new WeakMap<Figure, string>();

function settleTrack(f: Figure) {
  let attr = settles.get(f);
  if (attr === undefined) {
    const from: Flat = [SETTLE_FROM[0] - REGISTER[0], SETTLE_FROM[1] - REGISTER[1]];
    attr = f.track(
      "reg",
      [
        { t: 0, css: `transform:translate(${num(from[0])}px,${num(from[1])}px);easing:ease-out` },
        { t: SETTLE_TIME, css: "transform:translate(0px,0px)" },
      ],
      { period: SETTLE_TIME, once: true },
    );
    settles.set(f, attr);
  }
  return attr;
}

export const rectD = (x: number, y: number, w: number, h: number) => k.pathOf([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], true) as string;

export const polyD = (points: Flat[]) => k.pathOf(points, true) as string;

export const circleD = (cx: number, cy: number, r: number, steps = 28) =>
  polyD(Array.from({ length: steps }, (_, i): Flat => [cx + Math.cos((i / steps) * Math.PI * 2) * r, cy + Math.sin((i / steps) * Math.PI * 2) * r]));

export function inkPath(d: string, extra = "") {
  if (!d) return "";
  return `<path class="${PRINT_LINE}${extra ? ` ${extra}` : ""}" ${PRINT_LINE_ATTRS} d="${d}"/>`;
}

export const paperPath = (d: string) => (d ? `<path class="${PLATE.paper}" d="${d}"/>` : "");

export const inkFill = (d: string, extra = "") => (d ? `<path class="${PLATE.ink}${extra ? ` ${extra}` : ""}" d="${d}"/>` : "");

export function screenPath(f: Figure, d: string, level: Screen, extra = "") {
  if (!d) return "";
  screens(f);
  return `<path class="stroke-none${extra ? ` ${extra}` : ""}" fill="url(#${f.id}-scr-${level})" d="${d}"/>`;
}

export function greenPlate(f: Figure, d: string) {
  if (!d) return "";
  return `<g class="${PLATE.register}" transform="translate(${REGISTER[0]} ${REGISTER[1]})"><g ${settleTrack(f)}><path class="${PLATE.green}" d="${d}"/></g></g>`;
}

export function shadowOf(f: Figure, d: string, by: Flat = [3, 3], level: Screen = "lo") {
  return `<g transform="translate(${by[0]} ${by[1]})">${screenPath(f, d, level)}</g>`;
}

export interface PrintOptions {
  subject?: boolean;
  screens?: ShadeScreens;
}

export function printSolid(f: Figure, paths: SolidPaths, { subject = false, screens: map = SIDE_SCREENS }: PrintOptions = {}) {
  const blend = subject ? PLATE.blend : "";
  const parts = [paperPath(paths.fill)];
  if (subject) parts.push(greenPlate(f, paths.fill));
  paths.shades.forEach((d, index) => {
    const level = map[index];
    if (d && level) parts.push(screenPath(f, d, level, blend));
  });
  parts.push(inkPath(paths.crease, blend), inkPath(paths.bevel ?? "", blend), inkPath(paths.outline, blend));
  const group = subject ? ` class="${PLATE.isolate}"` : "";
  return `<g${group}>${parts.join("")}</g>`;
}

export function printText(transform: string, text: string, { size = 6, anchor = "start" as "start" | "middle" | "end", extra = "" } = {}) {
  return `<text class="${PRINT_TEXT}${extra ? ` ${extra}` : ""}" transform="${transform}" font-size="${size}" text-anchor="${anchor}">${escape(text)}</text>`;
}

export function groundDots(f: Figure, center: Flat, radius: number, step = 14, z = 0) {
  const points: Array<[number, number, number]> = [];
  const span = Math.ceil(radius / step);
  for (let i = -span; i <= span; i++) {
    for (let j = -span; j <= span; j++) {
      const x = center[0] + i * step;
      const y = center[1] + j * step;
      const share = Math.hypot(x - center[0], y - center[1]) / radius;
      if (share >= 1) continue;
      const [sx, sy] = f.at([x, y, z]);
      points.push([sx, sy, 1 - share * share]);
    }
  }
  return k.dotsSvg(points, { size: 0.6, tone: "mid" }) as string;
}

export const lineD = (points: Flat[]) => k.pathOf(points) as string;

export function arcD(cx: number, cy: number, r: number, from: number, to: number, steps = 18) {
  return lineD(Array.from({ length: steps + 1 }, (_, i): Flat => {
    const a = from + ((to - from) * i) / steps;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  }));
}

export function ellipseD(cx: number, cy: number, rx: number, ry: number, steps = 28) {
  return polyD(Array.from({ length: steps }, (_, i): Flat => [cx + Math.cos((i / steps) * Math.PI * 2) * rx, cy + Math.sin((i / steps) * Math.PI * 2) * ry]));
}

export function gearD(cx: number, cy: number, r: number, teeth: number, depth = 1.6) {
  const points: Flat[] = [];
  const step = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i++) {
    for (const [share, radius] of [[0, r - depth], [0.2, r], [0.5, r], [0.7, r - depth]] as const) {
      const a = i * step + share * step;
      points.push([cx + Math.cos(a) * radius, cy + Math.sin(a) * radius]);
    }
  }
  return polyD(points);
}

export function greenAt(d: string, by: Flat = REGISTER, extra = "") {
  if (!d) return "";
  return `<g class="${PLATE.blend}${extra ? ` ${extra}` : ""}" transform="translate(${by[0]} ${by[1]})"><path class="${PLATE.green}" d="${d}"/></g>`;
}

export function greenFlat(d: string, by: Flat = REGISTER) {
  if (!d) return "";
  return `<g transform="translate(${by[0]} ${by[1]})"><path class="${PLATE.green}" d="${d}"/></g>`;
}

export function travel(f: Figure, name: string, points: Flat[], period: number, hold: Array<[number, number]> = []) {
  const first = points[0]!;
  const frames = points.map((point, index) => ({
    t: (period * index) / (points.length - 1),
    css: `transform:translate(${num(point[0] - first[0])}px,${num(point[1] - first[1])}px)`,
  }));
  for (const [t, index] of hold) {
    const point = points[index]!;
    frames.push({ t, css: `transform:translate(${num(point[0] - first[0])}px,${num(point[1] - first[1])}px)` });
  }
  return { attr: f.track(name, frames, { period }), start: first };
}

export function hash(text: string) {
  let value = 2166136261;
  for (let i = 0; i < text.length; i++) value = Math.imul(value ^ text.charCodeAt(i), 16777619);
  return value >>> 0;
}

const LOGO = "32,4 48,60 40.5,60 32,14 23.5,60 16,60";

export function logoD(x: number, y: number, size: number) {
  const scale = size / 64;
  return polyD(
    LOGO.split(" ").map((pair): Flat => {
      const [px, py] = pair.split(",").map(Number) as [number, number];
      return [x + px * scale, y + py * scale];
    }),
  );
}

export const pad2 = (value: number) => String(value).padStart(2, "0");
