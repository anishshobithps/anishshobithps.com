import { PLATE } from "@repo/iso/classes";
import { Figure, type Projection, type Scene } from "@repo/iso/figure";
import { greenPlate, inkFill, inkPath, paperPath, polyD, printText, rectD, screenPath, shadowOf } from "@repo/iso/print";

const PROJECTION: Projection = { origin: [0, 0], scale: 1, azimuth: 45, elevation: 30 };

const X = 70;
const Y = 18;
const W = 250;
const H = 262;
const FOLD = 22;
const VALUE_X = X + 100;
const VALUE_W = W - 114;
const ROW_Y = 54;
const ROW_PITCH = 22;

const ROWS: ReadonlyArray<readonly [string, boolean]> = [
  ["ip hash", true],
  ["ip address", false],
  ["reaction", true],
  ["link clicks", true],
  ["email", false],
  ["user id", true],
  ["message", true],
  ["time", true],
  ["password", false],
  ["fingerprint", false],
];

function dashes(row: number, y: number) {
  const lengths = [14 + ((row * 7) % 9), 8 + ((row * 5) % 7), 18 + ((row * 3) % 11), 6 + ((row * 11) % 5)];
  let x = VALUE_X + 6;
  let d = "";
  for (const length of lengths) {
    if (x + length > VALUE_X + VALUE_W - 4) break;
    d += `M${x} ${y + 5.5}h${length}`;
    x += length + 6;
  }
  return d;
}

export function redactedScene(width = 400, height = 300): Scene {
  const f = new Figure("redacted", PROJECTION, 4);
  const sheet = polyD([[X, Y], [X + W - FOLD, Y], [X + W, Y + FOLD], [X + W, Y + H], [X, Y + H]]);
  const back = rectD(X + 14, Y - 8, W, H);

  f.add(paperPath(back), inkPath(back));
  f.add(shadowOf(f, sheet, [5, 5], "mid"));
  f.add(paperPath(sheet), inkPath(sheet));
  const fold = polyD([[X + W - FOLD, Y], [X + W - FOLD, Y + FOLD], [X + W, Y + FOLD]]);
  f.add(screenPath(f, fold, "mid"), inkPath(fold));
  f.add(inkFill(rectD(X + 14, 38, W - 28, 2.5)));

  ROWS.forEach(([label, kept], index) => {
    const y = ROW_Y + index * ROW_PITCH;
    f.add(printText(`translate(${X + 14} ${y + 9})`, label, { size: 8 }));
    f.add(screenPath(f, rectD(X + 14, y + 14, W - 28, 0.9), "hi"));
    if (kept) {
      f.add(greenPlate(f, rectD(VALUE_X, y, VALUE_W, 11)));
      f.add(inkPath(dashes(index, y), PLATE.blend));
    } else {
      f.add(inkPath(dashes(index, y)));
      const bar = rectD(VALUE_X - 2, y - 1, VALUE_W + 4, 13);
      f.add(inkFill(bar, PLATE.void), inkPath(bar));
    }
  });

  return f.build({
    width,
    height,
    label: "A form page with its values blacked out for everything this site never collects, such as an IP address, an email and a password, and highlighted in green for the few fields it keeps.",
  });
}
