export const isoCanvas =
  "bg-[radial-gradient(color-mix(in_oklab,var(--foreground)_9%,transparent)_1px,transparent_1px)] bg-size-[16px_16px] bg-center";

export const isoType = "font-pixel uppercase tracking-[0.06em]";

export const isoPlay =
  "[animation-play-state:paused] in-data-iso-active:[animation-play-state:running] group-hover/iso:[animation-play-state:running] group-focus-visible/iso:[animation-play-state:running]";

export const isoRipple =
  "fill-none stroke-(--brand) stroke-1 opacity-0 [transform-box:fill-box] origin-center in-data-iso-active:animate-iso-ripple group-hover/iso:animate-iso-ripple group-focus-visible/iso:animate-iso-ripple";

export const isoTwinkle = `fill-(--brand) animate-iso-twinkle ${isoPlay}`;

export const nudgeDraw =
  "[stroke-dasharray:1] [stroke-dashoffset:1] animate-nudge-draw motion-reduce:[stroke-dashoffset:0]";

export const gitDraw =
  "[stroke-dasharray:1] [stroke-dashoffset:1] animate-git-draw [animation-play-state:paused] in-data-revealed:[animation-play-state:running] motion-reduce:[stroke-dashoffset:0]";

export const gitPop =
  "[transform-box:fill-box] origin-center scale-0 animate-git-pop [animation-play-state:paused] in-data-revealed:[animation-play-state:running] motion-reduce:scale-100";

export const gitFade =
  "opacity-0 animate-git-fade [animation-play-state:paused] in-data-revealed:[animation-play-state:running] motion-reduce:opacity-100";
