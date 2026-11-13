"use client";

import { useId } from "react";

import { PauseIcon, PlayIcon } from "@repo/icons";
import { Label } from "@repo/ui/components/label";
import { Switch } from "@repo/ui/components/switch";
import { Text, TypographyMuted } from "@repo/ui/components/typography";
import { useMotionSetting } from "@repo/ui/hooks/use-prefers-reduced-motion";
import { setMotionOff } from "@repo/ui/lib/motion-preference";

const HINTS = {
  on: "Doodles walk, drawings print in, signs sway.",
  off: "Everything holds still. Saved on this device.",
  system: "Your system asks for reduced motion, so it stays off.",
} as const;

export function MotionPanel() {
  const setting = useMotionSetting();
  const id = useId();
  const switchId = `${id}-switch`;
  const hintId = `${id}-hint`;
  const on = setting === "on";

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-background text-foreground">
        {on ? (
          <PlayIcon weight="fill" aria-hidden="true" className="size-4" />
        ) : (
          <PauseIcon weight="fill" aria-hidden="true" className="size-4" />
        )}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Label htmlFor={switchId}>
          <Text as="span" variant="small">
            Motion
          </Text>
        </Label>
        <TypographyMuted id={hintId}>{HINTS[setting]}</TypographyMuted>
      </div>
      <Switch
        id={switchId}
        checked={on}
        disabled={setting === "system"}
        onCheckedChange={(checked) => setMotionOff(!checked)}
        aria-describedby={hintId}
      />
    </div>
  );
}
