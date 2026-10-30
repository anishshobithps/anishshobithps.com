import { SHEET, SHEET_ATTRS } from "../classes";
import { Figure, type Flat, k, pathOf, type Plan, type Projection, type Scene, smoothstep, type V3 } from "../figure";
import { circleD, D, knob, L, radialD, S, screwsOnTop } from "../parts";

const TOP = 8;
const TAPE_Z0 = 21;
const TAPE_Z1 = 27;
const WHEEL: Flat = [0, -4];
const WHEEL_R = 7;
const TAPE_Y = WHEEL[1] + WHEEL_R;
const SUPPLY: Flat = [-30, -10];
const SUPPLY_R = 8.5;
const TAKE: Flat = [30, 8];
const TAKE_R = 6;
const POSTS: Flat[] = [
  [-16, TAPE_Y - 1.2],
  [16, TAPE_Y - 1.2],
];

const PITCH = 1.7;
const LINE = [3.2, 2.4, 3.2, 0, 2.4, 3.6, 2.4, 3.2];
const CHAR_T = 0.5;
const IDLE = 1;
const PERIOD = LINE.length * CHAR_T + IDLE;

interface Pose {
  t: number;
  wheel: number;
  strike: number;
  tape: number;
  char: number;
}

function planPrint(): Pose[] {
  const poses: Pose[] = [];
  let wheel = 0;
  let tape = 0;
  poses.push({ t: 0, wheel, strike: 0, tape, char: -1 });
  LINE.forEach((height, i) => {
    const t0 = i * CHAR_T;
    const target = wheel + (((i * 7 + Math.round(height * 3)) % 24) + 3) * ((Math.PI * 2) / 24);
    const from = wheel;
    for (let s = 1; s <= 6; s++) {
      const e = smoothstep(s / 6);
      poses.push({ t: t0 + 0.22 * (s / 6), wheel: from + (target - from) * e, strike: 0, tape, char: i });
    }
    wheel = target;
    poses.push({ t: t0 + 0.26, wheel, strike: height ? 1 : 0, tape, char: i });
    poses.push({ t: t0 + 0.32, wheel, strike: 0, tape, char: i });
    for (let s = 1; s <= 4; s++) {
      poses.push({ t: t0 + 0.32 + 0.14 * (s / 4), wheel, strike: 0, tape: tape + PITCH * smoothstep(s / 4), char: i });
    }
    tape += PITCH;
  });
  poses.push({ t: LINE.length * CHAR_T + 0.05, wheel, strike: 0, tape, char: LINE.length });
  poses.push({ t: PERIOD, wheel, strike: 0, tape, char: LINE.length });
  return poses;
}

export function lateNightScene(width = 400, height = 225): Scene {
  const PLINTH_R = 44;
  const P = k.fitProjection(
    [
      ...Array.from({ length: 32 }, (_, i) => [Math.cos((i / 32) * Math.PI * 2) * PLINTH_R, Math.sin((i / 32) * Math.PI * 2) * PLINTH_R, 0] as V3),
      [0, -4, 40],
      [-30, -10, 30],
    ],
    width,
    height,
    { pad: 22, azimuth: 52 },
  ) as Projection;
  const f = new Figure("ticker", P, PERIOD);
  const at = (p: V3) => f.at(p);
  const poses = planPrint();
  const spin = (name: string, angle: (p: Pose) => number) => f.spinOf(name, poses.map((p) => ({ t: p.t, angle: angle(p) })), { tolerance: 0.5 });

  f.add(f.halo({ x: -PLINTH_R, y: -PLINTH_R, w: PLINTH_R * 2, d: PLINTH_R * 2, r: PLINTH_R }, 0, 6));
  f.add(S(k.cylinder(0, 0, PLINTH_R, 0, 4.4, P, 96, 0.8), { tone: "mid", inner: L(k.sideArc(0, 0, PLINTH_R, 2, P, 48), { tone: "faint" }) }));
  f.add(S(k.cylinder(0, 0, PLINTH_R - 4, 4.4, TOP - 4.4, P, 96, 0.6), { tone: "mid" }));
  f.add(L(k.ring(0, 0, PLINTH_R - 7, TOP, P, 96) + k.ring(0, 0, PLINTH_R - 8.4, TOP, P, 96), { tone: "faint" }));
  f.add(screwsOnTop(P, [0, 1, 2, 3].map((i) => [Math.cos(0.4 + (i * Math.PI) / 2) * (PLINTH_R - 7.7), Math.sin(0.4 + (i * Math.PI) / 2) * (PLINTH_R - 7.7)] as Flat), TOP, 0.6));

  const posts: Flat[] = [
    [-26, 24],
    [-19, 28],
  ];
  const reel = (c: Flat, r: number, name: string, dir: number) => {
    f.add(S(k.cylinder(c[0], c[1], 3, TOP, 1.4, P, 24), { tone: "mid" }));
    f.add(S(k.cylinder(c[0], c[1], 1.3, TOP + 1.4, TAPE_Z0 - 1 - TOP - 1.4, P, 14), { tone: "mid", crease: "none" }));
    f.add(S(k.cylinder(c[0], c[1], r + 1.6, TAPE_Z0 - 1, 1, P, 48), { tone: "mid" }));
    f.add(S(k.cylinder(c[0], c[1], r, TAPE_Z0, TAPE_Z1 - TAPE_Z0, P, 48), { tone: "hi", crease: "lo", inner: L([2, 4].map((dz) => k.sideArc(c[0], c[1], r, TAPE_Z0 + dz, P, 32)).join(""), { tone: "faint" }) }));
    f.add(S(k.cylinder(c[0], c[1], r + 1.6, TAPE_Z1, 1, P, 48, 0.3), { tone: "mid" }));
    const turn = spin(name, (p) => (dir * p.tape) / r);
    const spokes = L(radialD(0, 0, 2.2, r + 0.6, 5) + circleD(0, 0, 2.2, 18), { tone: "lo" }) + L(pathOf([[0, 0], [r + 1, 0]]), { tone: "hi" });
    f.add(f.inPlane(f.topPlane(c, TAPE_Z1 + 1), spokes, turn));
    f.add(S(k.cylinder(c[0], c[1], 1.3, TAPE_Z1 + 1, 1.4, P, 14), { tone: "mid" }));
  };
  reel(SUPPLY, SUPPLY_R, "supply", 1);

  const ribbon = (a: Flat, b: Flat) =>
    `<path class="${SHEET}" ${SHEET_ATTRS} d="${pathOf([at([a[0], a[1], TAPE_Z0]), at([b[0], b[1], TAPE_Z0]), at([b[0], b[1], TAPE_Z1]), at([a[0], a[1], TAPE_Z1])], true)}"/>`;
  const tangentFrom = (c: Flat, r: number, p: Flat, side: number): Flat => {
    const dx = p[0] - c[0];
    const dy = p[1] - c[1];
    const d = Math.hypot(dx, dy);
    const base = Math.atan2(dy, dx) + side * Math.acos(r / d);
    return [c[0] + Math.cos(base) * r, c[1] + Math.sin(base) * r];
  };
  const inLeft: Flat = [POSTS[0]![0], TAPE_Y + 0.2];
  f.add(ribbon(tangentFrom(SUPPLY, SUPPLY_R, POSTS[0]!, 1), [POSTS[0]![0] - 1, POSTS[0]![1] + 0.6]));

  const PILLARS: Flat[] = [
    [-9.5, -6],
    [9.5, -6],
  ];
  f.add(S(k.cylinder(PILLARS[0]![0], PILLARS[0]![1], 1.8, TOP, 34 - TOP, P, 18), { tone: "mid", crease: "none" }));
  const INK: Flat = [0, WHEEL[1] - WHEEL_R - 2.5];
  f.add(S(k.slabOf({ x: -1.4, y: INK[1] - 8, w: 2.8, d: 6, r: 0.8 }, TOP, 16, P, 2, 0.3), { tone: "mid" }));
  f.add(S(k.slabOf({ x: -1, y: INK[1] - 3, w: 2, d: 3, r: 0.5 }, TOP + 15, 3, P, 2), { tone: "mid", crease: "none" }));
  f.add(S(k.cylinder(INK[0], INK[1], 2.5, TAPE_Z0, TAPE_Z1 - TAPE_Z0, P, 24), { tone: "lo", lit: false, crease: "lo" }));
  f.add(S(k.cylinder(WHEEL[0], WHEEL[1], 1.4, TOP, TAPE_Z0 - TOP, P, 14), { tone: "mid", crease: "none" }));
  f.add(S(k.cylinder(WHEEL[0], WHEEL[1], WHEEL_R, TAPE_Z0, TAPE_Z1 - TAPE_Z0, P, 48), { tone: "hi", crease: "lo" }));
  const wheelTurn = spin("wheel", (p) => p.wheel);
  const letters = Array.from({ length: 24 }, (_, i) => {
    const a = (i / 24) * Math.PI * 2;
    return pathOf([
      [Math.cos(a) * (WHEEL_R - 1.6), Math.sin(a) * (WHEEL_R - 1.6)],
      [Math.cos(a) * (WHEEL_R - 0.4), Math.sin(a) * (WHEEL_R - 0.4)],
    ]);
  }).join("");
  f.add(f.inPlane(f.topPlane(WHEEL, TAPE_Z1), L(letters, { tone: "mid" }) + L(radialD(0, 0, 1.6, WHEEL_R - 2.4, 6, 0.2) + circleD(0, 0, WHEEL_R - 2.4, 36), { tone: "lo" }) + L(pathOf([[0, 0], [0, -(WHEEL_R - 2.4)]]), { tone: "hi" }), wheelTurn));
  f.add(S(k.cylinder(WHEEL[0], WHEEL[1], 1, TAPE_Z1, 34 - TAPE_Z1, P, 12), { tone: "hi", crease: "none" }));
  f.add(S(k.cylinder(PILLARS[1]![0], PILLARS[1]![1], 1.8, TOP, 34 - TOP, P, 18), { tone: "mid", crease: "none" }));
  const BRIDGE: Plan = { x: -12, y: -9.5, w: 24, d: 7, r: 3.4 };
  f.add(S(k.slabOf(BRIDGE, 34, 2.4, P, 6, 0.5), { tone: "mid" }));
  f.add(screwsOnTop(P, PILLARS, 36.4, 1));
  f.add(S(k.cylinder(WHEEL[0], WHEEL[1] , 3.6, 36.4, 1, P, 32), { tone: "mid" }));
  const star = Array.from({ length: 12 }, (_, i) => {
    const a0 = (i / 12) * Math.PI * 2;
    const a1 = ((i + 0.5) / 12) * Math.PI * 2;
    return [
      [Math.cos(a0) * 3.4, Math.sin(a0) * 3.4],
      [Math.cos(a1) * 2.2, Math.sin(a1) * 2.2],
    ] as Flat[];
  }).flat();
  f.add(f.inPlane(f.topPlane(WHEEL, 37.4), L(pathOf(star, true), { tone: "hi" }) + L(circleD(0, 0, 0.8, 12), { tone: "mid" }), wheelTurn));

  for (const [x, y] of POSTS) {
    f.add(S(k.cylinder(x, y, 1.2, TOP, TAPE_Z1 + 1.5 - TOP, P, 14), { tone: "mid", crease: "none" }));
    f.add(S(k.cylinder(x, y, 2, TAPE_Z1 + 1.5, 0.8, P, 18), { tone: "mid" }));
  }
  f.add(ribbon(inLeft, [POSTS[1]![0], TAPE_Y + 0.2]));
  const FACE_Y = TAPE_Y + 0.25;
  const plane = f.sidePlane([0, FACE_Y], TAPE_Z1, "left");
  f.defs.push(`<clipPath id="ticker-out"><path d="M2.6 0H${POSTS[1]![0] - 1.2}V6H2.6Z"/></clipPath>`);
  const marks = Array.from({ length: LINE.length * 3 }, (_, i) => {
    const h = LINE[i % LINE.length]!;
    if (!h) return "";
    const u = -PITCH * (i % LINE.length) + PITCH * LINE.length * Math.floor(i / LINE.length);
    return pathOf([
      [u, 3 - h / 2 + 0.2],
      [u, 3 + h / 2 - 0.2],
    ]);
  }).join("");
  const feed = f.trackOf(
    "tape",
    poses.map((p) => ({ t: p.t, v: [p.tape] })),
    ([u]) => `transform:translate(${u!.toFixed(2)}px,0)`,
    { tolerance: 0.03 },
  );
  f.add(`<g transform="${plane}"><g clip-path="url(#ticker-out)"><g ${feed}>${L(marks, { tone: "hi" })}</g></g></g>`);

  for (const x of [-3.6, 3.6]) {
    f.add(S(k.cylinder(x, 15, 2.6, TOP, 12, P, 24), { tone: "mid", inner: L([2, 4, 6, 8, 10].map((dz) => k.sideArc(x, 15, 2.6, TOP + dz, P, 16)).join(""), { tone: "lo" }) }));
  }
  const PIVOT: Flat = [0, 21];
  f.add(S(k.slabOf({ x: -2, y: PIVOT[1] - 1.5, w: 4, d: 3, r: 0.8 }, TOP, 15, P, 2, 0.3), { tone: "mid" }));
  const strike = f.moveOf("hammer", poses.map((p) => ({ t: p.t, by: [0, -0.7 * p.strike, -0.5 * p.strike] })), { steps: false });
  const lever =
    S(k.slabOf({ x: -6.5, y: 12, w: 13, d: 6, r: 1 }, 20.6, 1.4, P, 2, 0.3), { tone: "mid" }) +
    S(k.slabOf({ x: -1.2, y: TAPE_Y + 0.6, w: 2.4, d: 12, r: 0.6 }, 22.6, 2, P, 2, 0.2), { tone: "mid" }) +
    S(k.slabOf({ x: -1.6, y: TAPE_Y + 0.5, w: 3.2, d: 2.4, r: 0.6 }, 21.6, 4.4, P, 2, 0.3), { tone: "hi", crease: "lo" });
  f.add(`<g ${strike}>${lever}</g>`);
  f.add(S(k.cylinder(PIVOT[0], PIVOT[1], 1.1, TOP + 15, 1.4, P, 12), { tone: "hi" }));

  f.add(ribbon([POSTS[1]![0] + 1, POSTS[1]![1] + 0.6], tangentFrom(TAKE, TAKE_R, POSTS[1]!, 1)));
  reel(TAKE, TAKE_R, "take", -1);

  for (const [x, y] of posts) {
    f.add(S(k.cylinder(x, y, 2.4, TOP, 1.2, P, 20), { tone: "mid" }));
    f.add(S(k.cylinder(x, y, 1.6, TOP + 1.2, 3.4, P, 18), { tone: "mid" }));
    f.add(L(k.knurl(x, y, 1.6, TOP + 1.2, TOP + 4.6, 14, P, 0.3), { tone: "lo" }));
  }
  const lead = (from: Flat, to: V3) => L(pathOf([at([from[0], from[1], TOP + 2]), at([from[0] + 4, from[1] - 4, TOP + 0.4]), at([to[0] - 2, to[1] + 2, TOP + 0.4]), at(to)]), { tone: "mid" });
  f.add(lead(posts[0]!, [-5.6, 17, TOP + 2]), lead(posts[1]!, [-1.4, 17.6, TOP + 2]));
  f.add(D(posts.map(([x, y]) => at([x, y, TOP + 4.6])), { size: 0.5, tone: "hi" }));
  knob(f, [24, 28], TOP, 3, 2.6);

  return f.build({
    width,
    height,
    label:
      "A ticker-tape printer on a round plinth. Tape runs from a supply reel past a typewheel to a take-up reel. For each character the wheel turns, a hammer presses the tape against it and the tape steps on, so a printed line walks toward the take-up reel.",
  });
}
