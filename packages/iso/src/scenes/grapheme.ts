import { FACE_FILL } from "../classes";
import { Figure, k, type Plan, type Projection, type Scene, smoothstep } from "../figure";
import { circleD, D, face, knob, L, S } from "../parts";

const SORTS = [
  { name: "U+1F469", w: 9 },
  { name: "U+1F3FB", w: 5 },
  { name: "U+200D", w: 1.6 },
  { name: "U+1F4BB", w: 9 },
];
const GAP = 4.5;
const BODY_H = 16;
const FACE_Z = 4 + BODY_H;
const DEPTH = 8;
const PERIOD = 6;

const joinAt = (t: number) => (t < 0.8 ? 0 : t < 2 ? smoothstep((t - 0.8) / 1.2) : t < 4.4 ? 1 : t < 5.4 ? 1 - smoothstep((t - 4.4) / 1) : 0);
const fusedAt = (t: number) => t >= 2.1 && t < 4.3;

export function graphemeScene(width = 400, height = 225): Scene {
  const DESK: Plan = { x: -56, y: -30, w: 112, d: 56, r: 4 };
  const P = k.fitProjection([...k.boxCorners(DESK, -3, 0), [-40, -22, 26], [40, -22, 26]], width, height, { pad: 20, azimuth: 58 }) as Projection;
  const f = new Figure("sorts", P, PERIOD);
  const times = Array.from({ length: 121 }, (_, i) => (i / 120) * PERIOD);

  f.add(f.halo(DESK, -3, 6));
  f.add(S(k.slabOf(DESK, -3, 3, P, 4, 0.5), { tone: "lo", inner: L(k.planOutline(k.insetPlan(DESK, 4), 0, P, 4), { tone: "faint" }) }));

  const CASE: Plan = { x: -44, y: -26, w: 88, d: 18, r: 1.2 };
  f.add(S(k.slabOf(CASE, 0, 5, P, 2, 0.4), { tone: "mid" }));
  const cells: string[] = [];
  for (let c = 0; c < 8; c++) for (let r = 0; r < 2; r++) cells.push(k.planOutline({ x: CASE.x + 2 + c * 10.6, y: CASE.y + 2 + r * 7.2, w: 9.6, d: 6.2, r: 0.4 }, 5, P, 2));
  f.add(`<path class="stroke-none ${FACE_FILL["0"]}" d="${cells.join("")}"/>`, L(cells.join(""), { tone: "lo" }));
  f.add(D([0, 3, 5, 6, 9, 12, 14].map((i) => f.at([CASE.x + 6 + (i % 8) * 10.6, CASE.y + 5 + Math.floor(i / 8) * 7.2, 5])), { size: 0.7, tone: "mid" }));

  const STICK: Plan = { x: -40, y: -2, w: 80, d: 12, r: 1 };
  f.add(S(k.slabOf(STICK, 0, 2.4, P, 2, 0.4), { tone: "mid" }));
  f.add(S(k.slabOf({ x: STICK.x, y: STICK.y, w: STICK.w, d: 2, r: 0.5 }, 2.4, 10, P, 2, 0.3), { tone: "mid", inner: L(k.segment([STICK.x, STICK.y + 2, 7], [STICK.x + STICK.w, STICK.y + 2, 7], P), { tone: "faint" }) }));
  const ruler = Array.from({ length: 27 }, (_, i) => k.segment([STICK.x + 2 + i * 3, STICK.y + 2, 12.4], [STICK.x + 2 + i * 3, STICK.y + 2, i % 5 ? 11.2 : 10.2], P)).join("");
  f.add(L(ruler, { tone: "lo" }));
  f.add(S(k.slabOf({ x: STICK.x, y: STICK.y + 2, w: 3, d: 10, r: 0.6 }, 2.4, 9, P, 2, 0.3), { tone: "mid" }));

  const total = SORTS.reduce((s, x) => s + x.w, 0);
  const x0 = -total / 2 - (GAP * (SORTS.length - 1)) / 2;
  let open = x0;
  let shut = -total / 2;
  const placed = SORTS.map((s) => {
    const p = { ...s, open, shut };
    open += s.w + GAP;
    shut += s.w;
    return p;
  });
  const face_ = (i: number, w: number): string => {
    const cx = w / 2;
    if (i === 0) return face(circleD(cx, 2.4, 1.6, 14), "1", "hi") + L(`M${cx - 3} 6.4a3 2.4 0 0 1 6 0`, { tone: "hi" });
    if (i === 1) return face(`M${cx - 1.4} 2.6h2.8v2.8h-2.8z`, "2", "hi");
    if (i === 2) return L(`M${cx} 1v6`, { tone: "lit" });
    return face(`M${cx - 3.4} 2.2h6.8v3.4h-6.8z`, "top", "hi") + L(`M${cx - 4.2} 6.6h8.4`, { tone: "hi" });
  };
  const sortSolid = (w: number, lit = false) => S(k.slabOf({ x: 0, y: STICK.y + 2.2, w, d: DEPTH, r: 0.3 }, 4, BODY_H, P, 1, 0.3), { tone: lit ? "hi" : "mid", lit, crease: "lo" });
  placed.forEach((s, i) => {
    const slide = f.moveOf(`sort${i}`, times.map((t) => ({ t, by: [s.open + (s.shut - s.open) * joinAt(t), 0, 0] })));
    const shown = f.switchOf(`sort${i}-on`, times.map((t) => ({ t, on: !fusedAt(t) })));
    const nick = L(k.segment([0, STICK.y + 2.2 + DEPTH, 8], [s.w, STICK.y + 2.2 + DEPTH, 8], P), { tone: "lo" });
    f.add(
      `<g class="${shown}"><g class="${slide}" transform="${f.translate([s.open, 0, 0])}">${sortSolid(s.w, i === 2)}${nick}${f.inPlane(f.topPlane([0, STICK.y + 2.2], FACE_Z), face_(i, s.w))}</g></g>`,
    );
  });
  const fused = f.switchOf("fused", times.map((t) => ({ t, on: fusedAt(t) })));
  const ligFace =
    face(circleD(total / 2 - 3, 2.6, 1.6, 14), "1", "hi") +
    L(`M${total / 2 - 6} 6.6a3 2.4 0 0 1 6 0`, { tone: "hi" }) +
    face(`M${total / 2 - 0.6} 3.6h6.4v3h-6.4z`, "top", "hi") +
    L(`M${total / 2 - 1.4} 7h8`, { tone: "hi" }) +
    L(`M${total / 2 - 3.4} 5.4l1 0.4`, { tone: "lit" });
  f.add(
    `<g class="${fused}" opacity="0"><g transform="${f.translate([-total / 2, 0, 0])}">${sortSolid(total, true)}${f.inPlane(f.topPlane([0, STICK.y + 2.2], FACE_Z), ligFace)}</g></g>`,
  );

  const knee = f.moveOf("knee", times.map((t) => ({ t, by: [placed.at(-1)!.open + placed.at(-1)!.w + ((placed.at(-1)!.shut - placed.at(-1)!.open) * joinAt(t)), 0, 0] })));
  f.add(`<g class="${knee}" transform="${f.translate([placed.at(-1)!.open + placed.at(-1)!.w, 0, 0])}">${S(k.slabOf({ x: 0, y: STICK.y + 2, w: 3, d: 10, r: 0.6 }, 2.4, 9, P, 2, 0.3), { tone: "mid" })}</g>`);
  knob(f, [STICK.x + STICK.w - 4, STICK.y + 6], 2.4, 2.6, 3);

  return f.build({
    width,
    height,
    label:
      "Four metal type sorts in a composing stick, the woman, the skin-tone modifier, a thin zero-width joiner and the laptop, slide together and lock up as one ligature sort: one grapheme. A type case sits behind.",
  });
}
