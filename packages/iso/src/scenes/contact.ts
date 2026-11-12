import { Figure, type Flat, type Projection, type Scene } from "../figure";
import { arcD, circleD, ellipseD, greenAt, inkPath, lineD, paperPath, rectD, screenPath, travel } from "../print";

const PROJECTION: Projection = { origin: [0, 0], scale: 1, azimuth: 45, elevation: 30 };
const PERIOD = 4;
const GROUND = 214;
const MOUTH_Y = 172;
const SAG = 9;

const stringAt = (t: number): Flat => [106 + t * 188, MOUTH_Y + Math.sin(t * Math.PI) * SAG];

export function contactScene(width = 400, height = 300): Scene {
  const f = new Figure("tin", PROJECTION, PERIOD);
  f.add(screenPath(f, rectD(20, GROUND, 360, 6), "lo"), inkPath(lineD([[20, GROUND], [380, GROUND]])));

  const can = (x: number, side: 1 | -1) => {
    const body = rectD(x, 150, 50, 44);
    const cradle = rectD(x - 4, 194, 58, 20);
    const lip = ellipseD(side === 1 ? x + 50 : x, 172, 6, 22, 20);
    return (
      paperPath(cradle) + screenPath(f, cradle, "mid") + inkPath(cradle) +
      paperPath(body) + screenPath(f, rectD(x, 150, 50, 12), "hi") + inkPath(body) +
      paperPath(lip) + inkPath(lip) + inkPath(ellipseD(side === 1 ? x + 50 : x, 172, 2.4, 9, 12)) +
      inkPath(lineD([[x + 12, 150], [x + 12, 194]]) + lineD([[x + 38, 150], [x + 38, 194]]))
    );
  };
  f.add(can(50, 1), can(300, -1));
  f.add(inkPath(lineD(Array.from({ length: 25 }, (_, i) => stringAt(i / 24)))));

  for (const [cx, dir] of [[40, -1], [360, 1]] as const) {
    for (const r of [8, 15, 22]) f.add(inkPath(arcD(cx, 172, r, dir === 1 ? -0.9 : Math.PI - 0.9, dir === 1 ? 0.9 : Math.PI + 0.9, 10)));
  }

  const out = Array.from({ length: 20 }, (_, i) => stringAt(i / 19));
  const route = [...out, ...out.slice().reverse()];
  const { attr, start } = travel(f, "pulse", route, PERIOD * 0.8);
  const pulse = `<g transform="translate(${start[0]} ${start[1]})"><g ${attr}>${paperPath(circleD(0, 0, 6, 16))}${greenAt(circleD(0, 0, 6, 16))}${inkPath(circleD(0, 0, 6, 16))}</g></g>`;
  f.add(pulse);

  return f.build({
    width,
    height,
    label: "Two tin cans on cradles joined by a taut string. A small green pulse runs along the string to the far can and comes back, a message sent and answered.",
  });
}
