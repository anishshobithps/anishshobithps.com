"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
import { cn } from "@repo/ui/lib/cn";

interface LinkImageProps {
  src: string;
  className?: string;
  fallback?: ReactNode;
}

export function LinkImage({ src, className, fallback = null }: LinkImageProps) {
  const [failed, setFailed] = useState(false);
  if (failed) return fallback;

  return (
    <span className={cn("relative block shrink-0 overflow-hidden bg-muted", className)}>
      <Image
        src={src}
        alt=""
        fill
        unoptimized
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className="object-cover"
      />
    </span>
  );
}
