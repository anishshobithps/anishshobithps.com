import {
  byDepth,
  cubic,
  Figure,
  type Flat,
  type Frame,
  k,
  lengths,
  pathOf,
  type Plan,
  type Projection,
  type Scene,
  smoothstep,
  stadium,
  type V3,
} from "../figure";
import {
  alongX,
  alongZ,
  arc,
  basePlate,
  cable,
  circleOn,
  coilZ,
  D,
  disc,
  G,
  knob,
  knurlOn,
  L,
  labelPlate,
  rulerStrip,
  S,
  screwsOnTop,
  slotsOnSide,
  turned,
} from "../parts";

const PAPER = 20.3;
const TAKE_R = 8.7;
const TAKE_Z = PAPER - TAKE_R - 0.3;

const BACK = -52;
const COVER_BACK = 34;
const TAKE_Y = 47;
const Y_PEN = -11.6;

const SUPPLY: V3 = [0, -66, 38];
const SUPPLY_R = 10;
const GUIDE: V3 = [0, BACK - 2.3, PAPER - 2.3];

const PAPER_HALF = 46;
const PITCH = 42;
const MASCOT_SCALE = 30 / 56;
const U0 = -8;
const toPaper = ([x, y]: Flat): Flat => [U0 + (x - 32) * MASCOT_SCALE, (y - 4) * MASCOT_SCALE];

const MASCOT: Flat[] = (
  [
    [32, 4],
    [48, 60],
    [40.5, 60],
    [32, 14],
    [23.5, 60],
    [16, 60],
    [32, 4],
  ] as Flat[]
).map(toPaper);
const eye = (x0: number) => stadium(x0 + 2.5, x0 + 8.5, 38.5, 2.5, 8).map(toPaper);
const UNDERLINE: Flat[] = cubic([U0 - 15, 33.4], [U0 - 4, 31.6], [U0 + 8, 35.4], [U0 + 22, 32], 24);
const STROKES: Flat[][] = [MASCOT, eye(18), eye(35), UNDERLINE];

const X_HOME = 30;
const F_END = Y_PEN + 6;
const F_START = F_END - PITCH;

const V_DRAW = 26;
const V_TRAVEL = 70;
const LIFT = 3;
const T_LIFT = 0.16;

interface Pose {
  t: number;
  x: number;
  f: number;
  lift: number;
  ink: number[];
  stroke: number;
}

function planMoves(P: Projection) {
  const screens = STROKES.map((pts) => pts.map(([u, v]) => k.iso([u, v, PAPER], P) as Flat));
  const totals = screens.map((pts) => lengths(pts).at(-1)!);
  const poses: Pose[] = [];
  let pose: Pose = { t: 0, x: X_HOME, f: F_START, lift: LIFT, ink: STROKES.map(() => 0), stroke: -1 };
  const push = (change: Partial<Pose>) => {
    pose = { ...pose, ...change, ink: change.ink ?? [...pose.ink] };
    poses.push(pose);
  };
  const travel = (x: number, f: number, speed = V_TRAVEL) => {
    const from = { x: pose.x, f: pose.f, t: pose.t };
    const span = Math.max(Math.abs(x - from.x), Math.abs(f - from.f));
    const time = Math.max(0.35, span / speed) * 1.25;
    for (let i = 1; i <= 10; i++) {
      const e = smoothstep(i / 10);
      push({ t: from.t + (time * i) / 10, x: from.x + (x - from.x) * e, f: from.f + (f - from.f) * e });
    }
  };

  push({});
  push({ t: 0.9 });
  STROKES.forEach((pts, s) => {
    const along = lengths(screens[s]!);
    travel(pts[0]![0], Y_PEN - pts[0]![1]);
    push({ t: pose.t + T_LIFT, lift: 0, stroke: s });
    pts.forEach(([u, v], i) => {
      if (i === 0) return;
      const [pu, pv] = pts[i - 1]!;
      const ink = [...pose.ink];
      ink[s] = along[i]!;
      push({ t: pose.t + Math.hypot(u - pu, v - pv) / V_DRAW, x: u, f: Y_PEN - v, ink });
    });
    push({ t: pose.t + 0.08 });
    push({ t: pose.t + T_LIFT, lift: LIFT });
  });
  push({ t: pose.t + 0.2, stroke: STROKES.length });
  travel(X_HOME, F_END, 40);
  push({ t: pose.t + 0.1, stroke: -1 });
  const period = Math.ceil((pose.t + 1.6) * 10) / 10;
  return { poses, screens, totals, period };
}

const PLATE: Plan = { x: -112, y: -82, w: 222, d: 150, r: 7 };

const spinMark = (length: number, hub: number) =>
  L(`M0 0L0 ${-length}`, { tone: "hi" }) +
  L(k.pathOf(Array.from({ length: 17 }, (_, i) => [Math.cos((i / 16) * Math.PI * 2) * hub, Math.sin((i / 16) * Math.PI * 2) * hub])), { tone: "lo" });

export function guestbookScene(width = 400, height = 300): Scene {
  const P = k.fitProjection(
    [...k.boxCorners(PLATE, -13, 0), [-76, -27, 63], [0, -72, 48], [76, -27, 48]],
    width,
    height,
    { pad: 26, azimuth: 58 },
  ) as Projection;
  const { poses, screens, totals, period } = planMoves(P);
  const f = new Figure("plot", P, period);
  const at = (p: V3) => f.at(p);
  const spin = (name: string, angle: (pose: Pose) => number) => f.spinOf(name, poses.map((pose) => ({ t: pose.t, angle: angle(pose) })));

  basePlate(f, PLATE, 0, 8);
  rulerStrip(f, { x: -64, y: PLATE.y + PLATE.d - 9, w: 128, d: 5.5, r: 1 }, 0, 4, 5);
  labelPlate(f, { x: -106, y: 44, w: 30, d: 15, r: 1.5 }, 0);

  const PSU: Plan = { x: -110, y: -62, w: 20, d: 24, r: 3 };
  f.add(S(k.slabOf(PSU, 0, 9, P, 5, 0.6), { tone: "mid", inner: L(k.sideSeam(PSU, 4.5, P, 5), { tone: "faint" }) }));
  f.add(L([0, 1, 2, 3].map((i) => k.planOutline({ x: PSU.x + 4 + i * 3.4, y: PSU.y + 5, w: 1.3, d: 13, r: 0.6 }, 9, P, 3)).join(""), { tone: "lo" }));
  f.add(S(k.slabOf({ x: -102, y: PSU.y + PSU.d, w: 4, d: 1.6, r: 0.5 }, 2, 3.2, P, 2), { tone: "mid" }));
  f.add(cable(P, [[-100, PSU.y + PSU.d + 1.6, 3.6], [-100, -24, 0.8], [-100, -12, 0.8], [-100, -6, 3.6]], 0.75));

  const CTRL: Plan = { x: -106, y: -6, w: 30, d: 40, r: 2.5 };
  f.add(S(k.slabOf(CTRL, 0, 13, P, 4, 0.6), { tone: "mid", inner: L(k.sideSeam(CTRL, 9.5, P, 4), { tone: "faint" }) }));
  f.add(screwsOnTop(P, k.corners(CTRL, 3) as Flat[], 13, 1));
  for (let i = 0; i < 5; i++) {
    f.add(L(k.planOutline({ x: CTRL.x + 6 + i * 3.6, y: CTRL.y + 6, w: 1.4, d: 14, r: 0.7 }, 13, P, 3), { tone: "lo" }));
  }
  const led: Flat = [CTRL.x + 22, CTRL.y + 30];
  f.add(L(k.ring(led[0], led[1], 1.7, 13, P, 16), { tone: "lo" }));
  const busy = f.switchOf(
    "led",
    poses.map((pose) => ({ t: pose.t, on: pose.stroke >= 0 && pose.stroke < STROKES.length ? 1 : 0.3 })),
  );
  f.add(`<g class="${busy}" opacity="0.3"><g class="iso-dots iso-glow"><circle cx="${at([led[0], led[1], 13])[0]}" cy="${at([led[0], led[1], 13])[1]}" r="1.1"/></g></g>`);
  knob(f, [CTRL.x + 10, CTRL.y + 30], 13, 3.2, 3.4);
  f.add(`<g transform="${f.sidePlane([CTRL.x + CTRL.w, CTRL.y + 22], 7, "right")}">${L("M-3 -1.3h6v2.6h-6z", { tone: "lo" })}</g>`);

  const upright = (x: number) => {
    const plan: Plan = { x, y: SUPPLY[1] - 6, w: 6, d: 12, r: 2.5 };
    f.add(S(k.slabOf(plan, 0, SUPPLY[2] + 5, P, 4, 0.5), { tone: "mid", inner: L(k.sideSeam(plan, 6, P, 4), { tone: "faint" }) }));
    f.add(screwsOnTop(P, [[x + 3, SUPPLY[1] - 3], [x + 3, SUPPLY[1] + 3]], SUPPLY[2] + 5, 0.8));
  };
  upright(-62);
  const tangent = (() => {
    const [ay, az] = [GUIDE[1], GUIDE[2] + 2.3];
    const [cy, cz] = [SUPPLY[1], SUPPLY[2]];
    const d = Math.hypot(cy - ay, cz - az);
    const base = Math.atan2(cz - az, cy - ay) + Math.asin(SUPPLY_R / d);
    const len = Math.sqrt(d * d - SUPPLY_R * SUPPLY_R);
    return [ay + Math.cos(base) * len, az + Math.sin(base) * len] as Flat;
  })();
  const slope = [
    [-PAPER_HALF, GUIDE[1], PAPER],
    [PAPER_HALF, GUIDE[1], PAPER],
    [PAPER_HALF, tangent[0], tangent[1]],
    [-PAPER_HALF, tangent[0], tangent[1]],
  ] as V3[];
  f.add(`<path class="iso-sheet" d="${pathOf(slope.map(at), true)}"/>`);
  const ROLL = alongX(SUPPLY);
  f.add(S(disc(P, ROLL, -56, 56, 2.6), { tone: "mid" }));
  f.add(
    S(disc(P, ROLL, -PAPER_HALF, PAPER_HALF, SUPPLY_R), {
      tone: "mid",
      crease: "lo",
      inner: L(arc(P, ROLL, -PAPER_HALF + 0.05, SUPPLY_R - 0.3), { tone: "faint" }),
    }),
  );
  f.add(L([4, 6, 8].map((r) => circleOn(P, ROLL, PAPER_HALF, r)).join(""), { tone: "faint" }));
  upright(56);
  const KNOB_S = alongX([62, SUPPLY[1], SUPPLY[2]]);
  f.add(S(disc(P, KNOB_S, 0, 3.2, 4.2), { tone: "mid" }));
  f.add(knurlOn(P, KNOB_S, 0, 3.2, 4.2, 20));
  const supplySpin = spin("supply-spin", (pose) => (pose.f - F_START) / SUPPLY_R);
  f.add(`<g transform="${f.sidePlane([65.2, SUPPLY[1]], SUPPLY[2], "right")}"><g class="${supplySpin}">${spinMark(3, 0.9)}</g></g>`);

  const towerSolid = (x: number) => {
    const plan: Plan = { x, y: -28, w: 10, d: 16, r: 1.5 };
    f.add(S(k.slabOf(plan, 0, 38, P, 3, 0.6), { tone: "mid", inner: L(k.sideSeam(plan, 6, P, 3), { tone: "faint" }) }));
  };
  towerSolid(-74);

  f.add(S(disc(P, alongX(GUIDE), -54, 54, 2.3), { tone: "mid", crease: "lo" }));
  const BODY: Plan = { x: -56, y: BACK, w: 112, d: 88, r: 3 };
  f.add(S(k.slabOf(BODY, 0, 20, P, 4, 0.8), { tone: "mid", inner: L(k.sideSeam(BODY, 4, P, 4), { tone: "faint" }) }));
  f.add(slotsOnSide(f, "right", [56, 30], 15, 6, 3.2, 1.4, 7));
  const flat = [
    [-PAPER_HALF, GUIDE[1]],
    [PAPER_HALF, GUIDE[1]],
    [PAPER_HALF, COVER_BACK + 4],
    [-PAPER_HALF, COVER_BACK + 4],
  ] as Flat[];
  f.add(`<path class="iso-sheet" d="${k.onTop(flat, PAPER, P, true)}"/>`);

  const clip = k.onTop(
    [
      [-PAPER_HALF, BACK],
      [PAPER_HALF, BACK],
      [PAPER_HALF, COVER_BACK],
      [-PAPER_HALF, COVER_BACK],
    ],
    PAPER,
    P,
    true,
  );
  f.defs.push(`<clipPath id="plot-paper"><path d="${clip}"/></clipPath>`);
  const entryMarks = () => {
    const perf: Flat[] = [];
    for (let u = -PAPER_HALF + 1.4; u <= PAPER_HALF - 1.4; u += 2.2) perf.push(at([u, -4, PAPER]));
    const rules = (
      [
        [
          [22, 3],
          [36, 3],
        ],
        [
          [22, 6],
          [31, 6],
        ],
      ] as Flat[][]
    )
      .map((pts) => L(k.onTop(pts, PAPER, P), { tone: "lo", free: true }))
      .join("");
    return D(perf, { size: 0.32, tone: "lo" }) + rules;
  };
  const strokeD = screens.map((pts) => pathOf(pts));
  const previous = strokeD.map((d) => `<path class="iso-ink" d="${d}"/>`).join("");
  const current = strokeD
    .map((d, s) => {
      const total = totals[s]!;
      const hidden = +(total + 1).toFixed(2);
      const cls = f.trackOf(
        `ink${s}`,
        poses.map((pose) => ({ t: pose.t, v: [pose.ink[s]! > 0 ? total - pose.ink[s]! : hidden] })),
        ([offset]) => `stroke-dashoffset:${offset!.toFixed(1)}`,
        { tolerance: 0.05 },
      );
      return `<path class="iso-ink ${cls}" d="${d}" stroke-dasharray="${total.toFixed(2)} ${(total + 4).toFixed(2)}" stroke-dashoffset="${hidden}"/>`;
    })
    .join("");
  const feed = f.moveOf("feed", poses.map((pose) => ({ t: pose.t, by: [0, pose.f, 0] })));
  f.add(
    `<g clip-path="url(#plot-paper)"><g class="${feed}" transform="${f.translate([0, F_START, 0])}">` +
      `${entryMarks()}${current}<g transform="${f.translate([0, PITCH, 0])}">${entryMarks()}${previous}</g>` +
      `</g></g>`,
  );

  for (const side of [-1, 1]) {
    const x = side * (PAPER_HALF - 1);
    const F = alongX([x, Y_PEN, PAPER + 3]);
    const arm: Plan = { x: side < 0 ? x - 3.2 : x + 1.6, y: Y_PEN - 2.6, w: 1.6, d: 5.2, r: 0.5 };
    const foot: Plan = { x: arm.x - 0.6, y: -17, w: 2.8, d: Y_PEN + 2.6 + 17, r: 0.5 };
    const armSvg =
      S(k.slabOf(arm, PAPER + 1.4, 39.5 - PAPER - 1.4, P, 2), { tone: "mid" }) +
      S(k.slabOf(foot, 39.5, 3, P, 2, 0.3), { tone: "mid" }) +
      D([at([foot.x + 1.4, -11, 42.5])], { size: 0.4 });
    if (side < 0) f.add(armSvg);
    f.add(S(disc(P, F, -1.2, 1.2, 3), { tone: "mid", crease: "lo" }));
    f.add(L(circleOn(P, F, 1.2, 1.1), { tone: "lo" }));
    if (side > 0) {
      f.add(armSvg);
      f.add(D([at([x + 3.2, Y_PEN, PAPER + 3])], { size: 0.45 }));
    }
  }

  towerSolid(64);
  const BEAM: Plan = { x: -76, y: -27, w: 152, d: 10, r: 1 };
  f.add(
    S(k.slabOf(BEAM, 38, 8, P, 3, 0.5), {
      tone: "mid",
      inner: L(
        [40.6, 43.4].map((z) => k.segment([BEAM.x, BEAM.y + BEAM.d, z], [BEAM.x + BEAM.w, BEAM.y + BEAM.d, z], P)).join(""),
        { tone: "faint" },
      ),
    }),
  );
  f.add(screwsOnTop(P, [[72, -22]], 46, 1));

  const BELT_Z = 46;
  for (const y of [-24.8, -19.2]) {
    f.add(S(k.slabOf({ x: -68, y: y - 0.35, w: 136, d: 0.7, r: 0.3 }, BELT_Z + 0.5, 1.6, P, 2), { tone: "lo", crease: "none" }));
  }
  const pulley = (x: number, name: string) => {
    f.add(S(k.cylinder(x, -22, 2.8, BELT_Z, 2.6, P, 24), { tone: "mid", crease: "lo", inner: L(k.sideArc(x, -22, 2.8, BELT_Z + 1.3, P, 16), { tone: "faint" }) }));
    const turn = spin(name, (pose) => (pose.x - X_HOME) / 2.8);
    f.add(`<g transform="${f.topPlane([x, -22], BELT_Z + 2.6)}"><g class="${turn}">${spinMark(2.2, 1)}</g></g>`);
  };
  pulley(68, "idler");
  pulley(-68, "pulley");

  const MOTOR: Plan = { x: -75, y: -29, w: 14, d: 14, r: 1.2 };
  for (const [x, y] of byDepth(k.corners(MOTOR, 1.6) as Flat[], P)) {
    f.add(S(k.cylinder(x, y, 0.7, 46, 5, P, 10), { tone: "mid", crease: "none" }));
  }
  f.add(S(k.slabOf(MOTOR, 51, 1.2, P, 3), { tone: "lo" }));
  const BODY_M = k.insetPlan(MOTOR, 0.3);
  f.add(S(k.slabOf(BODY_M, 52.2, 10, P, 3, 0.5), { tone: "mid", inner: L(k.sideSeam(BODY_M, 58, P, 3), { tone: "faint" }) }));
  f.add(L(k.ring(-68, -22, 4.2, 62.2, P, 28), { tone: "lo" }));
  f.add(screwsOnTop(P, k.corners(MOTOR, 2.2) as Flat[], 62.2, 0.7));

  const CLIP_Z = 28;
  const lead: V3[] = [
    [-80, 2, 13],
    [-80, 2, 19],
    [-69, -10.6, 19],
    [-69, -10.6, 55],
    [-69, -15.3, 55],
  ];
  f.add(S(k.slabOf({ x: -71, y: -12, w: 4, d: 1.4, r: 0.4 }, CLIP_Z, 3, P, 2), { tone: "mid", crease: "none" }));
  f.add(cable(P, lead, 0.75));
  f.add(S(k.slabOf({ x: -71.2, y: -12, w: 4.4, d: 1.4, r: 0.4 }, CLIP_Z + 0.4, 2.2, P, 2, 0.2), { tone: "mid" }));
  f.add(S(k.slabOf({ x: -71.2, y: -15.3, w: 4.4, d: 1.6, r: 0.4 }, 53.4, 3.2, P, 2), { tone: "mid" }));
  f.add(S(k.slabOf({ x: -82, y: 0, w: 4, d: 4, r: 0.6 }, 13, 1.6, P, 2), { tone: "mid" }));

  const car: string[] = [];
  const PLATE_Y = -17;
  const PLATE_F = -14.6;
  car.push(S(k.slabOf({ x: -9, y: PLATE_Y, w: 18, d: PLATE_F - PLATE_Y, r: 0.8 }, 29, 19, P, 2, 0.4), { tone: "mid" }));
  for (const [x, z] of [
    [-6.2, 44.6],
    [6.2, 44.6],
    [-6.2, 39.4],
    [6.2, 39.4],
  ] as Flat[]) {
    const F = G.frameOf([x, PLATE_F, z], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
    car.push(L(circleOn(P, F, 0, 1.2), { tone: "lo" }), D([at([x, PLATE_F, z])], { size: 0.42 }));
  }
  car.push(S(k.slabOf({ x: -5, y: -20.6, w: 10, d: 6, r: 0.6 }, 46, 2.6, P, 2, 0.3), { tone: "mid" }));
  car.push(screwsOnTop(P, [[-2.8, -18.2], [2.8, -18.2]], 48.6, 0.6));
  const ROD_Y = PLATE_F + 1;
  const BAR_Z = 43.6;
  const springs = [coilZ(P, [-5.6, ROD_Y], 34 + LIFT, BAR_Z, 1.15, 6), coilZ(P, [-5.6, ROD_Y], 34, BAR_Z, 1.15, 6)];
  const springCls = [true, false].map((up) =>
    f.switchOf(
      up ? "spring-up" : "spring-down",
      poses.map((pose) => ({ t: pose.t, on: pose.lift > LIFT / 2 === up })),
    ),
  );
  const springHalf = (half: "back" | "front", tone: "lo" | "mid") =>
    springs.map((coil, i) => `<g class="${springCls[i]}"${i ? ' opacity="0"' : ""}>${L(coil[half], { tone })}</g>`).join("");
  car.push(springHalf("back", "lo"));
  for (const x of [-5.6, 5.6]) car.push(S(k.cylinder(x, ROD_Y, 0.55, 29.5, BAR_Z - 29.5, P, 10), { tone: "hi", crease: "none" }));
  car.push(springHalf("front", "mid"));

  const PEN = alongZ([0, Y_PEN, PAPER]);
  const HOLD: Plan = { x: -3.9, y: PLATE_F, w: 7.8, d: 2 * (Y_PEN - PLATE_F), r: 1.2 };
  const lifted = [
    S(turned(P, PEN, [[0, 0.35], [2.6, 1.15], [3.2, 1.7]]), { tone: "hi", lit: true }),
    S(turned(P, PEN, [[3.2, 2.2], [9.7, 2.2]]), { tone: "hi", crease: "lo" }),
    S(k.slabOf(HOLD, 30, 4, P, 3, 0.4), { tone: "mid" }),
    S(k.slabOf({ x: 3.9, y: Y_PEN - 0.8, w: 1.2, d: 1.6, r: 0.3 }, 31, 2, P, 2), { tone: "mid", crease: "none" }),
    S(k.cylinder(6.3, Y_PEN, 1.3, 30.4, 3.2, P, 16), { tone: "mid" }),
    L(k.knurl(6.3, Y_PEN, 1.3, 30.4, 33.6, 12, P, 0.3), { tone: "lo" }),
    S(turned(P, PEN, [[13.7, 2.2], [16, 2.2], [16, 2.45], [19.6, 2.45], [20.2, 1.9]]), {
      tone: "hi",
      crease: "lo",
      inner: L(arc(P, PEN, 17.8, 2.45), { tone: "lit" }),
    }),
  ];
  const liftCls = f.moveOf("lift", poses.map((pose) => ({ t: pose.t, by: [0, 0, pose.lift] })));
  car.push(`<g class="${liftCls}" transform="${f.translate([0, 0, LIFT])}">${lifted.join("")}</g>`);
  const BAR: Plan = { x: -7.2, y: PLATE_F, w: 14.4, d: 3.4, r: 0.8 };
  car.push(S(k.slabOf(BAR, BAR_Z, 1.8, P, 2, 0.3), { tone: "mid" }));
  car.push(D([at([-5.6, ROD_Y, BAR_Z + 1.8]), at([5.6, ROD_Y, BAR_Z + 1.8])], { size: 0.4 }));
  car.push(S(k.cylinder(0, ROD_Y + 0.4, 2.3, BAR_Z + 1.8, 4.2, P, 20, 0.3), { tone: "mid", inner: L(k.sideArc(0, ROD_Y + 0.4, 2.3, BAR_Z + 3.9, P, 14), { tone: "faint" }) }));
  car.push(L(k.ring(0, ROD_Y + 0.4, 0.9, BAR_Z + 6, P, 12), { tone: "lo" }));
  const carriageCls = f.moveOf("carriage", poses.map((pose) => ({ t: pose.t, by: [pose.x, 0, 0] })));
  f.add(`<g class="${carriageCls}" transform="${f.translate([X_HOME, 0, 0])}">${car.join("")}</g>`);

  const FEED = alongX([74, -20, 14]);
  f.add(S(disc(P, FEED, 0, 1.4, 5.6), { tone: "mid" }));
  f.add(D([0, 1, 2, 3].map((i) => at(G.pointOf(FEED, 1.4, 4.6, Math.PI / 4 + (i * Math.PI) / 2) as V3)), { size: 0.4 }));
  f.add(S(turned(P, FEED, [[1.4, 4.4], [11, 4.4], [11.6, 3.7]]), { tone: "mid", crease: "lo", inner: L(arc(P, FEED, 6.5, 4.4), { tone: "faint" }) }));
  const feedSpin = spin("feed-spin", (pose) => (pose.f - F_START) / 3.2);
  f.add(`<g transform="${f.sidePlane([85.6, -20], 14, "right")}"><g class="${feedSpin}">${spinMark(2.4, 1.1)}</g></g>`);

  const TAKE = alongX([0, TAKE_Y, TAKE_Z]);
  const post = (x: number) => {
    const plan: Plan = { x, y: TAKE_Y - 4.5, w: 6, d: 9, r: 1.5 };
    f.add(S(k.slabOf(plan, 0, PAPER + 0.3, P, 3, 0.5), { tone: "mid" }));
  };
  post(-58);
  f.add(S(disc(P, TAKE, -52, 52, 2.6), { tone: "mid" }));
  f.add(S(disc(P, TAKE, -PAPER_HALF, PAPER_HALF, TAKE_R), { tone: "mid", crease: "lo" }));
  f.add(L([3.6, 6].map((r) => circleOn(P, TAKE, PAPER_HALF, r)).join(""), { tone: "faint" }));
  post(52);
  const KNOB_T = alongX([58, TAKE_Y, TAKE_Z]);
  f.add(S(disc(P, KNOB_T, 0, 3.4, 4.4), { tone: "mid" }));
  f.add(knurlOn(P, KNOB_T, 0, 3.4, 4.4, 20));
  const takeSpin = spin("take-spin", (pose) => -(pose.f - F_START) / TAKE_R);
  f.add(`<g transform="${f.sidePlane([61.4, TAKE_Y], TAKE_Z, "right")}"><g class="${takeSpin}">${spinMark(3.2, 0.9)}</g></g>`);
  const COVER: Plan = { x: -57, y: COVER_BACK, w: 114, d: 24, r: 1.5 };
  f.add(S(k.slabOf(COVER, PAPER + 0.3, 2.4, P, 3, 0.5), { tone: "mid" }));
  const teeth: Flat[] = [];
  for (let x = -PAPER_HALF; x <= PAPER_HALF + 1e-6; x += 2) teeth.push(at([x, COVER_BACK, PAPER + 2.7]), at([x + 1, COVER_BACK + 1, PAPER + 2.7]));
  f.add(L(pathOf(teeth), { tone: "faint" }));
  f.add(screwsOnTop(P, [[-54, 46], [54, 46]], PAPER + 2.7, 0.9));

  const SPARE = alongX([86, 54, 6.4]);
  for (const x of [72, 98]) {
    const block: Plan = { x: x - 2.5, y: 48, w: 5, d: 12, r: 0.8 };
    if (x > 80) continue;
    f.add(S(k.slabOf(block, 0, 3.4, P, 2, 0.3), { tone: "mid" }));
  }
  f.add(S(disc(P, SPARE, -15, 15, 6), { tone: "mid", crease: "lo", inner: L(arc(P, SPARE, 0, 6), { tone: "faint" }) }));
  f.add(L([2.2, 3.6, 4.8].map((r) => circleOn(P, SPARE, 15, r)).join(""), { tone: "faint" }));
  f.add(L(circleOn(P, SPARE, 15, 1.4), { tone: "lo" }));
  f.add(S(k.slabOf({ x: 95.5, y: 48, w: 5, d: 12, r: 0.8 }, 0, 3.4, P, 2, 0.3), { tone: "mid" }));

  const CAR: Flat = [90, 14];
  f.add(S(k.cylinder(CAR[0], CAR[1], 13, 0, 3, P, 48, 0.5), { tone: "mid" }));
  f.add(S(k.cylinder(CAR[0], CAR[1], 11.4, 3, 6, P, 48, 0.5), { tone: "mid", inner: L(k.sideArc(CAR[0], CAR[1], 11.4, 6, P, 24), { tone: "faint" }) }));
  const sockets = Array.from({ length: 6 }, (_, i) => {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 3;
    return [CAR[0] + Math.cos(a) * 7.6, CAR[1] + Math.sin(a) * 7.6, 9, i] as const;
  });
  for (const [x, y] of sockets) f.add(L(k.ring(x, y, 2.6, 9, P, 18), { tone: "lo" }));
  const EMPTY = 1;
  for (const [x, y, , i] of byDepth([...sockets], P)) {
    if (i === EMPTY) continue;
    f.add(S(k.cylinder(x, y, 2.2, 9, 8, P, 18), { tone: "hi", crease: "lo", inner: L(k.sideArc(x, y, 2.2, 13.5, P, 12), { tone: "lo" }) }));
    f.add(S(k.cylinder(x, y, 1.6, 17, 1.4, P, 14), { tone: "hi" }));
  }
  knob(f, CAR, 9, 2.6, 4, { pointer: false });
  const CAP = G.frameAlong([72, 32, 2.4], [Math.cos(0.5), Math.sin(0.5), 0]);
  f.add(S(turned(P, CAP, [[-3.6, 2.4], [2.8, 2.4], [3.6, 1.8]]), { tone: "hi", crease: "lo", inner: L(arc(P, CAP, -1.4, 2.4), { tone: "lit" }) }));

  return f.build({
    width,
    height,
    label:
      "A small roll-fed pen plotter on a base plate. Paper runs from a supply roll over the platen to a take-up roll. The pen carriage moves across while the paper moves under it, drawing the logo mascot and an underline in green ink, then the paper feeds one entry forward.",
  });
}
