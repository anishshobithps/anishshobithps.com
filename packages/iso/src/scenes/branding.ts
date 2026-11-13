import { SWATCH } from "@repo/iso/classes";
import { Figure, type Flat, type Projection, type Scene } from "@repo/iso/figure";
import { circleD, greenAt, inkPath, logoD, paperPath, polyD, printText, screenPath, shadowOf } from "@repo/iso/print";

const PROJECTION: Projection = { origin: [0, 0], scale: 1, azimuth: 45, elevation: 30 };
const PIVOT: Flat = [62, 252];
const LENGTH = 196;
const HALF = 10;
const FIRST = (-84 * Math.PI) / 180;
const LAST = (-12 * Math.PI) / 180;

function blade(angle: number): Flat[] {
  const rotate = ([x, y]: Flat): Flat => [PIVOT[0] + x * Math.cos(angle) - y * Math.sin(angle), PIVOT[1] + x * Math.sin(angle) + y * Math.cos(angle)];
  return [rotate([0, -HALF]), rotate([LENGTH, -HALF]), rotate([LENGTH + 5, 0]), rotate([LENGTH, HALF]), rotate([0, HALF])];
}

export function brandingScene(width = 400, height = 300): Scene {
  const f = new Figure("brand", PROJECTION, 4);
  const count = SWATCH.length;

  for (let i = 0; i < count; i++) {
    const angle = FIRST + ((LAST - FIRST) * i) / (count - 1);
    const shape = polyD(blade(angle));
    const tip = blade(angle)[2]!;
    f.add(shadowOf(f, shape, [2, 3], "mid"), paperPath(shape), `<path class="${SWATCH[i]}" d="${shape}"/>`, inkPath(shape));
    f.add(printText(`translate(${tip[0] - 40 * Math.cos(angle)} ${tip[1] - 40 * Math.sin(angle)}) rotate(${(angle * 180) / Math.PI})`, String(i + 1).padStart(2, "0"), { size: 6 }));
  }
  f.add(inkPath(circleD(PIVOT[0], PIVOT[1], 7, 16)), paperPath(circleD(PIVOT[0], PIVOT[1], 6, 16)), inkPath(circleD(PIVOT[0], PIVOT[1], 2.4, 10)));

  const mark = logoD(236, 44, 148);
  f.add(greenAt(mark, [7, 5]), screenPath(f, mark, "lo"), inkPath(mark));

  return f.build({
    width,
    height,
    label: "A paint fan deck whose blades are filled with the site's own theme colours, beside the logo's A printed in ink with its green plate slightly out of register.",
  });
}
