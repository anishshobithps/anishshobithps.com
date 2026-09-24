import { cn } from "@/lib/cn";

export type MascotEyes = "open" | "happy" | "flat" | "angry";

interface MascotFigureProps {
  eyes?: MascotEyes;
  mouth?: string;
  mouthFilled?: boolean;
}

const MASCOT_POINTS = "32,4 48,60 40.5,60 32,14 23.5,60 16,60";

function MascotEyeShapes({ eyes }: { eyes: MascotEyes }) {
  if (eyes === "happy") {
    return (
      <path
        d="M18.5 40 Q23.5 33 28.5 40 M35.5 40 Q40.5 33 45.5 40"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    );
  }
  if (eyes === "angry") {
    return (
      <path
        d="M19 35 L28.5 39 M45 35 L35.5 39"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    );
  }
  const flat = eyes === "flat";
  return (
    <>
      {[18, 35].map((x) => (
        <rect
          key={x}
          className="[transform-box:fill-box] origin-center animate-mascot-blink"
          x={x}
          y={flat ? 37.5 : 36}
          width="11"
          height={flat ? 2.5 : 5}
          rx={flat ? 1.25 : 2.5}
          fill="currentColor"
        />
      ))}
    </>
  );
}

export function MascotFigure({
  eyes = "open",
  mouth,
  mouthFilled = false,
}: MascotFigureProps) {
  return (
    <>
      <polygon points={MASCOT_POINTS} fill="currentColor" />
      <g className="transition-[translate] duration-200 ease-out group-hover/fab:-translate-y-[3px]">
        <MascotEyeShapes eyes={eyes} />
      </g>
      {mouth && (
        <path
          d={mouth}
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          className={cn(
            "transition-[d,fill] duration-200 ease-[cubic-bezier(0.2,0,0,1)]",
            mouthFilled ? "fill-(--brand)" : "fill-transparent",
          )}
        />
      )}
    </>
  );
}

interface LogoMascotProps extends MascotFigureProps {
  size?: number;
  waving?: boolean;
  className?: string;
}

export function LogoMascot({
  size = 24,
  waving = false,
  className,
  ...figure
}: LogoMascotProps) {
  const viewBox = waving ? "10 0 50 64" : "12 0 40 64";
  const width = Math.round(((waving ? 50 : 40) / 64) * size);

  return (
    <svg
      viewBox={viewBox}
      style={{ width, height: size }}
      fill="none"
      aria-hidden="true"
      className={cn("mascot shrink-0 overflow-visible", className)}
    >
      {waving && (
        <g className="[transform-box:view-box] origin-[44px_42px] animate-mascot-wave">
          <path
            d="M44 42 L53 31"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="54.5" cy="29" r="3.2" className="fill-(--brand)" />
        </g>
      )}
      <MascotFigure {...figure} />
    </svg>
  );
}
