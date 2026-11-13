import { DASH } from "@repo/iso/classes";
import { Figure, type Projection, type Scene } from "@repo/iso/figure";
import { circleD, greenPlate, hash, inkPath, paperPath, printText, rectD, shadowOf } from "@repo/iso/print";

const PROJECTION: Projection = { origin: [0, 0], scale: 1, azimuth: 45, elevation: 30 };
const MAX_STAMPS = 7;

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? `${parts[0]![0]}${parts.at(-1)![0]}` : (parts[0] ?? "?").slice(0, 2);
  return letters.toUpperCase();
}

export function tracesScene(names: string[] = [], width = 400, height = 225): Scene {
  const f = new Figure("traces", PROJECTION, 4);
  const sheet = rectD(24, 20, 352, 186);
  f.add(shadowOf(f, sheet, [4, 4], "mid"), paperPath(sheet), inkPath(sheet));

  const shown = names.slice(0, MAX_STAMPS);
  const total = shown.length + 1;
  const perRow = Math.min(4, total);
  const rows = Math.ceil(total / perRow);
  const gapX = 86;
  const gapY = 76;
  const left = 200 - ((perRow - 1) * gapX) / 2;
  const top = 113 - ((rows - 1) * gapY) / 2;

  for (let i = 0; i < total; i++) {
    const row = Math.floor(i / perRow);
    const inRow = row === rows - 1 ? total - row * perRow : perRow;
    const col = i - row * perRow;
    const cx = (row === rows - 1 ? 200 - ((inRow - 1) * gapX) / 2 : left) + col * gapX;
    const cy = top + row * gapY;
    const mine = i === total - 1;
    if (mine) {
      f.add(`<g transform="translate(${cx} ${cy})">${greenPlate(f, circleD(0, 0, 27, 28))}${inkPath(circleD(0, 0, 28, 28), DASH)}${inkPath(circleD(0, 0, 22, 28), DASH)}${inkPath("M-8 0H8M0 -8V8")}</g>`);
      continue;
    }
    const name = shown[i]!;
    const tilt = (hash(name) % 25) - 12;
    f.add(`<g transform="translate(${cx} ${cy}) rotate(${tilt})">${inkPath(circleD(0, 0, 28, 28))}${inkPath(circleD(0, 0, 22, 28))}${printText("translate(0 5)", initials(name), { size: 14, anchor: "middle" })}</g>`);
  }

  return f.build({
    width,
    height,
    label: `A sheet of paper with a rubber stamp ring for ${shown.length === 0 ? "nobody yet" : `each of the ${shown.length} most recent visitors`}, each ringing that person's initials, and one empty dashed green ring that is yours.`,
  });
}
