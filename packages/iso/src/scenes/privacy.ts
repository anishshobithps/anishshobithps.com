import { Figure, type Flat, k, pathOf, type Plan, type Projection, type Scene, smoothstep, type V3 } from "../figure";
import { alongY, D, disc, face, L, S } from "../parts";

const COLS = 3;
const ROWS = 4;
const CELL_W = 30;
const CELL_H = 14;
const FACE_Y = 0;
const LEFT = -45;
const BOTTOM = 8;
const DEPTH = 24;
const PULL = 17;
const BOX = { col: 1, row: 1 };
const PERIOD = 9;

interface Pose {
  t: number;
  guard: number;
  yours: number;
  pull: number;
  phase: string;
}

function planVisit(): Pose[] {
  const poses: Pose[] = [];
  const add = (t: number, change: Partial<Omit<Pose, "t">> = {}) => {
    const prev = poses.at(-1) ?? { guard: 0, yours: 0, pull: 0, phase: "Locked" };
    poses.push({ ...prev, ...change, t });
  };
  const ease = (t0: number, t1: number, key: "guard" | "yours" | "pull", to: number, phase: string, steps = 10) => {
    const from = poses.at(-1)![key];
    for (let i = 1; i <= steps; i++) add(t0 + ((t1 - t0) * i) / steps, { [key]: from + (to - from) * smoothstep(i / steps), phase });
  };
  add(0);
  add(0.8);
  ease(0.8, 1.3, "guard", 1, "Guard key turned", 4);
  add(1.6);
  ease(1.6, 2.1, "yours", 1, "Your key turned", 4);
  add(2.4);
  ease(2.4, 3.6, "pull", 1, "Box 07 open");
  add(5.6);
  ease(5.6, 6.8, "pull", 0, "Closing");
  add(7);
  ease(7, 7.5, "yours", 0, "Locked", 4);
  ease(7.5, 8, "guard", 0, "Locked", 4);
  add(PERIOD);
  return poses;
}

function hull(pts: Flat[]) {
  const s = [...pts].sort((p, q) => p[0] - q[0] || p[1] - q[1]);
  const cross = (o: Flat, p: Flat, q: Flat) => (p[0] - o[0]) * (q[1] - o[1]) - (p[1] - o[1]) * (q[0] - o[0]);
  const half = (list: Flat[]) => {
    const out: Flat[] = [];
    for (const p of list) {
      while (out.length >= 2 && cross(out.at(-2)!, out.at(-1)!, p) <= 0) out.pop();
      out.push(p);
    }
    return out;
  };
  const lower = half(s);
  const upper = half([...s].reverse());
  return [...lower.slice(0, -1), ...upper.slice(0, -1)];
}

export function privacyScene(width = 400, height = 300): Scene {
  const FLOOR: Plan = { x: -60, y: -40, w: 120, d: 66, r: 3 };
  const CAB: Plan = { x: -48, y: -30, w: 96, d: 30, r: 1.5 };
  const TOP = BOTTOM + ROWS * CELL_H + 4;
  const P = k.fitProjection([...k.boxCorners(FLOOR, -3, 0), [CAB.x, CAB.y, TOP + 5], [CAB.x + CAB.w, CAB.y, TOP + 5]], width, height, { pad: 26, azimuth: 62 }) as Projection;
  const f = new Figure("vault", P, PERIOD);
  const at = (p: V3) => f.at(p);
  const poses = planVisit();

  f.add(f.halo(FLOOR, -3, 6));
  const joints =
    [-30, 0, 30].map((x) => k.lineOnTop([x, FLOOR.y], [x, FLOOR.y + FLOOR.d], 0, P)).join("") +
    [-7, 14].map((y) => k.lineOnTop([FLOOR.x, y], [FLOOR.x + FLOOR.w, y], 0, P)).join("");
  f.add(S(k.slabOf(FLOOR, -3, 3, P, 3, 0.5), { tone: "lo", inner: L(joints, { tone: "faint" }) }));

  f.add(S(k.slabOf(k.insetPlan(CAB, 2), 0, 6, P, 2, 0.4), { tone: "mid" }));
  const seams = [BOTTOM - 1, TOP - 1].map((z) => k.sideSeam(CAB, z, P, 2)).join("");
  f.add(S(k.slabOf(CAB, 6, TOP - 6, P, 2, 0.4), { tone: "mid", inner: L(seams, { tone: "faint" }) }));
  const CORNICE = k.insetPlan(CAB, -1.5);
  f.add(S(k.slabOf(CORNICE, TOP, 4, P, 2, 0.6), { tone: "mid" }));
  f.add(L(k.planOutline(k.insetPlan(CORNICE, 5), TOP + 4, P, 2), { tone: "faint" }));
  f.add(f.inPlane(f.sidePlane([-14, CORNICE.y + CORNICE.d], TOP + 3.4, "left"), face("M0 0h28v2.8h-28z", "top", "lo") + L("M3 1.4h14", { tone: "lo", free: true }) + D([[1.4, 1.4], [26.6, 1.4]], { size: 0.35 })));
  f.add(D([0, 1, 2, 3].flatMap((i) => [at([CAB.x + CAB.w, -26 + i * 7.3, BOTTOM + 2]), at([CAB.x + CAB.w, -26 + i * 7.3, TOP - 3])]), { size: 0.45 }));

  const x0 = LEFT + BOX.col * CELL_W;
  const z0 = BOTTOM + BOX.row * CELL_H;
  const open = (inset: number): V3[] => [
    [x0 + inset, FACE_Y, z0 + inset],
    [x0 + CELL_W - inset, FACE_Y, z0 + inset],
    [x0 + CELL_W - inset, FACE_Y, z0 + CELL_H - inset],
    [x0 + inset, FACE_Y, z0 + CELL_H - inset],
  ];
  const mouth = open(0.6);
  const deep = mouth.map(([x, , z]) => [x, FACE_Y - DEPTH, z] as V3);
  f.add(`<path class="iso-face" data-fill="0" d="${pathOf(mouth.map(at), true)}"/>`);
  f.add(`<path class="iso-face" data-fill="1" d="${pathOf([mouth[3]!, mouth[2]!, deep[2]!, deep[3]!].map(at), true)}"/>`);
  f.add(`<path class="iso-face" data-fill="2" d="${pathOf([mouth[0]!, mouth[3]!, deep[3]!, deep[0]!].map(at), true)}"/>`);

  const front = (col: number, row: number, lit = false) => {
    const fx = LEFT + col * CELL_W;
    const fz = BOTTOM + row * CELL_H;
    const out: string[] = [];
    const plate: Plan = { x: fx + 0.6, y: FACE_Y, w: CELL_W - 1.2, d: 1.4, r: 0.4 };
    out.push(S(k.slabOf(plate, fz + 0.6, CELL_H - 1.2, P, 2, 0.3), { tone: lit ? "hi" : "mid", lit, crease: "lo" }));
    const plane = f.sidePlane([fx, FACE_Y + 1.4], fz + CELL_H, "left");
    const label = lit
      ? `<text class="iso-face-text" data-tone="hi" x="5.6" y="5.3" font-size="3" text-anchor="middle">07</text>`
      : L("M3.4 4.3h4.4", { tone: "lo", free: true });
    const escutcheon = (x: number) => face(`M${x} 4.4m-1.5 0a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0`, "top", "mid") + L(`M${x} 3.8v1.4`, { tone: "hi" });
    out.push(f.inPlane(plane, face("M2.4 2.4h6.4v3.8h-6.4z", "top", "lo") + label + escutcheon(14) + escutcheon(21)));
    for (const px of [fx + 9, fx + CELL_W - 9]) out.push(S(k.slabOf({ x: px - 0.6, y: FACE_Y + 1.4, w: 1.2, d: 2.4, r: 0.4 }, fz + 3.4, 1.2, P, 2), { tone: "mid", crease: "none" }));
    out.push(S(k.slabOf({ x: fx + 7.6, y: FACE_Y + 3.4, w: CELL_W - 15.2, d: 1.4, r: 0.6 }, fz + 3.2, 1.6, P, 2, 0.2), { tone: "hi", crease: "lo" }));
    return out.join("");
  };
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) if (col !== BOX.col || row !== BOX.row) f.add(front(col, row));
  }

  const W = CELL_W - 2.4;
  const tx = x0 + 1.2;
  const tz = z0 + 1.2;
  const tray: string[] = [];
  const wall = (plan: Plan, h: number) => S(k.slabOf(plan, tz, h, P, 2, 0.2), { tone: "mid" });
  tray.push(wall({ x: tx, y: FACE_Y - DEPTH + 1, w: W, d: 1, r: 0.3 }, 8));
  tray.push(wall({ x: tx, y: FACE_Y - DEPTH + 1, w: 1, d: DEPTH - 1, r: 0.3 }, 8));
  tray.push(S(k.slabOf({ x: tx, y: FACE_Y - DEPTH + 1, w: W, d: DEPTH - 1, r: 0.3 }, tz, 0.8, P, 2), { tone: "lo", crease: "none" }));
  [-19, -13, -7].forEach((y, i) => {
    const card: Plan = { x: tx + 3, y, w: W - 6, d: 0.6, r: 0.2 };
    tray.push(S(k.slabOf(card, tz + 0.8, 9.4, P, 1), { tone: "lo", crease: "none" }));
    tray.push(
      f.inPlane(
        f.sidePlane([card.x, y + 0.6], tz + 10.2, "left"),
        face(`M0 0h${card.w}v9.4h${-card.w}z`, "sheet", "lo") +
          L(`M2.4 3.2h${10 + i * 2}M2.4 5.6h${14 - i * 3}`, { tone: "lo", free: true }) +
          face(`M${4 + i * 6} -2h5v2h-5z`, i === 1 ? "lit" : "sheet", i === 1 ? "lit" : "lo"),
      ),
    );
  });
  tray.push(wall({ x: tx + W - 1, y: FACE_Y - DEPTH + 1, w: 1, d: DEPTH - 1, r: 0.3 }, 8));
  tray.push(front(BOX.col, BOX.row, true));

  const key = (x: number, which: "guard" | "yours") => {
    const kx = x0 + x;
    const kz = z0 + CELL_H - 4.4;
    const mine = which === "yours";
    const out = [S(disc(P, alongY([kx, FACE_Y + 1.4, kz]), 0, 3.4, 0.7), { tone: mine ? "hi" : "mid", lit: mine, crease: "none" })];
    for (let step = 0; step <= 4; step++) {
      const angle = (step / 4) * (Math.PI / 2);
      const plane = f.planeOf([kx, FACE_Y + 4.8, kz], [-Math.sin(angle), 0, Math.cos(angle)], [0, 1, 0]);
      const bow = face("M-1 0h2v1a3.2 3.2 0 1 1 -2 0z", mine ? "lit" : "top", mine ? "lit" : "hi") + L("M0 4.4m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0", { tone: "lo" });
      const on = f.switchOf(`${which}${step}`, poses.map((p) => ({ t: p.t, on: Math.round(p[which] * 4) === step })));
      out.push(`<g class="${on}"${step ? ' opacity="0"' : ""}><g transform="${plane}">${bow}</g></g>`);
    }
    return out.join("");
  };
  tray.push(key(14, "guard"), key(21, "yours"));

  const back = f.shift([0, -DEPTH - 2, 0]);
  const hole = mouth.map(at);
  const tunnel = hull([...hole, ...hole.map(([x, y]) => [x + back[0], y + back[1]] as Flat)]);
  f.defs.push(`<clipPath id="vault-out"><path clip-rule="evenodd" d="M-1000 -1000H2000V2000H-1000Z${pathOf(tunnel, true)}${pathOf(hole, true)}"/></clipPath>`);
  const slide = f.moveOf("drawer", poses.map((p) => ({ t: p.t, by: [0, PULL * p.pull, 0] })));
  f.add(`<g clip-path="url(#vault-out)"><g class="${slide}">${tray.join("")}</g></g>`);

  return f.build({
    width,
    height,
    label:
      "A safe-deposit cabinet of locking drawers. Two keys, the guard's and yours, turn in box 07, which slides out to show the three records it holds, then slides home and locks.",
  });
}
