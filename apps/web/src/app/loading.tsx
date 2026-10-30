"use client";

import { isoCanvas } from "@/components/diagrams/classes";
import { LoaderCaption, LogoLoader } from "@/components/shared/loader";
import { cn } from "@/lib/cn";

export default function Loading() {
  return (
    <div
      className="relative flex min-h-screen w-full flex-col items-center justify-center gap-5 bg-background"
      role="status"
      aria-label="Loading"
      aria-live="polite"
    >
      <div
        aria-hidden="true"
        className={cn(
          isoCanvas,
          "pointer-events-none absolute top-1/2 left-1/2 size-80 -translate-1/2 mask-[radial-gradient(closest-side,black,transparent)]",
        )}
      />
      <LogoLoader size={96} className="relative" />
      <LoaderCaption className="relative" />
    </div>
  );
}
