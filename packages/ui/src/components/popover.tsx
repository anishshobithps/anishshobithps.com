"use client"

import * as React from "react"
import {
  Popover as PopoverPrimitive,
  PopoverContent as PopoverContentPrimitive,
  PopoverTrigger as PopoverTriggerPrimitive,
} from "@ui-sdk/react/popover"

import { cn } from "@repo/ui/lib/cn"

function Popover(props: React.ComponentProps<typeof PopoverPrimitive>) {
  return <PopoverPrimitive {...props} />
}

function PopoverTrigger({
  asChild = false,
  children,
  ...props
}: React.ComponentProps<typeof PopoverTriggerPrimitive> & { asChild?: boolean }) {
  if (asChild && React.isValidElement(children)) {
    return <PopoverTriggerPrimitive render={children} {...props} />
  }
  return <PopoverTriggerPrimitive {...props}>{children}</PopoverTriggerPrimitive>
}

function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: Omit<React.ComponentProps<typeof PopoverContentPrimitive>, "className" | "children"> & {
  className?: string
  children?: React.ReactNode
}) {
  return (
    <PopoverContentPrimitive
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "bg-popover text-popover-foreground z-50 w-72 origin-(--transform-origin) rounded-md border p-4 shadow-md outline-hidden transition-[opacity,scale] duration-150 data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0 motion-reduce:transition-none",
        className
      )}
      {...props}
    />
  )
}

export {
  Popover,
  PopoverTrigger,
  PopoverContent,
}
