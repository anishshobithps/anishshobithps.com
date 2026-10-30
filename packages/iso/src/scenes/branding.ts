import { FACE_FILL } from "../classes";
import { Figure, type Flat, k, pathOf, type Plan, type Projection, type Scene, smoothstep } from "../figure";
import { alongZ, arc, face, L, rulerStrip, S, turned } from "../parts";

const PIVOT: Flat = [-58, 24];
const STRIPS = 11;
const BRAND = 7;
const LEN = 66;
const WIDE = 9;
const CLOSED = (-62 * Math.PI) / 180;
const SPREAD = (7.6 * Math.PI) / 180;
const PERIOD = 7.5;
const MASCOT: Flat[] = [
  [32, 4],
  [48, 60],
  [40.5, 60],
  [32, 14],
  [23.5, 60],
  [16, 60],
];

const openAt = (t: number, i: number) => {
  const lag = i * 0.05;
  if (t < 0.6 + lag) return 0;
  if (t < 1.8 + lag) return smoothstep((t - 0.6 - lag) / 1.2);
  const close = 5 + (STRIPS - 1 - i) * 0.05;
  if (t < close) return 1;
  if (t < close + 1.2) return 1 - smoothstep((t - close) / 1.2);
  return 0;
};

export function brandingScene(width = 400, height = 300): Scene {
  const MAT: Plan = { x: -78, y: -44, w: 156, d: 88, r: 3 };
  const P = k.fitProjection([...k.boxCorners(MAT, -2, 0), [40, -26, 22], [-44, 22, 8]], width, height, { pad: 24, azimuth: 52 }) as Projection;
  const f = new Figure("brand", P, PERIOD);
  const times = Array.from({ length: 151 }, (_, i) => (i / 150) * PERIOD);

  f.add(f.halo(MAT, -2, 6));
  const grid =
    Array.from({ length: 15 }, (_, i) => k.lineOnTop([MAT.x + 8 + i * 10, MAT.y], [MAT.x + 8 + i * 10, MAT.y + MAT.d], 0, P)).join("") +
    Array.from({ length: 8 }, (_, i) => k.lineOnTop([MAT.x, MAT.y + 9 + i * 10], [MAT.x + MAT.w, MAT.y + 9 + i * 10], 0, P)).join("");
  f.add(S(k.slabOf(MAT, -2, 2, P, 3, 0.4), { tone: "lo", inner: L(grid, { tone: "faint" }) }));
  rulerStrip(f, { x: MAT.x + 4, y: MAT.y + 2, w: MAT.w - 8, d: 4, r: 0.6 }, 0, 2, 5);

  const RULE: Plan = { x: -4, y: -40, w: 78, d: 6, r: 0.6 };
  f.add(S(k.slabOf(RULE, 0, 0.8, P, 2, 0.2), { tone: "mid" }));
  const ticks = k.topTicks(RULE.x + 2, RULE.x + RULE.w - 2, 2, 5, RULE.y + RULE.d, 0.8, [-1.2, -2.4], P);
  f.add(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  f.add(L(k.ring(RULE.x + 3.4, RULE.y + 3, 1, 0.8, P, 12), { tone: "lo" }));

  const SORT: Plan = { x: 28, y: -30, w: 12, d: 12, r: 0.6 };
  f.add(S(k.slabOf(SORT, 0, 20, P, 2, 0.4), { tone: "mid", inner: L(k.sideSeam(SORT, 6, P, 2), { tone: "faint" }) }));
  f.add(L(k.segment([SORT.x, SORT.y + SORT.d, 6.5], [SORT.x + SORT.w, SORT.y + SORT.d, 6.5], P), { tone: "lo" }));
  const glyph = MASCOT.map(([x, y]) => [SORT.x + 1.6 + (x - 16) * 0.27, SORT.y + 1.6 + (y - 4) * 0.155] as Flat);
  f.add(S(k.extrude(glyph, 20, 1.2, P, { convex: false }), { tone: "hi", crease: "lo" }));

  const PAD: Plan = { x: 50, y: -18, w: 24, d: 16, r: 2 };
  f.add(S(k.slabOf(PAD, 0, 3, P, 3, 0.4), { tone: "mid" }));
  f.add(`<path class="stroke-none ${FACE_FILL.lit}" d="${k.planOutline(k.insetPlan(PAD, 2), 3, P, 3)}"/>`, L(k.planOutline(k.insetPlan(PAD, 2), 3, P, 3), { tone: "lit" }));
  const STAMP = alongZ([66, 12, 0]);
  f.add(S(k.slabOf({ x: 58, y: 4, w: 16, d: 16, r: 1.4 }, 0, 1.4, P, 2), { tone: "hi", lit: true }));
  f.add(S(k.slabOf({ x: 58.6, y: 4.6, w: 14.8, d: 14.8, r: 1.4 }, 1.4, 5, P, 2, 0.4), { tone: "mid", inner: L(k.sideSeam({ x: 58.6, y: 4.6, w: 14.8, d: 14.8, r: 1.4 }, 3.8, P, 2), { tone: "faint" }) }));
  f.add(S(turned(P, STAMP, [[6.4, 2.4], [10, 1.8, 1], [12, 2.6, 1], [14.6, 4.2, 1], [17, 4.2, 1], [18.6, 2.6, 1], [19.4, 0, 1]]), { tone: "mid", crease: "lo", inner: L(arc(P, STAMP, 7.6, 2.3), { tone: "faint" }) }));
  f.add(f.inPlane(f.topPlane([58.6, 4.6], 6.4), face(pathOf(MASCOT.map(([x, y]) => [3 + (x - 16) * 0.27, 2 + (y - 4) * 0.18] as Flat), true), "top", "lo")));

  const CARD: Plan = { x: 14, y: 16, w: 34, d: 22, r: 0.8 };
  f.add(S(k.slabOf(CARD, 0, 0.4, P, 2), { tone: "lo", crease: "none", card: true }));
  f.add(
    f.inPlane(
      f.topPlane([CARD.x, CARD.y], 0.4),
      face(pathOf(MASCOT.map(([x, y]) => [3.4 + (x - 16) * 0.3, 3.4 + (y - 4) * 0.27] as Flat), true), "ink", "lit") +
        L("M17 7h13M17 10.4h9M17 13.8h11", { tone: "lo" }),
    ),
  );

  const ramp = (i: number) => {
    const chips: string[] = [];
    for (let c = 0; c < 6; c++) {
      const x0 = 8 + c * 9.4;
      const d = `M${x0} ${-WIDE / 2 + 1.2}h8.2v${WIDE - 2.4}h-8.2z`;
      if (i === BRAND) chips.push(`<path class="stroke-none ${FACE_FILL.ink}" style="opacity:${(0.25 + c * 0.15).toFixed(2)}" d="${d}"/>`);
      else chips.push(face(d, (["top", "3", "2", "1", "0", "0"] as const)[(c + i) % 6]!, "none"));
    }
    return chips.join("");
  };
  const strip = `M-6 ${-WIDE / 2}H${LEN - WIDE / 2}A${WIDE / 2} ${WIDE / 2} 0 0 1 ${LEN - WIDE / 2} ${WIDE / 2}H-6A${WIDE / 2} ${WIDE / 2} 0 0 1 -6 ${-WIDE / 2}Z`;
  for (let i = 0; i < STRIPS; i++) {
    const z = 0.6 + i * 0.55;
    const turn = f.spinOf(
      `strip${i}`,
      times.map((t) => ({ t, angle: CLOSED + i * SPREAD * openAt(t, i) })),
      { tolerance: 0.3 },
    );
    const edge = f.inPlane(f.topPlane(PIVOT, z - 0.45), face(strip, "0", "lo"), turn);
    const top = f.inPlane(
      f.topPlane(PIVOT, z),
      face(strip, i === BRAND ? "lit" : "top", i === BRAND ? "lit" : "mid") + ramp(i) + L("M1 -2.2h4M1 0h3", { tone: "lo" }),
      turn,
    );
    f.add(edge, top);
  }
  const screwZ = 0.6 + STRIPS * 0.55;
  f.add(S(k.cylinder(PIVOT[0], PIVOT[1], 2.4, screwZ - 0.4, 1.4, P, 20, 0.3), { tone: "hi", crease: "lo" }));
  f.add(L(k.lineOnTop([PIVOT[0] - 1.6, PIVOT[1]], [PIVOT[0] + 1.6, PIVOT[1]], screwZ + 1, P), { tone: "mid" }));

  return f.build({
    width,
    height,
    label:
      "A brand kit on a cutting mat: a colour fan deck that swings open on its pivot with one strip in the brand green, a metal type sort with the logo's A, the logo stamp on its ink pad, and a card it printed.",
  });
}
