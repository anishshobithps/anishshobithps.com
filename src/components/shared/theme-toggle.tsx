"use client";

import { cva } from "class-variance-authority";
import { Airplay, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { ComponentProps, useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";

const itemVariants = cva(
  "size-6.5 p-1.5 text-foreground/40 transition-colors",
  {
    variants: {
      active: {
        true: "bg-foreground/10 text-foreground",
        false: "text-foreground/40",
      },
    },
  },
);

const full = [
  ["light", Sun, "Switch to light theme"] as const,
  ["dark", Moon, "Switch to dark theme"] as const,
  ["system", Airplay, "Use system theme"] as const,
];

export function ThemeToggle({ className, ...props }: ComponentProps<"div">) {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
          <Icon className="size-full" fill="currentColor" aria-hidden="true" />
        </Button>
      ))}
    </div>
  );
}
