"use client";

import { cva } from "class-variance-authority";
import { SunIcon, MoonIcon, MonitorIcon } from "@/components/shared/icons";
import { useTheme } from "next-themes";
import { ComponentProps, useSyncExternalStore } from "react";
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
          onClick={() => setTheme(key)}
        >
          <Icon weight="fill" className="size-3.5" aria-hidden="true" />
        </Button>
      ))}
    </div>
  );
}
