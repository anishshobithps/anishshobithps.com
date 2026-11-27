"use client"

import * as React from "react"
import { Switch as SwitchPrimitive, SwitchThumb } from "@ui-sdk/react/switch"

import { cn } from "@repo/ui/lib/cn"

function Switch({
  className,
  size = "default",
  ...props
}: Omit<React.ComponentProps<typeof SwitchPrimitive>, "className"> & {
  className?: string
  size?: "sm" | "default"
}) {
  return (
    <SwitchPrimitive
      data-size={size}
      className={cn(
        "peer relative after:absolute after:-inset-[5px] data-checked:bg-primary data-unchecked:bg-input focus-visible:border-ring focus-visible:ring-ring/50 dark:data-unchecked:bg-input/80 group/switch inline-flex shrink-0 cursor-pointer items-center rounded-full border border-transparent shadow-xs transition-[color,background-color,border-color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-[1.15rem] data-[size=default]:w-8 data-[size=sm]:h-3.5 data-[size=sm]:w-6",
        className
      )}
      {...props}
    >
      <SwitchThumb className="bg-background dark:data-unchecked:bg-foreground dark:data-checked:bg-primary-foreground pointer-events-none block rounded-full ring-0 transition-transform group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 data-checked:translate-x-[calc(100%-2px)] data-unchecked:translate-x-0" />
    </SwitchPrimitive>
  )
}

export { Switch }
