import { createStoredValue } from "@repo/core/store";

export interface SoundPreferences {
  readonly enabled: boolean;
  readonly volume: number;
}

export const STORAGE_KEY = "sound:preferences";

const DEFAULT_PREFERENCES: SoundPreferences = { enabled: false, volume: 0.6 };

function clampVolume(value: number) {
  return Math.min(1, Math.max(0, value));
}

function parse(raw: string | null): SoundPreferences {
  if (!raw) return DEFAULT_PREFERENCES;
  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value !== "object" || value === null) {
      return DEFAULT_PREFERENCES;
    }
    const { enabled, volume } = value as Record<string, unknown>;
    return {
      enabled: enabled === true,
      volume:
        typeof volume === "number" && Number.isFinite(volume)
          ? clampVolume(volume)
          : DEFAULT_PREFERENCES.volume,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

const preferences = createStoredValue<SoundPreferences>({
  key: STORAGE_KEY,
  fallback: DEFAULT_PREFERENCES,
  parse,
  serialize: (value) => JSON.stringify(value),
  equal: (a, b) => a.enabled === b.enabled && a.volume === b.volume,
});

export const getSoundPreferences = preferences.get;
export const getServerSoundPreferences = preferences.getServer;
export const subscribeSoundPreferences = preferences.subscribe;

export function setSoundEnabled(enabled: boolean) {
  preferences.set({ ...preferences.get(), enabled });
}

export function setSoundVolume(volume: number) {
  preferences.set({ ...preferences.get(), volume: clampVolume(volume) });
}
