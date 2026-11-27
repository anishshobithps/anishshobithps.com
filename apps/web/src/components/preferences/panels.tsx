"use client";

import { SettingRow } from "@repo/ui/blocks/setting-row";
import { Slider } from "@repo/ui/components/slider";
import { Switch } from "@repo/ui/components/switch";
import { TypographyMuted } from "@repo/ui/components/typography";
import { useMotionSetting } from "@repo/ui/hooks/use-prefers-reduced-motion";
import {
  LinkIcon,
  PauseIcon,
  PlayIcon,
  SpeakerHighIcon,
  SpeakerSlashIcon,
} from "@repo/ui/icons";
import { setMotionOff } from "@repo/ui/lib/motion-preference";
import { setSoundVolume } from "@repo/sounds/sound-preferences";
import { playCue } from "@repo/sounds/sound-player";
import { useSoundPreferences } from "@repo/sounds/use-sound-preferences";
import { SoundSwitch } from "@/components/preferences/sound-controls";
import {
  setLinkPreviewsEnabled,
  useLinkPreviewsEnabled,
} from "@/lib/link-previews-preference";

const MOTION_HINTS = {
  on: "Doodles walk, drawings print in, signs sway.",
  off: "Everything holds still. Saved on this device.",
  system: "Your system asks for reduced motion, so it stays off.",
} as const;

export function LinkPreviewPanel() {
  const enabled = useLinkPreviewsEnabled();
  return (
    <SettingRow
      icon={<LinkIcon aria-hidden="true" className="size-4" />}
      label="Link previews"
      hint="Hover a link in a post to peek at where it goes."
      control={(ids) => (
        <Switch {...ids} checked={enabled} onCheckedChange={setLinkPreviewsEnabled} />
      )}
    />
  );
}

export function MotionPanel() {
  const setting = useMotionSetting();
  const on = setting === "on";
  const Icon = on ? PlayIcon : PauseIcon;
  return (
    <SettingRow
      icon={<Icon weight="fill" aria-hidden="true" className="size-4" />}
      label="Motion"
      hint={MOTION_HINTS[setting]}
      control={(ids) => (
        <Switch
          {...ids}
          checked={on}
          disabled={setting === "system"}
          onCheckedChange={(checked) => setMotionOff(!checked)}
        />
      )}
    />
  );
}

export function SoundPanel() {
  const { enabled, volume } = useSoundPreferences();
  const Icon = enabled ? SpeakerHighIcon : SpeakerSlashIcon;
  return (
    <SettingRow
      icon={<Icon weight="fill" aria-hidden="true" className="size-4" />}
      label="Sound effects"
      hint="Soft UI sounds. Off until you say so."
      control={(ids) => <SoundSwitch {...ids} aria-label={undefined} />}
    >
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
    </SettingRow>
  );
}
