"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import {
  getSoundPreferences,
  subscribeSoundPreferences,
} from "@repo/sounds/sound-preferences";
import {
  getMotionSetting,
  subscribeMotion,
} from "@repo/ui/lib/motion-preference";
import {
  getLinkPreviewsEnabled,
  subscribeLinkPreviews,
} from "@/lib/link-previews-preference";
import { commandMenu } from "@/components/command-menu/store";
import { registerContext, track } from "@/lib/analytics/events";

function watch<T>(
  subscribe: (listener: () => void) => () => void,
  read: () => T,
  onChange: (next: T, previous: T) => void,
) {
  let last = read();
  return subscribe(() => {
    const next = read();
    if (Object.is(next, last)) return;
    const previous = last;
    last = next;
    onChange(next, previous);
  });
}

function readSoundEnabled() {
  return getSoundPreferences().enabled;
}

export function AnalyticsContext() {
  const { theme, resolvedTheme } = useTheme();
  const lastTheme = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!theme) return;
    registerContext({
      theme_setting: theme,
      ...(resolvedTheme ? { theme_resolved: resolvedTheme } : {}),
    });
    if (lastTheme.current && lastTheme.current !== theme) {
      track("theme_changed", { theme });
    }
    lastTheme.current = theme;
  }, [theme, resolvedTheme]);

  useEffect(() => {
    registerContext({
      sound_enabled: readSoundEnabled(),
      motion_setting: getMotionSetting(),
      link_previews_enabled: getLinkPreviewsEnabled(),
    });

    const stops = [
      watch(subscribeSoundPreferences, readSoundEnabled, (enabled) => {
        registerContext({ sound_enabled: enabled });
        track("sound_toggled", { enabled });
      }),
      watch(subscribeMotion, getMotionSetting, (setting) => {
        registerContext({ motion_setting: setting });
        track("motion_changed", { setting });
      }),
      watch(subscribeLinkPreviews, getLinkPreviewsEnabled, (enabled) => {
        registerContext({ link_previews_enabled: enabled });
        track("link_previews_toggled", { enabled });
      }),
      watch(commandMenu.subscribe, commandMenu.get, (open) => {
        if (open) track("command_menu_opened");
      }),
    ];
    return () => {
      for (const stop of stops) stop();
    };
  }, []);

  return null;
}
