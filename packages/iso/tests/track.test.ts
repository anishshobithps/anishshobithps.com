import { describe, expect, it } from "vitest";
import { Figure, sceneMarkup } from "../src/figure";

const projection = { origin: [0, 0] as [number, number], scale: 1, azimuth: 45, elevation: 30 };

function figure(period = 4) {
  return new Figure("t", projection, period);
}

describe("Figure.track", () => {
  it("records a two-frame track as offsets 0 and 1 with camelCased keys", () => {
    const f = figure();
    f.track("move", [
      { t: 0, css: "transform:translate(0px,0px)" },
      { t: 4, css: "transform:translate(10px,5px);transform-origin:0 0" },
    ]);
    const [track] = f.tracks;
    expect(track!.keyframes.map((frame) => frame.offset)).toEqual([0, 1]);
    expect(track!.keyframes[1]).toMatchObject({
      transform: "translate(10px,5px)",
      transformOrigin: "0 0",
    });
    expect(track!.duration).toBe(4);
    expect(track!.easing).toBe("linear");
    expect(track!.keyframes.every((frame) => !("easing" in frame))).toBe(true);
  });

  it("uses steps(1, end) on every keyframe when steps is set", () => {
    const f = figure();
    f.track(
      "blink",
      [
        { t: 0, css: "opacity:0" },
        { t: 2, css: "opacity:1" },
      ],
      { steps: true },
    );
    const [track] = f.tracks;
    expect(track!.easing).toBe("steps(1, end)");
    expect(track!.keyframes.every((frame) => frame.easing === "steps(1, end)")).toBe(true);
  });

  it("pads the first and last frames to the full period", () => {
    const f = figure(10);
    f.track("late", [
      { t: 2.5, css: "opacity:0.5" },
      { t: 5, css: "opacity:1" },
    ]);
    const offsets = f.tracks[0]!.keyframes.map((frame) => frame.offset);
    expect(offsets).toEqual([0, 0.25, 0.5, 1]);
  });

  it("marks the element with the track id and ignores empty tracks", () => {
    const f = figure();
    const attribute = f.track("spin", [{ t: 0, css: "opacity:1" }]);
    expect(attribute).toBe(`data-iso-track="${f.tracks[0]!.id}"`);
    expect(f.track("none", [])).toBe("");
    expect(f.tracks).toHaveLength(1);
  });

  it("keeps ids in sync between the markup and the scene tracks", () => {
    const f = figure();
    f.add(`<g ${f.track("a", [{ t: 0, css: "opacity:0" }, { t: 4, css: "opacity:1" }])}/>`);
    f.add(`<g ${f.track("b", [{ t: 0, css: "opacity:1" }, { t: 4, css: "opacity:0" }])}/>`);
    const scene = f.build({ width: 40, height: 30, label: "test" });
    expect(scene.tracks).toHaveLength(2);
    for (const track of scene.tracks) {
      expect(track.id.startsWith(`${scene.id}-`)).toBe(true);
      expect(scene.body).toContain(`data-iso-track="${track.id}"`);
    }
    expect(new Set(scene.tracks.map((track) => track.id)).size).toBe(2);
  });

  it("emits no stylesheet from the scene markup", () => {
    const f = figure();
    f.add(`<g ${f.track("a", [{ t: 0, css: "opacity:0" }, { t: 4, css: "opacity:1" }])}/>`);
    const scene = f.build({ width: 10, height: 10, label: "test" });
    expect(sceneMarkup(scene)).toBe(scene.body);
    expect(sceneMarkup(scene)).not.toContain("<style");
    expect(sceneMarkup(scene)).not.toContain("@keyframes");
  });
});
