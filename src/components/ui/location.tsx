"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { formatTimeInZone, getHourInZone, getZoneOffsetHours } from "@/lib/date";

function statusFor(hour: number) {
  if (hour < 2) return "one more commit";
  if (hour < 6) return "probably asleep";
  if (hour < 9) return "brewing coffee";
  if (hour < 13) return "deep in the code";
  if (hour < 14) return "lunch break";
  if (hour < 18) return "shipping things";
  if (hour < 21) return "side-quest hours";
  return "one more commit";
}

function SkyIcon({ hour }: { hour: number | null }) {
  if (hour === null) {
    return <span className="size-4 shrink-0" aria-hidden="true" />;
  }

  if (hour >= 6 && hour < 18) {
    return (
      <svg viewBox="0 0 16 16" aria-hidden="true" className="size-4 shrink-0">
        <g className="origin-center [transform-box:fill-box] motion-safe:animate-[spin_14s_linear_infinite]">
          {Array.from({ length: 8 }, (_, i) => (
            <path
              key={i}
              d="M8 1.2 V2.8"
              strokeWidth="1.3"
              strokeLinecap="round"
              transform={`rotate(${i * 45} 8 8)`}
              className="stroke-amber-400"
            />
          ))}
        </g>
        <circle cx="8" cy="8" r="3.2" className="fill-amber-400" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="size-4 shrink-0">
      <path
        d="M10.8 11.9 A5 5 0 1 1 7.2 3.1 A4 4 0 0 0 10.8 11.9 Z"
        className="fill-slate-300"
      />
      <path
        d="M12.5 2.5 l0.5 1.2 1.2 0.5 -1.2 0.5 -0.5 1.2 -0.5 -1.2 -1.2 -0.5 1.2 -0.5 z"
        className="fill-slate-300 motion-safe:animate-pulse"
      />
      <circle cx="13.2" cy="8.6" r="0.7" className="fill-slate-300 motion-safe:animate-pulse [animation-delay:700ms]" />
    </svg>
  );
}

interface LocationTagProps {
  city?: string;
  country?: string;
  timezone?: string;
}

export function LocationTag({
  city = "Mangalore",
  country = "India",
  timezone = "Asia/Kolkata",
}: LocationTagProps) {
  const [isActive, setIsActive] = useState(false);
  const [time, setTime] = useState({
    current: "",
    offset: "",
    hour: null as number | null,
  });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const current = formatTimeInZone(timezone, now);
      const diffHrs = getZoneOffsetHours(timezone, now);
      const hour = getHourInZone(timezone, now);

      const offset =
        diffHrs === 0
          ? "same time"
          : diffHrs > 0
            ? `+${diffHrs}h`
            : `-${Math.abs(diffHrs)}h`;

      setTime({ current, offset, hour });
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [timezone]);

  const offsetLabel =
    time.offset === "same time"
      ? "same time as you"
      : time.offset.startsWith("+")
        ? `${time.offset.slice(1)} ahead of you`
        : `${time.offset.slice(1)} behind you`;
  const status = time.hour === null ? "" : statusFor(time.hour);

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={() => setIsActive((prev) => !prev)}
      onMouseEnter={() => setIsActive(true)}
      onMouseLeave={() => setIsActive(false)}
      onFocus={() => setIsActive(true)}
      onBlur={() => setIsActive(false)}
      aria-label={
        time.current
          ? `${city}, ${country}. Local time ${time.current}, ${offsetLabel}, ${status}.`
          : `Location: ${city}, ${country}`
      }
      className={cn(
        "group relative h-auto gap-2.5 rounded-full py-2 pl-4 pr-3.5 transition-colors duration-500",
        "border border-border/60 hover:border-border",
      )}
    >
      <SkyIcon hour={time.hour} />

      <span
        className="relative grid h-5 items-center justify-items-start overflow-hidden text-left"
        aria-hidden="true"
      >
        <span
          className="col-start-1 row-start-1 self-center whitespace-nowrap text-sm font-medium transition-[transform,opacity] duration-500"
          style={{
            transform: isActive ? "translateY(-120%)" : "translateY(0)",
            opacity: isActive ? 0 : 1,
          }}
        >
          {city}, {country}
        </span>

        <span
          className="col-start-1 row-start-1 flex items-baseline gap-1.5 self-center whitespace-nowrap text-sm font-medium tabular-nums transition-[transform,opacity] duration-500"
          style={{
            transform: isActive ? "translateY(0)" : "translateY(120%)",
            opacity: isActive ? 1 : 0,
          }}
        >
          {time.current || `${city}, ${country}`}
          {status && (
            <span className="text-xs font-normal text-muted-foreground">
              {status}
            </span>
          )}
        </span>
      </span>

      <svg
        data-icon="inline-end"
        className="size-3 shrink-0 text-muted-foreground transition-[transform,opacity] duration-300"
        style={{
          transform: isActive
            ? "translateX(1px) rotate(-45deg)"
            : "translateX(0) rotate(0)",
          opacity: isActive ? 1 : 0.6,
        }}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
        />
      </svg>
    </Button>
  );
}
