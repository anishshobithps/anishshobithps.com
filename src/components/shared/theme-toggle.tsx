"use client";

import { cva } from "class-variance-authority";
import { SunIcon, MoonIcon, MonitorIcon } from "@/components/shared/icons";
import { useTheme } from "next-themes";
import {
  ComponentProps,
  useSyncExternalStore,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { flushSync } from "react-dom";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";

const itemVariants = cva(
  "size-6.5 p-1.5 transition-colors hover:bg-transparent",
  {
    variants: {
      active: {
        true: "bg-foreground/10 text-foreground hover:bg-foreground/10",
        false: "bg-transparent text-foreground/40",
      },
    },
  },
);

const full = [
  ["light", SunIcon, "Switch to light theme"] as const,
  ["dark", MoonIcon, "Switch to dark theme"] as const,
  ["system", MonitorIcon, "Use system theme"] as const,
];

function applyTheme(
  setTheme: (theme: string) => void,
  key: string,
  event: ReactMouseEvent<HTMLButtonElement>,
) {
  const root = document.documentElement;
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (prefersReducedMotion || typeof document.startViewTransition !== "function") {
    setTheme(key);
    return;
  }

  // Keyboard activation reports (0, 0) — fall back to the button's centre.
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
    // flushSync guarantees next-themes has applied the new class to <html>
    // before the transition snapshots the "new" state.
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

export function ThemeToggle({ className, ...props }: ComponentProps<"div">) {
  const { setTheme, theme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const value = mounted ? theme : null;

  return (
    <div
      role="group"
      aria-label="Theme selection"
      className={cn(
        "inline-flex items-center rounded-full border p-1 *:rounded-full",
        className,
      )}
      data-theme-toggle=""
      {...props}
    >
      {full.map(([key, Icon, label]) => (
        <Button
          key={key}
          variant="ghost"
          size="icon-sm"
          aria-label={label}
          aria-pressed={value === key}
          className={cn(
            itemVariants({ active: value === key }),
            "cursor-pointer",
          )}
          onClick={(event) => applyTheme(setTheme, key, event)}
        >
          <Icon weight="fill" className="size-3.5" aria-hidden="true" />
        </Button>
      ))}
    </div>
  );
}
