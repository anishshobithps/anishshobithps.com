import { useSyncExternalStore } from "react";

import {
  getServerSoundPreferences,
  getSoundPreferences,
  subscribeSoundPreferences,
} from "./sound-preferences";

export function useSoundPreferences() {
  return useSyncExternalStore(
    subscribeSoundPreferences,
    getSoundPreferences,
    getServerSoundPreferences,
  );
}
