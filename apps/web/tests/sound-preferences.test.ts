import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type StorageListener = (event: {
  key: string | null;
  newValue: string | null;
}) => void;

function installWindow(initial?: string) {
  const store = new Map<string, string>();
  if (initial !== undefined) store.set("sound:preferences", initial);
  const storageListeners = new Set<StorageListener>();

  vi.stubGlobal("window", {
    localStorage: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
    },
    addEventListener: (type: string, listener: StorageListener) => {
      if (type === "storage") storageListeners.add(listener);
    },
    removeEventListener: (type: string, listener: StorageListener) => {
      if (type === "storage") storageListeners.delete(listener);
    },
  });

  return {
    store,
    dispatchStorage: (key: string | null, newValue: string | null) => {
      for (const listener of storageListeners) listener({ key, newValue });
    },
  };
}

async function loadStore() {
  vi.resetModules();
  return import("@/lib/sound-preferences");
}

describe("sound preferences", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("is off by default", async () => {
    installWindow();
    const prefs = await loadStore();
    expect(prefs.getSoundPreferences().enabled).toBe(false);
    expect(prefs.getSoundPreferences().volume).toBe(0.6);
  });

  it("serves a disabled snapshot on the server", async () => {
    const prefs = await loadStore();
    expect(prefs.getServerSoundPreferences()).toEqual({
      enabled: false,
      volume: 0.6,
    });
    expect(prefs.getSoundPreferences().enabled).toBe(false);
  });

  it("persists the opt-in and notifies subscribers once per change", async () => {
    const { store } = installWindow();
    const prefs = await loadStore();
    const listener = vi.fn();
    prefs.subscribeSoundPreferences(listener);

    prefs.setSoundEnabled(true);
    prefs.setSoundEnabled(true);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(prefs.getSoundPreferences().enabled).toBe(true);
    expect(JSON.parse(store.get("sound:preferences") ?? "{}")).toEqual({
      enabled: true,
      volume: 0.6,
    });
  });

  it("keeps the snapshot identity stable between changes", async () => {
    installWindow();
    const prefs = await loadStore();
    expect(prefs.getSoundPreferences()).toBe(prefs.getSoundPreferences());
    const before = prefs.getSoundPreferences();
    prefs.setSoundEnabled(false);
    expect(prefs.getSoundPreferences()).toBe(before);
  });

  it("restores saved preferences", async () => {
    installWindow(JSON.stringify({ enabled: true, volume: 0.25 }));
    const prefs = await loadStore();
    expect(prefs.getSoundPreferences()).toEqual({ enabled: true, volume: 0.25 });
  });

  it("falls back to defaults on corrupt storage", async () => {
    installWindow("{not json");
    const prefs = await loadStore();
    expect(prefs.getSoundPreferences()).toEqual({ enabled: false, volume: 0.6 });
  });

  it("only treats a literal true as opted in", async () => {
    installWindow(JSON.stringify({ enabled: "yes", volume: "loud" }));
    const prefs = await loadStore();
    expect(prefs.getSoundPreferences()).toEqual({ enabled: false, volume: 0.6 });
  });

  it("clamps volume from storage and from setters", async () => {
    installWindow(JSON.stringify({ enabled: true, volume: 9 }));
    const prefs = await loadStore();
    expect(prefs.getSoundPreferences().volume).toBe(1);
    prefs.setSoundVolume(-3);
    expect(prefs.getSoundPreferences().volume).toBe(0);
  });

  it("follows changes made in another tab", async () => {
    const { dispatchStorage } = installWindow();
    const prefs = await loadStore();
    const listener = vi.fn();
    const unsubscribe = prefs.subscribeSoundPreferences(listener);

    dispatchStorage(
      prefs.STORAGE_KEY,
      JSON.stringify({ enabled: true, volume: 0.4 }),
    );
    expect(prefs.getSoundPreferences()).toEqual({ enabled: true, volume: 0.4 });
    expect(listener).toHaveBeenCalledTimes(1);

    dispatchStorage("unrelated", "x");
    expect(listener).toHaveBeenCalledTimes(1);

    dispatchStorage(null, null);
    expect(prefs.getSoundPreferences().enabled).toBe(false);

    unsubscribe();
  });
});
