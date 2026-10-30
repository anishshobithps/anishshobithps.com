import { themeColor } from "@/lib/theme-tokens";
import type { Theme } from "@/lib/svg/template";

function build(theme: Theme) {
  const token = (name: string) => themeColor(`var(--${name})`, theme);
  const tint = (name: string, amount: number) =>
    themeColor(
      `color-mix(in oklab, var(--${name}) ${amount}%, var(--background))`,
      theme,
    );
  const fade = (name: string, amount: number) =>
    themeColor(
      `color-mix(in oklab, var(--${name}) ${amount}%, transparent)`,
      theme,
    );

  return {
    background: token("background"),
    foreground: token("foreground"),
    muted: token("muted-foreground"),
    line: token("line"),
    brand: token("brand"),
    brandText: token("brand-text"),
    surface: tint("foreground", 3),
    guide: fade("foreground", 28),
    hairline: fade("foreground", 15),
    brandWash: fade("brand", 10),
    brandBorder: fade("brand-text", 30),
    ramp: [
      tint("foreground", 6),
      tint("brand-text", 30),
      tint("brand-text", 55),
      tint("brand-text", 78),
      token("brand-text"),
    ],
  };
}

export type Palette = ReturnType<typeof build>;

const cache = new Map<Theme, Palette>();

export function palette(theme: Theme): Palette {
  let colors = cache.get(theme);
  if (!colors) {
    colors = build(theme);
    cache.set(theme, colors);
  }
  return colors;
}
