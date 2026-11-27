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

function PopoverHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="popover-header"
      className={cn("flex flex-col gap-1 text-sm", className)}
      {...props}
    />
  )
}

function PopoverTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <div
      data-slot="popover-title"
      className={cn("font-medium", className)}
      {...props}
    />
  )
}

function PopoverDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="popover-description"
      className={cn("text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
}
