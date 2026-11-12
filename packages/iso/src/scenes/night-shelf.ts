import { Figure, type Flat, type Projection, type Scene } from "../figure";
import { arcD, circleD, greenAt, inkFill, inkPath, lineD, paperPath, polyD, printText, rectD, screenPath } from "../print";

const PROJECTION: Projection = { origin: [0, 0], scale: 1, azimuth: 45, elevation: 30 };
const SHELF = 150;

const solid = (d: string) => paperPath(d) + inkPath(d);

export function nightShelfScene(width = 960, height = 200): Scene {
  const f = new Figure("shelf-night", PROJECTION, 6);
  const board = rectD(60, SHELF, 840, 8);
  f.add(screenPath(f, rectD(60, SHELF + 8, 840, 10), "lo"), solid(board));

  const books = [
    rectD(120, SHELF - 30, 14, 30),
    rectD(135, SHELF - 38, 12, 38),
    rectD(148, SHELF - 26, 16, 26),
  ];
  books.forEach((d, i) => f.add(solid(d), i === 1 ? screenPath(f, d, "mid") : ""));

  const shade = polyD([[270, 52], [330, 52], [316, 84], [284, 84]]);
  f.add(`<g class="hidden dark:inline">${greenAt(polyD([[284, 84], [316, 84], [380, SHELF], [220, SHELF]]))}</g>`);
  f.add(solid(rectD(297, 84, 6, 60)), solid(rectD(280, SHELF - 6, 40, 6)), paperPath(shade), screenPath(f, shade, "hi"), inkPath(shade));

  const dock = rectD(412, SHELF - 12, 76, 12);
  const body = rectD(430, SHELF - 54, 40, 42);
  f.add(solid(dock), paperPath(body), screenPath(f, rectD(458, SHELF - 54, 12, 42), "mid"), inkPath(body));
  f.add(inkPath(lineD([[450, SHELF - 54], [450, SHELF - 66]])), inkPath(circleD(450, SHELF - 69, 3, 12)));
  f.add(`<g class="dark:hidden">${inkFill(rectD(438, SHELF - 42, 8, 10) + rectD(454, SHELF - 42, 8, 10))}</g>`);
  f.add(`<g class="hidden dark:inline">${inkPath(arcD(442, SHELF - 36, 5, 0.2, Math.PI - 0.2, 8) + arcD(458, SHELF - 36, 5, 0.2, Math.PI - 0.2, 8))}${printText(`translate(474 ${SHELF - 64})`, "zz", { size: 9 })}</g>`);

  const cone = polyD([[574, SHELF - 44], [606, SHELF - 44], [590, SHELF - 4]]);
  const scoop = circleD(590, SHELF - 58, 17, 24);
  f.add(solid(rectD(574, SHELF - 4, 32, 4)), paperPath(cone), screenPath(f, cone, "mid"), inkPath(cone));
  f.add(inkPath(lineD([[580, SHELF - 44], [594, SHELF - 14]]) + lineD([[600, SHELF - 44], [586, SHELF - 14]])));
  f.add(paperPath(scoop), greenAt(scoop), inkPath(scoop), inkPath(arcD(590, SHELF - 46, 5, 0, Math.PI, 8)));

  const big = rectD(680, SHELF - 36, 58, 36);
  const small = rectD(694, SHELF - 56, 34, 20);
  f.add(solid(big), solid(small), screenPath(f, rectD(704, SHELF - 36, 8, 36), "mid"), screenPath(f, rectD(706, SHELF - 56, 6, 20), "mid"));
  f.add(inkPath(lineD([[704, SHELF - 36], [704, SHELF]]) + lineD([[712, SHELF - 36], [712, SHELF]])));

  const pot = polyD([[812, SHELF - 22], [848, SHELF - 22], [842, SHELF], [818, SHELF]]);
  f.add(solid(pot));
  const leaves: Flat[][] = [
    [[830, SHELF - 22], [818, SHELF - 52], [832, SHELF - 36]],
    [[830, SHELF - 22], [830, SHELF - 62], [838, SHELF - 36]],
    [[830, SHELF - 22], [846, SHELF - 50], [840, SHELF - 32]],
  ];
  for (const leaf of leaves) f.add(solid(polyD(leaf)));

  return f.build({
    width,
    height,
    label: "A shelf at night with a lamp, a small robot asleep on its dock, an ice cream cone and a parcel. In dark mode the lamp is on and the robot sleeps; in light mode the lamp is off and the robot is awake.",
  });
}
