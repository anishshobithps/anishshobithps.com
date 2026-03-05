import { cn } from "@/lib/cn";
import { forwardRef, type SVGProps } from "react";

const VB_HEIGHT = 64;
const CROP_LEFT = 12;
const CROP_RIGHT = 52;
const VB_W = CROP_RIGHT - CROP_LEFT;

interface LogoIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
}

export const LogoIcon = forwardRef<SVGSVGElement, LogoIconProps>(
  (
    { size = 64, color = "currentColor", className, onClick, ...props },
    ref,
  ) => {
    const scaledWidth = Math.round((VB_W / VB_HEIGHT) * size);

    return (
      <svg
        ref={ref}
        role="img"
        aria-label="Anish Shobith P S logo"
        viewBox={`${CROP_LEFT} 0 ${VB_W} ${VB_HEIGHT}`}
        width={scaledWidth}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        onClick={onClick}
        className={cn(
          "transition-colors select-none",
          onClick && "cursor-pointer",
          className,
        )}
        {...props}
      >
        <title>Anish Shobith P S</title>
        <polygon points="32,4 48,60 40.5,60 32,14 23.5,60 16,60" fill={color} />
        <rect x="18" y="36" width="11" height="5" rx="2.5" fill={color} />
        <rect x="35" y="36" width="11" height="5" rx="2.5" fill={color} />
      </svg>
    );
  },
);

LogoIcon.displayName = "LogoIcon";
