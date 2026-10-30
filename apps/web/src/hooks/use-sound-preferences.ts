import { useSyncExternalStore } from "react";

import {
  getServerSoundPreferences,
  getSoundPreferences,
  subscribeSoundPreferences,
} from "@/lib/sound-preferences";

export function useSoundPreferences() {
  return useSyncExternalStore(
    subscribeSoundPreferences,
    getSoundPreferences,
    getServerSoundPreferences,
  );
}
