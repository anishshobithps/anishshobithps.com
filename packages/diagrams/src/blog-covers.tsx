import type { Scene } from "@repo/iso/figure";
import { alertScene } from "@repo/iso/scenes/alert";
import { blogsScene } from "@repo/iso/scenes/blogs";
import { graphemeScene } from "@repo/iso/scenes/grapheme";
import { resumeScene } from "@repo/iso/scenes/resume";
import { stairsScene } from "@repo/iso/scenes/stairs";
import { IsoArt } from "./iso-art";

type Make = (width: number, height: number) => Scene;

const covers: Record<string, Make> = {
  "rcb-tickets-are-broken-so-i-built-an-alert-system-at-4am": alertScene,
  "the-hidden-architecture-of-emoji": graphemeScene,
  "making-my-resume-machine-readable": resumeScene,
  "i-never-thought-i-would-code-until-this-one-moment-changed-everything": stairsScene,
};

const built = new Map<string, Scene>();

export function BlogCover({ slug, zoom = false }: { slug: string; zoom?: boolean }) {
  const key = `${slug}:${zoom ? "4:3" : "16:9"}`;
  let scene = built.get(key);
  if (!scene) {
    scene = (covers[slug] ?? blogsScene)(400, zoom ? 300 : 225);
    built.set(key, scene);
  }
  return <IsoArt scene={scene} />;
}
