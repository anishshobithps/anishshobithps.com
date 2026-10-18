import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const engine = vi.hoisted(() => {
  const context = {
    state: "suspended" as "suspended" | "running",
    resume: vi.fn(),
  };
  context.resume.mockImplementation(async () => {
    context.state = "running";
  });
  return {
    context,
    getAudioContext: vi.fn(() => context),
    decodeAudioData: vi.fn(async () => ({})),
    playSound: vi.fn(async () => ({ stop: () => undefined })),
  };
});

vi.mock("@/lib/sound-engine", () => ({
  getAudioContext: engine.getAudioContext,
  decodeAudioData: engine.decodeAudioData,
  playSound: engine.playSound,
}));

vi.mock("@/sounds/palette", async () => {
  const { cueNames } = await import("@/lib/sound-cues");
  return {
    palette: Object.fromEntries(
      cueNames.map((name) => [
        name,
        { sound: { dataUri: `data:${name}` }, gain: 0.5, cooldownMs: 50 },
      ]),
    ),
  };
});

function installBrowser(initial?: { enabled: boolean; volume: number }) {
  const store = new Map<string, string>();
  if (initial) store.set("sound:preferences", JSON.stringify(initial));
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
    },
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  });
  vi.stubGlobal("document", { hidden: false });
}

async function load() {
  vi.resetModules();
  const player = await import("@/lib/sound-player");
  const prefs = await import("@/lib/sound-preferences");
  return { player, prefs };
}

describe("sound player", () => {
  beforeEach(() => {
    engine.context.state = "suspended";
    engine.context.resume.mockClear();
    engine.getAudioContext.mockClear();
    engine.decodeAudioData.mockClear();
    engine.playSound.mockClear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("maps the volume slider onto a perceptual curve", async () => {
    installBrowser();
    const { player } = await load();
    expect(player.volumeToGain(0)).toBe(0);
    expect(player.volumeToGain(0.5)).toBe(0.25);
    expect(player.volumeToGain(1)).toBe(1);
  });

  it("stays silent until the visitor opts in", async () => {
    installBrowser();
    const { player } = await load();
    await player.unlockAudio();
    player.playCue("tap");
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(engine.playSound).not.toHaveBeenCalled();
  });

  it("stays silent before the audio context is unlocked by a gesture", async () => {
    installBrowser({ enabled: true, volume: 0.6 });
    const { player } = await load();
    player.playCue("tap");
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(engine.playSound).not.toHaveBeenCalled();
    expect(engine.getAudioContext).not.toHaveBeenCalled();
  });

  it("plays a cue at master volume times cue gain once unlocked", async () => {
    installBrowser({ enabled: true, volume: 0.5 });
    const { player } = await load();
    await player.unlockAudio();

    player.playCue("copy");

    await vi.waitFor(() => expect(engine.playSound).toHaveBeenCalledTimes(1));
    expect(engine.playSound).toHaveBeenCalledWith(
      "data:copy",
      expect.objectContaining({ volume: 0.25 * 0.5 }),
    );
  });

  it("drops repeats of the same cue inside its cooldown", async () => {
    installBrowser({ enabled: true, volume: 0.6 });
    const { player } = await load();
    await player.unlockAudio();
    const now = vi.spyOn(performance, "now");

    now.mockReturnValue(1000);
    player.playCue("tap");
    await vi.waitFor(() => expect(engine.playSound).toHaveBeenCalledTimes(1));

    now.mockReturnValue(1020);
    player.playCue("tap");
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(engine.playSound).toHaveBeenCalledTimes(1);

    now.mockReturnValue(1100);
    player.playCue("tap");
    await vi.waitFor(() => expect(engine.playSound).toHaveBeenCalledTimes(2));
  });

  it("does not play while the tab is hidden", async () => {
    installBrowser({ enabled: true, volume: 0.6 });
    const { player } = await load();
    await player.unlockAudio();
    vi.stubGlobal("document", { hidden: true });

    player.playCue("tap");
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(engine.playSound).not.toHaveBeenCalled();
  });

  it("confirms the opt-in with a sound and persists it", async () => {
    installBrowser();
    const { player, prefs } = await load();

    await player.enableSound();

    expect(prefs.getSoundPreferences().enabled).toBe(true);
    await vi.waitFor(() =>
      expect(engine.playSound).toHaveBeenCalledWith(
        "data:toggleOn",
        expect.any(Object),
      ),
    );
  });

  it("plays the off cue and then goes quiet when disabled", async () => {
    installBrowser({ enabled: true, volume: 0.6 });
    const { player, prefs } = await load();
    await player.unlockAudio();

    player.disableSound();

    expect(prefs.getSoundPreferences().enabled).toBe(false);
    await vi.waitFor(() =>
      expect(engine.playSound).toHaveBeenCalledWith(
        "data:toggleOff",
        expect.any(Object),
      ),
    );

    engine.playSound.mockClear();
    player.playCue("tap");
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(engine.playSound).not.toHaveBeenCalled();
  });

  it("warms the palette once audio is unlocked", async () => {
    installBrowser({ enabled: true, volume: 0.6 });
    const { player } = await load();
    const { cueNames } = await import("@/lib/sound-cues");
    await player.unlockAudio();
    await vi.waitFor(() =>
      expect(engine.decodeAudioData).toHaveBeenCalledTimes(cueNames.length),
    );
  });
});
