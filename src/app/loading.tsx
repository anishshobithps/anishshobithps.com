"use client";

import { LogoLoader } from "@/components/shared/loader";

export default function Loading() {
  return (
    <div
      className="flex min-h-screen w-full items-center justify-center bg-background"
      role="status"
      aria-label="Loading"
      aria-live="polite"
    >
      <LogoLoader className="text-foreground" />
    </div>
  );
}
