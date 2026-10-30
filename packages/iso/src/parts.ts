import { FACE_FILL, type FaceFill } from "./classes";
import { byDepth, type Figure, type Flat, k, type Plan, type Projection, type Tone, type V3 } from "./figure";
import * as G from "./lathe";
import * as T from "./tube";

type SolidPaths = ReturnType<typeof k.slabOf>;
interface AnySolid {
  fill: string;
  outline: string;
  top: string;
  shades: string[];
  crease?: string;
  bevel?: string;
  seamless?: boolean;
}

export interface SolidStyle {
  tone?: Tone;
  crease?: Tone | "none";
  lit?: boolean;
  flat?: boolean;
  card?: boolean;
  inner?: string;
}

export const S = (paths: AnySolid, style: SolidStyle = {}) => k.solidSvg(paths as SolidPaths, style) as string;
export const L = (d: string, style: { tone?: k.LineTone } = {}) =>
  k.lineSvg(d, style);
export const D = (points: Array<Flat | [number, number, number]>, style: { size?: number; tone?: Tone } = {}) =>
  k.dotsSvg(points, style) as string;

export function screwsOnTop(P: Projection, points: Flat[], z: number, r = 1.3) {
  return (
    L(points.map(([x, y]) => k.ring(x, y, r, z, P, 14)).join(""), { tone: "lo" }) +
    D(points.map(([x, y]) => k.iso([x, y, z], P) as Flat), { size: 0.42 })
  );
}

export function basePlate(f: Figure, plan: Plan, z0: number, thick: number, { feet = 3.5, foot = 4.6 } = {}) {
  const P = f.P;
  const bottom = z0 - thick;
  f.add(f.halo(plan, bottom - feet, 8));
  for (const [x, y] of byDepth(k.corners(plan, 14) as Flat[], P)) {
    f.add(S(k.cylinder(x, y, foot + 1.2, bottom - feet, 1.2, P, 24), { tone: "lo" }));
    f.add(S(k.cylinder(x, y, foot, bottom - feet + 1.2, feet - 1.2, P, 24), { tone: "mid" }));
  }
  f.add(S(k.slabOf(plan, bottom, thick, P, 8, 1.2), { tone: "mid" }));
  f.add(L(k.planOutline(k.insetPlan(plan, 4), z0, P), { tone: "faint" }));
  f.add(screwsOnTop(P, k.corners(plan, 8.5) as Flat[], z0, 1.6));
}

export function rulerStrip(f: Figure, plan: Plan, z: number, step = 4, every = 5) {
  const P = f.P;
  f.add(S(k.slabOf(plan, z, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(plan.x + 3, plan.x + plan.w - 3, step, every, plan.y + 0.6, z + 0.6, [1.6, 3], P);
  f.add(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  f.add(D([f.at([plan.x + 1.6, plan.y + plan.d / 2, z + 0.6]), f.at([plan.x + plan.w - 1.6, plan.y + plan.d / 2, z + 0.6])], { size: 0.36 }));
}

export function labelPlate(f: Figure, plan: Plan, z: number) {
  const P = f.P;
  f.add(S(k.slabOf(plan, z, 0.8, P, 3, 0.4), { tone: "lo" }));
  f.add(L(k.planOutline(k.insetPlan(plan, 1.4), z + 0.8, P, 3), { tone: "faint" }));
  const x0 = plan.x + 4.5;
  const rows = [0.62, 0.42, 0.52];
  rows.forEach((share, i) => {
    const y = plan.y + 3.6 + i * ((plan.d - 7.2) / (rows.length - 1));
    f.add(L(k.lineOnTop([x0, y], [x0 + (plan.w - 9) * share, y], z + 0.8, P), { tone: "lo" }));
  });
  f.add(D([f.at([plan.x + 2.4, plan.y + plan.d / 2, z + 0.8]), f.at([plan.x + plan.w - 2.4, plan.y + plan.d / 2, z + 0.8])], { size: 0.38 }));
}

export function knob(f: Figure, at: Flat, z: number, r: number, h: number, { pointer = true, tone = "mid" as Tone } = {}) {
  const P = f.P;
  f.add(S(k.cylinder(at[0], at[1], r, z, h, P, 28, 0.4), { tone }));
  f.add(L(k.knurl(at[0], at[1], r, z, z + h, Math.round(r * 7), P, 0.5), { tone: "lo" }));
  if (pointer) f.add(L(k.lineOnTop([at[0], at[1]], [at[0] + r * 0.75, at[1] - r * 0.35], z + h, P), { tone: "hi" }));
}

export const alongX = (o: V3) => G.frameOf(o, [1, 0, 0], [0, 0, 1], [0, -1, 0]);
export const alongY = (o: V3) => G.frameOf(o, [0, 1, 0], [0, 0, 1], [1, 0, 0]);
export const alongZ = (o: V3) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]);

type Frame3 = ReturnType<typeof alongX>;

export function disc(P: Projection, F: Frame3, s0: number, s1: number, r: number) {
  return G.disc(s0, s1, r, F, P);
}

export function turned(P: Projection, F: Frame3, profile: Array<[number, number] | [number, number, number]>) {
  return G.solidOf(profile, F, P);
}

export const arc = (P: Projection, F: Frame3, s: number, r: number, options: { slope?: number; least?: number } = {}) =>
  G.arcOf(F, s, r, P, options);

export const circleOn = (P: Projection, F: Frame3, s: number, r: number) => G.circleOf(F, s, r, P);

export function knurlOn(P: Projection, F: Frame3, s0: number, s1: number, r: number, count: number) {
  const ribs = G.ribsOf(F, s0, s1, r, count, P, { fade: [0.1, 0.55], seams: true });
  return k.fadedSvg(ribs, { tone: "lo" }) as string;
}

export function coilZ(P: Projection, at: Flat, z0: number, z1: number, r: number, turns: number) {
  const count = Math.max(8, Math.round(turns * 18));
  const back: Flat[][] = [];
  const front: Flat[][] = [];
  let run: Flat[] = [];
  let near: boolean | null = null;
  for (let i = 0; i <= count; i++) {
    const share = i / count;
    const a = share * turns * Math.PI * 2;
    const nx = Math.cos(a);
    const ny = Math.sin(a);
    const facing = k.depthOf([nx, ny, 0], P) > 0;
    const pt = k.iso([at[0] + r * nx, at[1] + r * ny, z0 + (z1 - z0) * share], P) as Flat;
    if (near === null) near = facing;
    if (facing !== near) {
      run.push(pt);
      (near ? front : back).push(run);
      run = [pt];
      near = facing;
      continue;
    }
    run.push(pt);
  }
  if (run.length > 1) (near ? front : back).push(run);
  const d = (runs: Flat[][]) => runs.map((r) => k.pathOf(r)).join("");
  return { back: d(back), front: d(front) };
}

export function slotsOnSide(f: Figure, face: "left" | "right", at: Flat, z: number, count: number, gap: number, w: number, h: number) {
  const paths: string[] = [];
  for (let i = 0; i < count; i++) {
    const x = i * gap;
    paths.push(`M${x} 0h${w}v${h}h${-w}z`);
  }
  return `<g transform="${f.sidePlane(at, z, face)}">${L(roundSlots(paths), { tone: "lo" })}</g>`;
}

const roundSlots = (paths: string[]) => paths.join("");

export { G };

export function cable(P: Projection, points: V3[], r: number, { bend = 2.6, tone = "mid" as Tone, maxLength = 400 } = {}) {
  const route = G.fillet(points, r * bend, 7);
  const pieces = T.tubePieces(route, r, P, { maxLength });
  return pieces.map((piece) => T.tubeSvg(piece, { tone })).join("");
}

export function face(d: string, fill: FaceFill = "top", tone: k.LineTone | "none" = "mid") {
  return `<path class="stroke-none ${FACE_FILL[fill]}" d="${d}"/>` + (tone === "none" ? "" : L(d, { tone }));
}

export const circleD = (cx: number, cy: number, r: number, steps = 32) =>
  k.pathOf(Array.from({ length: steps }, (_, i) => [cx + Math.cos((i / steps) * Math.PI * 2) * r, cy + Math.sin((i / steps) * Math.PI * 2) * r]), true) as string;

export const radialD = (cx: number, cy: number, r0: number, r1: number, count: number, phase = 0) =>
  Array.from({ length: count }, (_, i) => {
    const a = phase + (i / count) * Math.PI * 2;
    return k.pathOf([
      [cx + Math.cos(a) * r0, cy + Math.sin(a) * r0],
      [cx + Math.cos(a) * r1, cy + Math.sin(a) * r1],
    ]) as string;
  }).join("");

export function gearD(cx: number, cy: number, r: number, teeth: number, depth = 0.8) {
  const pts: Flat[] = [];
  for (let i = 0; i < teeth; i++) {
    const a0 = (i / teeth) * Math.PI * 2;
    const step = (Math.PI * 2) / teeth;
    for (const [share, rr] of [
      [0, r - depth],
      [0.2, r],
      [0.5, r],
      [0.7, r - depth],
    ] as const) {
      const a = a0 + share * step;
      pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
    }
  }
  return k.pathOf(pts, true) as string;
}
