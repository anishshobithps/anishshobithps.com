"use client";

import { useTheme } from "next-themes";
import { useShortcut } from "@ui-sdk/react/shortcuts";

import { themeCue } from "@repo/sounds/sound-cues";
import { playCue } from "@repo/sounds/sound-player";

export function ThemeHotkey() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  useShortcut(
    "mod+shift+d",
    () => {
      const current = theme === "system" ? resolvedTheme : theme;
      const next = current === "dark" ? "light" : "dark";
      playCue(themeCue(next));
      setTheme(next);
    },
    { allowInInput: true, description: "Toggle light and dark theme" },
  );

  return null;
}
