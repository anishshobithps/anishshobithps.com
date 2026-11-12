"use client";

import type { Track } from "@repo/iso/figure";
import { usePrefersReducedMotion } from "@repo/ui/hooks/use-prefers-reduced-motion";
import { type ReactNode, useEffect, useRef } from "react";

export function IsoMotion({
  tracks,
  children,
}: {
  tracks: Track[];
  children: ReactNode;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const root = ref.current;
    if (!root || reduced) return;

    const byId = new Map(tracks.map((track) => [track.id, track]));
    const animations: Array<{ animation: Animation; once: boolean }> = [];
    for (const el of root.querySelectorAll("[data-iso-track]")) {
      const track = byId.get(el.getAttribute("data-iso-track") ?? "");
      if (!track) continue;
      const once = track.once === true;
      const animation = el.animate(track.keyframes, {
        duration: track.duration * 1000,
        iterations: once ? 1 : Infinity,
        easing: "linear",
      });
      animation.pause();
      animations.push({ animation, once });
    }

    const stage = root.closest("[data-iso-stage]");
    let wasActive = false;
    const sync = () => {
      const active = stage?.hasAttribute("data-iso-active") ?? false;
      const entering = active && !wasActive;
      wasActive = active;
      for (const { animation, once } of animations) {
        if (active) {
          if (once && entering) animation.currentTime = 0;
          animation.play();
        } else {
          animation.pause();
        }
      }
    };
    sync();

    const observer = new MutationObserver(sync);
    if (stage) {
      observer.observe(stage, {
        attributes: true,
        attributeFilter: ["data-iso-active"],
      });
    }

    return () => {
      observer.disconnect();
      for (const { animation } of animations) animation.cancel();
    };
  }, [tracks, reduced]);

  return (
    <span ref={ref} className="contents">
      {children}
    </span>
  );
}
