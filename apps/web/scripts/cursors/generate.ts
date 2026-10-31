import { mkdir, writeFile } from "node:fs/promises";
import { themeColor } from "@repo/styles/theme-tokens";

type Theme = "light" | "dark";
type Point = [number, number];

interface Palette {
  ink: string;
  edge: string;
  brand: string;
  brandShade: string;
}

interface Placement {
  x: number;
  y: number;
  angle: number;
  scale: number;
}

interface Cursor {
  fallback: string;
  hotspot: Point;
  draw: (palette: Palette) => string;
}

const SIZE = 32;
const EDGE = 3;
const PUBLIC = new URL("../../public/cursors/", import.meta.url);
const STYLES = new URL("../../src/app/cursors.css", import.meta.url);
const THEMES: Theme[] = ["light", "dark"];

const BLADE = "32,4 50,56 40,56 32,32 24,56 14,56";
const BLADE_RIGHT = "32,4 50,56 40,56 32,32";
const APEX: Point = [32, 4];
const EYES: Point[] = [
  [19, 35],
  [34, 35],
];
const EYE = { width: 10, height: 5, rx: 2.5 };
const LEAN: Placement = { x: 3, y: 3, angle: -22, scale: 0.44 };

const BEAM = [
  { x: 11, y: 5, width: 10, height: 2.4 },
  { x: 14.8, y: 5, width: 2.4, height: 22 },
  { x: 11, y: 24.6, width: 10, height: 2.4 },
];

const OPEN_HAND: Point[] = [
  [1.2, 7.4],
  [3.5, 10.2],
  [3.5, 2],
  [6.5, 2],
  [6.5, 7],
  [7.3, 7],
  [7.3, 0],
  [10.3, 0],
  [10.3, 6],
  [11.1, 6],
  [11.1, 1],
  [14.1, 1],
  [14.1, 6.4],
  [14.9, 6.4],
  [14.9, 3.5],
  [17.9, 3.5],
  [17.9, 13.2],
  [15.6, 17.6],
  [8.8, 17.6],
  [4.6, 14.4],
  [0.2, 9.6],
];

const FIST: Point[] = [
  [1, 10.4],
  [3.6, 7.6],
  [3.6, 4.2],
  [6.8, 4.2],
  [6.8, 7],
  [7.3, 7],
  [7.3, 2.8],
  [10.5, 2.8],
  [10.5, 7],
  [11, 7],
  [11, 3.2],
  [14.2, 3.2],
  [14.2, 7],
  [14.7, 7],
  [14.7, 4.6],
  [17.9, 4.6],
  [17.9, 13.2],
  [15.6, 16.8],
  [7, 16.8],
  [3, 14.4],
  [1, 12.6],
];

function palette(theme: Theme): Palette {
  const token = (name: string) => themeColor(`var(--${name})`, theme);
  const brand = theme === "light" ? "brand" : "brand-text";
  return {
    ink: token("foreground"),
    edge: token("background"),
    brand: token(brand),
    brandShade: themeColor(
      `color-mix(in oklab, var(--${brand}) 64%, var(--background))`,
      theme,
    ),
  };
}

function svg(body: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">\n${body}\n</svg>\n`;
}

function shift(points: Point[], [dx, dy]: Point): Point[] {
  return points.map(([x, y]) => [x + dx, y + dy]);
}

function polygon(points: Point[] | string, attributes: string) {
  const list =
    typeof points === "string"
      ? points
      : points.map(([x, y]) => `${x},${y}`).join(" ");
  return `<polygon points="${list}" ${attributes}/>`;
}

function blade(
  { x, y, angle, scale }: Placement,
  left: string,
  right: string,
  edge: string,
  eyes?: string,
) {
  const halo = `fill="${edge}" stroke="${edge}" stroke-width="${EDGE / scale}" stroke-linejoin="round"`;
  const pill = (attributes: string) =>
    EYES.map(
      ([ex, ey]) =>
        `<rect x="${ex}" y="${ey}" width="${EYE.width}" height="${EYE.height}" rx="${EYE.rx}" ${attributes}/>`,
    ).join("");
  return [
    `<g transform="translate(${x} ${y}) rotate(${angle}) scale(${scale}) translate(${-APEX[0]} ${-APEX[1]})">`,
    polygon(BLADE, halo),
    ...(eyes ? [pill(`${halo}`)] : []),
    polygon(BLADE, `fill="${left}"`),
    polygon(BLADE_RIGHT, `fill="${right}"`),
    ...(eyes ? [pill(`fill="${eyes}"`)] : []),
    `</g>`,
  ].join("\n");
}

function beam(ink: string, edge: string) {
  const rects = (attributes: string) =>
    BEAM.map(
      (at) =>
        `<rect x="${at.x}" y="${at.y}" width="${at.width}" height="${at.height}" ${attributes}/>`,
    ).join("\n");
  return [
    rects(
      `fill="${edge}" stroke="${edge}" stroke-width="${EDGE}" stroke-linejoin="round"`,
    ),
    rects(`fill="${ink}"`),
  ].join("\n");
}

function hand(points: Point[], fill: string, edge: string) {
  return [
    polygon(
      points,
      `fill="${edge}" stroke="${edge}" stroke-width="${EDGE}" stroke-linejoin="round"`,
    ),
    polygon(points, `fill="${fill}"`),
  ].join("\n");
}

const CURSORS: Record<string, Cursor> = {
  arrow: {
    fallback: "default",
    hotspot: [3, 3],
    draw: ({ ink, brand, edge }) => svg(blade(LEAN, ink, brand, edge)),
  },
  pointer: {
    fallback: "pointer",
    hotspot: [3, 3],
    draw: ({ ink, brand, brandShade, edge }) =>
      svg(blade(LEAN, brand, brandShade, edge, ink)),
  },
  text: {
    fallback: "text",
    hotspot: [16, 16],
    draw: ({ ink, edge }) => svg(beam(ink, edge)),
  },
  grab: {
    fallback: "grab",
    hotspot: [16, 15],
    draw: ({ ink, edge }) => svg(hand(shift(OPEN_HAND, [7, 6]), ink, edge)),
  },
  grabbing: {
    fallback: "grabbing",
    hotspot: [16, 15],
    draw: ({ brand, edge }) => svg(hand(shift(FIST, [7, 7]), brand, edge)),
  },
};

function inline(markup: string) {
  const compact = markup
    .trim()
    .replace(/\s*\n\s*/g, "")
    .replace(/"/g, "'")
    .replace(/%/g, "%25")
    .replace(/#/g, "%23")
    .replace(/</g, "%3C")
    .replace(/>/g, "%3E");
  return `data:image/svg+xml,${compact}`;
}

function variables(drawings: Record<string, string>) {
  return Object.entries(CURSORS)
    .map(
      ([name, { hotspot, fallback }]) =>
        `  --cursor-${name}: url("${inline(drawings[name])}") ${hotspot[0]} ${hotspot[1]}, ${fallback};`,
    )
    .join("\n");
}

async function main() {
  await mkdir(PUBLIC, { recursive: true });
  const drawings = {} as Record<Theme, Record<string, string>>;
  for (const theme of THEMES) {
    const colors = palette(theme);
    drawings[theme] = {};
    for (const [name, { draw }] of Object.entries(CURSORS)) {
      drawings[theme][name] = draw(colors);
      await writeFile(
        new URL(`${name}-${theme}.svg`, PUBLIC),
        drawings[theme][name],
      );
    }
  }
  await writeFile(
    STYLES,
    `:root {\n${variables(drawings.light)}\n}\n\n.dark {\n${variables(drawings.dark)}\n}\n`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
