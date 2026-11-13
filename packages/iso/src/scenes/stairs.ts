import { Figure, k, type Flat, type Projection, type Scene } from "@repo/iso/figure";
import { groundDots, inkPath, logoD, OBLIQUE, paperPath, printSolid, shadowOf } from "@repo/iso/print";

const STEPS = 6;
const STEP_W = 22;
const STEP_D = 34;
const RISE = 9;
const MASCOT_ON = 1;
const NEXT = 3;

export function stairsScene(width = 400, height = 225): Scene {
  const plans = Array.from({ length: STEPS }, (_, i) => ({ x: -i * STEP_W, y: 0, w: STEP_W - 2, d: STEP_D, r: 0 }));
  const heightOf = (i: number) => (i + 1) * RISE;
  const points = plans.flatMap((plan, i) => k.boxCorners(plan, 0, heightOf(i)));
  const P = k.fitProjection(points, width, height, { pad: 20, azimuth: 40, oblique: OBLIQUE }) as Projection;
  const f = new Figure("stairs", P, 4);

  f.add(groundDots(f, [-(STEPS * STEP_W) / 2, STEP_D / 2], STEPS * STEP_W * 0.9));

  const order = plans.map((_, i) => i).sort((a, b) => k.depthOf([plans[a]!.x, 0, 0], P) - k.depthOf([plans[b]!.x, 0, 0], P));
  for (const i of order) {
    const plan = plans[i]!;
    const h = heightOf(i);
    f.add(printSolid(f, k.slabOf(plan, 0, h, P, 1), { subject: i === NEXT, screens: ["hi", "mid", null, null] }));
    f.add(inkPath(k.planOutline(k.insetPlan(plan, 3), h, P, 1)));
    if (i === MASCOT_ON) {
      const [mx, my] = f.at([plan.x + plan.w / 2, plan.y + plan.d / 2, h]) as Flat;
      const size = 44;
      const mark = logoD(mx - size / 2, my - size * 0.93, size);
      f.add(shadowOf(f, mark, [2, 2], "mid"), paperPath(mark), inkPath(mark));
    }
  }

  return f.build({
    width,
    height,
    label: "A staircase built from keycaps. A small mascot stands partway up, and the next step is printed in green.",
  });
}
