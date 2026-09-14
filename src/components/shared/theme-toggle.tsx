"use client";

import { MonitorIcon, MoonIcon, SunIcon } from "@/components/shared/icons";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/cn";
import { useTheme } from "next-themes";
import {
  useSyncExternalStore,
  type ComponentProps,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { flushSync } from "react-dom";

const themes = [
  ["light", SunIcon, "Switch to light theme"],
  ["dark", MoonIcon, "Switch to dark theme"],
  ["system", MonitorIcon, "Use system theme"],
] as const;

function applyTheme(
  setTheme: (theme: string) => void,
  key: string,
  event: ReactMouseEvent<HTMLButtonElement>,
) {
  const root = document.documentElement;
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (
    prefersReducedMotion ||
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

  root.dataset.themeTransition = "";
  const transition = document.startViewTransition(() => {
    flushSync(() => setTheme(key));
  });

  transition.ready
    .then(() => {
      root.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 450,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    })
    .catch(() => {});

  transition.finished.finally(() => {
    delete root.dataset.themeTransition;
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
          onClick={(event) => applyTheme(setTheme, key, event)}
          className="size-6.5 min-w-0 cursor-pointer rounded-full p-0 text-foreground/40 hover:bg-transparent hover:text-foreground data-[state=on]:bg-foreground/10 data-[state=on]:text-foreground"
        >
          <Icon weight="fill" className="size-3.5" aria-hidden="true" />
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
