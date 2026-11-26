"use client";

import { Container, Controls, Gesture, Hotkey } from "@videojs/react";
import { usePlayer, Video, VideoPlayer } from "@videojs/react/video";
import { Button as BehaviorButton } from "@ui-sdk/react/button";
import {
  Menu,
  MenuContent,
  MenuItemIndicator,
  MenuRadioGroup,
  MenuRadioItem,
  MenuTrigger,
} from "@ui-sdk/react/menu";
import {
  Slider,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
} from "@ui-sdk/react/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipShortcut,
  TooltipTrigger,
} from "@ui-sdk/react/tooltip";
import { Button } from "@repo/ui/components/button";
import { Text } from "@repo/ui/components/typography";
import {
  ArrowsInSimpleIcon,
  ArrowsOutSimpleIcon,
  CheckIcon,
  FastForwardIcon,
  PauseIcon,
  PictureInPictureIcon,
  PlayIcon,
  RewindIcon,
  SpeakerHighIcon,
  SpeakerLowIcon,
  SpeakerSlashIcon,
} from "@repo/ui/icons";
import { cn } from "@repo/ui/lib/cn";
import {
  createContext,
  type ComponentProps,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
  useContext,
  useState,
} from "react";

const SKIP_SECONDS = 10;

const AutoHideContext = createContext(false);

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const whole = Math.floor(seconds);
  const h = Math.floor(whole / 3600);
  const m = Math.floor((whole % 3600) / 60);
  const s = String(whole % 60).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
}

const sliderThumb =
  "block size-3 rounded-full bg-primary shadow-sm ring-ring/50 transition-[box-shadow] hover:ring-4 has-focus-visible:ring-4";

const tooltipContent =
  "z-50 flex w-fit items-center gap-2 rounded-md bg-foreground px-3 py-1.5 text-xs text-background transition-[opacity,scale] duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 motion-reduce:transition-none";

const shortcutKey =
  "inline-flex h-5 min-w-5 items-center justify-center rounded-sm bg-background/20 px-1 font-sans text-xs font-medium text-background";

function ControlButton({
  label,
  shortcut,
  className,
  children,
  ...props
}: {
  label: string;
  shortcut?: string;
  className?: string;
  children: ReactNode;
} & Omit<ComponentProps<typeof BehaviorButton>, "children" | "className">) {
  return (
    <Tooltip type="label" shortcut={shortcut} delay={400}>
      <TooltipTrigger
        render={
          <BehaviorButton
            {...props}
            render={
              <Button
                variant="outline"
                size="icon"
                className={cn("size-8", className)}
              />
            }
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent sideOffset={10} className={tooltipContent}>
        {label}
        {shortcut && <TooltipShortcut className={shortcutKey} />}
      </TooltipContent>
    </Tooltip>
  );
}

const OWNS_ARROW_KEYS = 'input[type="range"], [role="menu"]';

function MediaPlayer({
  label = "Media player",
  autoHide = false,
  className,
  children,
  onFocus,
  ...props
}: ComponentProps<typeof Container> & {
  label?: string;
  autoHide?: boolean;
}) {
  const [arrowsTaken, setArrowsTaken] = useState(false);

  return (
    <VideoPlayer>
      <AutoHideContext value={autoHide}>
        <Container
          role="group"
          aria-label={label}
          tabIndex={0}
          data-slot="media-player"
          className={cn(
            "dark relative isolate flex flex-col overflow-hidden rounded-lg bg-background outline-none focus-visible:ring-3 focus-visible:ring-ring/50 in-[:fullscreen]:h-full in-[:fullscreen]:justify-center",
            className,
          )}
          onFocus={(event) => {
            onFocus?.(event);
            setArrowsTaken(
              event.target instanceof Element &&
                event.target.closest(OWNS_ARROW_KEYS) !== null,
            );
          }}
          {...props}
        >
          {children}
          <Hotkey keys="Space" action="togglePaused" />
          <Hotkey keys="k" action="togglePaused" />
          <Hotkey keys="m" action="toggleMuted" />
          <Hotkey keys="f" action="toggleFullscreen" />
          <Hotkey keys="p" action="togglePictureInPicture" />
          <Hotkey keys="j" action="seekStep" value={-SKIP_SECONDS} />
          <Hotkey keys="l" action="seekStep" value={SKIP_SECONDS} />
          <Hotkey keys="0-9" action="seekToPercent" />
          <Hotkey keys="<" action="speedDown" />
          <Hotkey keys=">" action="speedUp" />
          <Hotkey keys="ArrowLeft" action="seekStep" value={-5} disabled={arrowsTaken} />
          <Hotkey keys="ArrowRight" action="seekStep" value={5} disabled={arrowsTaken} />
          <Hotkey keys="ArrowUp" action="volumeStep" value={0.1} disabled={arrowsTaken} />
          <Hotkey keys="ArrowDown" action="volumeStep" value={-0.1} disabled={arrowsTaken} />
          <Hotkey keys="Home" action="seekToPercent" value={0} disabled={arrowsTaken} />
          <Hotkey keys="End" action="seekToPercent" value={100} disabled={arrowsTaken} />
          <Gesture type="tap" action="togglePaused" pointer="mouse" />
          <Gesture type="doubletap" action="toggleFullscreen" pointer="mouse" />
          <Gesture type="tap" action="toggleControls" pointer="touch" />
        </Container>
      </AutoHideContext>
    </VideoPlayer>
  );
}

function MediaPlayerVideo({ className, ...props }: ComponentProps<typeof Video>) {
  return (
    <Video
      playsInline
      preload="metadata"
      data-slot="media-player-video"
      className={cn(
        "block max-h-[75svh] w-full bg-black object-contain in-[:fullscreen]:size-full in-[:fullscreen]:max-h-none",
        className,
      )}
      {...props}
    />
  );
}

function MediaPlayerControls({
  className,
  children,
  ...props
}: ComponentProps<typeof Controls.Content>) {
  const autoHide = useContext(AutoHideContext);
  return (
    <Controls.Root visibility={autoHide ? "auto" : "always"}>
      <Controls.Content
        data-slot="media-player-controls"
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-center gap-2 px-4 py-3 opacity-0 transition-opacity duration-200 data-visible:pointer-events-auto data-visible:opacity-100 in-[:fullscreen]:px-6 in-[:fullscreen]:py-4",
          className,
        )}
        {...props}
      >
        {children}
      </Controls.Content>
    </Controls.Root>
  );
}

function MediaPlayerControlsOverlay({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      data-slot="media-player-controls-overlay"
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 bg-linear-to-t from-black/80 to-transparent",
        className,
      )}
    />
  );
}

function MediaPlayerPlay({ className }: { className?: string }) {
  const store = usePlayer();
  const paused = usePlayer((s) => s.paused);
  const ended = usePlayer((s) => s.ended);
  const label = ended ? "Replay" : paused ? "Play" : "Pause";

  return (
    <ControlButton
      label={label}
      shortcut="space"
      className={cn("[&_svg:not([class*='fill-'])]:fill-current", className)}
      onClick={() => {
        if (paused) void store.play();
        else store.pause();
      }}
    >
      {paused ? <PlayIcon aria-hidden="true" /> : <PauseIcon aria-hidden="true" />}
    </ControlButton>
  );
}

function MediaPlayerSeekBackward({
  seconds = SKIP_SECONDS,
  className,
}: {
  seconds?: number;
  className?: string;
}) {
  const store = usePlayer();
  const currentTime = usePlayer((s) => s.currentTime);

  return (
    <ControlButton
      label={`Back ${seconds} seconds`}
      shortcut="j"
      className={className}
      onClick={() => void store.seek(Math.max(0, currentTime - seconds))}
    >
      <RewindIcon aria-hidden="true" />
    </ControlButton>
  );
}

function MediaPlayerSeekForward({
  seconds = SKIP_SECONDS,
  className,
}: {
  seconds?: number;
  className?: string;
}) {
  const store = usePlayer();
  const currentTime = usePlayer((s) => s.currentTime);
  const duration = usePlayer((s) => s.duration);

  return (
    <ControlButton
      label={`Forward ${seconds} seconds`}
      shortcut="l"
      className={className}
      onClick={() =>
        void store.seek(Math.min(duration || Infinity, currentTime + seconds))
      }
    >
      <FastForwardIcon aria-hidden="true" />
    </ControlButton>
  );
}

function MediaPlayerSeek({ className }: { className?: string }) {
  const store = usePlayer();
  const currentTime = usePlayer((s) => s.currentTime);
  const duration = usePlayer((s) => s.duration);
  const buffered = usePlayer((s) => s.buffered);
  const [hover, setHover] = useState<{ time: number; ratio: number } | null>(
    null,
  );

  const bufferedEnd = buffered.reduce(
    (end, [start, stop]) => (start <= currentTime ? Math.max(end, stop) : end),
    0,
  );
  const percent = (value: number) =>
    duration > 0 ? `${Math.min(100, (value / duration) * 100)}%` : "0%";

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - box.left) / box.width));
    setHover({ time: ratio * duration, ratio });
  }

  return (
    <Slider
      value={Math.min(currentTime, duration || 0)}
      min={0}
      max={duration || 0}
      step={0.1}
      largeStep={SKIP_SECONDS}
      disabled={!duration}
      format={(value) => `${formatTime(value)} of ${formatTime(duration)}`}
      onValueChange={(value) => void store.seek(value as number)}
      data-slot="media-player-seek"
      className={cn("w-full data-disabled:opacity-50", className)}
      style={
        {
          "--buffered": percent(bufferedEnd),
          "--hover": `${(hover?.ratio ?? 0) * 100}%`,
        } as CSSProperties
      }
    >
      <SliderControl
        className="relative flex h-4 w-full cursor-pointer touch-none items-center"
        onPointerMove={duration ? onPointerMove : undefined}
        onPointerLeave={() => setHover(null)}
      >
        <SliderTrack className="relative h-1 w-full rounded-full bg-primary/30">
          <span
            aria-hidden="true"
            className="absolute inset-y-0 left-0 w-(--buffered) rounded-full bg-primary/40"
          />
          <SliderIndicator className="rounded-full bg-primary" />
          <SliderThumb aria-label="Seek" className={sliderThumb} />
        </SliderTrack>
        {hover && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-full left-(--hover) mb-2 -translate-x-1/2 rounded-md bg-foreground px-2 py-1 text-background"
          >
            <Text as="span" variant="none" className="tabular-nums">
              {formatTime(hover.time)}
            </Text>
          </span>
        )}
      </SliderControl>
    </Slider>
  );
}

function MediaPlayerVolume({
  expandable = false,
  className,
}: {
  expandable?: boolean;
  className?: string;
}) {
  const store = usePlayer();
  const volume = usePlayer((s) => s.volume);
  const muted = usePlayer((s) => s.muted);
  const availability = usePlayer((s) => s.volumeAvailability);
  const level = muted ? 0 : volume;

  return (
    <div
      data-slot="media-player-volume"
      className={cn(
        "group/volume flex items-center",
        expandable
          ? "gap-0 focus-within:gap-2 hover:gap-1.5"
          : "gap-1.5",
        className,
      )}
    >
      <ControlButton
        label={muted ? "Unmute" : "Mute"}
        shortcut="m"
        onClick={() => store.setMuted(!muted)}
      >
        {level === 0 ? (
          <SpeakerSlashIcon aria-hidden="true" />
        ) : level > 0.5 ? (
          <SpeakerHighIcon aria-hidden="true" />
        ) : (
          <SpeakerLowIcon aria-hidden="true" />
        )}
      </ControlButton>
      {availability !== "unsupported" && (
        <Slider
          value={level}
          min={0}
          max={1}
          step={0.05}
          format={{ style: "percent" }}
          onValueChange={(value) => {
            store.setVolume(value as number);
            if (muted && (value as number) > 0) store.setMuted(false);
          }}
          className={cn(
            expandable
              ? "w-0 opacity-0 transition-[width,opacity] duration-200 group-focus-within/volume:w-16 group-focus-within/volume:opacity-100 group-hover/volume:w-16 group-hover/volume:opacity-100"
              : "w-16",
          )}
        >
          <SliderControl className="relative flex h-4 w-full cursor-pointer touch-none items-center">
            <SliderTrack className="relative h-1 w-full rounded-full bg-primary/30">
              <SliderIndicator className="rounded-full bg-primary" />
              <SliderThumb aria-label="Volume" className={sliderThumb} />
            </SliderTrack>
          </SliderControl>
        </Slider>
      )}
    </div>
  );
}

function MediaPlayerTime({ className }: { className?: string }) {
  const currentTime = usePlayer((s) => s.currentTime);
  const duration = usePlayer((s) => s.duration);

  return (
    <div
      data-slot="media-player-time"
      className={cn(
        "flex items-center gap-1 text-sm text-foreground/80 tabular-nums",
        className,
      )}
    >
      <Text as="span" variant="none">
        {formatTime(currentTime)}
      </Text>
      <Text as="span" variant="none" aria-hidden="true">
        /
      </Text>
      <Text as="span" variant="none">
        {formatTime(duration)}
      </Text>
    </div>
  );
}

function MediaPlayerPlaybackSpeed({ className }: { className?: string }) {
  const store = usePlayer();
  const rate = usePlayer((s) => s.playbackRate);
  const rates = usePlayer((s) => s.playbackRates);
  const availability = usePlayer((s) => s.playbackRateAvailability);
  if (availability === "unsupported") return null;

  return (
    <Menu>
      <MenuTrigger
        aria-label={`Playback speed ${rate}x`}
        render={
          <Button
            variant="outline"
            size="icon"
            className={cn("h-8 w-16 data-open:bg-accent/50", className)}
          />
        }
      >
        <Text as="span" variant="none" className="tabular-nums">
          {rate}x
        </Text>
      </MenuTrigger>
      <MenuContent
        side="top"
        sideOffset={10}
        className="z-50 min-w-(--anchor-width) origin-(--transform-origin) rounded-md border bg-popover p-1 text-popover-foreground shadow-md transition-[opacity,scale] duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 motion-reduce:transition-none"
      >
        <MenuRadioGroup
          value={String(rate)}
          onValueChange={(value) => store.setPlaybackRate(Number(value))}
        >
          {rates.map((option) => (
            <MenuRadioItem
              key={option}
              value={String(option)}
              className="flex cursor-pointer items-center justify-between gap-4 rounded-sm px-2 py-1.5 text-sm outline-none select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground"
            >
              {option}x
              <MenuItemIndicator>
                <CheckIcon aria-hidden="true" className="size-4" />
              </MenuItemIndicator>
            </MenuRadioItem>
          ))}
        </MenuRadioGroup>
      </MenuContent>
    </Menu>
  );
}

function MediaPlayerPiP({ className }: { className?: string }) {
  const store = usePlayer();
  const active = usePlayer((s) => s.isPictureInPicture);
  const availability = usePlayer((s) => s.pictureInPictureAvailability);
  if (availability !== "available") return null;

  return (
    <ControlButton
      label={active ? "Exit picture in picture" : "Picture in picture"}
      shortcut="p"
      className={className}
      onClick={() =>
        void (active
          ? store.exitPictureInPicture()
          : store.requestPictureInPicture())
      }
    >
      <PictureInPictureIcon aria-hidden="true" />
    </ControlButton>
  );
}

function MediaPlayerFullscreen({ className }: { className?: string }) {
  const store = usePlayer();
  const active = usePlayer((s) => s.isFullscreen);
  const availability = usePlayer((s) => s.fullscreenAvailability);
  if (availability !== "available") return null;

  return (
    <ControlButton
      label={active ? "Exit fullscreen" : "Fullscreen"}
      shortcut="f"
      className={className}
      onClick={() =>
        void (active ? store.exitFullscreen() : store.requestFullscreen())
      }
    >
      {active ? (
        <ArrowsInSimpleIcon aria-hidden="true" />
      ) : (
        <ArrowsOutSimpleIcon aria-hidden="true" />
      )}
    </ControlButton>
  );
}

export {
  MediaPlayer,
  MediaPlayerControls,
  MediaPlayerControlsOverlay,
  MediaPlayerFullscreen,
  MediaPlayerPiP,
  MediaPlayerPlay,
  MediaPlayerPlaybackSpeed,
  MediaPlayerSeek,
  MediaPlayerSeekBackward,
  MediaPlayerSeekForward,
  MediaPlayerTime,
  MediaPlayerVideo,
  MediaPlayerVolume,
};
