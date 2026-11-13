"use client";

import { MonitorIcon, MoonIcon, SunIcon } from "@repo/icons";
import { Button } from "@repo/ui/components/button";
import { ToggleGroup, ToggleGroupItem } from "@repo/ui/components/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { cn } from "@repo/ui/lib/cn";
import { themeCue } from "@repo/sounds/sound-cues";
import { playCue } from "@repo/sounds/sound-player";
import { useTheme } from "next-themes";
import {
  useSyncExternalStore,
  type ComponentProps,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { flushSync } from "react-dom";
import { prefersReducedMotion } from "@repo/ui/lib/motion-preference";

export const themes = [
  ["light", SunIcon, "Switch to light theme"],
  ["dark", MoonIcon, "Switch to dark theme"],
  ["system", MonitorIcon, "Use system theme"],
] as const;

let activeTransition: ViewTransition | null = null;

export function applyTheme(
  setTheme: (theme: string) => void,
  key: string,
  event: ReactMouseEvent<HTMLButtonElement>,
) {
  const root = document.documentElement;
  if (
    prefersReducedMotion() ||
    typeof document.startViewTransition !== "function"
  ) {
    setTheme(key);
    return;
  }

  let x = event.clientX;
  let y = event.clientY;
  if (x === 0 && y === 0) {
    const rect = event.currentTarget.getBoundingClientRect();
    x = rect.left + rect.width / 2;
    y = rect.top + rect.height / 2;
  }

  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  );

  root.style.setProperty("--theme-x", `${x}px`);
  root.style.setProperty("--theme-y", `${y}px`);
  root.style.setProperty("--theme-r", `${endRadius}px`);
  root.dataset.themeTransition = "";
  const transition = document.startViewTransition(() => {
    flushSync(() => setTheme(key));
  });
  activeTransition = transition;

  transition.finished.finally(() => {
    if (activeTransition !== transition) return;
    activeTransition = null;
    delete root.dataset.themeTransition;
    root.style.removeProperty("--theme-x");
    root.style.removeProperty("--theme-y");
    root.style.removeProperty("--theme-r");
  });
}

type ThemeToggleProps = Omit<
  ComponentProps<"div">,
  "defaultValue" | "dir" | "onChange"
>;

export function ThemeToggle({ className, ...props }: ThemeToggleProps) {
  const { setTheme, theme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  return (
    <ToggleGroup
      type="single"
      value={mounted ? (theme ?? "") : ""}
      spacing={0.5}
      aria-label="Theme selection"
      data-theme-toggle=""
      className={cn("rounded-full border p-1", className)}
      {...props}
    >
      {themes.map(([key, Icon, label]) => (
        <ToggleGroupItem
          key={key}
          value={key}
          aria-label={label}
          onClick={(event) => {
            playCue(themeCue(key));
            applyTheme(setTheme, key, event);
          }}
          className="size-6.5 min-w-0 cursor-pointer rounded-full p-0 text-muted-foreground hover:bg-transparent hover:text-foreground data-[state=on]:bg-foreground/10 data-[state=on]:text-foreground"
        >
          <Icon weight="fill" className="size-3.5" aria-hidden="true" />
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

const themeNames = { light: "Light", dark: "Dark", system: "System" } as const;

export function ThemeCycle({
  className,
}: {
  className?: string;
}) {
  const { setTheme, theme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const index = Math.max(
    0,
    themes.findIndex(([key]) => key === (mounted ? theme : "system")),
  );
  const [current, Icon] = themes[index]!;
  const [next] = themes[(index + 1) % themes.length]!;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={`Theme: ${themeNames[current]}. Switch to ${themeNames[next]}`}
          data-theme-toggle=""
          onClick={(event) => {
            playCue(themeCue(next));
            applyTheme(setTheme, next, event);
          }}
          className={cn("overflow-hidden", className)}
        >
          <Icon
            key={current}
            weight="fill"
            aria-hidden="true"
            className="size-3.5 animate-in zoom-in-50 spin-in-90 fade-in-0 duration-300 motion-reduce:animate-none"
          />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{`${themeNames[current]} theme, switch to ${themeNames[next]}`}</TooltipContent>
    </Tooltip>
  );
}
