import { describe, expect, it } from "vitest";
import { Figure, k } from "../src/figure";
import { greenPlate, printSolid, REGISTER, rectD, SETTLE_FROM, SETTLE_TIME } from "../src/print";

const projection = { origin: [0, 0] as [number, number], scale: 4, azimuth: 60, elevation: 30, oblique: 0.8 };

function figure() {
  return new Figure("p", projection, 4);
}

describe("print kit", () => {
  it("records one settle track per figure however many plates it prints", () => {
    const f = figure();
    f.add(greenPlate(f, rectD(0, 0, 10, 10)), greenPlate(f, rectD(20, 0, 10, 10)));
    expect(f.tracks).toHaveLength(1);
    const [track] = f.tracks;
    expect(track!.once).toBe(true);
    expect(track!.duration).toBe(SETTLE_TIME);
    expect(track!.keyframes[0]).toMatchObject({
      easing: "ease-out",
      transform: `translate(${SETTLE_FROM[0] - REGISTER[0]}px,${SETTLE_FROM[1] - REGISTER[1]}px)`,
    });
    expect(track!.keyframes[1]).toMatchObject({ transform: "translate(0px,0px)" });
  });

  it("shifts every green plate by the same register", () => {
    const f = figure();
    f.add(greenPlate(f, rectD(0, 0, 10, 10)));
    const scene = f.build({ width: 40, height: 30, label: "test" });
    expect(scene.body).toContain(`transform="translate(${REGISTER[0]} ${REGISTER[1]})"`);
  });

  it("prints a subject on isolated green and a plain solid on paper only", () => {
    const f = figure();
    const solid = k.slabOf({ x: 0, y: 0, w: 10, d: 10, r: 0 }, 0, 12, f.P as never, 1);
    const subject = printSolid(f, solid, { subject: true });
    const plain = printSolid(f, solid);
    expect(subject).toContain("fill-iso-plate-green");
    expect(subject).toContain("isolate");
    expect(subject).toContain("mix-blend-multiply");
    expect(plain).not.toContain("fill-iso-plate-green");
    expect(plain).not.toContain("mix-blend");
  });

  it("defines the three halftone screens once, with ids that survive the build rename", () => {
    const f = figure();
    const solid = k.slabOf({ x: 0, y: 0, w: 10, d: 10, r: 0 }, 0, 12, f.P as never, 1);
    f.add(printSolid(f, solid), printSolid(f, solid));
    const scene = f.build({ width: 40, height: 30, label: "test" });
    expect(scene.body.match(/<pattern /g)).toHaveLength(3);
    for (const level of ["hi", "mid", "lo"]) {
      expect(scene.body).toContain(`id="${scene.id}-scr-${level}"`);
    }
    expect(scene.body).not.toContain(`url(#p-scr`);
  });
});
