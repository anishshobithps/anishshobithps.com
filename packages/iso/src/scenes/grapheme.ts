import { DASH } from "@repo/iso/classes";
import { Figure, k, type Projection, type Scene } from "@repo/iso/figure";
import { circleD, inkPath, lineD, OBLIQUE, polyD, printSolid, printText, rectD, screenPath } from "@repo/iso/print";

const W = 70;
const D = 40;
const THICK = 1.2;
const GAP = 32;

interface Layer {
  code: string;
  subject?: boolean;
  glyph: (f: Figure) => string;
}

const LAYERS: Layer[] = [
  {
    code: "U+1F4BB",
    glyph: () => inkPath(rectD(12, 8, 30, 19) + polyD([[7, 29], [47, 29], [43, 35], [11, 35]])),
  },
  {
    code: "U+200D",
    subject: true,
    glyph: () => inkPath(circleD(20, 20, 8, 18) + circleD(32, 20, 8, 18)),
  },
  {
    code: "U+1F3FD",
    glyph: (f) => screenPath(f, rectD(10, 8, 28, 28), "mid") + inkPath(rectD(10, 8, 28, 28)),
  },
  {
    code: "U+1F469",
    glyph: () => inkPath(circleD(24, 15, 6.5, 16) + polyD([[10, 38], [14, 25], [34, 25], [38, 38]])),
  },
];

export function graphemeScene(width = 400, height = 225): Scene {
  const plan = { x: 0, y: 0, w: W, d: D, r: 0 };
  const top = (LAYERS.length - 1) * GAP;
  const points = LAYERS.flatMap((_, i) => k.boxCorners(plan, i * GAP, i * GAP + THICK));
  const P = k.fitProjection(points, width, height, { pad: 18, azimuth: 52, oblique: OBLIQUE }) as Projection;
  const f = new Figure("emoji", P, 4);

  for (const [x, y] of [[0, 0], [W, 0], [W, D], [0, D]] as const) {
    const [ax, ay] = f.at([x, y, 0]);
    const [bx, by] = f.at([x, y, top]);
    f.add(inkPath(lineD([[ax, ay], [bx, by]]), DASH));
  }

  LAYERS.forEach((layer, i) => {
    const z = i * GAP;
    const plane = k.topMatrix([0, 0], z + THICK, P, "x");
    f.add(printSolid(f, k.slabOf(plan, z, THICK, P, 1), { subject: layer.subject, screens: ["hi", "mid", null, null] }));
    f.add(`<g transform="${plane}">${layer.glyph(f)}</g>`);
    f.add(printText(`${plane} translate(${W - 6} ${D - 6})`, layer.code, { size: 6, anchor: "end" }));
  });

  return f.build({
    width,
    height,
    label: "One emoji pulled apart into the four Unicode code points that make it: a woman, a skin tone, the invisible joiner printed in green, and a laptop.",
  });
}
