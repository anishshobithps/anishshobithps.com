import { DASH } from "../classes";
import { Figure, k, type Projection, type Scene } from "../figure";
import { circleD, inkFill, inkPath, lineD, OBLIQUE, printSolid, rectD } from "../print";

const W = 56;
const D = 76;
const THICK = 1.2;
const LAYERS = [0, 24, 48] as const;

export function resumeScene(width = 400, height = 300): Scene {
  const plan = { x: 0, y: 0, w: W, d: D, r: 0 };
  const points = LAYERS.flatMap((z) => k.boxCorners(plan, z, z + THICK));
  const P = k.fitProjection(points, width, height, { pad: 28, azimuth: 52, oblique: OBLIQUE }) as Projection;
  const f = new Figure("sheets", P, 4);
  const plane = (z: number) => k.topMatrix([0, 0], z + THICK, P, "x");

  const guides = [[0, 0], [W, 0], [W, D], [0, D]] as const;
  for (const [x, y] of guides) {
    const [ax, ay] = f.at([x, y, LAYERS[0]]);
    const [bx, by] = f.at([x, y, LAYERS[2]]);
    f.add(inkPath(lineD([[ax, ay], [bx, by]]), DASH));
  }

  const jsonLines = (indent: number[]) => indent.map((n, i) => `M${8 + n * 5} ${22 + i * 7}h${16 + ((i * 7) % 4) * 4}`).join("");
  f.add(printSolid(f, k.slabOf(plan, LAYERS[0], THICK, P, 1), { subject: true, screens: ["hi", "mid", null, null] }));
  f.add(`<g transform="${plane(LAYERS[0])}">${inkPath(lineD([[10, 8], [6, 8], [6, 16], [4, 18], [6, 20], [6, 28]]))}${inkPath(jsonLines([1, 1, 2, 2, 1, 2, 1]))}${inkPath(lineD([[W - 10, 8], [W - 6, 8], [W - 6, 16], [W - 4, 18], [W - 6, 20], [W - 6, 28]]))}</g>`);

  f.add(printSolid(f, k.slabOf(plan, LAYERS[1], THICK, P, 1), { screens: ["hi", "mid", null, null] }));
  let chips = "";
  for (let row = 0; row < 6; row++) {
    chips += rectD(8, 10 + row * 10, 14, 5);
    chips += lineD([[26, 12.5 + row * 10], [26 + 10 + ((row * 9) % 14), 12.5 + row * 10]]);
  }
  f.add(`<g transform="${plane(LAYERS[1])}">${inkPath(chips)}${inkPath(circleD(W - 12, 14, 4, 12))}</g>`);

  f.add(printSolid(f, k.slabOf(plan, LAYERS[2], THICK, P, 1), { screens: ["hi", "mid", null, null] }));
  let text = "";
  for (let row = 0; row < 9; row++) text += lineD([[7, 20 + row * 5.6], [W - 7 - ((row * 11) % 18), 20 + row * 5.6]]);
  f.add(`<g transform="${plane(LAYERS[2])}">${inkFill(rectD(7, 7, 30, 4))}${inkPath(text)}${inkPath(lineD([[7, 14], [W - 7, 14]]))}</g>`);

  return f.build({
    width,
    height,
    label: "A résumé pulled apart into its three layers: the visible printed sheet, a sheet of metadata tags, and a sheet of embedded structured data, printed in green, which is the layer machines read.",
  });
}
