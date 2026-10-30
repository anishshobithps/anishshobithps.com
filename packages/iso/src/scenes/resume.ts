import { BEAM, DOTS_GLOW, FACE_FILL, FACE_TEXT, INK, INK_ATTRS, TEXT, TEXT_ATTRS } from "../classes";
import { Figure, type Flat, k, type Plan, type Projection, type Scene, smoothstep, type V3 } from "../figure";
import { cable, face, knob, L, rulerStrip, S, screwsOnTop } from "../parts";

const PAGE: Plan = { x: -30, y: -42, w: 60, d: 84, r: 0.6 };
const RAIL_X = 40;
const BAR_Z = 16;
const Y_START = -50;
const Y_END = 50;
const SWEEP = 4.2;
const PERIOD = 7.2;

const ROWS: Array<[number, number, "head" | "rule" | "text"]> = [
  [5, 30, "head"],
  [9, 42, "text"],
  [16, 14, "rule"],
  [20, 48, "text"],
  [23.5, 40, "text"],
  [31, 16, "rule"],
  [35, 50, "text"],
  [38.5, 44, "text"],
  [42, 36, "text"],
  [50, 12, "rule"],
  [54, 46, "text"],
  [57.5, 30, "text"],
];
const QR = { x: 44, y: 66, size: 11 };
const FIELDS = ROWS.length + 1;

const headAt = (t: number) => {
  if (t < 0.4) return Y_START;
  if (t < 0.4 + SWEEP) return Y_START + (Y_END - Y_START) * smoothstep((t - 0.4) / SWEEP);
  if (t < 0.4 + SWEEP + 0.8) return Y_END;
  const u = Math.min(1, (t - 0.4 - SWEEP - 0.8) / 1.4);
  return Y_END + (Y_START - Y_END) * smoothstep(u);
};

export function resumeScene(width = 400, height = 300): Scene {
  const MAT: Plan = { x: -48, y: -58, w: 96, d: 116, r: 3 };
  const P = k.fitProjection([...k.boxCorners(MAT, -3, 0), [-RAIL_X - 4, 0, 32], [RAIL_X + 4, 0, 32], [72, -10, 14]], width, height, { pad: 26, azimuth: 40 }) as Projection;
  const f = new Figure("scan", P, PERIOD);
  const at = (p: V3) => f.at(p);
  const times = Array.from({ length: 145 }, (_, i) => (i / 144) * PERIOD);

  f.add(f.halo(MAT, -3, 7));
  f.add(S(k.slabOf(MAT, -3, 3, P, 4, 0.6), { tone: "lo" }));
  rulerStrip(f, { x: MAT.x + 3, y: MAT.y + 4, w: 5, d: MAT.d - 8, r: 0.8 }, 0, 4, 5);
  rulerStrip(f, { x: -26, y: MAT.y + MAT.d - 8, w: 52, d: 5, r: 0.8 }, 0, 4, 5);
  for (const [x, y, sx, sy] of [
    [PAGE.x - 2, PAGE.y - 2, 1, 1],
    [PAGE.x + PAGE.w + 2, PAGE.y - 2, -1, 1],
    [PAGE.x - 2, PAGE.y + PAGE.d + 2, 1, -1],
    [PAGE.x + PAGE.w + 2, PAGE.y + PAGE.d + 2, -1, -1],
  ] as Array<[number, number, number, number]>) {
    f.add(L(k.onTop([[x + sx * 6, y], [x, y], [x, y + sy * 6]], 0, P), { tone: "mid" }));
  }

  const UNIT: Plan = { x: 56, y: -24, w: 22, d: 30, r: 2 };
  f.add(S(k.slabOf(UNIT, 0, 12, P, 4, 0.6), { tone: "mid", inner: L(k.sideSeam(UNIT, 3, P, 4), { tone: "faint" }) }));
  f.add(screwsOnTop(P, k.corners(UNIT, 2.4) as Flat[], 12, 0.7));
  knob(f, [72, 0], 12, 2.4, 2.2);
  const lamp: V3 = [62, 0, 12];
  f.add(L(k.ring(lamp[0], lamp[1], 1.4, 12, P, 14), { tone: "lo" }));
  f.add(`<g class="${DOTS_GLOW}"><circle cx="${at(lamp)[0].toFixed(1)}" cy="${at(lamp)[1].toFixed(1)}" r="0.8"/></g>`);
  const screen = f.sidePlane([UNIT.x + 2, UNIT.y + UNIT.d], 10, "left");
  const counts = times.map((t) => ROWS.filter(([y]) => PAGE.y + y <= headAt(t) && t < 0.4 + SWEEP + 0.8).length + (PAGE.y + QR.y + QR.size <= headAt(t) && t < 0.4 + SWEEP + 0.8 ? 1 : 0));
  const states = [...new Set(counts)];
  const lcd = states
    .map((n) => {
      const on = f.switchOf(`lcd${n}`, times.map((t, i) => ({ t, on: counts[i] === n })));
      const label = n === FIELDS ? "JSON OK" : `${String(n).padStart(2, "0")}/${FIELDS}`;
      return `<g ${on}${n === counts[0] ? "" : ' opacity="0"'}><text class="${FACE_TEXT.lit}" x="9" y="4.9" font-size="3" text-anchor="middle">${label}</text></g>`;
    })
    .join("");
  f.add(f.inPlane(screen, face("M0 0h18v7h-18z", "0", "mid") + lcd));
  f.add(cable(P, [[UNIT.x, -8, 4], [50, -8, 2], [RAIL_X + 6, -8, 2], [RAIL_X + 6, -52, 2], [RAIL_X + 3, -52, 2.6]], 0.7));

  const top = f.topPlane([PAGE.x, PAGE.y], 0.3);
  const words = ([y, len, w]: (typeof ROWS)[number]) => {
    if (w !== "text") return `M5 ${y}h${len * 0.9}`;
    let x = 5;
    let seed = Math.round(y * 37);
    const end = 5 + len * 0.9;
    const out: string[] = [];
    while (x < end - 1) {
      seed = (seed * 9301 + 49297) % 233280;
      const word = Math.min(end - x, 2.4 + (seed / 233280) * 5);
      out.push(`M${x.toFixed(1)} ${y}h${word.toFixed(1)}`);
      x += word + 1.3;
    }
    return out.join("");
  };
  const rowD = (filter: (row: (typeof ROWS)[number]) => boolean) => ROWS.filter(filter).map(words).join("");
  const qrCells = (() => {
    const cells: string[] = [];
    let seed = 7;
    for (let r = 0; r < 7; r++)
      for (let c = 0; c < 7; c++) {
        seed = (seed * 9301 + 49297) % 233280;
        const corner = (r < 2 && c < 2) || (r < 2 && c > 4) || (r > 4 && c < 2);
        if (corner || seed / 233280 > 0.5) cells.push(`M${QR.x + c * (QR.size / 7)} ${QR.y + r * (QR.size / 7)}h${(QR.size / 7) * 0.8}v${(QR.size / 7) * 0.8}h${-(QR.size / 7) * 0.8}z`);
      }
    return cells.join("");
  })();
  f.add(S(k.slabOf(PAGE, 0, 0.3, P, 2), { tone: "lo", crease: "none", card: true }));
  f.add(
    `<g transform="${top}">` +
      `<path class="${TEXT}" ${TEXT_ATTRS} style="stroke-width:0.6" d="${rowD(([, , w]) => w === "text")}"/>` +
      `<path class="${TEXT}" ${TEXT_ATTRS} style="stroke-width:1.4" d="${rowD(([, , w]) => w === "head")}"/>` +
      `<path class="${TEXT}" ${TEXT_ATTRS} style="stroke-width:0.9" d="${rowD(([, , w]) => w === "rule")}"/>` +
      `<path class="stroke-none ${FACE_FILL["2"]}" d="${qrCells}"/>` +
      `</g>`,
  );
  const lit = ROWS.map(([y, len, w], i) => {
    const on = f.switchOf(`row${i}`, times.map((t) => ({ t, on: PAGE.y + y <= headAt(t) && t < 0.4 + SWEEP + 0.8 })));
    return `<path class="${INK}" ${on} ${INK_ATTRS} opacity="0" style="stroke-width:${w === "head" ? 1.4 : w === "rule" ? 0.9 : 0.6};stroke-linecap:butt" d="${words([y, len, w])}"/>`;
  }).join("");
  const qrOn = f.switchOf("qr", times.map((t) => ({ t, on: PAGE.y + QR.y + QR.size <= headAt(t) && t < 0.4 + SWEEP + 0.8 })));
  f.add(`<g transform="${top}">${lit}<path class="stroke-none ${FACE_FILL.ink}" ${qrOn} opacity="0" d="${qrCells}"/></g>`);

  const rail = (x: number) => {
    f.add(S(k.slabOf({ x: x - 2, y: -54, w: 4, d: 108, r: 1 }, 0, 4, P, 2, 0.4), { tone: "mid", inner: L(k.segment([x + 2, -54, 2], [x + 2, 54, 2], P), { tone: "faint" }) }));
    for (const y of [-54, 51]) f.add(S(k.slabOf({ x: x - 3, y, w: 6, d: 3, r: 0.8 }, 0, 6, P, 2, 0.3), { tone: "mid" }));
  };
  rail(-RAIL_X);
  rail(RAIL_X);

  const g: string[] = [];
  const tower = (x: number) => {
    g.push(S(k.slabOf({ x: x - 3.5, y: -5, w: 7, d: 10, r: 1 }, 4, 5, P, 2, 0.4), { tone: "mid" }));
    g.push(S(k.slabOf({ x: x - 2, y: -2.5, w: 4, d: 5, r: 0.8 }, 9, 19, P, 2, 0.4), { tone: "mid" }));
  };
  const glow = k.onTop(
    [
      [PAGE.x - 2, -2.2],
      [PAGE.x + PAGE.w + 2, -2.2],
      [PAGE.x + PAGE.w + 2, 2.2],
      [PAGE.x - 2, 2.2],
    ],
    0.35,
    P,
    true,
  );
  g.push(`<path class="${BEAM}" d="${glow}"/>`);
  g.push(L(k.lineOnTop([PAGE.x - 1, 0], [PAGE.x + PAGE.w + 1, 0], 0.4, P), { tone: "lit" }));
  tower(-RAIL_X);
  g.push(S(k.slabOf({ x: -RAIL_X + 2, y: -2, w: RAIL_X * 2 - 4, d: 4, r: 1 }, BAR_Z - 2, 4, P, 2, 0.4), { tone: "mid", inner: L(k.segment([-RAIL_X + 2, 2, BAR_Z - 0.6], [RAIL_X - 2, 2, BAR_Z - 0.6], P), { tone: "lit" }) }));
  g.push(S(k.slabOf({ x: -RAIL_X, y: -3, w: RAIL_X * 2, d: 6, r: 1.2 }, 26, 3, P, 2, 0.4), { tone: "mid" }));
  g.push(screwsOnTop(P, [[-RAIL_X, 0], [RAIL_X, 0]], 29, 0.8));
  tower(RAIL_X);
  const ride = f.moveOf("gantry", times.map((t) => ({ t, by: [0, headAt(t), 0] })));
  f.add(`<g ${ride} transform="${f.translate([0, Y_START, 0])}">${g.join("")}</g>`);

  return f.build({
    width,
    height,
    label:
      "An overhead line scanner over a résumé on a scanning mat. A gantry runs down two rails and its light bar lays a green line across the page; each line lights up as it is read, then the metadata block, and the unit counts the fields parsed.",
  });
}
