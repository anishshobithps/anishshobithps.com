"use client";

import { useId, type ComponentProps } from "react";

import {
  SpeakerHighIcon,
  SpeakerSlashIcon,
} from "@repo/icons";
import { Button } from "@repo/ui/components/button";
import { Label } from "@repo/ui/components/label";
import { Slider } from "@repo/ui/components/slider";
import { Switch } from "@repo/ui/components/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { Text, TypographyMuted } from "@repo/ui/components/typography";
import { useSoundPreferences } from "@repo/sounds/use-sound-preferences";
import { setSoundVolume } from "@repo/sounds/sound-preferences";
import { disableSound, enableSound, playCue } from "@repo/sounds/sound-player";

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

export function SoundPanel() {
  const { enabled, volume } = useSoundPreferences();
  const id = useId();
  const switchId = `${id}-switch`;
  const hintId = `${id}-hint`;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/30 p-3">
      <div className="flex items-center gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-background text-foreground">
          {enabled ? (
            <SpeakerHighIcon weight="fill" aria-hidden="true" className="size-4" />
          ) : (
            <SpeakerSlashIcon weight="fill" aria-hidden="true" className="size-4" />
          )}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Label htmlFor={switchId}>
            <Text as="span" variant="small">
              Sound effects
            </Text>
          </Label>
          <TypographyMuted id={hintId}>
            Soft UI sounds. Off until you say so.
          </TypographyMuted>
        </div>
        <SoundSwitch id={switchId} aria-label={undefined} aria-describedby={hintId} />
      </div>
      {enabled && (
        <div className="flex items-center gap-3">
          <TypographyMuted className="w-14 shrink-0">Volume</TypographyMuted>
          <Slider
            aria-label="Sound volume"
            min={0}
            max={100}
            step={5}
            value={[Math.round(volume * 100)]}
            onValueChange={([next]) => setSoundVolume(next / 100)}
            onValueCommit={() => playCue("tap")}
          />
        </div>
      )}
    </div>
  );
}
