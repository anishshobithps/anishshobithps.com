import { PLATE } from "@repo/iso/classes";
import { Figure, type Flat, type Projection, type Scene } from "@repo/iso/figure";
import { circleD, gearD, greenAt, inkPath, lineD, logoD, paperPath, polyD, rectD, REGISTER, screenPath } from "@repo/iso/print";

const PROJECTION: Projection = { origin: [0, 0], scale: 1, azimuth: 45, elevation: 30 };
const PERIOD = 4;
const SURFACE = 96;
const PRESS = 5;

export function principlesScene(width = 400, height = 225): Scene {
  const f = new Figure("surface", PROJECTION, PERIOD);
  const slab = rectD(30, SURFACE - 4, 340, 8);
  const ground = rectD(30, SURFACE + 4, 340, 108);
  const cavity = rectD(96, SURFACE + 12, 208, 90);

  f.add(screenPath(f, ground, "lo"), paperPath(cavity), inkPath(cavity));
  f.add(paperPath(slab), inkPath(slab));

  const gear = (name: string, cx: number, cy: number, r: number, teeth: number, turn: number) => {
    const spin = f.spinOf(name, [{ t: 0, angle: 0 }, { t: PERIOD, angle: turn }], { period: PERIOD, tolerance: 0.5 });
    const body = gearD(0, 0, r, teeth, 2);
    return `<g transform="translate(${cx} ${cy})"><g ${spin}>${paperPath(body)}${inkPath(body)}${inkPath(circleD(0, 0, r * 0.28, 14))}${inkPath(`M0 ${-r * 0.28}V${-r * 0.8}M${r * 0.28} 0H${r * 0.8}M0 ${r * 0.28}V${r * 0.8}M${-r * 0.28} 0H${-r * 0.8}`)}</g></g>`;
  };
  f.add(gear("pinion", 158, 150, 18, 10, Math.PI * 2));
  f.add(gear("wheel", 198, 158, 24, 13, (-Math.PI * 2 * 10) / 13));

  const box = rectD(246, 144, 40, 28);
  f.add(paperPath(box), screenPath(f, box, "mid"), inkPath(box), inkPath(lineD([[198, 158], [246, 158]])));
  f.add(inkPath(rectD(252, 150, 10, 5) + rectD(252, 160, 28, 3)));

  const spring = lineD(Array.from({ length: 9 }, (_, i): Flat => [200 + (i % 2 ? 9 : -9), 112 + i * 4.5]));
  f.add(inkPath(spring));

  const cap = polyD([[150, SURFACE - 4], [158, 56], [242, 56], [250, SURFACE - 4]]);
  const stems = rectD(190, SURFACE - 4, 6, 20) + rectD(204, SURFACE - 4, 6, 20);
  const dip = f.track(
    "key",
    [
      { t: 0, css: "transform:translate(0px,0px)" },
      { t: 1.4, css: "transform:translate(0px,0px)" },
      { t: 1.7, css: `transform:translate(0px,${PRESS}px)` },
      { t: 2.1, css: `transform:translate(0px,${PRESS}px)` },
      { t: 2.4, css: "transform:translate(0px,0px)" },
      { t: PERIOD, css: "transform:translate(0px,0px)" },
    ],
    { period: PERIOD },
  );
  f.add(
    `<g ${dip}>${paperPath(stems)}${inkPath(stems)}${paperPath(cap)}${greenAt(cap, REGISTER)}${inkPath(cap, PLATE.blend)}<path class="fill-iso-plate-ink stroke-none ${PLATE.blend}" d="${logoD(190, 62, 20)}"/></g>`,
  );

  return f.build({
    width,
    height,
    label: "A single keycap above a cut-away surface. Below it a spring, two meshing gears and a small switch do the work, and the key dips every few seconds to show the complexity stays underneath.",
  });
}
