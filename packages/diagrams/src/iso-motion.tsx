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
    const animations: Animation[] = [];
    for (const el of root.querySelectorAll("[data-iso-track]")) {
      const track = byId.get(el.getAttribute("data-iso-track") ?? "");
      if (!track) continue;
      const animation = el.animate(track.keyframes, {
        duration: track.duration * 1000,
        iterations: Infinity,
        easing: "linear",
      });
      animation.pause();
      animations.push(animation);
    }

    const stage = root.closest("[data-iso-stage]");
    const sync = () => {
      const active = stage?.hasAttribute("data-iso-active") ?? false;
      for (const animation of animations) {
        if (active) animation.play();
        else animation.pause();
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
      for (const animation of animations) animation.cancel();
    };
  }, [tracks, reduced]);

  return (
    <span ref={ref} className="contents">
      {children}
    </span>
  );
}
