"use client";

import { cn } from "@/lib/cn";
import { type ComponentProps, useEffect, useRef } from "react";

interface IsoStageProps extends ComponentProps<"div"> {
  ambient?: boolean;
}

export function IsoStage({ ambient = false, className, ...props }: IsoStageProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(hover: none)").matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => el.toggleAttribute("data-active", entry.isIntersecting),
      { threshold: ambient ? 0.2 : 0.6 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ambient]);

  return (
    <div
      ref={ref}
      data-ambient={ambient || undefined}
      className={cn("iso iso-stage", className)}
      {...props}
    />
  );
}
