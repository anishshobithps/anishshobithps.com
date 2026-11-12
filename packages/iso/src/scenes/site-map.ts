import { DASH, PLATE } from "../classes";
import { Figure, type Flat, type Hotspot, type Projection, type Scene } from "../figure";
import { circleD, greenPlate, hotspotOf, inkPath, paperPath, polyD, printText, rectD, shadowOf } from "../print";

const PROJECTION: Projection = { origin: [0, 0], scale: 1, azimuth: 45, elevation: 30 };

const OY = 24;
const SHEET = { x: 34, y: 34, w: 296, h: 206 };

const PLOTS = [
  { name: "projects", href: "/projects", x: 52, y: 54, w: 104, h: 66 },
  { name: "blogs", href: "/blogs", x: 172, y: 54, w: 136, h: 40 },
  { name: "resume", href: "/resume", x: 172, y: 108, w: 64, h: 46 },
  { name: "guestbook", href: "/guestbook", x: 248, y: 108, w: 60, h: 46 },
] as const;

type Plot = (typeof PLOTS)[number];

function detail(plot: Plot) {
  const { x, y, w } = plot;
  switch (plot.name) {
    case "projects":
      return Array.from({ length: 6 }, (_, i) => rectD(x + 8 + (i % 3) * 30, y + 26 + Math.floor(i / 3) * 18, 22, 12)).join("");
    case "blogs":
      return `M${x + 8} ${y + 25}H${x + w - 20}M${x + 8} ${y + 32}H${x + w - 56}`;
    case "resume":
      return `M${x + 8} ${y + 24}H${x + 56}M${x + 8} ${y + 31}H${x + 44}M${x + 8} ${y + 38}H${x + 50}`;
    case "guestbook":
      return [10, 30, 50].map((dx) => circleD(x + dx, y + 32, 3.4, 14)).join("");
  }
}

function registrationMark(f: Figure, cx: number, cy: number) {
  const ink = inkPath(`${circleD(cx, cy, 4.5, 20)}M${cx - 8} ${cy}H${cx + 8}M${cx} ${cy - 8}V${cy + 8}`);
  const green = greenPlate(f, rectD(cx - 8, cy - 0.6, 16, 1.2) + rectD(cx - 0.6, cy - 8, 1.2, 16));
  return ink + green;
}

function pinShape(cx: number, cy: number, r: number) {
  const points: Flat[] = [];
  for (let degrees = 60; degrees >= -240; degrees -= 15) {
    const a = (degrees * Math.PI) / 180;
    points.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  points.push([cx, cy + r * 2.3]);
  return polyD(points);
}

export function siteMapScene(width = 400, height = 300): Scene {
  const f = new Figure("sitemap", PROJECTION, 1.4);
  const sheet = rectD(SHEET.x, SHEET.y, SHEET.w, SHEET.h);
  const body: string[] = [];

  body.push(registrationMark(f, SHEET.x + SHEET.w / 2, 14), registrationMark(f, 14, SHEET.y + SHEET.h / 2));
  body.push(shadowOf(f, sheet, [5, 5], "mid"), paperPath(sheet), inkPath(sheet));

  const hotspots: Hotspot[] = [];
  for (const plot of PLOTS) {
    const shape = rectD(plot.x, plot.y, plot.w, plot.h);
    body.push(shadowOf(f, shape, [3, 3], "mid"), paperPath(shape), inkPath(shape));
    body.push(printText(`translate(${plot.x + 8} ${plot.y + 13})`, plot.name, { size: 7 }), inkPath(detail(plot)));
    const spot = hotspotOf([[plot.x, plot.y + OY], [plot.x + plot.w, plot.y + plot.h + OY]], plot.href, `Go to ${plot.name}`, 0);
    hotspots.push(spot);
  }

  const start: Flat = [84, 188];
  const end: Flat = [352, 218];
  const path: Flat[] = Array.from({ length: 41 }, (_, i): Flat => {
    const t = i / 40;
    return [start[0] + t * (end[0] - start[0]), start[1] + t * (end[1] - start[1]) + Math.sin(t * Math.PI * 5) * 10 * (1 - t * 0.3)];
  });
  body.push(inkPath(path.map(([x, y], i) => `${i ? "L" : "M"}${Math.round(x * 10) / 10} ${Math.round(y * 10) / 10}`).join(""), DASH));
  body.push(paperPath(circleD(start[0], start[1], 3.4, 14)), inkPath(circleD(start[0], start[1], 3.4, 14)));

  const pinX = 364;
  const pinY = 196;
  const frames = Array.from({ length: 12 }, (_, i) => {
    const t = (i / 11) * 0.9;
    const lift = -7 * (1 - (((2 * t) / 0.9) - 1) ** 2);
    return { t, css: `transform:translate(0px,${Math.round(lift * 100) / 100}px)` };
  });
  const bounce = f.track("pin", frames);
  body.push(shadowOf(f, circleD(pinX, pinY + 28, 7, 14), [0, 0], "mid"));
  const shape = pinShape(pinX, pinY, 9);
  body.push(
    `<g ${bounce}><g class="${PLATE.isolate}">${paperPath(shape)}${greenPlate(f, shape)}${inkPath(shape, PLATE.blend)}${paperPath(circleD(pinX, pinY, 3.4, 14))}${inkPath(circleD(pinX, pinY, 3.4, 14))}</g></g>`,
  );

  f.add(`<g transform="translate(0 ${OY})">${body.join("")}</g>`);

  return f.build({
    width,
    height,
    hotspots,
    label: "A map of this site drawn as four plots inside a sheet border: projects, blogs, resume and guestbook. A dashed trail leaves the sheet to a green pin standing in the blank margin, as if this page were off the map.",
  });
}
