import * as k from "./iso-kit";

export type V3 = [number, number, number];
export type Flat = [number, number];
export interface Plan {
  x: number;
  y: number;
  w: number;
  d: number;
  r: number;
}
export interface Projection {
  origin: Flat;
  scale: number;
  azimuth: number;
  elevation: number;
}
export type Tone = "hi" | "mid" | "lo" | "faint";

export interface Frame {
  t: number;
  css: string;
}

export interface Scene {
  id: string;
  width: number;
  height: number;
  period: number;
  body: string;
  css: string;
  label: string;
}

function simplify(samples: Array<{ t: number; v: number[] }>, tolerance: number) {
  if (samples.length < 3) return samples;
  const out = [samples[0]!];
  let anchor = 0;
  for (let i = 1; i < samples.length - 1; i++) {
    const a = samples[anchor]!;
    const next = samples[i + 1]!;
    let fits = true;
    for (let j = anchor + 1; j <= i && fits; j++) {
      const m = samples[j]!;
      const span = next.t - a.t;
      const u = span > 1e-9 ? (m.t - a.t) / span : 0;
      fits = m.v.every((value, n) => Math.abs(a.v[n]! + (next.v[n]! - a.v[n]!) * u - value) <= tolerance);
    }
    if (!fits) {
      out.push(samples[i]!);
      anchor = i;
    }
  }
  out.push(samples.at(-1)!);
  return out;
}

function dedupeSteps(samples: Array<{ t: number; v: number[] }>) {
  return samples.filter((s, i) => i === 0 || s.v.some((value, n) => value !== samples[i - 1]!.v[n]));
}

const short = (n: number) => {
  const text = String(Math.round(n * 10) / 10);
  if (text === "-0") return "0";
  return text.replace(/^(-?)0\./, "$1.");
};

function compactPath(d: string) {
  if (/[^MLZ0-9.\-\s,]/.test(d)) return d;
  const tokens = d.match(/[MLZ]|-?[\d.]+/g);
  if (!tokens) return d;
  let out = "";
  let prev = "";
  const put = (n: number) => {
    const text = short(n);
    const joins = !prev || /[a-z]$/.test(out) || text.startsWith("-") || (text.startsWith(".") && prev.includes("."));
    out += (joins ? "" : " ") + text;
    prev = text;
  };
  let cx = 0;
  let cy = 0;
  let sx = 0;
  let sy = 0;
  let mode = "";
  for (let i = 0; i < tokens.length; ) {
    const cmd = tokens[i++]!;
    if (cmd === "Z") {
      out += "z";
      prev = "";
      mode = "";
      cx = sx;
      cy = sy;
      continue;
    }
    const x = Math.round(parseFloat(tokens[i++]!) * 10) / 10;
    const y = Math.round(parseFloat(tokens[i++]!) * 10) / 10;
    if (cmd === "M") {
      out += "m";
      prev = "";
      put(x - cx);
      put(y - cy);
      sx = x;
      sy = y;
      mode = "m";
    } else {
      if (mode !== "m" && mode !== "l") {
        out += "l";
        prev = "";
      }
      put(x - cx);
      put(y - cy);
      mode = mode || "l";
    }
    cx = x;
    cy = y;
  }
  return out;
}
const compactAll = (markup: string) => markup.replace(/ d="([^"]+)"/g, (_, d: string) => ` d="${compactPath(d)}"`);

const round = (n: number, places = 2) => {
  const f = 10 ** places;
  const v = Math.round(n * f) / f;
  return Object.is(v, -0) ? 0 : v;
};

export const smoothstep = (t: number) => t * t * (3 - 2 * t);
const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

export class Figure {
  readonly out: string[] = [];
  readonly defs: string[] = [];
  readonly css: string[] = [];
  private tracks = 0;

  constructor(
    readonly id: string,
    readonly P: Projection,
    readonly period: number,
  ) {}

  add(...markup: string[]) {
    this.out.push(...markup);
    return this;
  }

  at(point: V3): Flat {
    return k.iso(point, this.P) as Flat;
  }

  shift(by: V3): Flat {
    return k.axisVector(this.P, by) as Flat;
  }

  translate(by: V3) {
    const [x, y] = this.shift(by);
    return `translate(${round(x)} ${round(y)})`;
  }

  translateCss(by: V3) {
    const [x, y] = this.shift(by);
    return `transform:translate(${round(x, 3)}px,${round(y, 3)}px)`;
  }

  track(name: string, frames: Frame[], { steps = false, period = this.period } = {}) {
    const cls = `${this.id}-${name}-${this.tracks++}`;
    const sorted = [...frames].sort((a, b) => a.t - b.t);
    if (!sorted.length) return "";
    if (sorted[0]!.t > 0) sorted.unshift({ t: 0, css: sorted[0]!.css });
    if (sorted.at(-1)!.t < period) sorted.push({ t: period, css: sorted.at(-1)!.css });
    const seen = new Map<string, string>();
    for (const { t, css } of sorted) seen.set(`${round((clamp(t, 0, period) / period) * 100, 2)}`, css);
    const body = [...seen].map(([pct, css]) => `${pct}%{${css}}`).join("");
    const timing = steps ? "steps(1,end)" : "linear";
    this.css.push(`@keyframes ${cls}{${body}}.${cls}{animation:${cls} ${period}s ${timing} infinite}`);
    return `iso-anim ${cls}`;
  }

  trackOf(
    name: string,
    samples: Array<{ t: number; v: number[] }>,
    format: (v: number[]) => string,
    { steps = false, tolerance = 0.02, period = this.period } = {},
  ) {
    const sorted = [...samples].sort((a, b) => a.t - b.t);
    const kept = steps ? dedupeSteps(sorted) : simplify(sorted, tolerance);
    return this.track(
      name,
      kept.map(({ t, v }) => ({ t, css: format(v) })),
      { steps, period },
    );
  }

  moveOf(name: string, samples: Array<{ t: number; by: V3 }>, { period = this.period, steps = false } = {}) {
    return this.trackOf(
      name,
      samples.map(({ t, by }) => ({ t, v: this.shift(by) })),
      ([x, y]) => `transform:translate(${round(x!, 2)}px,${round(y!, 2)}px)`,
      { tolerance: 0.06, period, steps },
    );
  }

  spinOf(name: string, samples: Array<{ t: number; angle: number }>, { period = this.period, steps = false, tolerance = 0.8 } = {}) {
    return this.trackOf(
      name,
      samples.map(({ t, angle }) => ({ t, v: [(angle * 180) / Math.PI] })),
      ([deg]) => `transform:rotate(${round(deg!, 1)}deg)`,
      { tolerance, period, steps },
    );
  }

  switchOf(name: string, samples: Array<{ t: number; on: boolean | number }>, { period = this.period, steps = true } = {}) {
    return this.trackOf(
      name,
      samples.map(({ t, on }) => ({ t, v: [typeof on === "number" ? on : on ? 1 : 0] })),
      ([o]) => `opacity:${round(o!, 2)}`,
      { steps, period },
    );
  }

  inPlane(matrix: string, content: string, spin = "") {
    return `<g transform="${matrix}">${spin ? `<g class="${spin}">${content}</g>` : content}</g>`;
  }

  planeOf(origin: V3, u: V3, v: V3) {
    const o = this.at(origin);
    const a = this.shift(u);
    const b = this.shift(v);
    const r = (n: number) => round(n, 3);
    return `matrix(${r(a[0])} ${r(a[1])} ${r(b[0])} ${r(b[1])} ${r(o[0])} ${r(o[1])})`;
  }

  topPlane(at: Flat, z: number) {
    return k.topMatrix(at, z, this.P, "x");
  }

  sidePlane(at: Flat, z: number, face: "left" | "right") {
    return k.sideMatrix(at, z, this.P, face);
  }

  halo(plan: Plan, z: number, spread = 6) {
    const layers = [1, 0.66, 0.33].map((share, index) => {
      const grown = k.insetPlan(plan, -spread * share);
      return `<path class="iso-halo" style="opacity:calc(var(--anatomy-halo-opacity) * ${round(0.34 + index * 0.33)})" d="${k.haloOf(grown, z, 0.01, this.P)}"/>`;
    });
    return layers.join("");
  }

  build(meta: Omit<Scene, "id" | "body" | "css" | "period" | "width" | "height"> & { width: number; height: number }): Scene {
    const defs = this.defs.length ? `<defs>${this.defs.join("")}</defs>` : "";
    const id = `${this.id}${meta.width}x${meta.height}`;
    const rename = (text: string) => text.split(`${this.id}-`).join(`${id}-`);
    return {
      id,
      period: this.period,
      body: rename(compactAll(defs + this.out.join(""))),
      css: rename(this.css.join("")),
      ...meta,
    };
  }
}

export function byDepth<T extends readonly number[]>(points: T[], P: Projection) {
  return [...points].sort((a, b) => k.depthOf([a[0]!, a[1]!, a[2] ?? 0], P) - k.depthOf([b[0]!, b[1]!, b[2] ?? 0], P));
}

export function lengths(points: Flat[]) {
  const out = [0];
  for (let i = 1; i < points.length; i++) {
    out.push(out[i - 1]! + Math.hypot(points[i]![0] - points[i - 1]![0], points[i]![1] - points[i - 1]![1]));
  }
  return out;
}

export function pathOf(points: Flat[], closed = false) {
  return k.pathOf(points, closed) as string;
}

export function cubic(a: Flat, b: Flat, c: Flat, d: Flat, count: number): Flat[] {
  return Array.from({ length: count + 1 }, (_, i) => {
    const t = i / count;
    const u = 1 - t;
    return [
      u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0],
      u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1],
    ];
  });
}

export function stadium(x0: number, x1: number, cy: number, r: number, perHalf = 10): Flat[] {
  const pts: Flat[] = [];
  for (let i = 0; i <= perHalf; i++) {
    const a = -Math.PI / 2 + (i / perHalf) * Math.PI;
    pts.push([x1 + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  for (let i = 0; i <= perHalf; i++) {
    const a = Math.PI / 2 + (i / perHalf) * Math.PI;
    pts.push([x0 + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  pts.push(pts[0]!);
  return pts;
}

export function sceneMarkup(scene: Scene) {
  return `<style>${scene.css}</style>${scene.body}`;
}

export { k };
