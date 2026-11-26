export type Tone = "hi" | "mid" | "lo" | "faint";

export const DOTS = "*:fill-iso-dot *:stroke-none";

export const DOT_TONE = {
  hi: "*:opacity-85",
  mid: "*:opacity-45",
  lo: "*:opacity-22",
  faint: "*:opacity-12",
} as const satisfies Record<Tone, string>;

const BLEND = "mix-blend-multiply dark:mix-blend-screen";

export const PLATE = {
  paper: "fill-iso-paper stroke-none",
  ink: "fill-iso-plate-ink stroke-none",
  green: "fill-iso-plate-green stroke-none",
  blend: BLEND,
  isolate: "isolate",
  void: "dark:fill-iso-paper",
  register: `${BLEND} transition-[translate] duration-500 ease-out group-hover/iso:translate-x-[3px] group-hover/iso:translate-y-[2px] group-focus-visible/iso:translate-x-[3px] group-focus-visible/iso:translate-y-[2px] motion-reduce:transition-none`,
} as const;

export const SWATCH = [
  "fill-(--brand) stroke-none",
  "fill-(--selection-bg) stroke-none",
  "fill-foreground stroke-none",
  "fill-muted-foreground stroke-none",
  "fill-muted stroke-none",
  "fill-background stroke-none",
] as const;

export const PRINT_LINE = "stroke-iso-plate-ink";

export const DASH = "[stroke-dasharray:3_4]";

export const PRINT_LINE_ATTRS =
  'fill="none" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"';

export const SCREEN_DOT = "fill-iso-screen stroke-none";

export const PRINT_TEXT = "fill-iso-plate-ink font-pixel uppercase tracking-[0.06em]";
