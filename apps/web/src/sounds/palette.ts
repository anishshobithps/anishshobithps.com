import type { CueName } from "@/lib/sound-cues";
import type { SoundAsset } from "@/lib/sound-types";
import { back001Sound } from "@/sounds/back-001";
import { bookFlip3Sound } from "@/sounds/book-flip-3";
import { bookOpenSound } from "@/sounds/book-open";
import { cardPlace2Sound } from "@/sounds/card-place-2";
import { click004Sound } from "@/sounds/click-004";
import { close001Sound } from "@/sounds/close-001";
import { confirmation003Sound } from "@/sounds/confirmation-003";
import { drop002Sound } from "@/sounds/drop-002";
import { drop003Sound } from "@/sounds/drop-003";
import { drop004Sound } from "@/sounds/drop-004";
import { error008Sound } from "@/sounds/error-008";
import { impactGenericLight001Sound } from "@/sounds/impact-generic-light-001";
import { impactSoftMedium001Sound } from "@/sounds/impact-soft-medium-001";
import { maximize007Sound } from "@/sounds/maximize-007";
import { minimize003Sound } from "@/sounds/minimize-003";
import { open001Sound } from "@/sounds/open-001";
import { pepSound3Sound } from "@/sounds/pep-sound-3";
import { pluck001Sound } from "@/sounds/pluck-001";
import { pluck002Sound } from "@/sounds/pluck-002";
import { question003Sound } from "@/sounds/question-003";
import { select004Sound } from "@/sounds/select-004";
import { select007Sound } from "@/sounds/select-007";
import { switchOffSound } from "@/sounds/switch-off";
import { switchOnSound } from "@/sounds/switch-on";

interface Cue {
  readonly sound: SoundAsset;
  readonly gain: number;
  readonly cooldownMs: number;
}

const DEFAULT_COOLDOWN_MS = 80;

function cue(
  sound: SoundAsset,
  gain: number,
  cooldownMs = DEFAULT_COOLDOWN_MS,
): Cue {
  return { sound, gain, cooldownMs };
}

export const palette: Record<CueName, Cue> = {
  tap: cue(click004Sound, 0.55, 40),
  select: cue(select007Sound, 0.5, 40),
  toggleOn: cue(switchOnSound, 0.8),
  toggleOff: cue(switchOffSound, 0.7),
  open: cue(open001Sound, 0.6),
  close: cue(close001Sound, 0.5),
  pin: cue(impactGenericLight001Sound, 0.55),
  flip: cue(bookFlip3Sound, 0.65),
  read: cue(bookOpenSound, 0.6),
  copy: cue(pluck002Sound, 0.7),
  success: cue(confirmation003Sound, 0.75, 200),
  error: cue(error008Sound, 0.6, 200),
  info: cue(question003Sound, 0.6, 200),
  post: cue(cardPlace2Sound, 0.9, 200),
  like: cue(pluck001Sound, 0.7),
  unlike: cue(back001Sound, 0.5),
  moodTerrible: cue(impactSoftMedium001Sound, 0.6),
  moodBad: cue(drop003Sound, 0.6),
  moodGood: cue(select004Sound, 0.7),
  moodAmazing: cue(pepSound3Sound, 0.85),
  remove: cue(minimize003Sound, 0.6),
  download: cue(drop004Sound, 0.7),
  top: cue(maximize007Sound, 0.55),
  drop: cue(drop002Sound, 0.7),
};

export type Palette = typeof palette;
