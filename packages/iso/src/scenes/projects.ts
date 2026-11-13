import { DASH, PLATE } from "@repo/iso/classes";
import { Figure, type Flat, type Projection, type Scene } from "@repo/iso/figure";
import { circleD, greenPlate, hash, inkPath, lineD, pad2, paperPath, polyD, printText, rectD, screenPath, shadowOf } from "@repo/iso/print";

const PROJECTION: Projection = { origin: [0, 0], scale: 1, azimuth: 45, elevation: 30 };

const EMBLEMS: Array<(r: number) => string> = [
  (r) => `${circleD(0, 0, r, 20)}${circleD(0, 0, r * 0.28, 10)}`,
  (r) => polyD([[0, -r], [r, r * 0.8], [-r, r * 0.8]]),
  (r) => polyD(Array.from({ length: 6 }, (_, i): Flat => [Math.cos((i / 6) * Math.PI * 2) * r, Math.sin((i / 6) * Math.PI * 2) * r])),
  (r) => `${lineD([[-r * 0.3, -r], [-r * 0.8, -r * 0.6], [-r * 0.8, -r * 0.1], [-r, 0], [-r * 0.8, r * 0.1], [-r * 0.8, r * 0.6], [-r * 0.3, r]])}${lineD([[r * 0.3, -r], [r * 0.8, -r * 0.6], [r * 0.8, -r * 0.1], [r, 0], [r * 0.8, r * 0.1], [r * 0.8, r * 0.6], [r * 0.3, r]])}`,
  (r) => `${rectD(-r, -r, r * 2, r * 2)}${lineD([[-r, r], [r, -r]])}`,
  (r) => `${lineD([[0, -r], [0, r]])}${lineD([[-r * 0.87, -r * 0.5], [r * 0.87, r * 0.5]])}${lineD([[-r * 0.87, r * 0.5], [r * 0.87, -r * 0.5]])}`,
  (r) => `${circleD(0, 0, r, 20)}${polyD([[-r * 0.3, -r * 0.5], [r * 0.6, 0], [-r * 0.3, r * 0.5]])}`,
  (r) => `${rectD(-r, -r * 0.2, r * 0.45, r * 1.2)}${rectD(-r * 0.22, -r, r * 0.45, r * 2)}${rectD(r * 0.55, -r * 0.6, r * 0.45, r * 1.6)}`,
];

export function projectsScene(titles: string[] = [], width = 400, height = 300): Scene {
  const f = new Figure("kit", PROJECTION, 4);
  const total = titles.length + 1;
  const rows = Math.max(1, Math.round(Math.sqrt(total / 1.4)));
  const cols = Math.max(2, Math.ceil(total / rows));
  const inner = { x: 28, y: 28, w: 344, h: 244 };
  const cellW = inner.w / cols;
  const cellH = inner.h / rows;
  const size = Math.min(cellW - 24, cellH - 24, 64);

  const frame = rectD(20, 20, 360, 260);
  const window = rectD(inner.x, inner.y, inner.w, inner.h);
  f.add(shadowOf(f, frame, [4, 4], "mid"), paperPath(frame), inkPath(frame), paperPath(window), inkPath(window));

  const runners: string[] = [];
  for (let r = 1; r < rows; r++) runners.push(rectD(inner.x, inner.y + r * cellH - 2.5, inner.w, 5));
  for (let c = 1; c < cols; c++) runners.push(rectD(inner.x + c * cellW - 2.5, inner.y, 5, inner.h));
  for (const d of runners) f.add(screenPath(f, d, "mid"), inkPath(d));

  for (let i = 0; i < total; i++) {
    const ghost = i === total - 1;
    const cx = inner.x + (i % cols) * cellW + cellW / 2;
    const cy = inner.y + Math.floor(i / cols) * cellH + cellH / 2;
    const half = size / 2;
    const gates = [
      rectD(cx - 3, cy - cellH / 2, 6, (cellH - size) / 2),
      rectD(cx - 3, cy + half, 6, (cellH - size) / 2),
      rectD(cx - cellW / 2, cy - 3, (cellW - size) / 2, 6),
      rectD(cx + half, cy - 3, (cellW - size) / 2, 6),
    ];
    for (const d of gates) f.add(paperPath(d), inkPath(d, ghost ? DASH : ""));
    const tile = rectD(cx - half, cy - half, size, size);
    const label = pad2(i + 1);
    if (ghost) {
      f.add(paperPath(tile), inkPath(tile, DASH), inkPath(`M${cx - 7} ${cy - 2}H${cx + 7}M${cx} ${cy - 9}V${cy + 5}`, DASH));
      f.add(printText(`translate(${cx} ${cy + half - 6})`, label, { size: 6, anchor: "middle", extra: "opacity-50" }));
      continue;
    }
    const subject = i === 0;
    f.add(shadowOf(f, tile, [3, 3], "mid"), paperPath(tile));
    if (subject) f.add(greenPlate(f, tile));
    const emblem = EMBLEMS[hash(titles[i]!) % EMBLEMS.length]!;
    f.add(`<g transform="translate(${cx} ${cy - 5}) scale(${size / 64})">${inkPath(emblem(16), subject ? PLATE.blend : "")}</g>`);
    f.add(inkPath(tile, subject ? PLATE.blend : ""), printText(`translate(${cx} ${cy + half - 6})`, label, { size: 6, anchor: "middle", extra: subject ? PLATE.blend : "" }));
  }

  return f.build({
    width,
    height,
    label: `A model-kit sprue holding ${titles.length === 0 ? "no parts yet" : `${titles.length} numbered part${titles.length === 1 ? "" : "s"}, one for every project`}. The first part is printed in green and a dashed empty tile waits for the next project.`,
  });
}
