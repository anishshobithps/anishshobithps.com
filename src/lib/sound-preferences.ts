export interface SoundPreferences {
  readonly enabled: boolean;
  readonly volume: number;
}

export const STORAGE_KEY = "sound:preferences";

const DEFAULT_PREFERENCES: SoundPreferences = { enabled: false, volume: 0.6 };

let current = DEFAULT_PREFERENCES;
let loaded = false;
const listeners = new Set<() => void>();

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

function readStorage() {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStorage(preferences: SoundPreferences) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    void 0;
  }
}

function emit() {
  for (const listener of listeners) listener();
}

function isSame(a: SoundPreferences, b: SoundPreferences) {
  return a.enabled === b.enabled && a.volume === b.volume;
}

function onStorage(event: StorageEvent) {
  if (event.key !== null && event.key !== STORAGE_KEY) return;
  loaded = true;
  const next = parse(event.newValue);
  if (isSame(next, current)) return;
  current = next;
  emit();
}

export function getSoundPreferences(): SoundPreferences {
  if (!loaded && typeof window !== "undefined") {
    loaded = true;
    current = parse(readStorage());
  }
  return current;
}

export function getServerSoundPreferences(): SoundPreferences {
  return DEFAULT_PREFERENCES;
}

export function subscribeSoundPreferences(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

function update(patch: Partial<SoundPreferences>) {
  const base = getSoundPreferences();
  const next: SoundPreferences = {
    enabled: patch.enabled ?? base.enabled,
    volume: patch.volume === undefined ? base.volume : clampVolume(patch.volume),
  };
  if (isSame(next, base)) return;
  current = next;
  writeStorage(next);
  emit();
}

export function setSoundEnabled(enabled: boolean) {
  update({ enabled });
}

export function setSoundVolume(volume: number) {
  update({ volume });
}
