import { Figure, type Flat, k, pathOf, type Plan, type Projection, type Scene, smoothstep, type V3 } from "../figure";
import {
  alongX,
  alongZ,
  arc,
  basePlate,
  circleD,
  D,
  disc,
  face,
  G,
  L,
  labelPlate,
  S,
  screwsOnTop,
  turned,
} from "../parts";
import * as T from "../tube";

const SX = -64;
const RX = 64;
const CAB_TOP = 30;
const RUN_Z = 58;
const TUBE_R = 3;
const TRAY_Z = 16;
const TRAY_Y = 17;
const HATCH_Y = 12;
const GLASS = [-26, 26];
const PERIOD = 10;

interface Pose {
  t: number;
  at: V3;
  shown: number;
  pressure: number;
  lever: [number, number];
  lamp: [number, number];
  phase: string;
}

function planTrip(): Pose[] {
  const poses: Pose[] = [];
  const add = (t: number, at: V3, change: Partial<Pose> = {}) => {
    const prev = poses.at(-1);
    const base: Omit<Pose, "t" | "at"> = { shown: 1, pressure: 0, lever: [0, 0], lamp: [0, 0], phase: "Ready" };
    poses.push({ ...base, ...prev, ...change, t, at });
  };
  const leg = (from: number, dir: 1 | -1) => {
    const [a, b] = dir > 0 ? [SX, RX] : [RX, SX];
    const send = dir > 0 ? 0 : 1;
    const name = dir > 0 ? "Sending hello" : "Sending reply";
    const t0 = from;
    const lever = (v: number): [number, number] => (send === 0 ? [v, 0] : [0, v]);
    add(t0, [a, TRAY_Y, TRAY_Z], { shown: 1, pressure: 0, lever: lever(0), lamp: [0, 0], phase: name });
    add(t0 + 0.3, [a, TRAY_Y, TRAY_Z], { lever: lever(1) });
    for (let i = 1; i <= 4; i++) add(t0 + 0.3 + 0.1 * i, [a, TRAY_Y - (TRAY_Y - HATCH_Y + 4) * smoothstep(i / 4), TRAY_Z], { shown: 1 - smoothstep(i / 4), pressure: 0.4 * (i / 4) });
    add(t0 + 0.8, [dir * -46, 0, RUN_Z], { shown: 0, pressure: 0.8, lever: lever(0) });
    add(t0 + 0.81, [dir * -46, 0, RUN_Z], { shown: 1 });
    for (let i = 1; i <= 12; i++) add(t0 + 0.81 + 0.9 * (i / 12), [dir * -46 + dir * 92 * smoothstep(i / 12), 0, RUN_Z], { pressure: 0.8 + 0.2 * Math.sin((i / 12) * Math.PI) });
    add(t0 + 1.72, [dir * 46, 0, RUN_Z], { shown: 0 });
    add(t0 + 2.3, [b, HATCH_Y - 4, TRAY_Z], { shown: 0, pressure: 0.3 });
    for (let i = 1; i <= 4; i++) add(t0 + 2.3 + 0.12 * i, [b, HATCH_Y - 4 + (TRAY_Y - HATCH_Y + 4) * smoothstep(i / 4), TRAY_Z], { shown: smoothstep(i / 4), pressure: 0.3 * (1 - i / 4), lamp: send === 0 ? [0, 1] : [1, 0] });
    add(t0 + 2.9, [b, TRAY_Y, TRAY_Z], { phase: dir > 0 ? "Delivered" : "Reply delivered" });
  };
  add(0, [SX, TRAY_Y, TRAY_Z], { phase: "Ready" });
  leg(0.6, 1);
  add(5.2, [RX, TRAY_Y, TRAY_Z], { lamp: [0, 0], phase: "Delivered" });
  leg(5.6, -1);
  add(PERIOD, [SX, TRAY_Y, TRAY_Z], { lamp: [0, 0], phase: "Reply delivered" });
  poses[0]!.phase = "Reply delivered";
  return poses;
}

export function contactScene(width = 400, height = 300): Scene {
  const PLATE: Plan = { x: -92, y: -34, w: 184, d: 66, r: 6 };
  const P = k.fitProjection([...k.boxCorners(PLATE, -10, 0), [SX, 0, RUN_Z + 6], [RX, 0, RUN_Z + 6]], width, height, { pad: 26, azimuth: 58 }) as Projection;
  const f = new Figure("tube", P, PERIOD);
  const at = (p: V3) => f.at(p);
  const poses = planTrip();

  basePlate(f, PLATE, 0, 7);
  labelPlate(f, { x: -16, y: 18, w: 32, d: 12, r: 1.5 }, 0);

  const BLOWER: Plan = { x: -22, y: -28, w: 30, d: 16, r: 2 };
  f.add(S(k.slabOf(BLOWER, 0, 20, P, 4, 0.6), { tone: "mid", inner: L(k.sideSeam(BLOWER, 4, P, 4), { tone: "faint" }) }));
  f.add(screwsOnTop(P, k.corners(BLOWER, 2.6) as Flat[], 20, 0.8));
  const fan = f.sidePlane([-14, BLOWER.y + BLOWER.d], 12, "left");
  f.add(f.inPlane(fan, face(circleD(0, 0, 6, 32), "1", "mid") + L(Array.from({ length: 7 }, (_, i) => pathOf([[-5 + i * 1.65, -Math.sqrt(Math.max(0, 25 - (-5 + i * 1.65) ** 2)) + 0.4], [-5 + i * 1.65, Math.sqrt(Math.max(0, 25 - (-5 + i * 1.65) ** 2)) - 0.4]])).join(""), { tone: "lo" })));
  const gaugeAt: Flat = [1, BLOWER.y + BLOWER.d];
  const gaugeFace = f.sidePlane(gaugeAt, 13, "left");
  const ticks = Array.from({ length: 11 }, (_, i) => {
    const a = Math.PI * (0.75 + (i / 10) * 1.5);
    const r0 = i % 5 === 0 ? 2.8 : 3.4;
    return pathOf([[Math.cos(a) * r0, Math.sin(a) * r0], [Math.cos(a) * 4.2, Math.sin(a) * 4.2]]);
  }).join("");
  f.add(f.inPlane(gaugeFace, face(circleD(0, 0, 5.2, 36), "top", "hi") + L(circleD(0, 0, 4.6, 36), { tone: "lo" }) + L(ticks, { tone: "mid" })));
  const needle = f.spinOf("gauge", poses.map((p) => ({ t: p.t, angle: Math.PI * 1.5 * p.pressure })), { tolerance: 1 });
  f.add(f.inPlane(gaugeFace, `<g transform="rotate(135)"><g class="${needle}">${L(pathOf([[-0.8, 0], [4, 0]]), { tone: "lit" })}</g></g>` + `<circle class="iso-face" data-fill="2" r="0.7"/>`));
  f.add(S(k.cylinder(-7, -20, 2.6, 20, 1.2, P, 18), { tone: "mid" }));
  f.add(T.tubePieces(G.fillet([[-7, -20, 21.2], [-7, -20, 25], [-44, -20, 25], [-44, -4, 25], [SX + 12 + 1.2, -4, 25]] as V3[], 4, 7) as V3[], 1.4, P, { maxLength: 400 }).map((piece) => T.tubeSvg(piece, { tone: "mid" })).join(""));
  const station = (cx: number, index: 0 | 1) => {
    const CAB: Plan = { x: cx - 12, y: -12, w: 24, d: 26, r: 2 };
    f.add(S(k.slabOf(CAB, 0, CAB_TOP, P, 4, 0.6), { tone: "mid", inner: L(k.sideSeam(CAB, CAB_TOP - 4, P, 4) + k.sideSeam(CAB, 4, P, 4), { tone: "faint" }) }));
    f.add(screwsOnTop(P, k.corners(CAB, 2.6) as Flat[], CAB_TOP, 0.8));
    const front = f.sidePlane([cx, CAB.y + CAB.d], TRAY_Z + 5, "left");
    f.add(f.inPlane(front, face(`M-7 -2h14v7h-14z`, "0", "mid") + L(`M-6 -1h12`, { tone: "lo" })));
    f.add(S(k.slabOf({ x: cx - 8, y: CAB.y + CAB.d, w: 16, d: 7, r: 1 }, TRAY_Z - 3.4, 1.2, P, 2, 0.3), { tone: "mid" }));
    for (const x of [cx - 8, cx + 6.6]) f.add(S(k.slabOf({ x, y: CAB.y + CAB.d, w: 1.4, d: 7, r: 0.4 }, TRAY_Z - 2.2, 2.4, P, 2), { tone: "mid" }));
    const lampAt: Flat = [cx + 7, CAB.y + CAB.d - 5];
    f.add(S(k.cylinder(lampAt[0], lampAt[1], 2.4, CAB_TOP, 1.4, P, 20), { tone: "mid" }));
    f.add(S(turned(P, alongZ([lampAt[0], lampAt[1], CAB_TOP + 1.4]), [[0, 1.8], [2, 1.8, 1], [3, 1.2, 1], [3.5, 0, 1]]), { tone: "hi", crease: "lo", lit: false }));
    const lit = f.switchOf(`lamp${index}`, poses.map((p) => ({ t: p.t, on: p.lamp[index] })));
    f.add(`<g class="${lit}" opacity="0">${S(turned(P, alongZ([lampAt[0], lampAt[1], CAB_TOP + 1.4]), [[0, 1.8], [2, 1.8, 1], [3, 1.2, 1], [3.5, 0, 1]]), { tone: "hi", lit: true })}</g>`);
    const side = f.sidePlane([CAB.x + CAB.w, CAB.y + 8], TRAY_Z + 8, "right");
    const lever = f.spinOf(`lever${index}`, poses.map((p) => ({ t: p.t, angle: -0.7 * p.lever[index] })), { tolerance: 1 });
    f.add(f.inPlane(side, face(circleD(0, 0, 2.2, 18), "2", "mid")));
    f.add(f.inPlane(side, face(`M-1.1 0v-10.5a1.1 1.1 0 0 1 2.2 0v10.5z`, "2", "mid") + face(circleD(0, -11.6, 2.2, 20), "top", "hi") + face(circleD(0, 0, 1.3, 14), "top", "mid"), lever));
    if (index === 0) {
      f.add(S(disc(P, alongX([CAB.x + CAB.w, -4, 25]), 0, 1.2, 2.6), { tone: "mid" }));
      f.add(D([0, 1, 2, 3].map((i) => at(G.pointOf(alongX([CAB.x + CAB.w + 1.2, -4, 25]), 0, 1.9, i * 1.57 + 0.78) as V3)), { size: 0.35 }));
    }
    f.add(S(k.cylinder(cx, 0, TUBE_R + 1.6, CAB_TOP, 1.4, P, 32, 0.3), { tone: "mid" }));
    f.add(D([0, 1, 2, 3].map((i) => at([cx + Math.cos(i * 1.57 + 0.78) * (TUBE_R + 0.9), Math.sin(i * 1.57 + 0.78) * (TUBE_R + 0.9), CAB_TOP + 1.4])), { size: 0.4 }));
  };
  station(SX, 0);
  station(RX, 1);

  for (const x of [-40, 40]) {
    f.add(S(k.cylinder(x, 0, 2.6, 0, 1.4, P, 20), { tone: "mid" }));
    f.add(S(k.cylinder(x, 0, 1.2, 1.4, RUN_Z - TUBE_R - 1.4 - 1.2, P, 14), { tone: "mid", crease: "none" }));
  }

  const CAP = alongX([0, 0, 0]);
  const capsule =
    S(turned(P, CAP, [[-6, 1.2, 1], [-5.5, 2.1, 1], [-4.6, 2.4], [4.6, 2.4], [5.5, 2.1, 1], [6, 1.2, 1]]), { tone: "hi", crease: "lo", inner: L(arc(P, CAP, -2.6, 2.4) + arc(P, CAP, 2.6, 2.4), { tone: "lit" }) });
  const ride = f.moveOf("capsule", poses.map((p) => ({ t: p.t, by: p.at })));
  const fade = f.trackOf("capsule-fade", poses.map((p) => ({ t: p.t, v: [p.shown] })), ([o]) => `opacity:${o!.toFixed(2)}`, { tolerance: 0.01 });
  f.add(`<g class="${fade}"><g class="${ride}" transform="${f.translate([SX, TRAY_Y, TRAY_Z])}">${capsule}</g></g>`);

  const route = (pts: V3[]) => G.fillet(pts, TUBE_R * 3, 9) as V3[];
  const opaque = (pts: V3[]) => T.tubePieces(route(pts), TUBE_R, P, { maxLength: 400 }).map((piece) => T.tubeSvg(piece, { tone: "mid" })).join("");
  f.add(opaque([[SX, 0, CAB_TOP + 1.4], [SX, 0, RUN_Z], [GLASS[0]!, 0, RUN_Z]]));
  const glassPieces = T.tubePieces([[GLASS[0]!, 0, RUN_Z], [GLASS[1]!, 0, RUN_Z]], TUBE_R, P, { maxLength: 400, caps: false }) as Array<{ body: string; edges: string }>;
  f.add(glassPieces.map((g) => `<path class="iso-glass" d="${g.body}"/>${L(g.edges, { tone: "mid" })}`).join(""));
  const glassRun = alongX([0, 0, RUN_Z]);
  f.add(L([-14, 0, 14].map((s) => arc(P, glassRun, s, TUBE_R)).join(""), { tone: "faint" }));
  f.add(opaque([[GLASS[1]!, 0, RUN_Z], [RX, 0, RUN_Z], [RX, 0, CAB_TOP + 1.4]]));
  for (const x of GLASS) f.add(S(disc(P, alongX([x!, 0, RUN_Z]), -1.6, 1.6, TUBE_R + 0.8), { tone: "mid", crease: "lo" }));
  for (const x of [-40, 40]) f.add(S(disc(P, alongX([x, 0, RUN_Z]), -1.4, 1.4, TUBE_R + 0.7), { tone: "mid" }));
  for (const x of [SX, RX]) f.add(S(disc(P, alongZ([x, 0, 44]), -1.2, 1.2, TUBE_R + 0.7), { tone: "mid" }));

  return f.build({
    width,
    height,
    label:
      "Two pneumatic tube stations joined by an overhead tube with a glass section. A capsule leaves the left station, crosses through the glass and lands on the right station's tray, then the reply makes the same trip back while the blower's gauge reads the pressure.",
  });
}
