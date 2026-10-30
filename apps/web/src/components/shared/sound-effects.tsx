"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { useSoundPreferences } from "@/hooks/use-sound-preferences";
import { isCueName } from "@/lib/sound-cues";
import { playCue, preloadSounds, unlockAudio } from "@/lib/sound-player";

const PIN_DELAY_MS = 380;

function cueFromEvent(event: MouseEvent) {
  if (!(event.target instanceof Element)) return undefined;
  const cue = event.target.closest<HTMLElement>("[data-sound]")?.dataset.sound;
  return isCueName(cue) ? cue : undefined;
}

export function SoundEffects() {
  const { enabled } = useSoundPreferences();
  const pathname = usePathname();
  const previousPathname = useRef(pathname);

  useEffect(() => {
    if (!enabled) return;
    preloadSounds();

    const unlock = () => {
      void unlockAudio();
    };
    const onClick = (event: MouseEvent) => {
      const cue = cueFromEvent(event);
      if (cue) playCue(cue);
    };

    window.addEventListener("pointerdown", unlock, {
      capture: true,
      passive: true,
    });
    window.addEventListener("keydown", unlock, {
      capture: true,
      passive: true,
    });
    document.addEventListener("click", onClick, true);

    return () => {
      window.removeEventListener("pointerdown", unlock, true);
      window.removeEventListener("keydown", unlock, true);
      document.removeEventListener("click", onClick, true);
    };
  }, [enabled]);

  useEffect(() => {
    if (previousPathname.current === pathname) return;
    previousPathname.current = pathname;
    if (!enabled) return;

    const timer = window.setTimeout(() => playCue("pin"), PIN_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [pathname, enabled]);

  return null;
}
