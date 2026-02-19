import { cn } from "@/lib/cn";

interface DividerProps {
  className?: string;
  borderBottom?: boolean;
  borderTop?: boolean;
  short?: boolean;
  plain?: boolean;
}

export function Divider({
  className,
  borderBottom = true,
  borderTop = true,
  short = false,
  plain = false,
}: DividerProps) {
  return (
    <div
      className={cn(
        "relative flex w-full",
        plain ? "h-px" : short ? "h-4" : "h-8",
        "before:absolute before:left-1/2 before:-translate-x-1/2 before:z-0 before:w-screen",
        !plain && (short ? "before:h-4" : "before:h-8"),
        !plain && [
          "before:bg-[repeating-linear-gradient(315deg,var(--pattern-fg)_0,var(--pattern-fg)_1px,transparent_0,transparent_50%)]",
          "before:bg-size-[10px_10px]",
          "before:[--pattern-fg:color-mix(in_oklab,var(--color-border)_40%,transparent)]",
        ],
        !plain && borderBottom && "before:border-b before:border-border",
        borderTop && "before:border-t before:border-border",
        className,
      )}
    />
  );
}
