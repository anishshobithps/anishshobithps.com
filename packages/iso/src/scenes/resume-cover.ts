import { DASH, PLATE } from "@repo/iso/classes";
import { Figure, type Projection, type Scene } from "@repo/iso/figure";
import { greenPlate, inkFill, inkPath, lineD, paperPath, rectD, shadowOf } from "@repo/iso/print";

const PROJECTION: Projection = { origin: [0, 0], scale: 1, azimuth: 45, elevation: 30 };

export function resumeCoverScene(width = 400, height = 225): Scene {
  const f = new Figure("cv", PROJECTION, 4);
  const oy = (height - 225) / 2;
  const sheet = rectD(90, 22, 220, 181);
  const body: string[] = [shadowOf(f, sheet, [5, 5], "mid"), paperPath(sheet), inkPath(sheet)];

  body.push(inkFill(rectD(104, 38, 54, 6)));
  for (let i = 0; i < 12; i++) body.push(inkPath(lineD([[104, 58 + i * 11], [104 + 62 - ((i * 17) % 28), 58 + i * 11]])));

  body.push(inkPath(lineD([[200, 22], [200, 203]]), DASH));
  body.push(greenPlate(f, rectD(206, 30, 98, 166)));

  const blend = PLATE.blend;
  const branches = [[0, 0], [1, 0], [1, 1], [0, 1], [1, 0], [0, 0], [1, 1]];
  const nodes: string[] = [];
  const links: string[] = [lineD([[216, 50], [216, 188]])];
  branches.forEach(([depth], i) => {
    const y = 56 + i * 19;
    const x = 216 + (depth ?? 0) * 14;
    links.push(lineD([[216, y], [x + 8, y]]));
    nodes.push(rectD(x + 8, y - 5, 46 - (depth ?? 0) * 10, 10));
  });
  body.push(inkPath(rectD(212, 36, 46, 10), blend), inkPath(links.join(""), blend), inkPath(nodes.join(""), blend));

  f.add(`<g transform="translate(0 ${oy})">${body.join("")}</g>`);
  return f.build({
    width,
    height,
    label: "A résumé folded down the middle. The left half is the printed page, lines of text. The right half is the same content as an indented tree of data, printed in green, for machines to read.",
  });
}
