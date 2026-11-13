import { DASH, PLATE } from "@repo/iso/classes";
import { Figure, type Projection, type Scene } from "@repo/iso/figure";
import { circleD, greenPlate, inkFill, inkPath, lineD, paperPath, polyD, rectD, shadowOf } from "@repo/iso/print";

const PROJECTION: Projection = { origin: [0, 0], scale: 1, azimuth: 45, elevation: 30 };

function ticket(f: Figure, cx: number, cy: number, rot: number, { w = 120, stub = true } = {}) {
  const h = 52;
  const x = -w / 2;
  const y = -h / 2;
  const main = rectD(x, y, stub ? w * 0.74 : w, h);
  const out: string[] = [shadowOf(f, main, [3, 3], "mid"), paperPath(main), inkPath(main)];
  out.push(inkFill(rectD(x + 8, y + 8, 30, 4)), inkPath(lineD([[x + 8, y + 22], [x + 62, y + 22]]) + lineD([[x + 8, y + 30], [x + 48, y + 30]]) + lineD([[x + 8, y + 38], [x + 56, y + 38]])));
  const bars = Array.from({ length: 7 }, (_, i) => rectD(x + 6 + i * 4 + (i % 2), y + h - 12, 1.6 + (i % 3), 8)).join("");
  out.push(inkFill(bars));
  if (stub) {
    const s = rectD(x + w * 0.74, y, w * 0.26, h);
    out.push(paperPath(s), inkPath(s), inkPath(lineD([[x + w * 0.74, y], [x + w * 0.74, y + h]]), DASH));
    out.push(inkPath(circleD(x + w * 0.74, y, 3, 10) + circleD(x + w * 0.74, y + h, 3, 10)));
    out.push(inkFill(rectD(x + w * 0.74 + 6, y + 12, 18, 3)));
  }
  return `<g transform="translate(${cx} ${cy}) rotate(${rot})">${out.join("")}</g>`;
}

export function alertScene(width = 400, height = 225): Scene {
  const f = new Figure("alert", PROJECTION, 4);
  const oy = (height - 225) / 2;
  const body: string[] = [];

  body.push(ticket(f, 108, 56, -7), ticket(f, 214, 108, 4), ticket(f, 268, 164, -5, { w: 120, stub: false }));

  const tornStub = (cx: number, cy: number, rot: number) => {
    const s = rectD(-16, -26, 32, 52);
    return `<g transform="translate(${cx} ${cy}) rotate(${rot})">${shadowOf(f, s, [3, 3], "mid")}${paperPath(s)}${greenPlate(f, s)}${inkPath(s, PLATE.blend)}${inkFill(rectD(-8, -12, 18, 3))}${inkPath(lineD([[-16, -26], [-12, -22], [-16, -18], [-12, -14], [-16, -10], [-12, -6], [-16, -2], [-12, 2], [-16, 6], [-12, 10], [-16, 14], [-12, 18], [-16, 22], [-12, 26]]), PLATE.blend)}</g>`;
  };
  body.push(tornStub(342, 150, 14));

  const bubble = polyD([[298, 22], [364, 22], [364, 58], [330, 58], [318, 70], [320, 58], [298, 58]]);
  body.push(shadowOf(f, bubble, [3, 3], "mid"), paperPath(bubble), inkPath(bubble), inkFill(rectD(328, 30, 4, 16)), inkFill(rectD(328, 49, 4, 4)));

  f.add(`<g transform="translate(0 ${oy})">${body.join("")}</g>`);
  return f.build({
    width,
    height,
    label: "A strip of match tickets. The last one has its stub torn off, printed in green, and a small alert bubble pings beside it.",
  });
}
