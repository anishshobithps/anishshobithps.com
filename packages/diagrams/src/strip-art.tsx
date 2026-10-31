import type { Scene } from "@repo/iso/figure";
import { nightShelfScene } from "@repo/iso/scenes/night-shelf";
import { workbenchScene } from "@repo/iso/scenes/workbench";
import { IsoArt } from "./iso-art";

type Make = (width: number, height: number) => Scene;

const strips = {
  workbench: { make: workbenchScene, width: 960, height: 230 },
  nightShelf: { make: nightShelfScene, width: 960, height: 200 },
} satisfies Record<string, { make: Make; width: number; height: number }>;

export type StripName = keyof typeof strips;

const built = new Map<StripName, Scene>();

export function StripArt({ name }: { name: StripName }) {
  let scene = built.get(name);
  if (!scene) {
    const { make, width, height } = strips[name];
    scene = make(width, height);
    built.set(name, scene);
  }
  return <IsoArt scene={scene} slice />;
}
