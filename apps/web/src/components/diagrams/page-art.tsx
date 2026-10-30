import type { Scene } from "@repo/iso/figure";
import { blogsScene } from "@repo/iso/scenes/blogs";
import { brandingScene } from "@repo/iso/scenes/branding";
import { contactScene } from "@repo/iso/scenes/contact";
import { guestbookScene } from "@repo/iso/scenes/guestbook";
import { lateNightScene } from "@repo/iso/scenes/late-night";
import { notFoundScene } from "@repo/iso/scenes/not-found";
import { principlesScene } from "@repo/iso/scenes/principles";
import { privacyScene } from "@repo/iso/scenes/privacy";
import { projectsScene } from "@repo/iso/scenes/projects";
import { resumeScene } from "@repo/iso/scenes/resume";
import { tracesScene } from "@repo/iso/scenes/traces";
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
