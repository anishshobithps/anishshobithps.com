import type { CueName } from "@/lib/sound-cues";
import {
  decodeAudioData,
  getAudioContext,
  playSound,
} from "@/lib/sound-engine";
import { getSoundPreferences, setSoundEnabled } from "@/lib/sound-preferences";
import type { Palette } from "@/sounds/palette";

const MAX_VOICES = 6;

let context: AudioContext | null = null;
let voices = 0;
let paletteRequest: Promise<Palette | null> | null = null;
let warmRequest: Promise<void> | null = null;
const lastPlayed = new Map<CueName, number>();

export function volumeToGain(volume: number) {
  return volume * volume;
}

function isRunning(audioContext: AudioContext | null) {
  return audioContext?.state === "running";
}

function loadPalette() {
  paletteRequest ??= import("@/sounds/palette").then(
    (module) => module.palette,
    () => {
      paletteRequest = null;
      return null;
    },
  );
  return paletteRequest;
}

function warm() {
  warmRequest ??= loadPalette().then(async (palette) => {
    if (!palette) {
      warmRequest = null;
      return;
    }
    const sources = new Set(
      Object.values(palette).map((cue) => cue.sound.dataUri),
    );
    await Promise.allSettled([...sources].map(decodeAudioData));
  });
  return warmRequest;
}

export function preloadSounds() {
  void loadPalette();
}

export async function unlockAudio() {
  if (typeof window === "undefined") return false;
  context ??= getAudioContext();
  if (isRunning(context)) return true;
  try {
    await context.resume();
  } catch {
    return false;
  }
  const running = isRunning(context);
  if (running) void warm();
  return running;
}

export function playCue(name: CueName) {
  if (typeof document === "undefined" || document.hidden) return;
  const { enabled, volume } = getSoundPreferences();
  if (!enabled || !isRunning(context)) return;

  void loadPalette().then((palette) => {
    const cue = palette?.[name];
    if (!cue || voices >= MAX_VOICES) return;

    const now = performance.now();
    const last = lastPlayed.get(name);
    if (last !== undefined && now - last < cue.cooldownMs) return;
    lastPlayed.set(name, now);

    voices += 1;
    playSound(cue.sound.dataUri, {
      volume: volumeToGain(volume) * cue.gain,
      onEnd: () => {
        voices -= 1;
      },
    }).catch(() => {
      voices -= 1;
    });
  });
}

export async function enableSound() {
  setSoundEnabled(true);
  preloadSounds();
  if (await unlockAudio()) playCue("toggleOn");
}

export function disableSound() {
  playCue("toggleOff");
  setSoundEnabled(false);
}
