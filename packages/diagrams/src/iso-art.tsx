import { HOTSPOT } from "@repo/iso/classes";
import type { Scene } from "@repo/iso/figure";
import { sceneMarkup } from "@repo/iso/figure";
import type { Route } from "next";
import Link from "next/link";
import { IsoMotion } from "./iso-motion";

export function IsoArt({ scene, slice = false }: { scene: Scene; slice?: boolean }) {
  const hotspots = scene.hotspots ?? [];
  const interactive = hotspots.length > 0;
  const art = (
    <svg
      viewBox={`0 0 ${scene.width} ${scene.height}`}
      aria-hidden={interactive ? undefined : "true"}
      role={interactive ? "group" : undefined}
      aria-label={interactive ? scene.label : undefined}
      focusable="false"
      data-iso-art=""
      preserveAspectRatio={slice ? "xMidYMid slice" : undefined}
      className="absolute inset-0 size-full overflow-visible"
    >
      <g dangerouslySetInnerHTML={{ __html: sceneMarkup(scene) }} />
      {hotspots.map((spot) => (
        <Link
          key={`${spot.href}:${spot.x}:${spot.y}`}
          href={spot.href as Route}
          aria-label={spot.label}
          className={HOTSPOT.link}
        >
          <rect
            x={spot.x}
            y={spot.y}
            width={spot.w}
            height={spot.h}
            rx={3}
            strokeWidth={1.25}
            vectorEffect="non-scaling-stroke"
            className={HOTSPOT.box}
          />
        </Link>
      ))}
    </svg>
  );

  if (scene.tracks.length === 0) return art;
  return <IsoMotion tracks={scene.tracks}>{art}</IsoMotion>;
}
