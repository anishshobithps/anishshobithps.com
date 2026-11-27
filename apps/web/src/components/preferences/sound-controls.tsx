"use client";

import { SpeakerHighIcon, SpeakerSlashIcon } from "@repo/ui/icons";
import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/cn";
import { useSoundPreferences } from "@repo/sounds/use-sound-preferences";
import { disableSound, enableSound } from "@repo/sounds/sound-player";
import { Switch, SwitchThumb } from "@ui-sdk/react/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@ui-sdk/react/tooltip";
import type { ComponentProps } from "react";

export function setSoundOn(next: boolean) {
  if (next) void enableSound();
  else disableSound();
}

const tooltipContent =
  "z-50 w-fit rounded-md bg-foreground px-3 py-1.5 text-xs text-background transition-[opacity,scale] duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 motion-reduce:transition-none";

type SoundSwitchProps = Omit<
  ComponentProps<typeof Switch>,
  "checked" | "onCheckedChange" | "children"
> & {
  look?: "button" | "track" | "pill";
};

export function SoundSwitch({
  look = "track",
  className,
  "aria-label": ariaLabel = "Sound effects",
  ...props
}: SoundSwitchProps) {
  const { enabled } = useSoundPreferences();
  const Icon = enabled ? SpeakerHighIcon : SpeakerSlashIcon;
  const shared = {
    ...props,
    "aria-label": ariaLabel,
    checked: enabled,
    onCheckedChange: setSoundOn,
  };

  if (look === "track") {
    return (
      <Switch
        {...shared}
        className={cn(
          "relative inline-flex h-5 w-8 shrink-0 cursor-pointer items-center rounded-full border border-transparent bg-input shadow-xs outline-none transition-[background-color,box-shadow] after:absolute after:-inset-[5px] focus-visible:ring-3 focus-visible:ring-ring/50 data-checked:bg-primary data-disabled:cursor-not-allowed data-disabled:opacity-50 dark:bg-input/80",
          className,
        )}
      >
        <SwitchThumb className="pointer-events-none block size-4 rounded-full bg-background transition-transform data-checked:translate-x-[calc(100%-2px)] dark:bg-foreground dark:data-checked:bg-primary-foreground" />
      </Switch>
    );
  }

  if (look === "pill") {
    return (
      <Switch
        {...shared}
        render={<Button variant="ghost" size="icon-sm" />}
        className={cn("relative rounded-full pointer-coarse:size-10", className)}
      >
        <Icon
          key={String(enabled)}
          weight="fill"
          aria-hidden="true"
          className="size-4 animate-in zoom-in-50 spin-in-12 duration-300 motion-reduce:animate-none"
        />
        {enabled && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0.5 rounded-full border border-(--brand) opacity-0 animate-ping [animation-iteration-count:1] motion-reduce:hidden"
          />
        )}
      </Switch>
    );
  }

  return (
    <Tooltip type="description">
      <TooltipTrigger
        render={
          <Switch
            {...shared}
            className={className}
            render={<Button variant="outline" size="icon" />}
          />
        }
      >
        <Icon weight="fill" aria-hidden="true" className="size-3.5" />
      </TooltipTrigger>
      <TooltipContent sideOffset={6} className={tooltipContent}>
        {enabled ? "Turn sound off" : "Turn sound on"}
      </TooltipContent>
    </Tooltip>
  );
}
