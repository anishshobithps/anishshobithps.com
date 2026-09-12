"use client";

import { useCallback, useEffect } from "react";
import { useTheme } from "next-themes";

const EDITABLE_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (EDITABLE_TAGS.has(target.tagName)) return true;
  return target.isContentEditable;
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

      const isPlainD = event.code === "KeyD" && !event.altKey;
      const isCmdOrCtrlShiftD =
        event.code === "KeyD" && event.shiftKey && !event.altKey;

      if (isPlainD && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        toggle();
        return;
      }

      if (isCmdOrCtrlShiftD && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        toggle();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [toggle]);

  return null;
}
