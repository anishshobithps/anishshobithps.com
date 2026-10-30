import { Figure, type Flat, k, pathOf, type Plan, type Projection, type Scene, smoothstep, type V3 } from "../figure";
import { alongY, arc, circleD, D, disc, face, G, L, S, screwsOnTop } from "../parts";
import * as T from "../tube";

const N = 7;
const SLAT_W = 6;
const GAP = 0.8;
const H0 = 8;
const STEP = 4.4;
const X0 = -26;
const MARBLE_R = 2.2;
const PHASE = 1;
const RETURN = 1.6;
const PERIOD = (N - 1) * PHASE + RETURN;

const slatX = (i: number) => X0 + i * (SLAT_W + GAP);
const TOP_Z = H0 + (N - 1) * STEP + STEP / 2 + MARBLE_R;
const TROUGH = G.fillet(
  [
    [X0 + (N - 1) * (SLAT_W + GAP) + SLAT_W / 2, 0, TOP_Z],
    [X0 + N * (SLAT_W + GAP) + 3, 0, TOP_Z - 1],
    [X0 + N * (SLAT_W + GAP) + 3, -10, TOP_Z - 2],
    [X0 - 5, -10, H0 + MARBLE_R + 4],
    [X0 - 5, 0, H0 + MARBLE_R + 2],
    [X0 + SLAT_W / 2, 0, H0 - STEP / 2 + MARBLE_R],
  ] as V3[],
  4,
  8,
) as V3[];
const SPLIT = TROUGH.findIndex(([, y]) => y < -2);
const lift = (t: number) => {
  if (t >= (N - 1) * PHASE) return -1;
  const phase = Math.floor(t / PHASE);
  const local = (t - phase * PHASE) / PHASE;
  const from = phase % 2 === 0 ? -1 : 1;
  return from + (-from - from) * smoothstep(Math.min(1, local / 0.5));
};
const topOf = (i: number, t: number) => H0 + i * STEP + (STEP / 2) * lift(t) * (i % 2 === 0 ? 1 : -1);

function marbleAt(t: number): V3 {
  if (t >= (N - 1) * PHASE) {
    const u = smoothstep((t - (N - 1) * PHASE) / RETURN);
    return G.pointAlong(TROUGH, u * G.pathLength(TROUGH)) as V3;
  }
  const phase = Math.floor(t / PHASE);
  const local = (t - phase * PHASE) / PHASE;
  const slat = local < 0.55 ? phase : phase + 1;
  const roll = local < 0.55 ? 0 : smoothstep((local - 0.55) / 0.4);
  const x = slatX(phase) + SLAT_W / 2 + (SLAT_W + GAP) * roll;
  return [x, 0, topOf(slat, t) + MARBLE_R];
}

export function stairsScene(width = 400, height = 225): Scene {
  const BASE: Plan = { x: -40, y: -20, w: 92, d: 34, r: 3 };
  const P = k.fitProjection([...k.boxCorners(BASE, -6, 0), [slatX(N - 1) + 10, -10, TOP_Z + 6], [X0 - 4, -7, TOP_Z + 6]], width, height, { pad: 22, azimuth: 56 }) as Projection;
  const f = new Figure("stairs", P, PERIOD);
  const times = Array.from({ length: 181 }, (_, i) => (i / 180) * PERIOD);

  f.add(f.halo(BASE, -6, 6));
  f.add(S(k.slabOf(BASE, -6, 6, P, 3, 0.6), { tone: "mid", inner: L(k.sideSeam(BASE, -3, P, 3), { tone: "faint" }) }));
  f.add(screwsOnTop(P, k.corners(BASE, 3) as Flat[], 0, 0.8));

  f.add(
    T.tubePieces(TROUGH.slice(SPLIT - 1), 1.5, P, { maxLength: 400 })
      .map((piece) => T.tubeSvg(piece, { tone: "mid" }))
      .join(""),
  );
  const POST_TOP = TOP_Z + 4;
  for (const x of [X0 - 3, X0 + N * (SLAT_W + GAP) + 0.4]) {
    f.add(S(k.slabOf({ x: x - 1.2, y: -7, w: 2.4, d: 2.4, r: 0.5 }, 0, POST_TOP, P, 2, 0.3), { tone: "mid" }));
  }
  for (const z of [8, 20, 32]) {
    f.add(S(k.slabOf({ x: X0 - 3, y: -6.6, w: N * (SLAT_W + GAP) + 3.4, d: 1.4, r: 0.5 }, z, 1.2, P, 2), { tone: "mid", crease: "none" }));
  }
  f.add(screwsOnTop(P, [[X0 - 3, -5.8], [X0 + N * (SLAT_W + GAP) + 0.4, -5.8]], POST_TOP, 0.6));

  const ride = f.moveOf("marble", times.map((t) => ({ t, by: marbleAt(t) })));
  const marble = S(G.sphereOf([0, 0, 0], MARBLE_R, P), { tone: "hi", lit: true });
  const inTrough = (t: number) => t >= (N - 1) * PHASE + 0.25 && t < PERIOD - 0.2;
  const back = f.switchOf("marble-back", times.map((t) => ({ t, on: inTrough(t) })));
  const front = f.switchOf("marble-front", times.map((t) => ({ t, on: !inTrough(t) })));
  f.add(`<g class="${back}" opacity="0"><g class="${ride}">${marble}</g></g>`);

  for (let i = 0; i < N; i++) {
    const plan: Plan = { x: slatX(i), y: -4, w: SLAT_W, d: 8, r: 0.6 };
    const h = H0 + i * STEP + STEP;
    const move = f.moveOf(`slat${i}`, times.map((t) => ({ t, by: [0, 0, topOf(i, t) - (H0 + i * STEP)] })));
    const solid = S(k.slabOf(plan, -STEP, h, P, 2, 0.4), { tone: i === N - 1 ? "hi" : "mid", crease: "lo", inner: L(k.sideSeam(plan, h - STEP - 3, P, 2), { tone: "faint" }) });
    f.add(`<g class="${move}">${solid}${L(k.lineOnTop([plan.x + 1, 0], [plan.x + SLAT_W - 1, 0], h - STEP, P), { tone: "faint" })}</g>`);
  }
  f.add(
    T.tubePieces(TROUGH.slice(0, SPLIT), 1.5, P, { maxLength: 400 })
      .map((piece) => T.tubeSvg(piece, { tone: "mid" }))
      .join(""),
  );
  f.add(`<g class="${front}"><g class="${ride}">${marble}</g></g>`);

  const MOTOR: Plan = { x: 38, y: -12, w: 12, d: 14, r: 1.5 };
  f.add(S(k.slabOf(MOTOR, 0, 12, P, 3, 0.5), { tone: "mid", inner: L(k.sideSeam(MOTOR, 6, P, 3), { tone: "faint" }) }));
  const CRANK = alongY([44, 2, 7]);
  f.add(S(disc(P, CRANK, 0, 1.4, 4.6), { tone: "mid", crease: "lo", inner: L(arc(P, CRANK, 0.7, 4.6), { tone: "faint" }) }));
  const turn = f.spinOf("crank", times.map((t) => ({ t, angle: (Math.min(t, (N - 1) * PHASE) / PHASE) * Math.PI })), { tolerance: 1 });
  f.add(f.inPlane(f.sidePlane([44, 3.4], 7, "left"), L(circleD(0, 0, 1, 12) + "M0 0L0 -3.6", { tone: "hi" }) + face(circleD(0, -3.4, 0.9, 10), "top", "hi"), turn));
  f.add(D([f.at([41, 2, 12]), f.at([47, -8, 12])], { size: 0.45 }));

  return f.build({
    width,
    height,
    label: "A marble stair lift: seven slats in two interleaved groups rise and fall half a step out of phase, so a green marble climbs one step at a time, then rolls back down a trough to start again.",
  });
}
