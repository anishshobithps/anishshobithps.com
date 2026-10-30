import type { Scene } from "@/lib/iso/figure";
import { alertScene } from "@/lib/iso/scenes/alert";
import { blogsScene } from "@/lib/iso/scenes/blogs";
import { graphemeScene } from "@/lib/iso/scenes/grapheme";
import { resumeScene } from "@/lib/iso/scenes/resume";
import { stairsScene } from "@/lib/iso/scenes/stairs";
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
