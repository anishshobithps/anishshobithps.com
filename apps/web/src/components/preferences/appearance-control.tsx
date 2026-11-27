"use client";

import { applyTheme, themes } from "@/components/preferences/theme-toggle";
import { SoundSwitch } from "@/components/preferences/sound-controls";
import { ToggleGroup, ToggleGroupItem } from "@repo/ui/components/toggle-group";
import { cn } from "@repo/ui/lib/cn";
import { themeCue } from "@repo/sounds/sound-cues";
import { playCue } from "@repo/sounds/sound-player";
import { useTheme } from "next-themes";
import { type CSSProperties, useSyncExternalStore } from "react";

export function AppearanceControl({ className }: { className?: string }) {
  const { setTheme, theme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const index = mounted ? themes.findIndex(([key]) => key === theme) : -1;

  return (
    <div
      role="group"
      aria-label="Theme and sound"
      className={cn("flex items-center gap-1 rounded-full border p-1", className)}
    >
      <ToggleGroup
        type="single"
        value={index === -1 ? "" : themes[index]![0]}
        aria-label="Theme selection"
        className="relative"
      >
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-y-0 left-0 w-1/3 translate-x-(--slot) rounded-full bg-foreground/10 transition-[translate,opacity] duration-300 ease-out motion-reduce:transition-none",
            index === -1 && "opacity-0",
          )}
          style={{ "--slot": `${Math.max(index, 0) * 100}%` } as CSSProperties}
        />
        {themes.map(([key, Icon, label], position) => (
          <ToggleGroupItem
            key={key}
            value={key}
            aria-label={label}
            onClick={(event) => {
              playCue(themeCue(key));
              applyTheme(setTheme, key, event);
            }}
            className="relative z-10 size-8 min-w-0 cursor-pointer rounded-full p-0 text-muted-foreground hover:bg-transparent hover:text-foreground data-[state=on]:bg-transparent data-[state=on]:text-foreground pointer-coarse:size-10"
          >
            <Icon
              weight="fill"
              aria-hidden="true"
              className={cn(
                "size-4 transition-transform duration-500 ease-out motion-reduce:transition-none",
                position === index && "scale-110 rotate-[360deg]",
              )}
            />
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <span aria-hidden="true" className="h-5 w-px bg-line" />

      <SoundSwitch look="pill" />
    </div>
  );
}
