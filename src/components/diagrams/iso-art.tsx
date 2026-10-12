import type { Scene } from "@/lib/iso/figure";
import { sceneMarkup } from "@/lib/iso/figure";

/**
 * A drawn scene from `@/lib/iso`. The markup is built once on the server;
 * motion is CSS that runs while the surrounding `IsoStage` is in view.
 */
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
