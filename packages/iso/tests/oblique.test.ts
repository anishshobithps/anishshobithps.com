import { describe, expect, it } from "vitest";
import { depthOf, extrude, fitProjection, iso, type Projection } from "@repo/iso/iso-kit";

const plan: Projection = { origin: [0, 0], scale: 10, azimuth: 60, oblique: 0.8 };

const length = (a: [number, number], b: [number, number]) => Math.hypot(b[0] - a[0], b[1] - a[1]);
const dot = (a: [number, number], b: [number, number], c: [number, number]) => (b[0] - a[0]) * (c[0] - a[0]) + (b[1] - a[1]) * (c[1] - a[1]);

describe("plan oblique projection", () => {
  it("keeps a floor square a square", () => {
    const a = iso([0, 0, 0], plan);
    const b = iso([1, 0, 0], plan);
    const c = iso([0, 1, 0], plan);
    expect(length(a, b)).toBeCloseTo(length(a, c), 6);
    expect(dot(a, b, c)).toBeCloseTo(0, 6);
  });

  it("draws heights straight up at the oblique factor", () => {
    const base = iso([3, 4, 0], plan);
    const up = iso([3, 4, 5], plan);
    expect(up[0]).toBeCloseTo(base[0], 6);
    expect(base[1] - up[1]).toBeCloseTo(5 * 0.8 * 10 * Math.sqrt(1.6), 6);
  });

  it("orders a nearer point after a farther one", () => {
    const near = depthOf([2, 2, 0], plan);
    const far = depthOf([-2, -2, 0], plan);
    expect(near).toBeGreaterThan(far);
    expect(depthOf([0, 0, 6], plan)).toBeGreaterThan(depthOf([0, 0, 0], plan));
  });

  it("matches the classic projection when oblique is unset", () => {
    const classic: Projection = { origin: [0, 0], scale: 10, azimuth: 60, elevation: 30 };
    const [x, y] = iso([1, 2, 3], classic);
    const [px] = iso([1, 2, 3], plan);
    expect(px).toBeCloseTo(x, 6);
    expect(iso([1, 2, 3], plan)[1]).not.toBeCloseTo(y, 3);
  });

  it("carries oblique through fitProjection and extrude", () => {
    const fitted = fitProjection([[0, 0, 0], [40, 20, 30]], 400, 300, { azimuth: 60, oblique: 0.8, pad: 20 });
    expect(fitted.oblique).toBe(0.8);
    const solid = extrude([[0, 0], [10, 0], [10, 10], [0, 10]], 0, 10, fitted);
    expect(solid.outline.length).toBeGreaterThan(0);
    expect(solid.top.length).toBeGreaterThan(0);
  });
});
