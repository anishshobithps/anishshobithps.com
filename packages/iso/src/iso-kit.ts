import {
  DOT_TONE,
  DOTS,
  FACE_TEXT,
  FILL_FACE,
  FILL_PAPER,
  HALO,
  lineAttrs,
  SEAM_ATTRS,
  SHADE_FILL,
  SHADE_LIT,
  SHADE_LIT_SEAM,
  SHADE_STROKE,
  TOP,
  TOP_SEAM,
  type LineTone,
  type Tone,
} from "./classes";

export type { LineTone, Tone };

export type Flat = [number, number];
export type Point3 = [number, number, number];
export type Plane = [number, number];

export interface Projection {
  origin: Flat;
  scale: number;
  azimuth?: number;
  elevation?: number;
}

export interface Plan {
  x: number;
  y: number;
  w: number;
  d: number;
  r: number;
}

export interface SolidPaths {
  fill: string;
  outline: string;
  crease: string;
  top: string;
  shades: string[];
  bevel?: string;
  seamless?: boolean;
}



export const AZIMUTH = 45;
export const ELEVATION = 30;
export const SHADES = 4;

const RADIANS = Math.PI / 180;
const UNIT = Math.sqrt(1.6);

interface Camera {
  sinA: number;
  cosA: number;
  sinE: number;
  cosE: number;
  k: number;
}

export function cameraOf({ scale, azimuth = AZIMUTH, elevation = ELEVATION }: Projection): Camera {
  const a = azimuth * RADIANS;
  const e = elevation * RADIANS;
  return { sinA: Math.sin(a), cosA: Math.cos(a), sinE: Math.sin(e), cosE: Math.cos(e), k: scale * UNIT };
}

export function iso([x, y, z]: Point3, projection: Projection): Flat {
  const { origin } = projection;
  const { sinA, cosA, sinE, cosE, k } = cameraOf(projection);
  return [origin[0] + (x * sinA - y * cosA) * k, origin[1] + ((x * cosA + y * sinA) * sinE - z * cosE) * k];
}

export function towardViewer(projection: Projection): Plane {
  const { sinA, cosA } = cameraOf(projection);
  return [cosA, sinA];
}

export function depthOf([x, y, z]: Point3, projection: Projection) {
  const { sinA, cosA, sinE, cosE } = cameraOf(projection);
  return (x * cosA + y * sinA) * cosE + z * sinE;
}

const tenth = (value: number) => {
  const text = (Math.round(value * 10) / 10).toFixed(1).replace(/\.0$/, "");
  return text === "-0" ? "0" : text;
};

export function pathOf(points: Flat[], closed = false) {
  if (!points.length) return "";
  return points.map(([x, y], at) => `${at ? "L" : "M"}${tenth(x)} ${tenth(y)}`).join("") + (closed ? "Z" : "");
}

export const joinPaths = (paths: string[]) => paths.filter(Boolean).join("");

export function roundedPlan({ x, y, w, d, r }: Plan, steps = 8): Plane[] {
  const radius = Math.max(0, Math.min(r, w / 2, d / 2));
  const corners: [number, number, number][] = [
    [x + w - radius, y + radius, -90],
    [x + w - radius, y + d - radius, 0],
    [x + radius, y + d - radius, 90],
    [x + radius, y + radius, 180],
  ];
  const out: Plane[] = [];
  for (const [cx, cy, start] of corners) {
    const count = radius > 0 ? steps : 0;
    for (let step = 0; step <= count; step++) {
      const angle = (start + (count ? (90 * step) / count : 45)) * RADIANS;
      out.push([cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)]);
    }
  }
  return out;
}

function signedArea(points: Plane[] | Flat[]) {
  let area = 0;
  for (let index = 0; index < points.length; index++) {
    const [ax, ay] = points[index]!;
    const [bx, by] = points[(index + 1) % points.length]!;
    area += ax * by - bx * ay;
  }
  return area / 2;
}

const oriented = (points: Flat[]) => (signedArea(points) < 0 ? [...points].reverse() : points);

function convexHull(points: Flat[]): Flat[] {
  const sorted = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (sorted.length < 3) return sorted;
  const cross = (o: Flat, a: Flat, b: Flat) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower: Flat[] = [];
  for (const point of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2]!, lower[lower.length - 1]!, point) <= 0) lower.pop();
    lower.push(point);
  }
  const upper: Flat[] = [];
  for (let index = sorted.length - 1; index >= 0; index--) {
    const point = sorted[index]!;
    while (upper.length >= 2 && cross(upper[upper.length - 2]!, upper[upper.length - 1]!, point) <= 0) upper.pop();
    upper.push(point);
  }
  return [...lower.slice(0, -1), ...upper.slice(0, -1)];
}

function runsOf(flags: boolean[], want: boolean) {
  const count = flags.length;
  const runs: number[][] = [];
  const start = flags.findIndex((flag, index) => flag !== flags[(index + count - 1) % count]);
  if (start < 0) return flags[0] === want ? [Array.from({ length: count + 1 }, (_, index) => index % count)] : [];
  let run: number[] | null = null;
  for (let step = 0; step < count; step++) {
    const index = (start + step) % count;
    if (flags[index] === want) {
      if (!run) run = [index];
      run.push((index + 1) % count);
    } else if (run) {
      runs.push(run);
      run = null;
    }
  }
  if (run) runs.push(run);
  return runs;
}

export interface ExtrudeOptions {
  convex?: boolean;
  bevel?: number;
}

export function extrude(ring: Plane[], z: number, height: number, projection: Projection, options: ExtrudeOptions = {}): SolidPaths {
  const convex = options.convex ?? true;
  const count = ring.length;
  const counter = signedArea(ring) > 0;
  const [vx, vy] = towardViewer(projection);
  const { sinA, cosA } = cameraOf(projection);
  const normals = ring.map(([ax, ay], index) => {
    const [bx, by] = ring[(index + 1) % count]!;
    const dx = bx - ax;
    const dy = by - ay;
    const length = Math.hypot(dx, dy) || 1;
    return (counter ? [dy / length, -dx / length] : [-dy / length, dx / length]) as Plane;
  });
  const facing = normals.map(([nx, ny]) => nx * vx + ny * vy > 1e-9);
  const top = ring.map(([x, y]) => iso([x, y, z + height], projection));
  const bottom = ring.map(([x, y]) => iso([x, y, z], projection));
  const outline: string[] = [];
  const crease: string[] = [];
  for (const run of runsOf(facing, false)) outline.push(pathOf(run.map((index) => top[index]!)));
  for (const run of runsOf(facing, true)) {
    crease.push(pathOf(run.map((index) => top[index]!)));
    if (height > 0) outline.push(pathOf(run.map((index) => bottom[index]!)));
  }
  if (height > 0) {
    for (let index = 0; index < count; index++) {
      if (facing[(index + count - 1) % count] !== facing[index]) outline.push(pathOf([top[index]!, bottom[index]!]));
    }
  }
  let fill: string;
  if (convex) {
    fill = pathOf(convexHull([...top, ...bottom]), true);
  } else {
    const parts = [pathOf(oriented(top), true), pathOf(oriented(bottom), true)];
    for (let index = 0; index < count; index++) {
      if (!facing[index]) continue;
      const next = (index + 1) % count;
      parts.push(pathOf(oriented([top[index]!, top[next]!, bottom[next]!, bottom[index]!]), true));
    }
    fill = parts.join("");
  }
  const buckets: string[][] = Array.from({ length: SHADES }, () => []);
  if (height > 0) {
    const [lx, ly] = [-sinA, cosA];
    for (let index = 0; index < count; index++) {
      if (!facing[index]) continue;
      const [nx, ny] = normals[index]!;
      const lit = (nx * lx + ny * ly + 1) / 2;
      const shade = Math.min(SHADES - 1, Math.max(0, Math.floor(lit * SHADES)));
      const next = (index + 1) % count;
      buckets[shade]!.push(pathOf(oriented([top[index]!, top[next]!, bottom[next]!, bottom[index]!]), true));
    }
  }
  let bevel: string | undefined;
  if (options.bevel && options.bevel > 0) {
    const by = options.bevel;
    const inset = ring.map(([x, y], index) => {
      const [ax, ay] = normals[(index + count - 1) % count]!;
      const [bx, by2] = normals[index]!;
      const mx = ax + bx;
      const my = ay + by2;
      const length = Math.hypot(mx, my) || 1;
      return [x - (mx / length) * by, y - (my / length) * by] as Plane;
    });
    const insetTop = inset.map(([x, y]) => iso([x, y, z + height], projection));
    bevel = runsOf(facing, true)
      .map((run) => pathOf([top[run[0]!]!, ...run.slice(1, -1).map((index) => insetTop[index]!), top[run[run.length - 1]!]!]))
      .join("");
  }
  return {
    fill,
    outline: outline.join(""),
    crease: crease.join(""),
    top: pathOf(oriented(top), true),
    shades: buckets.map((paths) => paths.join("")),
    bevel,
  };
}

export const ringOf = (plan: Plan, steps = 8): Plane[] => roundedPlan(plan, steps);

export function slabOf(plan: Plan, z: number, height: number, projection: Projection, steps = 8, bevel = 0) {
  return extrude(ringOf(plan, steps), z, height, projection, { convex: true, bevel });
}

export function circleRing(cx: number, cy: number, radius: number, steps = 40): Plane[] {
  return Array.from({ length: steps }, (_, step) => {
    const angle = (step / steps) * Math.PI * 2;
    return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)] as Plane;
  });
}

export function cylinder(cx: number, cy: number, radius: number, z: number, height: number, projection: Projection, steps = 32, bevel = 0) {
  return extrude(circleRing(cx, cy, radius, steps), z, height, projection, { convex: true, bevel });
}

export const insetPlan = ({ x, y, w, d, r }: Plan, by: number): Plan => ({ x: x + by, y: y + by, w: w - by * 2, d: d - by * 2, r: Math.max(0, r - by) });

export function onTop(points: Plane[], z: number, projection: Projection, closed = false) {
  return pathOf(
    points.map(([x, y]) => iso([x, y, z], projection)),
    closed,
  );
}

export const planOutline = (plan: Plan, z: number, projection: Projection, steps = 8) => onTop(ringOf(plan, steps), z, projection, true);

export const lineOnTop = (from: Plane, to: Plane, z: number, projection: Projection) => onTop([from, to], z, projection);

export const segment = (from: Point3, to: Point3, projection: Projection) => pathOf([iso(from, projection), iso(to, projection)]);

export const rise = (at: Plane, from: number, to: number, projection: Projection) => segment([at[0], at[1], from], [at[0], at[1], to], projection);

export const ring = (cx: number, cy: number, radius: number, z: number, projection: Projection, steps = 40) =>
  onTop(circleRing(cx, cy, radius, steps), z, projection, true);

export const pointsAt = (points: Point3[], projection: Projection): Flat[] => points.map((point) => iso(point, projection));

export function dotGrid(x: number, y: number, columns: number, rows: number, gap: number, z: number, projection: Projection): Flat[] {
  const dots: Flat[] = [];
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) dots.push(iso([x + column * gap, y + row * gap, z], projection));
  }
  return dots;
}

export function corners({ x, y, w, d }: Plan, inset = 0): Plane[] {
  return [
    [x + inset, y + inset],
    [x + w - inset, y + inset],
    [x + inset, y + d - inset],
    [x + w - inset, y + d - inset],
  ];
}

export function boxCorners({ x, y, w, d }: Plan, z0: number, z1: number): Point3[] {
  const out: Point3[] = [];
  for (const px of [x, x + w]) for (const py of [y, y + d]) for (const z of [z0, z1]) out.push([px, py, z]);
  return out;
}

export function knurl(cx: number, cy: number, radius: number, z0: number, z1: number, count: number, projection: Projection, inset = 0.4) {
  const [vx, vy] = towardViewer(projection);
  const lines: string[] = [];
  for (let index = 0; index < count; index++) {
    const angle = (index / count) * Math.PI * 2;
    const nx = Math.cos(angle);
    const ny = Math.sin(angle);
    if (nx * vx + ny * vy < 0.15) continue;
    lines.push(segment([cx + radius * nx, cy + radius * ny, z0 + inset], [cx + radius * nx, cy + radius * ny, z1 - inset], projection));
  }
  return lines.join("");
}

export function sideArc(cx: number, cy: number, radius: number, z: number, projection: Projection, steps = 24) {
  const [vx, vy] = towardViewer(projection);
  const facing = Math.atan2(vy, vx);
  const points: Flat[] = [];
  for (let step = 0; step <= steps; step++) {
    const angle = facing - Math.PI / 2 + (step / steps) * Math.PI;
    points.push(iso([cx + radius * Math.cos(angle), cy + radius * Math.sin(angle), z], projection));
  }
  return pathOf(points);
}

export function ringSeam(ring: Plane[], z: number, projection: Projection) {
  const count = ring.length;
  const counter = signedArea(ring) > 0;
  const [vx, vy] = towardViewer(projection);
  const facing = ring.map(([ax, ay], index) => {
    const [bx, by] = ring[(index + 1) % count]!;
    const dx = bx - ax;
    const dy = by - ay;
    const [nx, ny] = counter ? [dy, -dx] : [-dy, dx];
    return nx * vx + ny * vy > 1e-9;
  });
  return runsOf(facing, true).map((run) => pathOf(run.map((index) => iso([ring[index]![0], ring[index]![1], z], projection)))).join("");
}

export const sideSeam = (plan: Plan, z: number, projection: Projection, steps = 8) => ringSeam(ringOf(plan, steps), z, projection);

export function sideRing(center: Point3, radius: number, axis: "x" | "y", projection: Projection, steps = 20) {
  const [px, py, pz] = center;
  const points: Flat[] = [];
  for (let step = 0; step < steps; step++) {
    const angle = (step / steps) * Math.PI * 2;
    const u = radius * Math.cos(angle);
    const v = radius * Math.sin(angle);
    points.push(iso(axis === "x" ? [px, py + u, pz + v] : [px + u, py, pz + v], projection));
  }
  return pathOf(points, true);
}

export function coil(from: number, to: number, center: Plane, radius: number, turns: number, axis: "x" | "y", projection: Projection, perTurn = 16) {
  const count = Math.max(1, Math.round(turns * perTurn));
  const back: string[] = [];
  const front: string[] = [];
  let run: Flat[] = [];
  let near: boolean | null = null;
  for (let index = 0; index <= count; index++) {
    const share = index / count;
    const angle = share * turns * Math.PI * 2;
    const u = radius * Math.cos(angle);
    const v = radius * Math.sin(angle);
    const along = from + (to - from) * share;
    const point: Point3 = axis === "x" ? [along, center[0] + u, center[1] + v] : [center[0] + u, along, center[1] + v];
    const normal: Point3 = axis === "x" ? [0, Math.cos(angle), Math.sin(angle)] : [Math.cos(angle), 0, Math.sin(angle)];
    const facing = depthOf(normal, projection) > 0;
    const flat = iso(point, projection);
    if (near === null) near = facing;
    if (facing !== near) {
      run.push(flat);
      (near ? front : back).push(pathOf(run));
      run = [flat];
      near = facing;
      continue;
    }
    run.push(flat);
  }
  if (run.length > 1) (near ? front : back).push(pathOf(run));
  return { back: back.join(""), front: front.join("") };
}

export interface Ticks {
  minor: string;
  major: string;
}

export function topTicks(from: number, to: number, step: number, every: number, edge: number, z: number, lengths: [number, number], projection: Projection, axis: "x" | "y" = "x"): Ticks {
  const minor: string[] = [];
  const major: string[] = [];
  const first = Math.ceil(from / step) * step;
  for (let at = first, index = Math.round(first / step); at <= to + 1e-9; at += step, index++) {
    const big = index % every === 0;
    const length = big ? lengths[1] : lengths[0];
    const a: Plane = axis === "x" ? [at, edge] : [edge, at];
    const b: Plane = axis === "x" ? [at, edge + length] : [edge + length, at];
    (big ? major : minor).push(lineOnTop(a, b, z, projection));
  }
  return { minor: minor.join(""), major: major.join("") };
}

export function sideTicks(from: number, to: number, step: number, every: number, face: number, top: number, lengths: [number, number], projection: Projection, axis: "x" | "y" = "x"): Ticks {
  const minor: string[] = [];
  const major: string[] = [];
  const first = Math.ceil(from / step) * step;
  for (let at = first, index = Math.round(first / step); at <= to + 1e-9; at += step, index++) {
    const big = index % every === 0;
    const length = big ? lengths[1] : lengths[0];
    const a: Point3 = axis === "x" ? [at, face, top] : [face, at, top];
    const b: Point3 = axis === "x" ? [at, face, top - length] : [face, at, top - length];
    (big ? major : minor).push(segment(a, b, projection));
  }
  return { minor: minor.join(""), major: major.join("") };
}

export function radialTicks(cx: number, cy: number, radius: number, count: number, every: number, z: number, lengths: [number, number], projection: Projection, from = 0, span = Math.PI * 2): Ticks {
  const minor: string[] = [];
  const major: string[] = [];
  const closed = Math.abs(span - Math.PI * 2) < 1e-9;
  const steps = closed ? count : count + 1;
  for (let index = 0; index < steps; index++) {
    const angle = from + (index / count) * span;
    const big = index % every === 0;
    const inner = radius - (big ? lengths[1] : lengths[0]);
    const sx = Math.sin(angle);
    const sy = -Math.cos(angle);
    (big ? major : minor).push(lineOnTop([cx + sx * inner, cy + sy * inner], [cx + sx * radius, cy + sy * radius], z, projection));
  }
  return { minor: minor.join(""), major: major.join("") };
}

export const haloOf = (plan: Plan, z: number, height: number, projection: Projection) => slabOf(plan, z, height, projection).fill;

export function axisVector(projection: Projection, [dx, dy, dz]: Point3): Flat {
  const origin = iso([0, 0, 0], projection);
  const moved = iso([dx, dy, dz], projection);
  return [moved[0] - origin[0], moved[1] - origin[1]];
}

const fine = (value: number) => Math.round(value * 100) / 100;

export function translateAlong(projection: Projection, by: Point3) {
  const [x, y] = axisVector(projection, by);
  return `translate(${fine(x)} ${fine(y)})`;
}

const thousandth = (value: number) => Math.round(value * 1000) / 1000;

function axesAt(at: Plane, z: number, projection: Projection) {
  const origin = iso([at[0], at[1], z], projection);
  const along = (point: Point3): Flat => {
    const [px, py] = iso(point, projection);
    return [px - origin[0], py - origin[1]];
  };
  return { origin, x: along([at[0] + 1, at[1], z]), y: along([at[0], at[1] + 1, z]), z: along([at[0], at[1], z + 1]) };
}

const matrixOf = (u: Flat, v: Flat, origin: Flat) =>
  `matrix(${thousandth(u[0])} ${thousandth(u[1])} ${thousandth(v[0])} ${thousandth(v[1])} ${thousandth(origin[0])} ${thousandth(origin[1])})`;

export function holdStill(element: Element, [dx, dy]: Flat) {
  const text = dx || dy ? `translate(${-dx} ${-dy})` : "";
  element.querySelectorAll("[data-hold]").forEach((node) => (text ? node.setAttribute("transform", text) : node.removeAttribute("transform")));
}

export function topMatrix(at: Plane, z: number, projection: Projection, along: "x" | "y" = "x") {
  const { origin, x, y } = axesAt(at, z, projection);
  return along === "x" ? matrixOf(x, y, origin) : matrixOf([-y[0], -y[1]], x, origin);
}

export function sideMatrix(at: Plane, z: number, projection: Projection, face: "left" | "right") {
  const { origin, x, y, z: up } = axesAt(at, z, projection);
  const down: Flat = [-up[0], -up[1]];
  return face === "left" ? matrixOf(x, down, origin) : matrixOf([-y[0], -y[1]], down, origin);
}

export function screenRise(height: number, projection: Projection) {
  const { cosE, k } = cameraOf(projection);
  return height * cosE * k;
}

export interface FitOptions {
  pad?: number;
  headroom?: number;
  azimuth?: number;
  elevation?: number;
}

export function fitProjection(points: Point3[], width: number, height: number, { pad = 24, headroom = 0, azimuth = AZIMUTH, elevation = ELEVATION }: FitOptions = {}): Projection {
  const unit: Projection = { origin: [0, 0], scale: 1, azimuth, elevation };
  const flat = points.map((point) => iso(point, unit));
  const xs = flat.map(([x]) => x);
  const ys = flat.map(([, y]) => y);
  const left = Math.min(...xs);
  const right = Math.max(...xs);
  const up = Math.min(...ys);
  const down = Math.max(...ys);
  const scale = Math.min((width - pad * 2) / (right - left), (height - pad * 2 - headroom) / (down - up));
  return {
    origin: [width / 2 - ((left + right) / 2) * scale, headroom + (height - headroom) / 2 - ((up + down) / 2) * scale],
    scale,
    azimuth,
    elevation,
  };
}

const escape = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export interface SolidStyle {
  tone?: Tone;
  crease?: Tone | "none";
  halo?: boolean;
  lit?: boolean;
  flat?: boolean;
  card?: boolean;
  className?: string;
  inner?: string;
}

function shadeSvg(d: string, shade: number, lit: boolean, seamless: boolean) {
  const fill = lit ? SHADE_LIT : SHADE_FILL[shade]!;
  if (!seamless) return `<path class="${fill} stroke-none" d="${d}"/>`;
  const stroke = lit ? SHADE_LIT_SEAM : SHADE_STROKE[shade]!;
  return `<path class="${fill} ${stroke}" ${SEAM_ATTRS} d="${d}"/>`;
}

function topSvg(d: string, lit: boolean, card: boolean, seamless: boolean) {
  const fill = lit ? TOP.lit : card ? TOP.card : TOP.plain;
  if (!seamless) return `<path class="${fill} stroke-none" d="${d}"/>`;
  return `<path class="${fill} ${lit ? TOP_SEAM.lit : TOP_SEAM.plain}" ${SEAM_ATTRS} d="${d}"/>`;
}

export function solidSvg(paths: SolidPaths, { tone = "hi", crease = "faint", halo = false, lit = false, flat = false, card = false, className, inner = "" }: SolidStyle = {}) {
  const seamless = Boolean(paths.seamless);
  const parts: string[] = [];
  if (halo) parts.push(`<path class="${HALO}" d="${paths.fill}"/>`);
  parts.push(`<path class="${lit ? FILL_FACE : FILL_PAPER}" d="${paths.fill}"/>`);
  if (!flat) {
    paths.shades.forEach((d, shade) => {
      if (d) parts.push(shadeSvg(d, shade, lit, seamless));
    });
    parts.push(topSvg(paths.top, lit, card, seamless));
  }
  if (crease !== "none" && paths.crease) parts.push(`<path ${lineAttrs(crease)} d="${paths.crease}"/>`);
  if (crease !== "none" && paths.bevel) parts.push(`<path ${lineAttrs(crease)} d="${paths.bevel}"/>`);
  if (inner) parts.push(inner);
  parts.push(`<path ${lineAttrs(lit ? "lit" : tone)} d="${paths.outline}"/>`);
  return `<g${className ? ` class="${escape(className)}"` : ""}>${parts.join("")}</g>`;
}

export interface LineStyle {
  tone?: LineTone;
  className?: string;
}

export function lineSvg(d: string, { tone = "lo", className }: LineStyle = {}) {
  if (!d) return "";
  return `<path ${lineAttrs(tone, className)} d="${d}"/>`;
}

export function dotsSvg(points: Array<Flat | [number, number, number]>, { size = 0.5, tone = "mid" }: { size?: number; tone?: Tone } = {}) {
  const dots = points
    .map(([x, y, alpha]: number[]) => `<circle cx="${tenth(x!)}" cy="${tenth(y!)}" r="${size}"${alpha !== undefined && alpha < 1 ? ` fill-opacity="${Math.max(0, alpha).toFixed(2)}"` : ""}/>`)
    .join("");
  return `<g class="${DOTS} ${DOT_TONE[tone]}">${dots}</g>`;
}

export type Faded = { d: string; alpha: number } | [string, number];

export function fadedSvg(list: Faded[], style: LineStyle = {}) {
  const groups = new Map<number, string>();
  for (const entry of list) {
    const [d, alpha] = Array.isArray(entry) ? entry : [entry.d, entry.alpha];
    if (!d || !(alpha > 0.02)) continue;
    const level = Math.min(1, Math.round(alpha * 20) / 20);
    groups.set(level, (groups.get(level) ?? "") + d);
  }
  return [...groups].map(([alpha, d]) => (alpha >= 1 ? lineSvg(d, style) : `<g opacity="${alpha.toFixed(2)}">${lineSvg(d, style)}</g>`)).join("");
}

export function faceTextSvg(transform: string, text: string, { size = 3, tone = "mid", anchor = "start" }: { size?: number; tone?: Tone; anchor?: "start" | "middle" | "end" } = {}) {
  return `<text class="${FACE_TEXT[tone]}" transform="${transform}" font-size="${size}" text-anchor="${anchor}">${escape(text)}</text>`;
}
