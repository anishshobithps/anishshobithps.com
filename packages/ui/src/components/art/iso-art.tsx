import type { Scene } from "@repo/ui/art/figure";
import { sceneMarkup } from "@repo/ui/art/figure";
import { IsoMotion } from "@repo/ui/components/art/iso-motion";

export function IsoArt({ scene, slice = false }: { scene: Scene; slice?: boolean }) {
  const art = (
    <svg
      viewBox={`0 0 ${scene.width} ${scene.height}`}
      aria-hidden="true"
      focusable="false"
      data-iso-art=""
      preserveAspectRatio={slice ? "xMidYMid slice" : undefined}
      className="absolute inset-0 size-full overflow-visible"
      dangerouslySetInnerHTML={{ __html: sceneMarkup(scene) }}
    />
  );

  if (scene.tracks.length === 0) return art;
  return <IsoMotion tracks={scene.tracks}>{art}</IsoMotion>;
}
