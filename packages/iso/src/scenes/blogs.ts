import { SHEET, SHEET_ATTRS, TEXT, TEXT_ATTRS } from "../classes";
import { Figure, type Flat, k, pathOf, type Plan, type Projection, type Scene, smoothstep, type V3 } from "../figure";
import { alongX, arc, circleD, D, disc, face, knurlOn, L, radialD, S, screwsOnTop, turned } from "../parts";

const PITCH = 1.45;
const WORDS = [5, 3, 6, 2, 4];
const CHARS = WORDS.flatMap((n, i) => [...Array.from({ length: n }, () => 1), ...(i < WORDS.length - 1 ? [0] : [])]);
const STRIKE = 0.17;
const LINE_H = 3.2;
const LEAN = (16 * Math.PI) / 180;
const PLATEN_Y = -14;
const PLATEN_Z = 22;
const PLATEN_R = 5;
const PRINT: V3 = [0, PLATEN_Y + PLATEN_R + 0.2, PLATEN_Z];
const X0 = (CHARS.length * PITCH) / 2;

interface Pose {
  t: number;
  carriage: number;
  feed: number;
  col: number;
  key: number;
  bar: number;
}

function planTyping() {
  const poses: Pose[] = [];
  let carriage = X0;
  let t = 0.4;
  poses.push({ t: 0, carriage, feed: 0, col: 0, key: -1, bar: 0 });
  poses.push({ t, carriage, feed: 0, col: 0, key: -1, bar: 0 });
  CHARS.forEach((isChar, i) => {
    const key = isChar ? (i * 7 + 3) % 27 : 27;
    poses.push({ t: t + 0.02, carriage, feed: 0, col: i, key, bar: isChar });
    poses.push({ t: t + 0.08, carriage, feed: 0, col: i + 1, key, bar: 0 });
    poses.push({ t: t + 0.11, carriage: carriage - PITCH, feed: 0, col: i + 1, key: -1, bar: 0 });
    carriage -= PITCH;
    t += STRIKE;
  });
  t += 0.5;
  poses.push({ t, carriage, feed: 0, col: CHARS.length, key: -1, bar: 0 });
  for (let i = 1; i <= 10; i++) {
    const e = smoothstep(i / 10);
    poses.push({ t: t + 0.6 * (i / 10), carriage: carriage + (X0 - carriage) * e, feed: Math.min(1, e * 1.6), col: CHARS.length, key: -1, bar: 0 });
  }
  t += 0.6;
  poses.push({ t: t + 1, carriage: X0, feed: 1, col: CHARS.length, key: -1, bar: 0 });
  return { poses, period: Math.round((t + 1) * 10) / 10 };
}

export function blogsScene(width = 400, height = 300): Scene {
  const BODY: Plan = { x: -42, y: -20, w: 84, d: 50, r: 6 };
  const P = k.fitProjection([...k.boxCorners(BODY, -3, 0), [-50, -18, 30], [50, -18, 30], [0, -26, 54]], width, height, { pad: 30, azimuth: 56 }) as Projection;
  const { poses, period } = planTyping();
  const f = new Figure("type", P, period);
  const at = (p: V3) => f.at(p);

  f.add(f.halo(BODY, -3, 7));
  for (const [x, y] of k.corners(BODY, 6) as Flat[]) f.add(S(k.cylinder(x, y, 3, -3, 3, P, 18), { tone: "lo" }));
  f.add(S(k.slabOf(BODY, 0, 8, P, 8, 0.8), { tone: "mid", inner: L(k.sideSeam(BODY, 4, P, 8), { tone: "faint" }) }));
  const SHELL: Plan = { x: -40, y: -20, w: 80, d: 22, r: 5 };
  f.add(S(k.slabOf(SHELL, 8, 7, P, 6, 0.6), { tone: "mid", inner: L(k.sideSeam(SHELL, 11.5, P, 6), { tone: "faint" }) }));
  f.add(S(turned(P, { o: [33, -14, 15], a: [0, 0, 1], u: [1, 0, 0], v: [0, 1, 0] }, [[0, 3.4], [1.6, 3.2, 1], [2.8, 2.4, 1], [3.6, 1.2, 1], [3.9, 0, 1]]), { tone: "hi", crease: "lo" }));

  const car: string[] = [];
  const RAIL: Plan = { x: -40, y: PLATEN_Y - 6, w: 80, d: 6, r: 1 };
  car.push(S(k.slabOf(RAIL, 15, 3, P, 2, 0.4), { tone: "mid", inner: L(k.sideSeam(RAIL, 16.5, P, 2), { tone: "faint" }) }));
  for (const x of [-18, 18]) car.push(L(pathOf([at([x, PLATEN_Y - 5, 18]), at([x, PLATEN_Y - 11, 52])]), { tone: "mid" }));
  const PLATEN = alongX([0, PLATEN_Y, PLATEN_Z]);
  car.push(S(disc(P, PLATEN, -38, 38, 1.4), { tone: "mid" }));
  car.push(S(disc(P, PLATEN, -32, 32, PLATEN_R), { tone: "mid", crease: "lo", inner: L([-24, 24].map((s) => arc(P, PLATEN, s, PLATEN_R)).join(""), { tone: "faint" }) }));
  const up: V3 = [0, -Math.sin(LEAN), Math.cos(LEAN)];
  const paperOrigin: V3 = [-22, PRINT[1], PRINT[2] - 1];
  const paperPlane = f.planeOf(paperOrigin, [1, 0, 0], up);
  car.push(`<g transform="${paperPlane}">${face("M0 0h44v32h-44z", "sheet", "lo")}</g>`);
  const lineD = (row: number) =>
    CHARS.map((isChar, i) => (isChar ? `M${(5 + i * PITCH).toFixed(2)} ${(1.2 + row * LINE_H).toFixed(1)}v${1.1 + ((i * 5) % 3) * 0.25}` : "")).join("");
  const tick = (i: number) => 1.1 + ((i * 5) % 3) * 0.25;
  const typedLen = CHARS.reduce((sum, isChar, i) => sum + (isChar ? tick(i) : 0), 0);
  const revealAt = (col: number) => CHARS.slice(0, col).reduce((sum, isChar, i) => sum + (isChar ? tick(i) : 0), 0);
  const reveal = f.trackOf(
    "line",
    poses.map((p) => ({ t: p.t, v: [p.feed >= 1 || p.col >= CHARS.length ? 0 : typedLen - revealAt(p.col) + 0.6] })),
    ([o]) => `stroke-dashoffset:${o!.toFixed(2)}`,
    { steps: true },
  );
  const feed = f.trackOf("feed", poses.map((p) => ({ t: p.t, v: [p.feed * LINE_H] })), ([v]) => `transform:translate(0px,${v!.toFixed(2)}px)`, { tolerance: 0.02 });
  f.defs.push(`<clipPath id="type-paper"><path d="M0 0h44v30h-44z"/></clipPath>`);
  car.push(
    `<g transform="${paperPlane}"><g clip-path="url(#type-paper)"><g ${feed}>` +
      `${[1, 2, 3, 4, 5, 6, 7].map((r) => `<path class="${TEXT}" ${TEXT_ATTRS} d="${lineD(r)}"/>`).join("")}` +
      `<path class="${TEXT}" ${reveal} ${TEXT_ATTRS} d="${lineD(0)}" stroke-dasharray="${typedLen.toFixed(2)} ${(typedLen + 4).toFixed(2)}" stroke-dashoffset="${(typedLen + 0.6).toFixed(2)}"/>` +
      `</g></g></g>`,
  );
  const BAIL = alongX([0, PRINT[1] + 0.6, PLATEN_Z + 5]);
  car.push(S(disc(P, BAIL, -26, 26, 0.5), { tone: "hi", crease: "none" }));
  for (const s of [-10, 10]) car.push(S(disc(P, BAIL, s - 1.2, s + 1.2, 1.4), { tone: "mid" }));
  car.push(S(disc(P, alongX([0, PLATEN_Y - 11, 52]), -20, 20, 0.9), { tone: "mid" }));
  for (const side of [-1, 1]) {
    const K = alongX([side * 38, PLATEN_Y, PLATEN_Z]);
    const [s0, s1] = side < 0 ? [-6, 0] : [0, 6];
    car.push(S(disc(P, K, s0, s1, 4.4), { tone: "mid", crease: "lo" }));
    car.push(knurlOn(P, K, s0, s1, 4.4, 24));
  }
  const knobTurn = f.spinOf("knob", poses.map((p) => ({ t: p.t, angle: -(p.feed * LINE_H) / PLATEN_R })));
  car.push(f.inPlane(f.sidePlane([44, PLATEN_Y], PLATEN_Z, "right"), L(circleD(0, 0, 1.4, 14) + pathOf([[0, 0], [0, -3.4]]), { tone: "hi" }), knobTurn));
  car.push(S(k.slabOf({ x: -46, y: PLATEN_Y - 1, w: 2, d: 2, r: 0.5 }, PLATEN_Z, 4, P, 2), { tone: "mid" }));
  car.push(S(k.slabOf({ x: -46, y: PLATEN_Y - 1, w: 2, d: 12, r: 0.8 }, PLATEN_Z + 4, 1.6, P, 2, 0.3), { tone: "hi", crease: "lo" }));
  const carriage = f.moveOf("carriage", poses.map((p) => ({ t: p.t, by: [p.carriage, 0, 0] })));
  f.add(`<g ${carriage} transform="${f.translate([X0, 0, 0])}">${car.join("")}</g>`);

  const spoolTurn = f.spinOf("spool", poses.map((p) => ({ t: p.t, angle: (X0 - p.carriage) * 0.08 })));
  for (const x of [-28, 28]) {
    f.add(S(k.cylinder(x, -9, 6.4, 15, 1, P, 32), { tone: "mid" }));
    f.add(S(k.cylinder(x, -9, 5.6, 16, 3, P, 32), { tone: "lo", crease: "lo", inner: L(k.sideArc(x, -9, 5.6, 17.5, P, 20), { tone: "lit" }) }));
    f.add(f.inPlane(f.topPlane([x, -9], 19), L(radialD(0, 0, 1.4, 5.4, 4) + circleD(0, 0, 1.4, 12), { tone: "lo" }), spoolTurn));
  }
  f.add(`<path class="${SHEET}" ${SHEET_ATTRS} d="${pathOf([at([-24, PRINT[1] + 1.4, 17]), at([24, PRINT[1] + 1.4, 17]), at([24, PRINT[1] + 1.4, 19.6]), at([-24, PRINT[1] + 1.4, 19.6])], true)}"/>`);
  f.add(L(k.segment([-24, PRINT[1] + 1.4, 18.3], [24, PRINT[1] + 1.4, 18.3], P), { tone: "lit" }));

  const fan = f.topPlane([0, -2], 13.4);
  const bars = Array.from({ length: 28 }, (_, i) => {
    const a = Math.PI + ((i + 0.5) / 28) * Math.PI;
    return pathOf([
      [Math.cos(a) * 4, Math.sin(a) * 4],
      [Math.cos(a) * 14, Math.sin(a) * 14],
    ]);
  }).join("");
  f.add(f.inPlane(fan, face("M-15 0a15 15 0 0 1 30 0z", "0", "lo") + L(bars, { tone: "mid" })));
  f.add(S(k.slabOf({ x: -2, y: PRINT[1] + 2, w: 4, d: 2, r: 0.5 }, 15, 3.4, P, 2), { tone: "mid" }));
  const strike = f.switchOf("strike", poses.map((p) => ({ t: p.t, on: p.bar })));
  f.add(`<g ${strike} opacity="0">${L(pathOf([at([0, -2, 13.6]), at([0, PRINT[1] + 0.8, PRINT[2] - 0.4])]), { tone: "lit" })}${D([at([0, PRINT[1] + 0.8, PRINT[2] - 0.4])], { size: 0.8, tone: "hi" })}</g>`);

  const rows = [
    { y: 4, z: 13.2, n: 10, x0: -19 },
    { y: 10, z: 11.6, n: 9, x0: -17 },
    { y: 16, z: 10, n: 8, x0: -15 },
  ];
  let index = 0;
  for (const row of rows) {
    f.add(S(k.slabOf({ x: -26, y: row.y - 3, w: 52, d: 6, r: 2 }, 8, row.z - 10 + 2, P, 3, 0.4), { tone: "mid" }));
    for (let i = 0; i < row.n; i++) {
      const x = row.x0 + i * 4.2;
      const me = index++;
      const dip = f.moveOf(`key${me}`, poses.map((p) => ({ t: p.t, by: [0, 0, p.key === me ? -0.9 : 0] })));
      const key =
        S(k.cylinder(x, row.y, 0.6, row.z - 2.6, 2.6, P, 10), { tone: "mid", crease: "none" }) +
        S(k.cylinder(x, row.y, 1.8, row.z, 1.1, P, 18, 0.3), { tone: "hi", crease: "lo" }) +
        L(k.ring(x, row.y, 1.2, row.z + 1.1, P, 14), { tone: "faint" });
      f.add(`<g ${dip}>${key}</g>`);
    }
  }
  const space = f.moveOf("space", poses.map((p) => ({ t: p.t, by: [0, 0, p.key === 27 ? -0.9 : 0] })));
  f.add(`<g ${space}>${S(k.slabOf({ x: -14, y: 22, w: 28, d: 3.2, r: 1.4 }, 8.6, 1.6, P, 3, 0.3), { tone: "hi", crease: "lo" })}</g>`);
  f.add(screwsOnTop(P, [[-36, 26], [36, 26]], 8, 0.7));

  return f.build({
    width,
    height,
    label:
      "A portable typewriter. Each keystroke dips a key, flicks a typebar up to the print point and steps the carriage left, so a line of text grows on the paper; at the end of the line the carriage returns and the paper feeds up a line.",
  });
}
