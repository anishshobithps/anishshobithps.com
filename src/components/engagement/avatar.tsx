"use client";

import { cn } from "@/lib/cn";
import NextImage from "next/image";
import { memo } from "react";

function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export const Avatar = memo(function Avatar({
  imageUrl,
  name,
  size = "size-7 sm:size-8",
  className,
}: {
  imageUrl?: string | null;
  name: string;
  size?: string;
  className?: string;
}) {
  if (imageUrl) {
    return (
      <div
        className={cn(
          "relative shrink-0 rounded-full overflow-hidden ring-1 ring-border",
          size,
          className,
        )}
      >
        <NextImage
          src={imageUrl}
          alt={name}
          fill
          sizes="36px"
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      aria-label={name}
      className={cn(
        size,
        "shrink-0 rounded-full ring-1 ring-border bg-muted",
        "flex items-center justify-center",
        "text-[10px] font-semibold text-muted-foreground",
        className,
      )}
    >
      {initialsOf(name)}
    </div>
  );
});
