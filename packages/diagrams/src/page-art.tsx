import type { Scene } from "@repo/iso/figure";
import { brandingScene } from "@repo/iso/scenes/branding";
import { contactScene } from "@repo/iso/scenes/contact";
import { guestbookScene } from "@repo/iso/scenes/guestbook";
import { lateNightScene } from "@repo/iso/scenes/late-night";
import { principlesScene } from "@repo/iso/scenes/principles";
import { projectsScene } from "@repo/iso/scenes/projects";
import { redactedScene } from "@repo/iso/scenes/redacted";
import { resumeScene } from "@repo/iso/scenes/resume";
import { type ShelfPost, shelfScene } from "@repo/iso/scenes/shelf";
import { siteMapScene } from "@repo/iso/scenes/site-map";
import { tracesScene } from "@repo/iso/scenes/traces";
import { IsoArt } from "@repo/diagrams/iso-art";

export type { ShelfPost };

const scenes = {
  blogs: (posts: ShelfPost[]) => shelfScene(posts),
  projects: (titles?: string[]) => projectsScene(titles),
  guestbook: (names?: string[]) => guestbookScene(names),
  resume: () => resumeScene(),
  privacy: () => redactedScene(),
  branding: () => brandingScene(),
  contact: () => contactScene(),
  notFound: () => siteMapScene(),
  lateNight: (posts?: number) => lateNightScene(posts),
  traces: (names?: string[]) => tracesScene(names),
  principles: () => principlesScene(),
} satisfies Record<string, (data: never) => Scene>;

type Scenes = typeof scenes;
type Name = keyof Scenes;
type DataOf<N extends Name> = Parameters<Scenes[N]>[0];
type Props<N extends Name> = { name: N } & ([DataOf<N>] extends [undefined]
  ? { data?: undefined }
  : undefined extends DataOf<N>
    ? { data?: NonNullable<DataOf<N>> }
    : { data: DataOf<N> });

const built = new Map<string, Scene>();
const LIMIT = 32;

export function PageArt<N extends Name>({ name, data }: Props<N>) {
  const key = `${name}:${data === undefined ? "" : JSON.stringify(data)}`;
  let scene = built.get(key);
  if (!scene) {
    if (built.size >= LIMIT) built.clear();
    scene = (scenes[name] as (data?: unknown) => Scene)(data);
    built.set(key, scene);
  }
  return <IsoArt scene={scene} />;
}
