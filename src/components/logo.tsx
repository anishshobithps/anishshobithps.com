import { cn } from "@/lib/cn";
import { forwardRef, SVGProps } from "react";

export interface LogoProps extends SVGProps<SVGSVGElement> {
  size?: number;
  container?: boolean;
  outline?: boolean;
  accentBackground?: boolean;
}

export const Logo = forwardRef<SVGSVGElement, LogoProps>(
  (
    {
      className,
      size = 64,
      container = true,
      outline = false,
      accentBackground = false,
      ...props
    },
    ref,
  ) => {
    const letterPointsContainer = "32,9 46,55 39.5,55 32,20 24.5,55 18,55";
    const letterPointsNoContainer = "32,4 48,60 40.5,60 32,14 23.5,60 16,60";

    return (
      <svg
        ref={ref}
        viewBox="0 0 64 64"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("transition-colors", className)}
        {...props}
      >
        {container && !outline && (
          <rect
            width="64"
            height="64"
            rx="14"
            className={accentBackground ? "fill-accent" : "fill-foreground"}
          />
        )}
        {outline && (
          <rect
            x="1"
            y="1"
            width="62"
            height="62"
            rx="13"
            fill="none"
            className="stroke-foreground"
            strokeWidth="1.5"
          />
        )}
        <polygon
          points={container ? letterPointsContainer : letterPointsNoContainer}
          className={
            accentBackground
              ? "fill-accent-foreground"
              : container
                ? "fill-background"
                : "fill-current"
          }
        />
        <rect
          x={container ? 18.5 : 18}
          y={container ? 34 : 36}
          width={container ? 10 : 11}
          height={container ? 4.5 : 5}
          rx={container ? 2.25 : 2.5}
          className={
            accentBackground
              ? "fill-accent-foreground"
              : container
                ? "fill-background"
                : "fill-current"
          }
        />
        <rect
          x={container ? 35.5 : 35}
          y={container ? 34 : 36}
          width={container ? 10 : 11}
          height={container ? 4.5 : 5}
          rx={container ? 2.25 : 2.5}
          className={
            accentBackground
              ? "fill-accent-foreground"
              : container
                ? "fill-background"
                : "fill-current"
          }
        />
      </svg>
    );
  },
);

Logo.displayName = "Logo";
