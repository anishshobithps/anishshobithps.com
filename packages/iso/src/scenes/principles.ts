import { DOTS_GLOW, FACE_FILL } from "../classes";
import { Figure, type Flat, k, pathOf, type Plan, type Projection, type Scene, type V3 } from "../figure";
import {
  alongX,
  alongY,
  arc,
  circleD,
  D,
  disc,
  face,
  G,
  gearD,
  knob,
  knurlOn,
  L,
  radialD,
  S,
  screwsOnTop,
  turned,
} from "../parts";

const MAT: Plan = { x: -104, y: -46, w: 210, d: 94, r: 8 };

const M: V3 = [-54, 0, 40];
const BODY_R = 20;
const RING_R = 23.5;

const W: Flat = [42, -4];
const CASE_R = 25;
const DIAL_Z = 6.6;

const WIND = 6;
const ROCK = (38 * Math.PI) / 180;
const BALANCE = 0.4;
const SWING = (220 * Math.PI) / 180;

function rotorSwing() {
  const w0 = (2 * Math.PI) / 1.3;
  const drag = 1.4;
  const rock = (t: number) => ROCK * Math.sin((2 * Math.PI * t) / WIND);
  const rate = (t: number) => ((ROCK * 2 * Math.PI) / WIND) * Math.cos((2 * Math.PI * t) / WIND);
  let phi = 0;
  let v = 0;
  const dt = 1 / 600;
  const samples: Array<{ t: number; rotor: number; cradle: number }> = [];
  const cycles = 12;
  for (let step = 0; step <= cycles * WIND * 600; step++) {
    const t = step * dt;
    const a = -w0 * w0 * Math.sin(phi) - drag * (v - rate(t));
    v += a * dt;
    phi += v * dt;
    const local = t - (cycles - 1) * WIND;
    if (local >= -1e-9 && step % 15 === 0) samples.push({ t: local, rotor: phi, cradle: rock(t) });
  }
  return samples;
}

export function principlesScene(width = 400, height = 225): Scene {
  const P = k.fitProjection(
    [...k.boxCorners(MAT, -3, 0), [M[0], M[1], M[2] + RING_R + 2], [M[0] - RING_R, 0, M[2]], [M[0] + RING_R, 0, M[2]]],
    width,
    height,
    { pad: 24, azimuth: 60 },
  ) as Projection;
  const f = new Figure("bench", P, WIND);
  const at = (p: V3) => f.at(p);

  f.add(f.halo(MAT, -3, 6));
  f.add(S(k.slabOf(MAT, -3, 3, P, 8, 0.6), { tone: "lo" }));
  f.add(L(k.planOutline(k.insetPlan(MAT, 4), 0, P), { tone: "faint" }));

  const DISH: Flat = [86, -30];
  f.add(S(k.cylinder(DISH[0], DISH[1], 10, 0, 2.4, P, 40, 0.4), { tone: "mid" }));
  f.add(L(k.ring(DISH[0], DISH[1], 8.4, 2.4, P, 40), { tone: "lo" }));
  f.add(D(([[84, -32], [88.5, -29], [86.4, -26.5], [82.6, -28.6]] as Flat[]).map(([x, y]) => at([x, y, 2.4])), { size: 0.55, tone: "hi" }));

  const POT: Flat = [-90, -30];
  f.add(S(k.cylinder(POT[0], POT[1], 6.4, 0, 2.4, P, 36, 0.4), { tone: "mid" }));
  f.add(S(k.cylinder(POT[0], POT[1], 4.6, 2.4, 3.4, P, 32, 0.3), { tone: "mid" }));
  f.add(L(k.ring(POT[0], POT[1], 2.2, 5.8, P, 20), { tone: "lo" }));
  f.add(`<g transform="${f.topPlane(POT, 5.8)}">${face(circleD(0, 0, 2.2, 20), "lit", "none")}</g>`);
  const OILER = G.frameAlong([-80, -38, 1.1], [Math.cos(-0.5), Math.sin(-0.5), 0]);
  f.add(S(turned(P, OILER, [[0, 0.25], [5, 0.5], [6, 1.1], [17, 1.1], [17.6, 0.8]]), { tone: "mid", crease: "lo" }));

  const BASE: Plan = { x: -84, y: -16, w: 60, d: 30, r: 3 };
  f.add(S(k.slabOf(BASE, 0, 9, P, 4, 0.6), { tone: "mid", inner: L(k.sideSeam(BASE, 2.5, P, 4), { tone: "faint" }) }));
  f.add(screwsOnTop(P, k.corners(BASE, 3) as Flat[], 9, 0.9));
  knob(f, [-31, 8], 9, 2.8, 3);
  const led: V3 = [-38, 8, 9];
  f.add(L(k.ring(led[0], led[1], 1.5, 9, P, 14), { tone: "lo" }));
  f.add(`<g class="${DOTS_GLOW}"><circle cx="${at(led)[0].toFixed(1)}" cy="${at(led)[1].toFixed(1)}" r="0.9"/></g>`);
  const POST: Plan = { x: M[0] - 7, y: -14, w: 14, d: 8, r: 2 };
  f.add(S(k.slabOf(POST, 9, M[2] - 9, P, 3, 0.5), { tone: "mid" }));
  f.add(S(disc(P, alongY([M[0], -6, M[2]]), 0, 2.5, 3), { tone: "mid" }));

  const AXIS = alongY([M[0], 0, M[2]]);
  f.add(S(disc(P, AXIS, -3, 3, BODY_R), { tone: "mid", crease: "lo" }));
  f.add(S(G.ringBand(-3.6, 3.6, BODY_R, RING_R, AXIS, P), { tone: "mid", inner: L(arc(P, AXIS, 0, RING_R), { tone: "faint" }) }));

  const swing = rotorSwing();
  const cradle = f.spinOf(
    "cradle",
    swing.map(({ t, cradle }) => ({ t, angle: -cradle })),
    { tolerance: 0.3 },
  );
  const ringFace = f.sidePlane([M[0], 3.6], M[2], "left");
  const screws = Array.from({ length: 6 }, (_, i) => {
    const a = (i / 6) * Math.PI * 2 + 0.3;
    const [x, y] = [Math.cos(a) * (RING_R - 1.7), Math.sin(a) * (RING_R - 1.7)];
    return L(circleD(x, y, 0.9, 12), { tone: "lo" }) + L(pathOf([[x - 0.7, y], [x + 0.7, y]]), { tone: "mid" });
  }).join("");
  f.add(f.inPlane(ringFace, screws, cradle));

  const BAL: Flat = [-9, -8];
  const ESC: Flat = [1.5, -15];
  f.defs.push(`<clipPath id="bench-plate"><path d="${circleD(0, 0, BODY_R - 0.6, 48)}"/></clipPath>`);
  const stripes = Array.from({ length: 16 }, (_, i) => {
    const o = -22 + i * 3;
    return pathOf([
      [o - 14, -24],
      [o + 14, 24],
    ]);
  }).join("");
  const balance = f.spinOf(
    "balance",
    Array.from({ length: 17 }, (_, i) => ({ t: (i / 16) * BALANCE, angle: SWING * Math.sin((i / 16) * Math.PI * 2) })),
    { period: BALANCE, tolerance: 2 },
  );
  const escape = f.spinOf(
    "escape",
    Array.from({ length: 31 }, (_, i) => ({ t: i * (BALANCE / 2), angle: (i * Math.PI * 2) / 30 })),
    { period: 15 * BALANCE, steps: true },
  );
  const jewels = ([[0, 0], BAL, ESC, [6, -10], [11, 4], [-12, 9], [4, 13]] as Flat[])
    .map(([x, y]) => L(circleD(x, y, 1, 12), { tone: "mid" }) + `<circle class="stroke-none ${FACE_FILL.lit}" cx="${x}" cy="${y}" r="0.5"/>`)
    .join("");
  const bridgeLines = L(
    pathOf([
      [-BODY_R + 0.4, 2],
      [-4, 2],
      [3, -5],
      [10, -16.4],
    ]) +
      pathOf([
        [3, -5],
        [16, -10.6],
      ]),
    { tone: "lo" },
  );
  const faceContent =
    face(circleD(0, 0, BODY_R - 0.6, 48), "top", "lo") +
    `<g clip-path="url(#bench-plate)">${L(stripes, { tone: "faint" })}</g>` +
    bridgeLines +
    face(circleD(BAL[0], BAL[1], 6.8, 32), "0", "lo") +
    `<g transform="translate(${BAL[0]} ${BAL[1]})">` +
    L(
      pathOf(
        Array.from({ length: 60 }, (_, i) => {
          const a = (i / 60) * Math.PI * 7;
          const r = 1 + (i / 60) * 3.4;
          return [Math.cos(a) * r, Math.sin(a) * r];
        }),
      ),
      { tone: "lo" },
    ) +
    `<g ${balance}>${L(circleD(0, 0, 5.4, 32) + circleD(0, 0, 4.7, 32), { tone: "hi" })}${L(radialD(0, 0, 0.6, 4.8, 3, 0.4), { tone: "mid" })}</g></g>` +
    face(circleD(ESC[0], ESC[1], 3.9, 24), "0", "lo") +
    `<g transform="translate(${ESC[0]} ${ESC[1]})"><g ${escape}>${L(gearD(0, 0, 3.3, 15, 0.9), { tone: "mid" })}${L(radialD(0, 0, 0.4, 2.3, 4), { tone: "lo" })}</g></g>` +
    jewels +
    ([[14, -8], [-15, 4], [8, 15], [-4, 17.5]] as Flat[])
      .map(([x, y]) => L(circleD(x, y, 1.15, 14), { tone: "mid" }) + L(pathOf([[x - 0.85, y - 0.4], [x + 0.85, y + 0.4]]), { tone: "hi" }))
      .join("");
  f.add(f.inPlane(f.sidePlane([M[0], 3], M[2], "left"), faceContent, cradle));

  const rotor = f.spinOf(
    "rotor",
    swing.map(({ t, rotor }) => ({ t, angle: -rotor })),
    { tolerance: 0.3 },
  );
  const sector = (r0: number, r1: number) =>
    pathOf(
      [
        ...Array.from({ length: 25 }, (_, i) => {
          const a = Math.PI * 0.08 + (i / 24) * Math.PI * 0.84;
          return [Math.cos(a) * r1, Math.sin(a) * r1] as Flat;
        }),
        ...Array.from({ length: 25 }, (_, i) => {
          const a = Math.PI * 0.92 - (i / 24) * Math.PI * 0.84;
          return [Math.cos(a) * r0, Math.sin(a) * r0] as Flat;
        }),
      ],
      true,
    );
  const rotorContent =
    face(sector(3.4, BODY_R - 1.2), "top", "hi") +
    face(sector(BODY_R - 4.6, BODY_R - 1.2), "2", "lo") +
    L(
      Array.from({ length: 5 }, (_, i) => {
        const r = 5.8 + i * 2.2;
        return pathOf(
          Array.from({ length: 17 }, (_, j) => {
            const a = Math.PI * 0.12 + (j / 16) * Math.PI * 0.76;
            return [Math.cos(a) * r, Math.sin(a) * r] as Flat;
          }),
        );
      }).join(""),
      { tone: "faint" },
    ) +
    face(circleD(0, 0, 3.4, 24), "2", "mid") +
    L(circleD(0, 0, 1.6, 16), { tone: "hi" }) +
    D(
      [0, 1, 2].map((i) => {
        const a = Math.PI * 0.5 + (i - 1) * 0.5;
        return [Math.cos(a) * 2.5, Math.sin(a) * 2.5] as Flat;
      }),
      { size: 0.4, tone: "hi" },
    );
  f.add(f.inPlane(f.sidePlane([M[0], 4.4], M[2], "left"), rotorContent, rotor));

  const strap = (side: number) => {
    const y0 = side < 0 ? W[1] - CASE_R - 28 : W[1] + CASE_R - 2;
    const plan: Plan = { x: W[0] - 9.5, y: y0, w: 19, d: 30, r: side < 0 ? 4 : 4 };
    f.add(S(k.slabOf(plan, 0, 2, P, 4, 0.4), { tone: "mid" }));
    const stitches: Flat[] = [];
    for (let y = y0 + 3; y <= y0 + 27; y += 2.2) stitches.push(at([W[0] - 7.4, y, 2]), at([W[0] + 7.4, y, 2]));
    f.add(D(stitches, { size: 0.32, tone: "lo" }));
    if (side > 0) {
      f.add(L(k.planOutline({ x: W[0] - 6, y: y0 + 14, w: 12, d: 2.2, r: 1 }, 2, P, 3), { tone: "lo" }));
    }
  };
  strap(-1);
  for (const sx of [-1, 1]) {
    for (const sy of [-1]) {
      f.add(S(k.slabOf({ x: W[0] + sx * 7.5 - 2, y: W[1] + sy * (CASE_R + 3) - 2, w: 4, d: 7, r: 1.2 }, 0, 4.4, P, 2, 0.3), { tone: "mid" }));
    }
  }
  f.add(S(k.cylinder(W[0], W[1], CASE_R - 1.5, 0, 1.5, P, 64), { tone: "mid" }));
  f.add(S(k.cylinder(W[0], W[1], CASE_R, 1.5, 5.1, P, 72, 0.6), { tone: "mid", inner: L(k.sideArc(W[0], W[1], CASE_R, 3.8, P, 40), { tone: "faint" }) }));
  for (const sx of [-1, 1]) {
    f.add(S(k.slabOf({ x: W[0] + sx * 7.5 - 2, y: W[1] + CASE_R - 4, w: 4, d: 7, r: 1.2 }, 0, 4.4, P, 2, 0.3), { tone: "mid" }));
  }
  strap(1);
  const CROWN = alongX([W[0] + CASE_R, W[1], 3.8]);
  f.add(S(disc(P, CROWN, 0, 2, 1.6), { tone: "mid" }));
  f.add(S(disc(P, CROWN, 2, 5.2, 3.2), { tone: "mid" }));
  f.add(knurlOn(P, CROWN, 2, 5.2, 3.2, 18));
  const TOP = DIAL_Z;
  f.add(L(k.ring(W[0], W[1], CASE_R - 2.4, TOP, P, 72), { tone: "lo" }));
  const ticks = k.radialTicks(W[0], W[1], CASE_R - 3.4, 60, 5, TOP, [1.1, 2.6], P);
  f.add(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "hi" }));
  f.add(L(k.planOutline({ x: W[0] + 13.2, y: W[1] - 1.6, w: 4.8, d: 3.2, r: 0.5 }, TOP, P, 2), { tone: "mid" }));
  f.add(k.faceTextSvg(k.topMatrix([W[0] + 15.6, W[1] + 1.1], TOP, P, "x"), "12", { size: 2.6, tone: "hi", anchor: "middle" }));

  const hand = (name: string, d: string, angle: (t: number) => number, period: number, z: number, fill: "top" | "lit" = "top", tone: k.LineTone = "hi") => {
    const turn = f.spinOf(
      name,
      Array.from({ length: 61 }, (_, i) => ({ t: (i / 60) * period, angle: angle((i / 60) * period) })),
      { period, tolerance: 0.2 },
    );
    return f.inPlane(f.topPlane(W, z), face(d, fill, tone), turn);
  };
  const hourAngle = ((10 + 9 / 60) / 12) * Math.PI * 2;
  const minAngle = (9 / 60) * Math.PI * 2;
  const handD = (len: number, w: number, tail: number) =>
    pathOf(
      [
        [-w * 0.6, tail],
        [-w, 0],
        [-w * 0.35, -len + 1.6],
        [0, -len],
        [w * 0.35, -len + 1.6],
        [w, 0],
        [w * 0.6, tail],
      ],
      true,
    );
  f.add(hand("hour", handD(12, 1.4, 2.6), () => hourAngle, 60, TOP + 0.3));
  f.add(hand("minute", handD(18.5, 1.1, 2.8), (t) => minAngle + (t / 3600) * Math.PI * 2, 60, TOP + 0.6));
  f.add(hand("second", pathOf([[-0.35, 5], [0, -20.5], [0.35, 5]], true), (t) => (t / 60) * Math.PI * 2, 60, TOP + 0.9, "lit", "lit"));
  f.add(f.inPlane(f.topPlane(W, TOP + 1), face(circleD(0, 0, 1.1, 14), "top", "hi")));

  const DRIVER = G.frameAlong([-26, 30, 2.6], [Math.cos(0.1), Math.sin(0.1), 0]);
  f.add(
    S(turned(P, DRIVER, [[0, 0.35], [3, 0.8], [18, 0.8], [18, 1.6], [20, 2.4], [40, 2.4], [41, 2.8], [44, 2.8], [44.6, 1.6]]), {
      tone: "mid",
      crease: "lo",
      inner: L(arc(P, DRIVER, 30, 2.4), { tone: "lit" }),
    }),
  );
  f.add(knurlOn(P, DRIVER, 21, 29, 2.4, 22));
  const TW: Flat = [-96, 26];
  for (const off of [-1.1, 1.1]) {
    const tip: V3 = [TW[0] + 36, TW[1] + off * 0.2 + 4, 0.8];
    const root: V3 = [TW[0], TW[1] + off, 0.8];
    f.add(L(pathOf([at(root), at(tip)]), { tone: "hi" }));
  }
  f.add(S(k.slabOf({ x: TW[0] - 3, y: TW[1] - 2.2, w: 5, d: 4.4, r: 1 }, 0, 1.6, P, 2), { tone: "mid" }));
  const LOUPE: Flat = [94, 20];
  f.add(S(k.cylinder(LOUPE[0], LOUPE[1], 6.6, 0, 3, P, 40, 0.4), { tone: "mid" }));
  f.add(S(turned(P, G.frameOf([LOUPE[0], LOUPE[1], 3], [0, 0, 1], [1, 0, 0], [0, 1, 0]), [[0, 6], [6, 5], [7.4, 5]]), { tone: "mid", crease: "lo" }));
  f.add(L(k.ring(LOUPE[0], LOUPE[1], 3.8, 10.4, P, 32), { tone: "hi" }));
  f.add(L(k.lineOnTop([LOUPE[0] - 2.2, LOUPE[1] - 1.6], [LOUPE[0] + 0.4, LOUPE[1] - 3.2], 10.4, P), { tone: "faint" }));

  return f.build({
    width,
    height,
    label:
      "A watchmaker's bench. A winder rocks an automatic movement back and forth while its rotor hangs by gravity, so the movement winds itself. Beside it, the finished watch lies face up with a plain dial and a sweeping second hand.",
  });
}
