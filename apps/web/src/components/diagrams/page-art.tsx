import type { Scene } from "@/lib/iso/figure";
import { blogsScene } from "@/lib/iso/scenes/blogs";
import { brandingScene } from "@/lib/iso/scenes/branding";
import { contactScene } from "@/lib/iso/scenes/contact";
import { guestbookScene } from "@/lib/iso/scenes/guestbook";
import { lateNightScene } from "@/lib/iso/scenes/late-night";
import { notFoundScene } from "@/lib/iso/scenes/not-found";
import { principlesScene } from "@/lib/iso/scenes/principles";
import { privacyScene } from "@/lib/iso/scenes/privacy";
import { projectsScene } from "@/lib/iso/scenes/projects";
import { resumeScene } from "@/lib/iso/scenes/resume";
import { tracesScene } from "@/lib/iso/scenes/traces";
import { IsoArt } from "./iso-art";

const scenes = {
  blogs: () => blogsScene(),
  projects: () => projectsScene(),
  guestbook: () => guestbookScene(),
  resume: () => resumeScene(),
  privacy: () => privacyScene(),
  branding: () => brandingScene(),
  contact: () => contactScene(),
  notFound: () => notFoundScene(),
  lateNight: () => lateNightScene(),
  traces: () => tracesScene(),
  principles: () => principlesScene(),
} satisfies Record<string, () => Scene>;

const built = new Map<keyof typeof scenes, Scene>();

export function PageArt({ name }: { name: keyof typeof scenes }) {
  let scene = built.get(name);
  if (!scene) {
    scene = scenes[name]();
    built.set(name, scene);
  }
  return <IsoArt scene={scene} />;
}
