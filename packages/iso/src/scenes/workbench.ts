import { DASH, PLATE } from "../classes";
import { Figure, type Flat, type Projection, type Scene } from "../figure";
import { circleD, greenAt, greenFlat, inkFill, inkPath, lineD, paperPath, rectD, REGISTER, screenPath } from "../print";

const PROJECTION: Projection = { origin: [0, 0], scale: 1, azimuth: 45, elevation: 30 };

const GROUND = 176;
const BOT_Y = 150;
const XS = [130, 360, 590, 820] as const;

const BODY = rectD(-28, -24, 56, 46);
const FEET = rectD(-22, 22, 14, 4) + rectD(8, 22, 14, 4);
const OFF: Flat = [5, 3.5];

function frame(f: Figure, x: number, head: "ink" | "green") {
  const parts: string[] = [];
  const posts = [rectD(x - 50, 64, 8, GROUND - 64), rectD(x + 42, 64, 8, GROUND - 64)];
  const beam = rectD(x - 58, 54, 116, 12);
  const rod = rectD(x - 3, 66, 6, 28);
  const plate = rectD(x - 30, 94, 60, 16);
  const tray = rectD(x - 40, GROUND - 8, 80, 8);
  const roller = circleD(x, 40, 11, 22);
  for (const d of [...posts, tray]) parts.push(paperPath(d), inkPath(d));
  parts.push(paperPath(beam), screenPath(f, beam, "mid"), inkPath(beam), paperPath(rod), inkPath(rod));
  parts.push(paperPath(plate));
  if (head === "green") parts.push(greenAt(plate, REGISTER));
  else parts.push(screenPath(f, plate, "hi"));
  parts.push(inkPath(plate, head === "green" ? PLATE.blend : ""));
  parts.push(paperPath(roller));
  if (head === "green") parts.push(greenAt(roller, REGISTER));
  parts.push(inkPath(roller, head === "green" ? PLATE.blend : ""), inkPath(`M${x - 11} 40H${x + 11}M${x} 29V51`));
  parts.push(screenPath(f, tray, "lo"));
  return parts.join("");
}

function sheets(f: Figure, x: number) {
  const out: string[] = [];
  for (let i = 0; i < 3; i++) {
    const d = rectD(x - 38 + i * 2, GROUND - 3 - i * 3, 76 - i * 4, 3);
    out.push(paperPath(d), inkPath(d));
  }
  out.push(screenPath(f, rectD(x - 38, GROUND - 3, 76, 3), "lo"));
  return out.join("");
}

function rack(x: number) {
  const out: string[] = [];
  for (const dx of [-70, 64]) {
    const pole = rectD(x + dx, 44, 6, GROUND - 44);
    out.push(paperPath(pole), inkPath(pole));
  }
  out.push(inkPath(lineD([[x - 64, 48], [x, 52], [x + 64, 48]])));
  const sheet = rectD(x - 26, 52, 52, 52);
  out.push(paperPath(sheet), inkPath(sheet));
  for (const dx of [-18, 13]) out.push(inkFill(rectD(x + dx, 48, 5, 9)));
  const mark = `M${x - 10} 78H${x + 10}M${x} 68V88`;
  out.push(inkPath(`${circleD(x, 78, 6, 16)}${mark}`), greenAt(`${rectD(x - 10, 77.4, 20, 1.2)}${rectD(x - 0.6, 68, 1.2, 20)}`, [0, 0]));
  return out.join("");
}

interface BotLayer {
  from: number;
  to: number;
  markup: string;
}

export function workbenchScene(width = 960, height = 230): Scene {
  const f = new Figure("bench", PROJECTION, 1);
  f.add(screenPath(f, rectD(20, GROUND, 920, 6), "lo"), inkPath(lineD([[20, GROUND], [940, GROUND]])));
  f.add(sheets(f, XS[0]));
  f.add(frame(f, XS[1], "ink"));
  f.add(frame(f, XS[2], "green"));
  f.add(rack(XS[3]));

  const layers: BotLayer[] = [
    { from: 0, to: 0, markup: inkPath(BODY, DASH) + inkPath(FEET, DASH) + inkPath("M-7 0H7M0 -7V7") },
    { from: 1, to: 3, markup: paperPath(BODY) + paperPath(FEET) },
    { from: 2, to: 2, markup: greenFlat(BODY, OFF) },
    { from: 3, to: 3, markup: greenFlat(BODY, REGISTER) },
    {
      from: 1,
      to: 3,
      markup:
        screenPath(f, rectD(12, -24, 16, 46), "mid") +
        inkPath(BODY) +
        inkPath(FEET) +
        inkPath(rectD(-16, -10, 10, 12) + rectD(6, -10, 10, 12)) +
        inkPath(lineD([[-8, 10], [8, 10]])),
    },
    {
      from: 3,
      to: 3,
      markup:
        inkFill(rectD(-13, -7, 4, 6) + rectD(9, -7, 4, 6)) +
        inkPath(lineD([[0, -24], [0, -38]])) +
        greenFlat(circleD(0, -41, 3.5, 14), REGISTER) +
        inkPath(circleD(0, -41, 3.5, 14)),
    },
  ];
  XS.forEach((x, station) => {
    const markup = layers.filter((layer) => station >= layer.from && station <= layer.to).map((layer) => layer.markup).join("");
    f.add(`<g transform="translate(${x} ${BOT_Y})">${markup}</g>`);
  });

  return f.build({ width, height, label: "A small robot walks along a print shop floor. On blank paper it is only faint guide lines, the ink press prints its outline and halftone, the green press lands a slightly misregistered plate, and at the drying rack the plates settle into register and the robot wakes up." });
}
