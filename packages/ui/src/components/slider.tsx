"use client"

import * as React from "react"
import {
  Slider as SliderPrimitive,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
} from "@ui-sdk/react/slider"

import { cn } from "@repo/ui/lib/cn"

type SliderProps = {
  value?: number[]
  defaultValue?: number[]
  onValueChange?: (value: number[]) => void
  onValueCommit?: (value: number[]) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  orientation?: "horizontal" | "vertical"
  name?: string
  className?: string
  "aria-label"?: string
}

const asArray = (value: number | number[]) => (Array.isArray(value) ? value : [value])

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  onValueChange,
  onValueCommit,
  "aria-label": ariaLabel,
  ...props
}: SliderProps) {
  const thumbs = (value ?? defaultValue ?? [min, max]).length

  return (
    <SliderPrimitive
      value={value}
      defaultValue={defaultValue}
      min={min}
      max={max}
      onValueChange={(next: number | number[]) => onValueChange?.(asArray(next))}
      onValueCommit={(next: number | number[]) => onValueCommit?.(asArray(next))}
      className={cn(
        "relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        className
      )}
      {...props}
    >
      <SliderControl className="flex h-5 w-full items-center data-[orientation=vertical]:h-full data-[orientation=vertical]:w-5 data-[orientation=vertical]:justify-center">
        <SliderTrack className="relative grow rounded-full bg-muted data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5">
          <SliderIndicator className="rounded-full bg-primary data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full" />
          {Array.from({ length: thumbs }, (_, index) => (
            <SliderThumb
              key={index}
              aria-label={ariaLabel}
              className="block size-4 shrink-0 rounded-full border border-primary bg-background shadow-sm ring-ring/50 transition-[color,box-shadow] hover:ring-4 has-focus-visible:ring-4 data-disabled:pointer-events-none data-disabled:opacity-50"
            />
          ))}
        </SliderTrack>
      </SliderControl>
    </SliderPrimitive>
  )
}

export { Slider }
