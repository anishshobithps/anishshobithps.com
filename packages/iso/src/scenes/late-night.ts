import { Figure, type Projection, type Scene } from "@repo/iso/figure";
import { arcD, circleD, greenPlate, inkFill, inkPath, lineD, paperPath, polyD, rectD, screenPath, shadowOf } from "@repo/iso/print";

const PROJECTION: Projection = { origin: [0, 0], scale: 1, azimuth: 45, elevation: 30 };
const MAX_RINGS = 10;

export function lateNightScene(posts = 0, width = 400, height = 225): Scene {
  const f = new Figure("desk", PROJECTION, 4);
  const desk = rectD(24, 14, 352, 197);
  f.add(shadowOf(f, desk, [4, 4], "mid"), paperPath(desk), inkPath(desk));

  const rings = Math.min(posts, MAX_RINGS);
  for (let i = 0; i < rings; i++) {
    const cx = 262 + ((i * 41) % 96);
    const cy = 112 + ((i * 53) % 78);
    const start = ((i * 97) % 360) * (Math.PI / 180);
    f.add(inkPath(arcD(cx, cy, 16, start, start + 4.9)));
  }

  const lid = rectD(100, 54, 142, 50);
  const screen = rectD(106, 60, 130, 38);
  const deck = rectD(96, 106, 150, 88);
  f.add(paperPath(lid), inkPath(lid), screenPath(f, screen, "lo"), inkPath(screen));
  f.add(inkFill(rectD(112, 68, 3, 8)), inkPath(lineD([[122, 72], [160, 72]]) + lineD([[122, 80], [148, 80]])));
  f.add(paperPath(deck), inkPath(deck));
  let keys = "";
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 11; col++) keys += rectD(103 + col * 13, 112 + row * 11, 10, 8);
  }
  f.add(inkPath(keys), inkPath(rectD(120, 158, 74, 8) + rectD(150, 174, 44, 14)));

  const mug = circleD(306, 66, 19, 28);
  f.add(shadowOf(f, mug, [3, 3], "mid"), paperPath(mug), inkPath(mug), inkPath(circleD(306, 66, 14, 24)));
  f.add(screenPath(f, circleD(306, 66, 14, 24), "mid"), inkPath(arcD(325, 66, 7, -Math.PI / 2, Math.PI / 2)));

  const notes = [rectD(40, 38, 40, 40), rectD(52, 74, 40, 40), rectD(36, 124, 40, 40)];
  notes.forEach((d, i) => {
    f.add(shadowOf(f, d, [2, 2], "mid"), paperPath(d), inkPath(d));
    const [x, y] = [[40, 38], [52, 74], [36, 124]][i]!;
    f.add(inkPath(lineD([[x + 6, y + 12], [x + 30, y + 12]]) + lineD([[x + 6, y + 20], [x + 24, y + 20]])));
  });
  f.add(inkPath(polyD([[44, 178], [52, 178], [52, 202], [48, 208], [44, 202]])));

  const pool = circleD(172, 122, 72, 40);
  f.add(greenPlate(f, pool));

  return f.build({
    width,
    height,
    label: `A desk seen from above at three in the morning: a laptop, a mug, sticky notes and a pencil, with a pool of green lamp light over the keyboard. ${rings > 0 ? `${rings} coffee ring${rings === 1 ? "" : "s"} on the wood, one for every post written here.` : ""}`.trim(),
  });
}
