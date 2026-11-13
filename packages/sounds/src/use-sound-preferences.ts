import { useSyncExternalStore } from "react";

import {
  getServerSoundPreferences,
  getSoundPreferences,
  subscribeSoundPreferences,
} from "@repo/sounds/sound-preferences";

export function useSoundPreferences() {
  return useSyncExternalStore(
    subscribeSoundPreferences,
    getSoundPreferences,
    getServerSoundPreferences,
  );
}
