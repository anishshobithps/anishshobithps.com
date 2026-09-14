"use client";

import { useCallback, useEffect } from "react";
import { useTheme } from "next-themes";

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  if (target.closest("[contenteditable='true']")) return true;

  const tagName = target.tagName;
  return tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT";
}

export function ThemeHotkey() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const toggle = useCallback(() => {
    const current = theme === "system" ? resolvedTheme : theme;
    setTheme(current === "dark" ? "light" : "dark");
  }, [theme, resolvedTheme, setTheme]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (isEditableTarget(event.target)) return;

      const isThemeShortcut =
        event.code === "KeyD" &&
        event.shiftKey &&
        !event.altKey &&
        (event.metaKey || event.ctrlKey);

      if (!isThemeShortcut) return;

      event.preventDefault();
      toggle();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [toggle]);

  return null;
}
