import { cn } from "@repo/ui/lib/cn";

export type BandDoodleName = "bot" | "snail" | "plane" | "balloon" | "cone";

const INK = "stroke-foreground/80 fill-background";
const LINE = "fill-none stroke-foreground/80";
const GREEN = "fill-(--brand)/80 stroke-foreground/80";
const ROUND = "[stroke-linecap:round] [stroke-linejoin:round]";

function Walker({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  return <div className={cn("absolute left-0", className)}>{children}</div>;
}

function Bot() {
  return (
    <Walker className="bottom-px motion-safe:animate-band-walk">
      <svg viewBox="0 0 22 26" className={cn("h-6 w-5", ROUND)}>
        <path d="M11 5V1.6" className={LINE} strokeWidth="1.3" />
        <circle cx="11" cy="1.4" r="1.2" className="fill-(--brand) stroke-none" />
        <path
          d="M8 17v7"
          className={cn(
            LINE,
            "origin-top [transform-box:fill-box] motion-safe:animate-band-step",
          )}
          strokeWidth="1.5"
        />
        <path
          d="M14 17v7"
          className={cn(
            LINE,
            "origin-top [transform-box:fill-box] motion-safe:animate-band-step [animation-delay:-0.5s]",
          )}
          strokeWidth="1.5"
        />
        <rect x="4" y="5" width="14" height="12" rx="3" className={INK} strokeWidth="1.3" />
        <rect x="7" y="9" width="4" height="2.2" rx="1.1" className="fill-(--brand) stroke-none" />
        <rect x="12" y="9" width="4" height="2.2" rx="1.1" className="fill-(--brand) stroke-none" />
      </svg>
    </Walker>
  );
}

function Snail() {
  return (
    <Walker className="bottom-px motion-safe:animate-band-crawl">
      <svg viewBox="0 0 30 20" className={cn("h-5 w-8", ROUND)}>
        <path
          d="M2 18h21c3 0 4.6-2 3.4-4.4-.8-1.6-2.4-2.4-3.6-2.2M25 12.4l1.4-4.2M27.4 13.6l2.2-3"
          className={LINE}
          strokeWidth="1.4"
        />
        <circle cx="13" cy="10" r="7.4" className={GREEN} strokeWidth="1.3" />
        <path
          d="M13 10.2c.9-.9 2.2-.2 1.8.9-.6 1.6-3 1.2-3.3-.6-.4-2.4 2.2-3.8 4-2.6"
          className={LINE}
          strokeWidth="1"
        />
      </svg>
    </Walker>
  );
}

function Plane() {
  return (
    <Walker className="top-1/2 -translate-y-1/2 motion-safe:animate-band-glide">
      <div className="motion-safe:animate-band-bob">
        <svg viewBox="0 0 32 20" className={cn("h-5 w-8", ROUND)}>
          <path d="M2 9.4 30 2 17.4 18 14 11z" className={INK} strokeWidth="1.3" />
          <path d="M30 2 14 11" className={LINE} strokeWidth="1.1" />
          <path d="M14 11l3.4 7 3-5.2z" className="fill-(--brand)/80 stroke-none" />
        </svg>
      </div>
    </Walker>
  );
}

function Balloon() {
  return (
    <div className="absolute bottom-px left-[78%] motion-safe:animate-band-bob">
      <svg viewBox="0 0 16 30" className={cn("h-7 w-4", ROUND)}>
        <path d="M8 16c-1.6 3 1.6 5 0 8s1.4 4 0 5.4" className={LINE} strokeWidth="1" />
        <ellipse cx="8" cy="8" rx="6" ry="7.4" className={GREEN} strokeWidth="1.3" />
        <path d="M8 15.4 6.4 17.6h3.2z" className="fill-foreground/80 stroke-none" />
        <path d="M5 5.2c.4-1.4 1.4-2.2 2.6-2.4" className="fill-none stroke-background/80" strokeWidth="1.2" />
      </svg>
    </div>
  );
}

function Cone() {
  return (
    <div className="absolute bottom-px left-[9%]">
      <svg viewBox="0 0 14 26" className={cn("h-6 w-3.5 overflow-visible", ROUND)}>
        <path d="M3 11h8l-4 14.4z" className={INK} strokeWidth="1.3" />
        <path d="M4.4 14.6l5.2 0M5.6 18.2l2.8 0" className={LINE} strokeWidth="0.9" />
        <circle cx="7" cy="7" r="5.6" className={GREEN} strokeWidth="1.3" />
        <path
          d="M11.6 9.4v2.4"
          className="fill-none stroke-(--brand) motion-safe:animate-doodle-drip"
          strokeWidth="1.6"
        />
      </svg>
    </div>
  );
}

const doodles = {
  bot: Bot,
  snail: Snail,
  plane: Plane,
  balloon: Balloon,
  cone: Cone,
} satisfies Record<BandDoodleName, () => React.ReactNode>;

export function BandDoodle({ name }: { name: BandDoodleName }) {
  const Doodle = doodles[name];
  return (
    <div
      aria-hidden="true"
      className="section-band hidden overflow-hidden sm:block"
    >
      <Doodle />
    </div>
  );
}
