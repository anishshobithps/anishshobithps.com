export type Tone = "hi" | "mid" | "lo" | "faint";
export type LineTone = Tone | "lit";

export const LINE_ATTRS =
  'fill="none" stroke-width="0.7" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"';

export const SEAM_ATTRS = 'stroke-width="0.4" stroke-linejoin="round"';

export const SHEET_ATTRS =
  'stroke-width="0.7" stroke-linejoin="round" vector-effect="non-scaling-stroke"';

export const TEXT_ATTRS = 'fill="none" stroke-width="0.5" stroke-linecap="butt"';

export const INK_ATTRS =
  'fill="none" stroke-width="1.15" stroke-linecap="round" stroke-linejoin="round"';

export const TONE_STROKE = {
  hi: "stroke-iso-hi",
  mid: "stroke-iso-mid",
  lo: "stroke-iso-lo",
  faint: "stroke-iso-faint",
  lit: "stroke-iso-lit",
} as const satisfies Record<LineTone, string>;

export const SHADE_FILL = [
  "fill-iso-shade-0",
  "fill-iso-shade-1",
  "fill-iso-shade-2",
  "fill-iso-shade-3",
] as const;

export const SHADE_STROKE = [
  "stroke-iso-shade-0",
  "stroke-iso-shade-1",
  "stroke-iso-shade-2",
  "stroke-iso-shade-3",
] as const;

export const FACE_FILL = {
  paper: "fill-iso-paper",
  top: "fill-iso-top",
  "0": "fill-iso-shade-0",
  "1": "fill-iso-shade-1",
  "2": "fill-iso-shade-2",
  "3": "fill-iso-shade-3",
  lit: "fill-iso-lit-top",
  sheet: "fill-iso-sheet",
  ink: "fill-iso-ink",
} as const;

export type FaceFill = keyof typeof FACE_FILL;

export const FACE_TEXT = {
  hi: "fill-iso-hi font-mono tracking-[0.04em]",
  mid: "fill-iso-mid font-mono tracking-[0.04em]",
  lo: "fill-iso-lo font-mono tracking-[0.04em]",
  faint: "fill-iso-mid font-mono tracking-[0.04em]",
  lit: "fill-iso-lit font-mono tracking-[0.04em]",
} as const satisfies Record<LineTone, string>;

export const DOTS = "*:fill-iso-dot *:stroke-none";

export const DOT_TONE = {
  hi: "*:opacity-85",
  mid: "*:opacity-45",
  lo: "*:opacity-22",
  faint: "*:opacity-12",
} as const satisfies Record<Tone, string>;

export const DOTS_GLOW = "*:fill-iso-lit *:stroke-none *:opacity-100";

export const HALO_OPACITY = [
  "opacity-[calc(var(--iso-halo-opacity)*0.34)]",
  "opacity-[calc(var(--iso-halo-opacity)*0.67)]",
  "opacity-(--iso-halo-opacity)",
] as const;

export const HALO = "fill-iso-halo stroke-none";
export const FILL_PAPER = "fill-iso-paper stroke-none";
export const FILL_FACE = "fill-iso-face stroke-none";

export const TOP = {
  plain: "fill-iso-top",
  card: "fill-iso-sheet",
  lit: "fill-iso-lit-top",
} as const;

export const TOP_SEAM = {
  plain: "stroke-iso-top",
  lit: "stroke-iso-lit-top",
} as const;

export const SHADE_LIT = "fill-iso-lit-shade";
export const SHADE_LIT_SEAM = "stroke-iso-lit-shade";

export const GLASS_FILL = "fill-iso-sheet [fill-opacity:0.35] stroke-none";
export const BEAM = "fill-iso-lit opacity-16 stroke-none";
export const SHEET = "fill-iso-sheet stroke-iso-lo";
export const TEXT = "stroke-iso-mid";
export const INK = "stroke-iso-ink";

export const TUBE = {
  body: "fill-iso-shade-2 stroke-none",
  shine: "fill-iso-top stroke-none",
  shade: "fill-iso-shade-0 stroke-none",
} as const;

export const PLAY =
  "[animation-play-state:paused]! in-data-iso-active:[animation-play-state:running]! motion-reduce:animate-none!";

export const lineAttrs = (tone: LineTone, extra = "") =>
  `class="${TONE_STROKE[tone]}${extra ? ` ${extra}` : ""}" ${LINE_ATTRS}`;
