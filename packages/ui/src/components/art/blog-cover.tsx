import type { Scene } from "@repo/ui/art/figure";
import { alertScene } from "@repo/ui/art/scenes/alert";
import { graphemeScene } from "@repo/ui/art/scenes/grapheme";
import { resumeCoverScene } from "@repo/ui/art/scenes/resume-cover";
import { sheetScene } from "@repo/ui/art/scenes/sheet";
import { stairsScene } from "@repo/ui/art/scenes/stairs";
import { IsoArt } from "@repo/ui/components/art/iso-art";

type Make = (width: number, height: number) => Scene;

const covers: Record<string, Make> = {
  "rcb-tickets-are-broken-so-i-built-an-alert-system-at-4am": alertScene,
  "the-hidden-architecture-of-emoji": graphemeScene,
  "making-my-resume-machine-readable": resumeCoverScene,
  "i-never-thought-i-would-code-until-this-one-moment-changed-everything": stairsScene,
};

const built = new Map<string, Scene>();

export function BlogCover({ slug, number, zoom = false }: { slug: string; number: number; zoom?: boolean }) {
  const height = zoom ? 300 : 225;
  const key = `${slug}:${covers[slug] ? "" : number}:${height}`;
  let scene = built.get(key);
  if (!scene) {
    const make = covers[slug];
    scene = make ? make(400, height) : sheetScene(number, slug, 400, height);
    built.set(key, scene);
  }
  return <IsoArt scene={scene} />;
}
