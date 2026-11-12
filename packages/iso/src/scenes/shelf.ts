import { DASH, PLATE } from "../classes";
import { Figure, k, type Projection, type Scene } from "../figure";
import { groundDots, inkPath, OBLIQUE, polyD, printSolid, printText, screenPath } from "../print";

export interface ShelfPost {
  number: number;
  minutes: number;
}

const DEPTH = 40;
const GAP = 1.4;
const MAX_BOOKS = 12;
const GHOST_WIDTH = 14;

interface Book {
  post: ShelfPost;
  x: number;
  y: number;
  w: number;
  h: number;
  newest: boolean;
}

const planOf = (x: number, y: number, w: number, d: number) => ({ x, y, w, d, r: 0 });
const heightOf = (number: number) => 64 + ((number * 37) % 5) * 5;

export function shelfScene(posts: ShelfPost[], width = 400, height = 300): Scene {
  const list = [...posts].sort((a, b) => b.number - a.number).slice(0, MAX_BOOKS).reverse();
  const crowd = Math.max(1, list.length / 6);
  let cursor = 0;
  const books: Book[] = list.map((post, index) => {
    const w = (10 + Math.min(post.minutes, 16) * 1.1) / Math.sqrt(crowd);
    const book = {
      post,
      x: cursor,
      y: index === list.length - 1 ? 9 : 0,
      w,
      h: heightOf(post.number),
      newest: index === list.length - 1,
    };
    cursor += w + GAP;
    return book;
  });
  const next = (list.at(-1)?.number ?? 0) + 1;
  const ghost = { x: cursor, w: GHOST_WIDTH / Math.sqrt(crowd), h: heightOf(next) };
  const length = ghost.x + ghost.w;
  const end = planOf(-5, -3, 3, DEPTH + 6);

  const points = [
    ...k.boxCorners(end, 0, 72),
    ...books.flatMap((b) => k.boxCorners(planOf(b.x, b.y, b.w, DEPTH), 0, b.h)),
    ...k.boxCorners(planOf(ghost.x, 0, ghost.w, DEPTH), 0, ghost.h),
  ];
  const P = k.fitProjection(points, width, height, { pad: 24, azimuth: 72, oblique: OBLIQUE }) as Projection;
  const f = new Figure("shelf", P, 4);

  f.add(groundDots(f, [length / 2, DEPTH / 2], Math.max(length, DEPTH) * 0.95));

  for (const b of books) {
    const reach = b.h * 0.28;
    const ground = (x: number, y: number) => f.at([x, y, 0]);
    f.add(
      screenPath(
        f,
        polyD([ground(b.x + b.w, b.y), ground(b.x + b.w + reach, b.y - reach * 0.58), ground(b.x + b.w + reach, b.y + DEPTH - reach * 0.58), ground(b.x + b.w, b.y + DEPTH)]),
        "lo",
      ),
    );
  }

  type Item = { at: [number, number, number]; draw: () => string };
  const items: Item[] = [
    { at: [end.x + end.w / 2, end.y + end.d / 2, 0], draw: () => printSolid(f, k.slabOf(end, 0, 72, P, 1)) },
    {
      at: [ghost.x + ghost.w / 2, DEPTH / 2, 0],
      draw: () => {
        const solid = k.slabOf(planOf(ghost.x, 0, ghost.w, DEPTH), 0, ghost.h, P, 1);
        const face = k.sideMatrix([ghost.x, DEPTH], ghost.h, P, "left");
        return (
          inkPath(solid.outline, DASH) +
          inkPath(solid.crease, DASH) +
          printText(`${face} translate(${ghost.w / 2} 11)`, String(next).padStart(2, "0"), { size: 6.5, anchor: "middle", extra: "opacity-50" })
        );
      },
    },
    ...books.map((b): Item => {
      const plan = planOf(b.x, b.y, b.w, DEPTH);
      return {
        at: [b.x + b.w / 2, b.y + DEPTH / 2, 0],
        draw: () => {
          const face = k.sideMatrix([b.x, b.y + DEPTH], b.h, P, "left");
          const blend = b.newest ? PLATE.blend : "";
          return (
            printSolid(f, k.slabOf(plan, 0, b.h, P, 1), { subject: b.newest, screens: ["hi", "mid", null, null] }) +
            `<g transform="${face}">${inkPath(`M0 ${b.h - 17}H${b.w}M0 ${b.h - 14}H${b.w}`, blend)}</g>` +
            printText(`${face} translate(${b.w / 2} 11)`, String(b.post.number).padStart(2, "0"), { size: 6.5, anchor: "middle", extra: blend })
          );
        },
      };
    }),
  ];
  items.sort((a, b) => k.depthOf(a.at, P) - k.depthOf(b.at, P));
  for (const item of items) f.add(item.draw());

  return f.build({
    width,
    height,
    label: "A shelf of book spines, one for every post, thicker for longer reads and numbered to match the post cards. The newest sits slightly pulled out, printed in green, and a dashed empty slot waits for the next one.",
  });
}
