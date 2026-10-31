import type { Scene } from "@repo/iso/figure";
import { sceneMarkup } from "@repo/iso/figure";
import { IsoMotion } from "./iso-motion";

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
