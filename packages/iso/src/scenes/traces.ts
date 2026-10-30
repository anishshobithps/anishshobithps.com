import { FACE_FILL } from "../classes";
import { Figure, type Flat, k, pathOf, type Plan, type Projection, type Scene, smoothstep, type V3 } from "../figure";
import {
  alongY,
  alongZ,
  arc,
  basePlate,
  circleD,
  D,
  disc,
  face,
  knurlOn,
  L,
  S,
  screwsOnTop,
  turned,
} from "../parts";

const CARD = { w: 34, d: 22 };
const THICK = 0.4;
const FEED_Z = 4.5;
const IN_X = -56;
const OUT_X = 56;
const DRUM_X = 0;
const DRUM_R = 6;
const DRUM_Z = FEED_Z + THICK + DRUM_R;
const STACK = 9;
const PERIOD = 6;

interface Pose {
  t: number;
  x: number;
  hopper: number;
  tray: number;
  phase: string;
}

function planCard(): Pose[] {
  const poses: Pose[] = [];
  const travel = (t0: number, t1: number, x0: number, x1: number, phase: string, steps = 16) => {
    for (let i = 1; i <= steps; i++) {
      const u = i / steps;
      poses.push({ t: t0 + (t1 - t0) * u, x: x0 + (x1 - x0) * smoothstep(u), hopper: 0, tray: 0, phase });
    }
  };
  poses.push({ t: 0, x: IN_X, hopper: 0, tray: 0, phase: "Ready" });
  poses.push({ t: 0.6, x: IN_X, hopper: 0, tray: 0, phase: "Ready" });
  travel(0.6, 4, IN_X, OUT_X, "Postmarking", 24);
  for (const p of poses) {
    if (p.t > 0.6 && p.x < DRUM_X - CARD.w / 2) p.phase = "Feeding";
    else if (p.t > 0.6 && p.x > DRUM_X + CARD.w / 2) p.phase = "Filed";
  }
  const left = poses.find((p) => p.x > IN_X + CARD.w)?.t ?? 1.6;
  for (const p of poses) {
    p.hopper = smoothstep(Math.min(1, Math.max(0, (p.t - left) / 0.4))) * THICK;
    p.tray = smoothstep(Math.min(1, Math.max(0, (p.t - 4) / 0.4))) * THICK;
  }
  poses.push({ t: 4.4, x: OUT_X, hopper: THICK, tray: THICK, phase: "Filed" });
  poses.push({ t: PERIOD, x: OUT_X, hopper: THICK, tray: THICK, phase: "Filed" });
  return poses;
}

export function tracesScene(width = 400, height = 225): Scene {
  const PLATE: Plan = { x: -84, y: -30, w: 168, d: 60, r: 6 };
  const P = k.fitProjection([...k.boxCorners(PLATE, -10, 0), [DRUM_X, -16, 26], [DRUM_X, 22, 18]], width, height, { pad: 22, azimuth: 56 }) as Projection;
  const f = new Figure("post", P, PERIOD);
  const at = (p: V3) => f.at(p);
  const poses = planCard();

  basePlate(f, PLATE, 0, 6, { feet: 3, foot: 3.6 });

  const BOTTLE = alongZ([70, -22, 0]);
  f.add(S(turned(P, BOTTLE, [[0, 4], [7, 4], [8.4, 2.6], [10, 2.6]]), { tone: "mid", crease: "lo", inner: L(arc(P, BOTTLE, 3.5, 4), { tone: "lit" }) }));
  f.add(S(turned(P, BOTTLE, [[10, 2.9], [13, 2.9]]), { tone: "mid", crease: "lo" }));
  f.add(knurlOn(P, BOTTLE, 10, 13, 2.9, 16));


  const cardFace = (marked: boolean) => {
    const lines = [0, 1, 2]
      .map((i) => pathOf([[3, 9 + i * 3.4], [3 + [17, 13, 15][i]!, 9 + i * 3.4]]))
      .join("");
    const stamp = `M${CARD.w - 9.5} 2.6h6.4v8h-6.4z`;
    const mark = marked
      ? `<g>${L(circleD(CARD.w - 11.4, 9.4, 4.2, 28), { tone: "lit" })}${L(
          [0, 1, 2, 3].map((i) => pathOf(Array.from({ length: 13 }, (_, j) => [CARD.w - 22 + j * 1.5, 4.6 + i * 2.6 + Math.sin(j * 0.9) * 0.8] as Flat))).join(""),
          { tone: "lit" },
        )}${L(pathOf([[CARD.w - 11.4, 6.6], [CARD.w - 9.7, 11.6], [CARD.w - 13.1, 11.6], [CARD.w - 11.4, 6.6]], true), { tone: "lit" })}</g>`
      : "";
    return L(lines, { tone: "lo" }) + face(stamp, "2", "lo") + L(`M${CARD.w - 8.7} 3.4h4.8v6.4h-4.8z`, { tone: "faint" }) + mark;
  };
  const card = (cx: number, z: number, marked: boolean) => {
    const plan: Plan = { x: cx - CARD.w / 2, y: -CARD.d / 2, w: CARD.w, d: CARD.d, r: 0.8 };
    return S(k.slabOf(plan, z, THICK, P, 2), { tone: "lo", crease: "none", card: true }) + `<g transform="${f.topPlane([cx - CARD.w / 2, -CARD.d / 2], z + THICK)}">${cardFace(marked)}</g>`;
  };

  const tray = (cx: number, opens: "right" | "left", cards: string) => {
    const inner: Plan = { x: cx - CARD.w / 2 - 1, y: -CARD.d / 2 - 1, w: CARD.w + 2, d: CARD.d + 2, r: 1 };
    const wall = (plan: Plan) => S(k.slabOf(plan, 0, 6.5, P, 2, 0.3), { tone: "mid" });
    f.add(wall({ x: inner.x - 1.6, y: inner.y - 1.6, w: inner.w + 3.2, d: 1.6, r: 0.5 }));
    if (opens === "right") f.add(wall({ x: inner.x - 1.6, y: inner.y, w: 1.6, d: inner.d, r: 0.4 }));
    f.add(cards);
    if (opens === "left") f.add(wall({ x: inner.x + inner.w, y: inner.y, w: 1.6, d: inner.d, r: 0.4 }));
    f.add(wall({ x: inner.x - 1.6, y: inner.y + inner.d, w: inner.w + 3.2, d: 1.6, r: 0.5 }));
    f.add(D([at([inner.x + 2, inner.y + inner.d + 0.8, 6.5]), at([inner.x + inner.w - 2, inner.y + inner.d + 0.8, 6.5])], { size: 0.4 }));
  };

  const hopper = f.moveOf("hopper", poses.map((p) => ({ t: p.t, by: [0, 0, p.hopper] })));
  const inStack = Array.from({ length: STACK }, (_, i) => card(IN_X, FEED_Z - (STACK - i) * THICK, false)).join("");
  tray(IN_X, "right", `<g class="${hopper}">${inStack}</g>`);

  const sink = f.moveOf("tray", poses.map((p) => ({ t: p.t, by: [0, 0, -p.tray] })));
  const outStack = Array.from({ length: STACK }, (_, i) => card(OUT_X, FEED_Z - (STACK - i) * THICK, true)).join("");
  tray(OUT_X, "left", `<g class="${sink}">${outStack}</g>`);

  const FEED_ROLL = alongY([IN_X + CARD.w / 2 + 4, 0, FEED_Z + THICK + 2.4]);
  const rollPost = (y: number) => S(k.slabOf({ x: FEED_ROLL.o[0] - 1.6, y, w: 3.2, d: 2.4, r: 0.6 }, 0, FEED_ROLL.o[2] + 2.2, P, 2, 0.3), { tone: "mid" });
  f.add(rollPost(-CARD.d / 2 - 4));
  f.add(S(k.slabOf({ x: DRUM_X - 7, y: -12, w: 14, d: 24, r: 1 }, 0, FEED_Z, P, 2, 0.4), { tone: "mid" }));
  f.add(S(k.slabOf({ x: DRUM_X - 9, y: -16, w: 18, d: 3, r: 1 }, 0, DRUM_Z + 9, P, 3, 0.5), { tone: "mid" }));

  const travel = f.moveOf("card", poses.map((p) => ({ t: p.t, by: [p.x - IN_X, 0, 0] })));
  const clipOut = k.onTop(
    [
      [DRUM_X, -20],
      [DRUM_X + 120, -20],
      [DRUM_X + 120, 20],
      [DRUM_X, 20],
    ],
    FEED_Z + THICK,
    P,
    true,
  );
  f.defs.push(`<clipPath id="post-printed"><path d="${clipOut}"/></clipPath>`);
  f.add(`<g class="${travel}">${card(IN_X, FEED_Z, false)}</g><g clip-path="url(#post-printed)"><g class="${travel}">${card(IN_X, FEED_Z, true)}</g></g>`);

  f.add(S(disc(P, FEED_ROLL, -CARD.d / 2 - 1.6, CARD.d / 2 + 1.6, 2.4), { tone: "mid", crease: "lo" }));
  f.add(rollPost(CARD.d / 2 + 1.6));
  const INK = alongY([DRUM_X - 6.2, 0, DRUM_Z + 5.6]);
  f.add(S(disc(P, INK, -13, 13, 0.8), { tone: "mid" }));
  f.add(S(disc(P, INK, -11, 11, 2.6), { tone: "lo", crease: "lo", inner: L(arc(P, INK, 0, 2.6), { tone: "lit" }) }));
  const DRUM = alongY([DRUM_X, 0, DRUM_Z]);
  f.add(S(disc(P, DRUM, -13, 13, 1.4), { tone: "mid" }));
  f.add(S(disc(P, DRUM, -11, 11, DRUM_R), { tone: "hi", crease: "lo", inner: L([-6, 0, 6].map((at) => arc(P, DRUM, at, DRUM_R)).join(""), { tone: "faint" }) }));
  const drumTurn = f.spinOf(
    "drum",
    poses.map((p) => ({ t: p.t, angle: (p.x - IN_X) / DRUM_R })),
    { tolerance: 0.5 },
  );
  const onDrumFace = (y: number, content: string) => f.inPlane(f.sidePlane([DRUM_X, y], DRUM_Z, "left"), content, drumTurn);
  f.add(onDrumFace(11, L(circleD(0, 0, 3.8, 24) + pathOf([[0, 0], [0, -5.2]]), { tone: "lo" })));

  f.add(S(k.slabOf({ x: DRUM_X - 9, y: 13, w: 18, d: 3, r: 1 }, 0, DRUM_Z + 9, P, 3, 0.5), { tone: "mid" }));
  f.add(S(k.slabOf({ x: DRUM_X - 2.5, y: -16, w: 5, d: 32, r: 1 }, DRUM_Z + 9, 2, P, 2, 0.4), { tone: "mid" }));
  f.add(screwsOnTop(P, [[DRUM_X, -14.5], [DRUM_X, 14.5]], DRUM_Z + 11, 0.7));
  f.add(S(disc(P, alongY([DRUM_X, 16, DRUM_Z]), 0, 1.8, 3), { tone: "mid" }));
  const crank =
    `<path class="stroke-none ${FACE_FILL["2"]}" d="M-1.4 0a1.4 1.4 0 0 1 2.8 0v-9a1.4 1.4 0 0 1-2.8 0z"/>` +
    L("M-1.4 0a1.4 1.4 0 0 1 2.8 0v-9a1.4 1.4 0 0 1-2.8 0z", { tone: "mid" }) +
    `<path class="stroke-none ${FACE_FILL.top}" d="${circleD(0, -9, 1.7, 16)}"/>` +
    L(circleD(0, -9, 1.7, 16), { tone: "hi" });
  f.add(onDrumFace(17.8, crank));
  f.add(D([at([DRUM_X, 17.8, DRUM_Z])], { size: 0.6, tone: "hi" }));

  return f.build({
    width,
    height,
    label:
      "A hand-cranked postmark machine on a base plate. A spring-loaded hopper offers a postcard to the feed roller, the card runs under an inked drum that prints a green postmark, and it lands on the output stack.",
  });
}
