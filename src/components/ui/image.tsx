"use client";

import NextImage, { type ImageProps as NextImageProps } from "next/image";
import { cn } from "@/lib/cn";
import { useState } from "react";

type AspectRatio = "square" | "video" | "portrait" | "wide" | "auto";

const ASPECT_CLASSES: Record<AspectRatio, string> = {
  square: "aspect-square",
  video: "aspect-video",
  portrait: "aspect-[3/4]",
  wide: "aspect-[21/9]",
  auto: "",
};

const ROUNDED_CLASSES = {
  none: "",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  full: "rounded-full",
};

interface ImageProps extends Omit<NextImageProps, "className"> {
  aspect?: AspectRatio;
  containerClassName?: string;
  className?: string;
  rounded?: "none" | "sm" | "md" | "lg" | "xl" | "full";
}

export function Image({
  aspect = "auto",
  containerClassName,
  className,
  rounded = "md",
  alt,
  fill,
  width,
  height,
  ...props
}: ImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const roundedClass = ROUNDED_CLASSES[rounded];
  const aspectClass = ASPECT_CLASSES[aspect];
  const isFill = fill ?? aspect !== "auto";

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-muted",
        aspectClass,
        roundedClass,
        containerClassName,
      )}
    >
      {!error ? (
        <NextImage
          alt={alt}
          fill={isFill}
          width={!isFill ? width : undefined}
          height={!isFill ? height : undefined}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          sizes={isFill ? "(max-width: 768px) 100vw, 50vw" : undefined}
          className={cn(
            "object-cover transition-opacity duration-500",
            loaded ? "opacity-100" : "opacity-0",
            className,
          )}
          {...props}
        />
      ) : (
        <div
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center gap-2 bg-muted text-muted-foreground",
            roundedClass,
          )}
          role="img"
          aria-label={alt}
        >
          <svg
            className="size-8 opacity-30"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <path
              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 3h18M3 3v18M21 3v18M3 21h18"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-xs font-mono opacity-40">Failed to load</span>
        </div>
      )}
    </div>
  );
}
