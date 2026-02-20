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
  ["light", Sun] as const,
  ["dark", Moon] as const,
  ["system", Airplay] as const,
];

export function ThemeToggle({ className, ...props }: ComponentProps<"div">) {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const container = cn(
    "inline-flex items-center rounded-full border p-1 *:rounded-full",
    className,
  );

  const value = mounted ? theme : null;

  return (
    <div className={container} data-theme-toggle="" {...props}>
      {full.map(([key, Icon]) => (
        <Button
          key={key}
          variant="ghost"
          size="icon-sm"
          aria-label={key}
          className={cn(
            itemVariants({ active: value === key }),
            "cursor-pointer",
          )}
          onClick={() => setTheme(key)}
        >
          <Icon className="size-full" fill="currentColor" />
        </Button>
      ))}
    </div>
  );
}
