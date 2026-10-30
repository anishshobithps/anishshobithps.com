import { FACE_FILL, FACE_TEXT, GLASS_FILL } from "../classes";
import { Figure, type Flat, k, pathOf, type Plan, type Projection, type Scene, smoothstep, type V3 } from "../figure";
import { cable, D, face, G, L, S, screwsOnTop } from "../parts";

const LOW_TOP = 34;
const PLAY_TOP = 84;
const RAIL_Z = 73;
const HOME: Flat = [-17, 15];
const TARGET: Flat = [9, -5];
const REST_DROP = 8;
const DEEP_DROP = 24;
const PERIOD = 8.5;

interface Pose {
  t: number;
  x: number;
  y: number;
  drop: number;
  open: number;
  phase: string;
}

function planGrab(): Pose[] {
  const poses: Pose[] = [];
  const add = (t: number, change: Partial<Omit<Pose, "t">>) => poses.push({ ...(poses.at(-1) ?? { x: HOME[0], y: HOME[1], drop: REST_DROP, open: 0, phase: "Insert coin" }), ...change, t });
  const ease = (t0: number, t1: number, to: Partial<Omit<Pose, "t" | "phase">>, phase: string, steps = 10) => {
    const from = poses.at(-1)!;
    for (let i = 1; i <= steps; i++) {
      const e = smoothstep(i / steps);
      const mix = (key: "x" | "y" | "drop" | "open") => from[key] + ((to[key] ?? from[key]) - from[key]) * e;
      add(t0 + ((t1 - t0) * i) / steps, { x: mix("x"), y: mix("y"), drop: mix("drop"), open: mix("open"), phase });
    }
  };
  add(0, {});
  add(0.5, {});
  ease(0.5, 0.8, { open: 1 }, "Aiming", 3);
  ease(0.8, 2.2, { x: TARGET[0], y: TARGET[1] }, "Aiming", 12);
  add(2.5, {});
  ease(2.5, 3.6, { drop: DEEP_DROP }, "Dropping");
  ease(3.7, 4.05, { open: 0 }, "Grabbing", 4);
  ease(4.2, 5.2, { drop: REST_DROP }, "Got nothing");
  ease(5.3, 6.6, { x: HOME[0], y: HOME[1] }, "Got nothing", 12);
  ease(6.7, 7, { open: 1 }, "Prize not found", 3);
  ease(7.4, 7.7, { open: 0 }, "Prize not found", 3);
  add(PERIOD, { phase: "Prize not found" });
  poses[0]!.phase = "Prize not found";
  return poses;
}

export function notFoundScene(width = 400, height = 300): Scene {
  const CAB: Plan = { x: -27, y: -23, w: 54, d: 46, r: 2 };
  const FLOOR: Plan = { x: -44, y: -36, w: 88, d: 80, r: 4 };
  const P = k.fitProjection([...k.boxCorners(FLOOR, -2, 0), ...k.boxCorners(CAB, 0, 98)], width, height, { pad: 22, azimuth: 50 }) as Projection;
  const f = new Figure("claw", P, PERIOD);
  const at = (p: V3) => f.at(p);
  const poses = planGrab();

  f.add(f.halo(FLOOR, -2, 6));
  f.add(S(k.slabOf(FLOOR, -2, 2, P, 3, 0.4), { tone: "lo", inner: L(k.lineOnTop([0, FLOOR.y], [0, FLOOR.y + FLOOR.d], 0, P) + k.lineOnTop([FLOOR.x, 4], [FLOOR.x + FLOOR.w, 4], 0, P), { tone: "faint" }) }));
  const LOW = k.insetPlan(CAB, 1);
  f.add(S(k.slabOf(LOW, 0, LOW_TOP, P, 2, 0.5), { tone: "mid", inner: L(k.sideSeam(LOW, 4, P, 2), { tone: "faint" }) }));
  const door = f.sidePlane([LOW.x + 6, LOW.y + LOW.d], 24, "left");
  f.add(f.inPlane(door, face("M0 0h18v18h-18z", "1", "mid") + face("M7 4h4v6h-4z", "0", "lo") + L("M8.2 5v4M9.8 5v4", { tone: "lo" }) + D([[2, 2], [16, 2], [2, 16], [16, 16]], { size: 0.4 }) + face("M6 13h6v2h-6z", "lit", "lit")));
  const side = f.sidePlane([LOW.x + LOW.w, 10], 26, "right");
  f.add(f.inPlane(side, L(Array.from({ length: 6 }, (_, i) => `M${4 + i * 3.2} 0v12`).join(""), { tone: "lo" }) + L("M2.4 -1.2h17.6v14.4h-17.6z", { tone: "faint" })));

  const LEDGE: Plan = { x: -20, y: LOW.y + LOW.d, w: 40, d: 9, r: 1.5 };
  f.add(S(k.slabOf(LEDGE, LOW_TOP - 8, 4, P, 2, 0.5), { tone: "mid" }));
  f.add(screwsOnTop(P, [[-17, LEDGE.y + 4.5], [17, LEDGE.y + 4.5]], LOW_TOP - 4, 0.7));
  const stick: Flat = [-8, LEDGE.y + 4.5];
  const lean = f.moveOf("stick", poses.map((p, i) => {
    const prev = poses[i - 1] ?? p;
    const dx = Math.sign(p.x - prev.x) * 0.9;
    const dy = Math.sign(p.y - prev.y) * 0.9;
    return { t: p.t, by: [dx, dy, 0] };
  }));
  f.add(S(k.cylinder(stick[0], stick[1], 2.4, LOW_TOP - 4, 0.8, P, 18), { tone: "mid" }));
  f.add(`<g ${lean}>${L(pathOf([at([stick[0], stick[1], LOW_TOP - 3.2]), at([stick[0], stick[1], LOW_TOP + 3])]), { tone: "hi" })}${S(G.sphereOf([stick[0], stick[1], LOW_TOP + 4.6], 2, P), { tone: "hi", lit: true })}</g>`);
  const btn: Flat = [7, LEDGE.y + 4.5];
  f.add(S(k.cylinder(btn[0], btn[1], 2.8, LOW_TOP - 4, 1, P, 20), { tone: "mid" }));
  const press = f.switchOf("button", poses.map((p) => ({ t: p.t, on: p.drop > REST_DROP + 0.5 && p.drop < DEEP_DROP - 0.5 && p.open > 0.5 })));
  f.add(S(k.cylinder(btn[0], btn[1], 2, LOW_TOP - 3, 1.2, P, 18), { tone: "hi", crease: "lo" }), `<g ${press} opacity="0">${S(k.cylinder(btn[0], btn[1], 2, LOW_TOP - 3, 1.2, P, 18), { tone: "hi", lit: true })}</g>`);

  const POSTS: Flat[] = [
    [CAB.x + 1.5, CAB.y + 1.5],
    [CAB.x + CAB.w - 1.5, CAB.y + 1.5],
    [CAB.x + 1.5, CAB.y + CAB.d - 1.5],
    [CAB.x + CAB.w - 1.5, CAB.y + CAB.d - 1.5],
  ];
  const post = (p: Flat) => S(k.slabOf({ x: p[0] - 1.5, y: p[1] - 1.5, w: 3, d: 3, r: 0.5 }, LOW_TOP, PLAY_TOP - LOW_TOP, P, 2, 0.3), { tone: "mid" });
  const pane = (a: Flat, b: Flat) => {
    const quad = [at([a[0], a[1], LOW_TOP]), at([b[0], b[1], LOW_TOP]), at([b[0], b[1], PLAY_TOP]), at([a[0], a[1], PLAY_TOP])];
    return `<path class="${GLASS_FILL}" d="${pathOf(quad, true)}"/>`;
  };
  f.add(post(POSTS[0]!));
  f.add(`<path class="stroke-none ${FACE_FILL["1"]}" d="${pathOf([[CAB.x, CAB.y, LOW_TOP], [CAB.x + CAB.w, CAB.y, LOW_TOP], [CAB.x + CAB.w, CAB.y, PLAY_TOP], [CAB.x, CAB.y, PLAY_TOP]].map((p) => at(p as V3)), true)}"/>`);
  f.add(pane([CAB.x + 1.5, CAB.y + 1.5], [CAB.x + 1.5, CAB.y + CAB.d - 1.5]));
  f.add(post(POSTS[1]!), post(POSTS[2]!));
  f.add(`<path class="stroke-none ${FACE_FILL.top}" d="${k.planOutline(k.insetPlan(CAB, 1.5), LOW_TOP, P, 2)}"/>`);
  const CHUTE: Plan = { x: HOME[0] - 7, y: HOME[1] - 6, w: 14, d: 12, r: 1 };
  f.add(`<path class="stroke-none ${FACE_FILL["0"]}" d="${k.planOutline(CHUTE, LOW_TOP, P, 2)}"/>`, L(k.planOutline(CHUTE, LOW_TOP, P, 2), { tone: "lo" }));
  const prizes: Array<[number, number, number, string]> = [];
  let seed = 11;
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i < 16; i++) {
    const x = -2 + rnd() * 22;
    const y = -18 + rnd() * 30;
    prizes.push([x, y, LOW_TOP + 3.2, i === 9 ? "lit" : ["hi", "mid"][i % 2]!]);
  }
  for (let i = 0; i < 6; i++) prizes.push([3 + rnd() * 14, -14 + rnd() * 20, LOW_TOP + 8.4, i === 2 ? "lit" : "hi"]);
  for (const [x, y, z, tone] of prizes.sort((a, b) => k.depthOf([a[0], a[1], a[2]], P) - k.depthOf([b[0], b[1], b[2]], P))) {
    f.add(S(G.sphereOf([x, y, z], 3.2, P), { tone: tone === "lit" ? "hi" : (tone as "hi" | "mid"), lit: tone === "lit" }));
    f.add(L(G.arcOf(G.frameAlong([x, y, z], [0, 0, 1]), 0, 3.2, P), { tone: "faint" }));
  }

  for (const x of [CAB.x + 3.5, CAB.x + CAB.w - 3.5]) f.add(S(k.slabOf({ x: x - 1, y: CAB.y + 2, w: 2, d: CAB.d - 4, r: 0.4 }, RAIL_Z, 1.6, P, 2), { tone: "mid" }));
  const claw = (open: number) => {
    const out: string[] = [];
    out.push(S(k.cylinder(0, 0, 3.2, -4, 4, P, 20, 0.3), { tone: "mid", inner: L(k.sideArc(0, 0, 3.2, -2, P, 14), { tone: "faint" }) }));
    out.push(S(G.solidOf([[0, 3.2], [2.4, 1.6]], G.frameOf([0, 0, -4], [0, 0, -1], [1, 0, 0], [0, 1, 0]), P), { tone: "mid", crease: "lo" }));
    const fingers = [0, 1, 2]
      .map((i) => {
        const a = (i / 3) * Math.PI * 2 + 0.5;
        const reach = 1.6 + open * 4.4;
        const knee: V3 = [Math.cos(a) * (2.4 + open * 2.6), Math.sin(a) * (2.4 + open * 2.6), -8];
        const tip: V3 = [Math.cos(a) * reach * 0.6, Math.sin(a) * reach * 0.6, -13];
        return cable(P, [[Math.cos(a) * 1.4, Math.sin(a) * 1.4, -5.6], knee, tip], 0.55, { bend: 1.4, tone: "hi" });
      })
      .join("");
    out.push(fingers);
    return out.join("");
  };
  const grip = (open: boolean) => f.switchOf(open ? "open" : "closed", poses.map((p) => ({ t: p.t, on: p.open > 0.5 === open })));
  const lower = f.moveOf("drop", poses.map((p) => ({ t: p.t, by: [0, 0, -p.drop] })));
  const cableLine = L(pathOf([at([0, 0, 40]), at([0, 0, 0])]), { tone: "mid" });
  const TROLLEY: Plan = { x: -4, y: -4, w: 8, d: 8, r: 1 };
  f.defs.push(`<clipPath id="claw-cable"><path d="${pathOf([at([-30, 0, RAIL_Z - 2]), at([30, 0, RAIL_Z - 2]), at([30, 0, -80]), at([-30, 0, -80])], true)}"/></clipPath>`);
  const hang =
    `<g clip-path="url(#claw-cable)"><g ${lower} transform="${f.translate([0, 0, -REST_DROP])}"><g transform="${f.translate([0, 0, RAIL_Z - 2])}">${cableLine}</g></g></g>` +
    `<g ${lower} transform="${f.translate([0, 0, -REST_DROP])}"><g transform="${f.translate([0, 0, RAIL_Z - 2])}"><g ${grip(true)} opacity="0">${claw(1)}</g><g ${grip(false)}>${claw(0)}</g></g></g>`;
  const trolley = S(k.slabOf(TROLLEY, RAIL_Z - 2, 4, P, 2, 0.3), { tone: "mid", inner: L(k.sideSeam(TROLLEY, RAIL_Z, P, 2), { tone: "faint" }) });
  const run = f.moveOf("trolley", poses.map((p) => ({ t: p.t, by: [p.x, 0, 0] })));
  const BRIDGE: Plan = { x: CAB.x + 2.5, y: -2, w: CAB.w - 5, d: 4, r: 0.6 };
  const bridge = S(k.slabOf(BRIDGE, RAIL_Z + 1.6, 2.4, P, 2, 0.3), { tone: "mid" });
  const ride = f.moveOf("bridge", poses.map((p) => ({ t: p.t, by: [0, p.y, 0] })));
  f.add(`<g ${ride} transform="${f.translate([0, HOME[1], 0])}">${bridge}<g ${run} transform="${f.translate([HOME[0], 0, 0])}">${hang}${trolley}</g></g>`);

  f.add(pane([CAB.x + 1.5, CAB.y + CAB.d - 1.5], [CAB.x + CAB.w - 1.5, CAB.y + CAB.d - 1.5]), pane([CAB.x + CAB.w - 1.5, CAB.y + 1.5], [CAB.x + CAB.w - 1.5, CAB.y + CAB.d - 1.5]));
  f.add(L(pathOf([at([-6, CAB.y + CAB.d - 1.5, 76]), at([4, CAB.y + CAB.d - 1.5, 62])]) + pathOf([at([0, CAB.y + CAB.d - 1.5, 78]), at([8, CAB.y + CAB.d - 1.5, 67])]), { tone: "faint" }));
  f.add(post(POSTS[3]!));
  const TOPBOX = k.insetPlan(CAB, -0.5);
  f.add(S(k.slabOf(TOPBOX, PLAY_TOP, 13, P, 2, 0.6), { tone: "mid", inner: L(k.sideSeam(TOPBOX, PLAY_TOP + 2.4, P, 2), { tone: "faint" }) }));
  const sign = f.sidePlane([TOPBOX.x + 6, TOPBOX.y + TOPBOX.d], PLAY_TOP + 11.4, "left");
  f.add(f.inPlane(sign, face("M0 0h43v8.4h-43z", "0", "mid") + `<text class="${FACE_TEXT.lit}" x="21.5" y="6.6" font-size="7.2" text-anchor="middle">404</text>` + D(Array.from({ length: 12 }, (_, i) => [1.8 + i * 3.6, 1.2] as Flat), { size: 0.3, tone: "hi" })));

  return f.build({
    width,
    height,
    label: "A claw machine. The claw rides its gantry over the prize pile, drops, closes on nothing, carries it back to the chute and lets it go. The marquee reads 404.",
  });
}
