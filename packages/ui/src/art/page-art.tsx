import type { Scene } from "@repo/ui/art/figure";
import { brandingScene } from "@repo/ui/art/scenes/branding";
import { contactScene } from "@repo/ui/art/scenes/contact";
import { guestbookScene } from "@repo/ui/art/scenes/guestbook";
import { lateNightScene } from "@repo/ui/art/scenes/late-night";
import { principlesScene } from "@repo/ui/art/scenes/principles";
import { projectsScene } from "@repo/ui/art/scenes/projects";
import { redactedScene } from "@repo/ui/art/scenes/redacted";
import { resumeScene } from "@repo/ui/art/scenes/resume";
import { type ShelfPost, shelfScene } from "@repo/ui/art/scenes/shelf";
import { siteMapScene } from "@repo/ui/art/scenes/site-map";
import { tracesScene } from "@repo/ui/art/scenes/traces";
import { IsoArt } from "@repo/ui/art/iso-art";

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
