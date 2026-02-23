"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

interface LocationTagProps {
  city?: string;
  country?: string;
  timezone?: string;
}

function getTargetOffsetMinutes(timezone: string, now: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const get = (type: string) =>
    parseInt(parts.find((p) => p.type === type)?.value ?? "0");
  const targetDate = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute"),
    get("second"),
  );
  return Math.round((targetDate - now.getTime()) / 60000);
}

export function LocationTag({
  city = "Mangalore",
  country = "India",
  timezone = "Asia/Kolkata",
}: LocationTagProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [offset, setOffset] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();

      setCurrentTime(
        new Intl.DateTimeFormat("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
          timeZone: timezone,
        }).format(now),
      );

      const localOffsetMins = -now.getTimezoneOffset();
      const targetOffsetMins = getTargetOffsetMinutes(timezone, now);
      const diffHrs = Math.round((targetOffsetMins - localOffsetMins) / 60);

      if (diffHrs === 0) setOffset("same TZ");
      else if (diffHrs > 0) setOffset(`+${diffHrs}h`);
      else setOffset(`-${Math.abs(diffHrs)}h`);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [timezone]);

  const offsetLabel =
    offset === "same TZ"
      ? "same timezone as you"
      : offset.startsWith("+")
        ? `${offset.slice(1)} ahead of you`
        : `${offset.slice(1)} behind you`;

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={() => setIsActive((prev) => !prev)}
      onMouseEnter={() => setIsActive(true)}
      onMouseLeave={() => setIsActive(false)}
      aria-label={
        isActive
          ? `Local time: ${currentTime}, ${offsetLabel}`
          : `Location: ${city}, ${country}`
      }
      aria-live="polite"
      className={cn(
        "relative group gap-3 rounded-full px-5 py-2 min-w-max transition-colors duration-500",
        "border border-border/60 hover:border-border",
      )}
    >
      <div
        className="relative flex items-center justify-center"
        aria-hidden="true"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500/40" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
        </span>
      </div>

      <div
        className="relative h-5 overflow-hidden min-w-max"
        aria-hidden="true"
      >
        <span
          className="block text-sm font-medium transition-[transform,opacity] duration-500"
          style={{
            transform: isActive ? "translateY(-100%)" : "translateY(0)",
            opacity: isActive ? 0 : 1,
          }}
        >
          {city}, {country}
        </span>

        <span
          className="absolute left-0 top-0 flex items-baseline gap-1.5 text-sm font-medium transition-[transform,opacity] duration-500"
          style={{
            transform: isActive ? "translateY(0)" : "translateY(100%)",
            opacity: isActive ? 1 : 0,
          }}
        >
          {currentTime}
          {offset && (
            <span className="text-xs text-muted-foreground font-normal">
              · {offset}
            </span>
          )}
        </span>
      </div>

      <svg
        className="h-3 w-3 text-muted-foreground transition-[transform,opacity] duration-300"
        style={{
          transform: isActive
            ? "translateX(2px) rotate(-45deg)"
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
