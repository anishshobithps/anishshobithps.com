import { FACE_FILL, FACE_TEXT, INK, INK_ATTRS } from "../classes";
import { Figure, type Flat, k, lengths, pathOf, type Plan, type Projection, type Scene, smoothstep, type V3 } from "../figure";
import { alongX, arc, circleD, D, disc, face, knob, L, S, screwsOnTop, turned } from "../parts";

const BELT_Z = 16;
const BACK_ROLL = -38;
const FRONT_ROLL = 38;
const ROLL_R = 4;
const HALF = 24;
const LAYERS = 8;
const LH = 1.6;
const Y_NOZZLE = 0;
const PITCH = 50;
const SCALE = 0.32;

const A: Flat[] = (
  [
    [32, 4],
    [48, 60],
    [40.5, 60],
    [32, 14],
    [23.5, 60],
    [16, 60],
  ] as Flat[]
).map(([x, y]) => [(x - 32) * SCALE, (y - 32) * SCALE]);

interface Pose {
  t: number;
  x: number;
  f: number;
  z: number;
  layer: number;
  ink: number[];
  fall: number;
  phase: string;
}

function planPrint(P: Projection) {
  const loop = [...A, A[0]!];
  const screens = Array.from({ length: LAYERS }, (_, i) => loop.map(([u, v]) => k.iso([u, v, BELT_Z + i * LH + LH], P) as Flat));
  const totals = screens.map((pts) => lengths(pts).at(-1)!);
  const poses: Pose[] = [];
  let pose: Pose = { t: 0, x: 20, f: 0, z: 0, layer: -1, ink: screens.map(() => 0), fall: 0, phase: "Heating" };
  const push = (change: Partial<Pose>) => {
    pose = { ...pose, ...change, ink: change.ink ?? [...pose.ink] };
    poses.push(pose);
  };
  const move = (x: number, f: number, z: number, time: number, steps = 8) => {
    const from = { ...pose };
    for (let i = 1; i <= steps; i++) {
      const e = smoothstep(i / steps);
      push({ t: from.t + (time * i) / steps, x: from.x + (x - from.x) * e, f: from.f + (f - from.f) * e, z: from.z + (z - from.z) * e });
    }
  };
  push({});
  push({ t: 0.6 });
  for (let layer = 0; layer < LAYERS; layer++) {
    const along = lengths(screens[layer]!);
    move(loop[0]![0], Y_NOZZLE - loop[0]![1], layer * LH, layer ? 0.25 : 0.5);
    push({ layer, phase: `Layer ${layer + 1}/${LAYERS}` });
    loop.forEach(([u, v], i) => {
      if (!i) return;
      const [pu, pv] = loop[i - 1]!;
      const ink = [...pose.ink];
      ink[layer] = along[i]!;
      push({ t: pose.t + Math.hypot(u - pu, v - pv) / 70, x: u, f: Y_NOZZLE - v, ink });
    });
  }
  push({ t: pose.t + 0.15, layer: LAYERS, phase: "Ejecting" });
  move(20, pose.f, LAYERS * LH + 6, 0.5);
  const start = pose.t;
  move(20, PITCH, LAYERS * LH + 6, 1.8, 18);
  const offAt = poses.find((p) => p.t >= start && p.f - 9 > FRONT_ROLL - 1)?.t ?? pose.t;
  for (const p of poses) if (p.t >= offAt) p.fall = Math.min(1, (p.t - offAt) / 0.45);
  push({ t: pose.t + 0.2, fall: 1 });
  move(20, PITCH, 0, 0.6);
  push({ t: pose.t + 0.6, phase: "Heating" });
  return { poses, screens, totals, period: Math.ceil(pose.t * 10) / 10 + 0.4 };
}

export function projectsScene(width = 400, height = 300): Scene {
  const FRAME: Plan = { x: -42, y: -48, w: 84, d: 96, r: 4 };
  const P = k.fitProjection(
    [...k.boxCorners(FRAME, -4, 0), [0, 0, 104], [-40, -24, 104], [62, 46, 0], [0, 72, 0]],
    width,
    height,
    { pad: 22, azimuth: 52 },
  ) as Projection;
  const { poses, screens, totals, period } = planPrint(P);
  const f = new Figure("print", P, period);
  const at = (p: V3) => f.at(p);

  f.add(f.halo(FRAME, -4, 6));
  for (const [x, y] of k.corners(FRAME, 4) as Flat[]) f.add(S(k.cylinder(x, y, 3, -4, 4, P, 18), { tone: "lo" }));
  const bar = (plan: Plan, z = 0, h = 6) => f.add(S(k.slabOf(plan, z, h, P, 2, 0.4), { tone: "mid", inner: L(k.sideSeam(plan, z + h / 2, P, 2), { tone: "faint" }) }));
  bar({ x: -42, y: -48, w: 84, d: 6, r: 1 });
  bar({ x: -42, y: -42, w: 6, d: 84, r: 1 });

  const SPOOL = alongX([0, -22, 96]);
  for (const x of [-16, 16]) f.add(S(k.slabOf({ x: x - 1.5, y: -25, w: 3, d: 6, r: 1 }, 84, 12, P, 2, 0.3), { tone: "mid" }));
  f.add(S(disc(P, SPOOL, -18, 18, 1.6), { tone: "mid" }));
  f.add(S(disc(P, SPOOL, -13, -11.6, 14), { tone: "mid" }));
  f.add(S(disc(P, SPOOL, -11.6, 11.6, 11), { tone: "hi", crease: "lo", lit: true, inner: L([-6, 0, 6].map((s) => arc(P, SPOOL, s, 11)).join(""), { tone: "lit" }) }));
  f.add(S(disc(P, SPOOL, 11.6, 13, 14), { tone: "mid" }));
  const spoolTurn = f.spinOf("spool", poses.map((p) => ({ t: p.t, angle: (p.layer < 0 ? 0 : p.layer + p.ink.reduce((a, b) => a + b, 0) / 400) * 0.6 })));
  f.add(f.inPlane(f.sidePlane([13, -22], 96, "right"), L(circleD(0, 0, 4, 20) + [0, 1, 2, 3, 4, 5].map((i) => pathOf([[Math.cos(i * 1.047) * 4, Math.sin(i * 1.047) * 4], [Math.cos(i * 1.047) * 12.6, Math.sin(i * 1.047) * 12.6]])).join(""), { tone: "lo" }), spoolTurn));

  const upright = (x: number) => {
    const plan: Plan = { x: x - 3, y: -3, w: 6, d: 6, r: 0.6 };
    f.add(S(k.slabOf(plan, 0, 84, P, 2, 0.4), { tone: "mid", inner: L(k.segment([x + 3, 0, 0], [x + 3, 0, 84], P) + k.segment([x, 3, 0], [x, 3, 84], P), { tone: "faint" }) }));
  };
  const zDrive = (x: number) => {
    const M: Plan = { x: x - 6, y: 4, w: 12, d: 12, r: 1 };
    f.add(S(k.slabOf(M, 6, 10, P, 2, 0.4), { tone: "mid", inner: L(k.sideSeam(M, 11, P, 2), { tone: "faint" }) }));
    f.add(S(k.cylinder(x, 10, 1.8, 16, 4, P, 16), { tone: "mid" }));
    f.add(S(k.cylinder(x, 10, 0.9, 20, 64, P, 12), { tone: "hi", crease: "none" }));
  };
  upright(-38);
  zDrive(-30);
  bar({ x: 36, y: -42, w: 6, d: 84, r: 1 });

  const sidePlate = (x: number) => bar({ x: x - 1.5, y: BACK_ROLL - 6, w: 3, d: FRONT_ROLL - BACK_ROLL + 12, r: 2 }, 6, BELT_Z - 6 + 3);
  sidePlate(-HALF - 2.5);
  for (const y of [BACK_ROLL, FRONT_ROLL]) f.add(S(disc(P, alongX([0, y, BELT_Z - ROLL_R]), -HALF - 1, HALF + 1, ROLL_R), { tone: "mid", crease: "lo" }));
  const beltTop = k.onTop(
    [
      [-HALF, BACK_ROLL],
      [HALF, BACK_ROLL],
      [HALF, FRONT_ROLL],
      [-HALF, FRONT_ROLL],
    ],
    BELT_Z,
    P,
    true,
  );
  f.add(`<path class="stroke-none ${FACE_FILL["1"]}" d="${beltTop}"/>`, L(beltTop, { tone: "lo" }));
  f.defs.push(`<clipPath id="print-belt"><path d="${beltTop}"/></clipPath>`);
  const ribs = Array.from({ length: 40 }, (_, i) => k.lineOnTop([-HALF, BACK_ROLL - PITCH + i * 5], [HALF, BACK_ROLL - PITCH + i * 5], BELT_Z, P)).join("");
  const belt = f.moveOf("belt", poses.map((p) => ({ t: p.t, by: [0, p.f, 0] })));

  const states = Array.from({ length: LAYERS }, (_, i) => {
    const solid = S(k.extrude(A, BELT_Z, (i + 1) * LH, P, { convex: false }), { tone: "hi", crease: "lo", lit: true });
    const on = f.switchOf(`layer${i}`, poses.map((p) => ({ t: p.t, on: p.layer > i && p.fall === 0 })));
    return `<g ${on} opacity="0">${solid}</g>`;
  }).join("");
  const laying = screens
    .map((pts, i) => {
      const total = totals[i]!;
      const hidden = total + 1;
      const reveal = f.trackOf(`lay${i}`, poses.map((p) => ({ t: p.t, v: [p.layer === i && p.ink[i]! > 0 ? total - p.ink[i]! : hidden] })), ([o]) => `stroke-dashoffset:${o!.toFixed(1)}`, { tolerance: 0.05 });
      return `<path class="${INK}" ${reveal} ${INK_ATTRS} d="${pathOf(pts)}" stroke-dasharray="${total.toFixed(1)} ${(total + 4).toFixed(1)}" stroke-dashoffset="${hidden.toFixed(1)}"/>`;
    })
    .join("");
  f.add(`<g clip-path="url(#print-belt)"><g ${belt}>${L(ribs, { tone: "faint" })}</g></g><g ${belt}>${states}${laying}</g>`);

  sidePlate(HALF + 2.5);
  upright(38);
  zDrive(30);

  const gantry = f.moveOf("gantry", poses.map((p) => ({ t: p.t, by: [0, 0, p.z] })));
  const head = f.moveOf("head", poses.map((p) => ({ t: p.t, by: [p.x, 0, 0] })));
  const ZB = BELT_Z + LH + 15;
  const g: string[] = [];
  for (const x of [-34, 34]) g.push(S(k.slabOf({ x: x - 4.5, y: -5, w: 9, d: 14, r: 1 }, ZB - 2, 10, P, 2, 0.4), { tone: "mid" }));
  g.push(S(k.slabOf({ x: -38, y: 3, w: 76, d: 6, r: 0.6 }, ZB, 6, P, 2, 0.4), { tone: "mid", inner: L(k.segment([-38, 9, ZB + 3], [38, 9, ZB + 3], P), { tone: "faint" }) }));
  g.push(screwsOnTop(P, [[-34, -2], [-34, 6], [34, -2], [34, 6]], ZB + 8, 0.6));
  const h: string[] = [];
  h.push(S(k.slabOf({ x: -8, y: 9, w: 16, d: 2.4, r: 0.6 }, ZB - 5, 15, P, 2, 0.3), { tone: "mid" }));
  h.push(S(k.slabOf({ x: -3, y: Y_NOZZLE - 2.2, w: 6, d: 4.4, r: 0.6 }, ZB - 12, 3, P, 2, 0.3), { tone: "mid" }));
  h.push(S(turned(P, { o: [0, Y_NOZZLE, BELT_Z + LH], a: [0, 0, 1], u: [1, 0, 0], v: [0, 1, 0] }, [[0, 0.3], [1.6, 1.2], [2.4, 1.6]]), { tone: "hi", lit: true }));
  for (let i = 0; i < 5; i++) h.push(S(k.cylinder(0, Y_NOZZLE, 3, ZB - 9 + i * 1.6, 0.8, P, 20), { tone: "mid" }));
  h.push(S(k.cylinder(0, Y_NOZZLE, 1.2, ZB - 9, 8, P, 12), { tone: "mid", crease: "none" }));
  h.push(S(k.slabOf({ x: -5, y: 3, w: 10, d: 6, r: 0.8 }, ZB + 6, 10, P, 2, 0.4), { tone: "mid", inner: L(k.sideSeam({ x: -5, y: 3, w: 10, d: 6, r: 0.8 }, ZB + 11, P, 2), { tone: "faint" }) }));
  h.push(L(k.ring(0, 6, 2.2, ZB + 16, P, 18), { tone: "lo" }));
  const fanFace = f.sidePlane([0, 11.4], ZB + 6, "left");
  h.push(f.inPlane(fanFace, face(`M-6.5 -3.2h13v9.5h-13z`, "1", "mid") + L(circleD(0, 1.5, 3.6, 24) + circleD(0, 1.5, 1.2, 12), { tone: "lo" }) + D([[-5.4, -2.1], [5.4, -2.1], [-5.4, 5.2], [5.4, 5.2]], { size: 0.35 })));
  g.push(`<g ${head} transform="${f.translate([20, 0, 0])}">${h.join("")}</g>`);
  f.add(`<g ${gantry}>${g.join("")}</g>`);

  bar({ x: -41, y: -3, w: 82, d: 6, r: 0.6 }, 84, 6);
  f.add(screwsOnTop(P, [[-38, 0], [38, 0]], 90, 0.8));

  bar({ x: -42, y: 42, w: 84, d: 6, r: 1 });
  const BIN: Plan = { x: -18, y: 52, w: 36, d: 22, r: 2 };
  const wall = (plan: Plan) => S(k.slabOf(plan, 0, 10, P, 2, 0.3), { tone: "mid" });
  f.add(wall({ x: BIN.x, y: BIN.y, w: BIN.w, d: 1.6, r: 0.5 }), wall({ x: BIN.x, y: BIN.y, w: 1.6, d: BIN.d, r: 0.5 }));
  f.add(S(k.slabOf(BIN, 0, 0.8, P, 2), { tone: "lo", crease: "none" }));
  const OFF_Y = FRONT_ROLL + 9;
  const binPart = (x: number, y: number) => S(k.extrude(A.map(([u, v]) => [u + x, v + y] as Flat), 0.8, LAYERS * LH, P, { convex: false }), { tone: "hi", crease: "lo", lit: true });
  f.add(binPart(-10, 60));
  const LAND: Flat = [0, 63];
  const drop = f.moveOf(
    "drop",
    poses.map((p) => ({ t: p.t, by: [0, (OFF_Y - LAND[1]) * (1 - p.fall), (BELT_Z - 0.8) * (1 - p.fall * p.fall)] })),
  );
  const shown = f.switchOf("drop-on", poses.map((p) => ({ t: p.t, on: p.fall > 0 })));
  f.add(`<g ${shown} opacity="0"><g ${drop}>${binPart(LAND[0], LAND[1])}</g></g>`);
  f.add(binPart(LAND[0], LAND[1]));
  f.add(wall({ x: BIN.x + BIN.w - 1.6, y: BIN.y, w: 1.6, d: BIN.d, r: 0.5 }), wall({ x: BIN.x, y: BIN.y + BIN.d - 1.6, w: BIN.w, d: 1.6, r: 0.5 }));

  const CTRL: Plan = { x: 46, y: 22, w: 18, d: 24, r: 2 };
  f.add(S(k.slabOf(CTRL, 0, 16, P, 3, 0.5), { tone: "mid", inner: L(k.sideSeam(CTRL, 3, P, 3), { tone: "faint" }) }));
  knob(f, [55, 40], 16, 2.6, 2.4);
  const screen = f.sidePlane([CTRL.x + 1.5, CTRL.y + CTRL.d], 14, "left");
  const states2 = [...new Set(poses.map((p) => p.phase))];
  const texts = states2
    .map((phase) => {
      const on = f.switchOf(`lcd-${phase.replace(/\W+/g, "")}`, poses.map((p) => ({ t: p.t, on: p.phase === phase })));
      return `<g ${on}${phase === poses[0]!.phase ? "" : ' opacity="0"'}><text class="${FACE_TEXT.lit}" x="7.5" y="5.2" font-size="2.3" text-anchor="middle">${phase.toUpperCase()}</text></g>`;
    })
    .join("");
  f.add(f.inPlane(screen, face(`M0 0h15v8h-15z`, "0", "mid") + `<clipPath id="print-lcd"><path d="M0.6 0.6h13.8v6.8h-13.8z"/></clipPath><g clip-path="url(#print-lcd)">${texts}</g>`));
  f.add(D([at([CTRL.x + 3, CTRL.y + 3, 16]), at([CTRL.x + 15, CTRL.y + 3, 16])], { size: 0.4 }));

  return f.build({
    width,
    height,
    label:
      "A belt 3D printer. The nozzle moves across and up while the belt moves under it, laying the logo's A layer by layer; then the belt carries the finished part over the front roller into a bin of earlier prints.",
  });
}
