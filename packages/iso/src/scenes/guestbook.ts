import { PLATE } from "../classes";
import { Figure, k, type Flat, type Projection, type Scene } from "../figure";
import { circleD, greenPlate, inkPath, OBLIQUE, polyD, printSolid, printText, screenPath } from "../print";

const PAGE_W = 62;
const PAGE_D = 84;
const PAGE_Z = 3;
const ROW = 10;
const ROWS_PER_PAGE = 4;
const MAX_NAMES = ROWS_PER_PAGE * 2;

export function guestbookScene(names: string[] = [], width = 400, height = 300): Scene {
  const list = names.slice(0, MAX_NAMES).reverse();
  const cover = { x: -3, y: -3, w: PAGE_W * 2 + 6, d: PAGE_D + 6, r: 0 };
  const left = { x: 0, y: 0, w: PAGE_W, d: PAGE_D, r: 0 };
  const right = { x: PAGE_W, y: 0, w: PAGE_W, d: PAGE_D, r: 0 };

  const points = [...k.boxCorners(cover, -2, PAGE_Z), [PAGE_W * 2 - 6, PAGE_D - 8, PAGE_Z], [PAGE_W + 56, PAGE_D - 56, PAGE_Z]] as Array<[number, number, number]>;
  const P = k.fitProjection(points, width, height, { pad: 12, azimuth: 66, oblique: OBLIQUE }) as Projection;
  const f = new Figure("book", P, 4);
  const at = (x: number, y: number, z = PAGE_Z): Flat => f.at([x, y, z]);

  f.add(printSolid(f, k.slabOf(cover, -2, 2, P, 1), { screens: ["hi", "mid", "lo", null] }));
  f.add(printSolid(f, k.slabOf(left, 0, PAGE_Z, P, 1), { screens: ["hi", "mid", null, null] }));
  f.add(printSolid(f, k.slabOf(right, 0, PAGE_Z, P, 1), { screens: ["hi", "mid", null, null] }));
  f.add(inkPath(k.lineOnTop([PAGE_W, 0], [PAGE_W, PAGE_D], PAGE_Z, P)));

  const writeRow = (page: "left" | "right", row: number, name: string, newest: boolean) => {
    const px = page === "left" ? 0 : PAGE_W;
    const y = 14 + row * ROW;
    const plane = k.topMatrix([px, 0], PAGE_Z, P, "x");
    const blend = newest ? PLATE.blend : "";
    if (newest) f.add(greenPlate(f, polyD([at(px + 3, y - 6.5), at(px + PAGE_W - 3, y - 6.5), at(px + PAGE_W - 3, y + 2.5), at(px + 3, y + 2.5)])));
    f.add(printText(`${plane} translate(6 ${y})`, name.slice(0, 13), { size: 5.2, extra: blend }));
    f.add(`<g transform="${plane}">${inkPath(`M4 ${y + 4}H${PAGE_W - 4}`, blend)}</g>`);
  };

  const rowsCount = Math.max(list.length, 1);
  for (let i = 0; i < ROWS_PER_PAGE * 2; i++) {
    const page = i < ROWS_PER_PAGE ? "left" : "right";
    const row = i % ROWS_PER_PAGE;
    const name = list[i];
    if (name === undefined) {
      const plane = k.topMatrix([page === "left" ? 0 : PAGE_W, 0], PAGE_Z, P, "x");
      const y = 14 + row * ROW;
      f.add(`<g transform="${plane}">${inkPath(`M4 ${y + 4}H${PAGE_W - 4}`)}</g>`);
      continue;
    }
    writeRow(page, row, name, i === list.length - 1 && rowsCount > 0);
  }
  f.add(`<g transform="${k.topMatrix([0, 0], PAGE_Z, P, "x")}">${inkPath(`M6 6H${PAGE_W - 6}`)}</g>`);

  const base: Flat = [92, 70];
  const tip: Flat = [118, 40];
  const dx = tip[0] - base[0];
  const dy = tip[1] - base[1];
  const len = Math.hypot(dx, dy);
  const n: Flat = [(-dy / len) * 1.8, (dx / len) * 1.8];
  const pen = polyD([
    at(base[0] + n[0], base[1] + n[1], PAGE_Z + 1),
    at(tip[0] + n[0] * 0.8, tip[1] + n[1] * 0.8, PAGE_Z + 1),
    at(tip[0] + (dx / len) * 5, tip[1] + (dy / len) * 5, PAGE_Z + 1),
    at(tip[0] - n[0] * 0.8, tip[1] - n[1] * 0.8, PAGE_Z + 1),
    at(base[0] - n[0], base[1] - n[1], PAGE_Z + 1),
  ]);
  f.add(screenPath(f, pen, "lo"), inkPath(pen));
  const chain = Array.from({ length: 7 }, (_, i): Flat => {
    const t = i / 6;
    const [sx, sy] = at(base[0] + (PAGE_W + 2 - base[0]) * t, base[1] + (PAGE_D - 4 - base[1]) * t + Math.sin(t * Math.PI) * 5, PAGE_Z + 0.5);
    return [sx, sy];
  });
  for (const [sx, sy] of chain) f.add(inkPath(circleD(sx, sy, 1.3, 8)));

  return f.build({
    width,
    height,
    label: `An open visitors' book with a pen on a bead chain. ${list.length === 0 ? "The lines are still empty." : `The last ${list.length} signers are written in ink and the newest name, ${list.at(-1)}, is highlighted in green.`}`,
  });
}
