import { cn } from "@/lib/cn";
import { cva, type VariantProps } from "class-variance-authority";

const DecorIconVariants = cva(
  "pointer-events-none absolute hidden lg:block z-30 size-5 shrink-0 stroke-1 stroke-muted-foreground",
  {
    variants: {
      position: {
        "top-left":
          "top-0 left-0 -translate-x-[calc(50%+0.5px)] -translate-y-[calc(50%+0.5px)]",
        "top-right":
          "top-0 right-0 translate-x-[calc(50%+0.5px)] -translate-y-[calc(50%+0.5px)]",
        "bottom-right":
          "right-0 bottom-0 translate-x-[calc(50%+0.5px)] translate-y-[calc(50%+0.5px)]",
        "bottom-left":
          "bottom-0 left-0 -translate-x-[calc(50%+0.5px)] translate-y-[calc(50%+0.5px)]",
      },
    },
    defaultVariants: {
      position: "top-left",
    },
  },
);

type DecorIconProps = React.ComponentProps<"svg"> &
  VariantProps<typeof DecorIconVariants>;

export function DecorIcon({ position, className, ...props }: DecorIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={cn(DecorIconVariants({ position, className }))}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

type FullWidthDividerProps = React.ComponentProps<"div"> & {
  contained?: boolean;
  position?: "top" | "bottom";
};

export function FullWidthDivider({
  className,
  contained = false,
  position,
  ...props
}: FullWidthDividerProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute h-px bg-border",
        // full-bleed (default)
        "data-[contained=false]:left-1/2 data-[contained=false]:w-screen data-[contained=false]:-translate-x-1/2",
        // contained
        "data-[contained=true]:inset-x-0 data-[contained=true]:w-full",
        // position
        position &&
          "data-[position=top]:-top-px data-[position=bottom]:-bottom-px",
        className,
      )}
      data-contained={contained}
      data-position={position}
      {...props}
    />
  );
}
