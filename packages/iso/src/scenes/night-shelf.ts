import { BEAM } from "../classes";
import { Figure, type Flat, k, pathOf, type Plan, type Projection, type Scene, type V3 } from "../figure";
import { alongZ, D, face, G, gearD, L, S, screwsOnTop, turned } from "../parts";
import * as T from "../tube";

const PERIOD = 6;
const LAMP = -118;
const BOT = -16;
const CREAM = 70;
const CRATES = 112;
const ASLEEP = "hidden dark:block";
const AWAKE = "dark:hidden";

export function nightShelfScene(width = 960, height = 200): Scene {
  const SHELF: Plan = { x: -150, y: -20, w: 300, d: 40, r: 3 };
  const P = k.fitProjection([...k.boxCorners(SHELF, -10, 0), [LAMP, 0, 62], [LAMP + 40, 0, 58], [BOT, 0, 48], [CREAM, 0, 34], [CRATES, 0, 32]], width, height, { pad: 10, azimuth: 76 }) as Projection;
  const f = new Figure("shelf", P, PERIOD);

  const tube = (points: V3[], r: number) =>
    T.tubePieces(points, r, P, { maxLength: 400 })
      .map((piece) => T.tubeSvg(piece, { tone: "mid" }))
      .join("");

  f.add(f.halo(SHELF, -10, 6));
  f.add(S(k.slabOf(SHELF, -10, 10, P, 3, 0.6), { tone: "mid", inner: L(k.sideSeam(SHELF, -5, P, 3), { tone: "faint" }) }));
  f.add(screwsOnTop(P, k.corners(SHELF, 4) as Flat[], 0, 1));

  const HEAD: V3 = [LAMP + 28, 0, 46];
  f.add(`<g class="${ASLEEP}"><path class="${BEAM}" d="${pathOf([f.at([HEAD[0] - 7, 0, 41]), f.at([HEAD[0] + 7, 0, 41]), f.at([HEAD[0] + 34, 14, 0]), f.at([HEAD[0] - 34, 14, 0])], true)}"/></g>`);
  f.add(S(k.cylinder(LAMP, 0, 10, 0, 3, P, 32, 0.5), { tone: "mid" }));
  f.add(tube(G.fillet([[LAMP, 0, 3], [LAMP, 0, 34], [HEAD[0] - 2, 0, 52]] as V3[], 9, 8) as V3[], 1.3));
  f.add(S(turned(P, alongZ([HEAD[0], 0, 44]), [[0, 11, 0], [9, 4.2]]), { tone: "hi", crease: "lo" }));
  f.add(S(G.sphereOf([HEAD[0], 0, 42], 3, P), { tone: "mid" }));
  f.add(`<g class="${ASLEEP}">${S(G.sphereOf([HEAD[0], 0, 42], 3, P), { tone: "hi", lit: true })}</g>`);

  const DOCK: Plan = { x: BOT - 25, y: -17, w: 50, d: 34, r: 2.4 };
  f.add(S(k.slabOf(DOCK, 0, 4, P, 3, 0.5), { tone: "mid", crease: "lo" }));
  const pulse = f.track("led", [
    { t: 0, css: "opacity:0.35" },
    { t: 1.5, css: "opacity:1" },
    { t: 3, css: "opacity:0.35" },
    { t: 4.5, css: "opacity:1" },
    { t: 6, css: "opacity:0.35" },
  ]);
  f.add(`<g ${pulse}>${f.inPlane(f.sidePlane([DOCK.x, DOCK.y + DOCK.d], 4, "left"), face("M5 1h18v2h-18z", "lit", "lit"))}</g>`);

  const BODY: Plan = { x: BOT - 17, y: -14, w: 34, d: 28, r: 2.2 };
  const TOP = 30;
  f.add(S(k.slabOf(BODY, 4, TOP - 4, P, 3, 0.6), { tone: "hi", crease: "lo", inner: L(k.sideSeam(BODY, 17, P, 3), { tone: "faint" }) }));
  const front = f.sidePlane([BODY.x, BODY.y + BODY.d], TOP, "left");
  const pill = (x: number) => `M${x} 6h4.4a1.7 1.7 0 0 1 0 3.4h-4.4a1.7 1.7 0 0 1 0-3.4z`;
  f.add(`<g class="${AWAKE}">${f.inPlane(front, face(pill(7) + pill(21), "lit", "lit") + L("M13 17h8", { tone: "lo" }))}</g>`);
  f.add(`<g class="${ASLEEP}">${f.inPlane(front, L("M7 8.4q2.8 3 5.6 0M21 8.4q2.8 3 5.6 0M13.6 17h6.8", { tone: "lit" }))}</g>`);
  f.add(f.inPlane(f.topPlane([BODY.x + 6, BODY.y + 6], TOP), face(gearD(8, 8, 6.4, 10, 1.2), "top", "hi")));
  const mastBase: V3 = [BOT + 8, 2, TOP];
  f.add(`<g class="${AWAKE}">${tube([mastBase, [BOT + 8, 2, TOP + 13]] as V3[], 1)}${S(G.sphereOf([BOT + 8, 2, TOP + 15], 2.4, P), { tone: "hi", lit: true })}</g>`);
  f.add(`<g class="${ASLEEP}">${tube(G.fillet([mastBase, [BOT + 8, 2, TOP + 10], [BOT + 20, 2, TOP + 8]] as V3[], 5, 6) as V3[], 1)}${S(G.sphereOf([BOT + 21.4, 2, TOP + 8], 2.4, P), { tone: "mid" })}</g>`);

  const letters = [
    { size: 3.4, at: 0, x: 4 },
    { size: 4.4, at: 1.4, x: 9 },
    { size: 5.6, at: 2.8, x: 15 },
  ];
  const zzz = f.sidePlane([BODY.x + 22, BODY.y + BODY.d], TOP + 8, "left");
  const drift = letters.map(({ size, at, x }, index) => {
    const move = f.track(`z${index}`, [
      { t: at, css: "opacity:0;transform:translate(0px,0px)" },
      { t: at + 0.5, css: "opacity:1;transform:translate(1px,-3px)" },
      { t: at + 3, css: "opacity:0;transform:translate(8px,-22px)" },
    ]);
    return `<g ${move} opacity="0">${k.faceTextSvg(zzz, "z", { size, tone: "mid", anchor: "start" }).replace("<text", `<text x="${x}"`)}</g>`;
  });
  f.add(`<g class="${ASLEEP}">${drift.join("")}</g>`);

  const BASE = alongZ([CREAM, 0, 0]);
  f.add(S(turned(P, BASE, [[0, 8], [2, 8, 0], [2.4, 3]]), { tone: "mid", crease: "lo" }));
  f.add(tube([[CREAM, 0, 2], [CREAM, 0, 8]] as V3[], 1));
  f.add(S(turned(P, alongZ([CREAM, 0, 8]), [[0, 0.8], [14, 6.4, 0]]), { tone: "hi", crease: "lo", inner: L(G.arcOf(alongZ([CREAM, 0, 8]), 8, 3.7, P), { tone: "faint" }) }));
  f.add(S(G.sphereOf([CREAM, 0, 25.5], 6, P), { tone: "hi", lit: true }));
  const melt = f.track("melt", [
    { t: 0, css: "opacity:0;transform:translate(0px,0px)" },
    { t: 0.4, css: "opacity:1;transform:translate(0px,0px)" },
    { t: 3.6, css: "opacity:1;transform:translate(1px,9px)" },
    { t: 4, css: "opacity:0;transform:translate(1px,9px)" },
  ]);
  f.add(`<g ${melt} opacity="0">${S(G.sphereOf([CREAM + 6, 0, 19], 1.5, P), { tone: "hi", lit: true })}</g>`);

  const LOW: Plan = { x: CRATES - 13, y: -12, w: 26, d: 24, r: 1.4 };
  f.add(S(k.slabOf(LOW, 0, 17, P, 3, 0.5), { tone: "hi", crease: "lo", inner: L(k.sideSeam(LOW, 8, P, 3), { tone: "faint" }) }));
  f.add(f.inPlane(f.sidePlane([LOW.x, LOW.y + LOW.d], 17, "left"), face("M3 3h8v3h-8z", "lit", "lit") + L("M3 9h18M3 12.4h12", { tone: "lo" })));
  const HIGH: Plan = { x: CRATES - 9, y: -8, w: 18, d: 16, r: 1.2 };
  f.add(S(k.slabOf(HIGH, 17, 12, P, 3, 0.5), { tone: "hi", crease: "lo" }));
  f.add(L(k.lineOnTop([CRATES, -8], [CRATES, 8], 29, P), { tone: "mid" }));
  f.add(D([f.at([CRATES - 3, 8, 29]), f.at([CRATES + 3, 8, 29])], { size: 0.5, tone: "mid" }));

  return f.build({
    width,
    height,
    label: "A long shelf at night: a lamp lights the scene while a little bot dozes on its charging dock with its eyes shut and its antenna drooping, an ice cream cone melts beside it, and two parcels stand ready to ship. In light mode the lamp is off and the bot is wide awake.",
  });
}
