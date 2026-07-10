"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { formatTimeInZone, getZoneOffsetHours } from "@/lib/date";

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
  const [time, setTime] = useState({ current: "", offset: "" });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const current = formatTimeInZone(timezone, now);
      const diffHrs = getZoneOffsetHours(timezone, now);

      const offset =
        diffHrs === 0
          ? "same time"
          : diffHrs > 0
            ? `+${diffHrs}h`
            : `-${Math.abs(diffHrs)}h`;

      setTime({ current, offset });
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
          ? `${city}, ${country}. Local time ${time.current}, ${offsetLabel}.`
          : `Location: ${city}, ${country}`
      }
      className={cn(
        "group relative h-auto gap-2.5 rounded-full py-2 pl-4 pr-3.5 transition-colors duration-500",
        "border border-border/60 hover:border-border",
      )}
    >
      <span className="relative flex size-2 shrink-0" aria-hidden="true">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-500/40" />
        <span className="relative inline-flex size-2 rounded-full bg-green-500" />
      </span>

      <span
        className="relative grid h-5 items-center overflow-hidden"
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
          className="col-start-1 row-start-1 flex items-baseline gap-1.5 self-center whitespace-nowrap text-sm font-medium transition-[transform,opacity] duration-500"
          style={{
            transform: isActive ? "translateY(0)" : "translateY(120%)",
            opacity: isActive ? 1 : 0,
          }}
        >
          {time.current || `${city}, ${country}`}
          {time.offset && (
            <span className="text-xs font-normal text-muted-foreground">
              · {time.offset}
            </span>
          )}
        </span>
      </span>

      <svg
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
