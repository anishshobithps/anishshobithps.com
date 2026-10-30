import type { Scene } from "@repo/iso/figure";
import { sceneMarkup } from "@repo/iso/figure";

export function IsoArt({ scene }: { scene: Scene }) {
  return (
    <svg
      viewBox={`0 0 ${scene.width} ${scene.height}`}
      aria-hidden="true"
      focusable="false"
      className="iso-art absolute inset-0 size-full"
      dangerouslySetInnerHTML={{ __html: sceneMarkup(scene) }}
    />
  );
}
