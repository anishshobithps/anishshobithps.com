"use client";

import type { ComponentProps } from "react";

import {
  SpeakerHighIcon,
  SpeakerSlashIcon,
} from "@repo/icons";
import { Button } from "@repo/ui/components/button";
import { Switch } from "@repo/ui/components/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { useSoundPreferences } from "@repo/sounds/use-sound-preferences";
import { disableSound, enableSound } from "@repo/sounds/sound-player";

function setSoundOn(next: boolean) {
  if (next) void enableSound();
  else disableSound();
}

export function SoundToggle({
  className,
  ...props
}: Omit<ComponentProps<typeof Button>, "children" | "onClick">) {
  const { enabled } = useSoundPreferences();
  const Icon = enabled ? SpeakerHighIcon : SpeakerSlashIcon;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          role="switch"
          aria-checked={enabled}
          aria-label="Sound effects"
          onClick={() => setSoundOn(!enabled)}
          className={className}
          {...props}
        >
          <Icon weight="fill" aria-hidden="true" className="size-3.5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{enabled ? "Turn sound off" : "Turn sound on"}</TooltipContent>
    </Tooltip>
  );
}

export function SoundSwitch(props: ComponentProps<typeof Switch>) {
  const { enabled } = useSoundPreferences();

  return (
    <Switch
      checked={enabled}
      onCheckedChange={setSoundOn}
      aria-label="Sound effects"
      {...props}
    />
  );
}
