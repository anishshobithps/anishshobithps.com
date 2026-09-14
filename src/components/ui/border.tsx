import { cn } from "@/lib/cn";

const positionClasses = {
  "top-left": "top-0 left-0",
  "top-right": "top-0 right-0",
  "bottom-right": "right-0 bottom-0",
  "bottom-left": "bottom-0 left-0",
} as const;

type Position = keyof typeof positionClasses;

type Align = "inner" | "outer";

const startOffset: Record<Align, string> = {
  inner: "calc(-50% + 0.5px)",
  outer: "calc(-50% - 0.5px)",
};

const endOffset: Record<Align, string> = {
  inner: "calc(50% - 0.5px)",
  outer: "calc(50% + 0.5px)",
};

type DecorIconProps = Omit<React.ComponentProps<"span">, "children"> & {
  position?: Position;
  alignX?: Align;
  alignY?: Align;
  pageBorder?: boolean;
};

export function DecorIcon({
  position = "top-left",
  alignX = "inner",
  alignY = "inner",
  pageBorder = false,
  className,
  style,
  ...props
}: DecorIconProps) {
  const [vertical, horizontal] = position.split("-") as [
    "top" | "bottom",
    "left" | "right",
  ];
  const x = horizontal === "left" ? startOffset[alignX] : endOffset[alignX];
  const y = vertical === "top" ? startOffset[alignY] : endOffset[alignY];

  return (
    <span
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute z-30 size-5 items-center justify-center",
        positionClasses[position],
        className,
      )}
      style={{ transform: `translate(${x}, ${y})`, ...style }}
      {...props}
    >
      <svg
        className={cn(
          pageBorder && "hidden lg:block",
          "size-5 shrink-0 stroke-1 stroke-muted-foreground",
        )}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M5 12h14" />
        <path d="M12 5v14" />
      </svg>
    </span>
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
        "data-[contained=false]:left-1/2 data-[contained=false]:w-screen data-[contained=false]:-translate-x-1/2",
        "data-[contained=true]:inset-x-0 data-[contained=true]:w-full",
        position &&
          "data-[position=top]:top-0 data-[position=bottom]:-bottom-px",
        className,
      )}
      data-contained={contained}
      data-position={position}
      {...props}
    />
  );
}
