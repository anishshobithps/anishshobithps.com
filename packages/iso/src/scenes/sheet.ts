import { DASH, PLATE } from "@repo/iso/classes";
import { Figure, type Projection, type Scene } from "@repo/iso/figure";
import { greenPlate, hash, inkFill, inkPath, lineD, paperPath, polyD, printText, rectD, screenPath, shadowOf, pad2 } from "@repo/iso/print";

const PROJECTION: Projection = { origin: [0, 0], scale: 1, azimuth: 45, elevation: 30 };
const FOLD = 24;

export function sheetScene(number: number, seed: string, width = 400, height = 225, ghost = false): Scene {
  const f = new Figure("sheet", PROJECTION, 4);
  const oy = (height - 225) / 2;
  const x = 130;
  const y = 18;
  const w = 140;
  const h = 189;
  const sheet = polyD([[x, y], [x + w - FOLD, y], [x + w, y + FOLD], [x + w, y + h], [x, y + h]]);
  const fold = polyD([[x + w - FOLD, y], [x + w - FOLD, y + FOLD], [x + w, y + FOLD]]);
  const body: string[] = [];

  body.push(shadowOf(f, sheet, [5, 5], "mid"), paperPath(sheet), inkPath(sheet, ghost ? DASH : ""));
  body.push(screenPath(f, fold, "mid"), inkPath(fold, ghost ? DASH : ""));
  body.push(inkFill(rectD(x + 14, y + 16, 46, 4)), inkPath(lineD([[x + 14, y + 28], [x + 80, y + 28]]) + lineD([[x + 14, y + 36], [x + 64, y + 36]])));

  const label = pad2(number);
  if (ghost) {
    body.push(printText(`translate(${x + w / 2} ${y + 122})`, label, { size: 58, anchor: "middle", extra: "opacity-40" }));
  } else {
    const seedValue = hash(seed);
    const left = x + 10 + (seedValue % 18);
    const span = 86 + ((seedValue >> 5) % 30);
    body.push(greenPlate(f, rectD(left, y + 78, Math.min(span, x + w - 8 - left), 58)));
    body.push(printText(`translate(${x + w / 2} ${y + 122})`, label, { size: 58, anchor: "middle", extra: PLATE.blend }));
  }
  body.push(inkPath(lineD([[x + 14, y + h - 40], [x + w - 14, y + h - 40]]) + lineD([[x + 14, y + h - 30], [x + w - 40, y + h - 30]]) + lineD([[x + 14, y + h - 20], [x + w - 70, y + h - 20]]), ghost ? DASH : ""));

  f.add(`<g transform="translate(0 ${oy})">${body.join("")}</g>`);
  return f.build({
    width,
    height,
    label: ghost
      ? `An empty dashed sheet numbered ${label}, waiting for the next post.`
      : `A numbered sheet for post ${label}, with a swipe of green behind the number that is different for every post.`,
  });
}
