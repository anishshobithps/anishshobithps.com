"use client"

import * as React from "react"
import { type VariantProps } from "class-variance-authority"
import {
  Toggle as TogglePrimitive,
  ToggleGroup as ToggleGroupPrimitive,
} from "@ui-sdk/react/toggle"

import { cn } from "@repo/ui/lib/cn"
import { toggleVariants } from "@repo/ui/components/toggle"

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants> & {
    spacing?: number
  }
>({
  size: "default",
  variant: "default",
  spacing: 0,
})

type GroupProps = Omit<
  React.ComponentProps<typeof ToggleGroupPrimitive>,
  "className" | "value" | "defaultValue" | "onValueChange" | "multiple" | "children"
> &
  VariantProps<typeof toggleVariants> & {
    className?: string
    spacing?: number
    children?: React.ReactNode
  } & (
    | {
        type: "single"
        value?: string
        defaultValue?: string
        onValueChange?: (value: string) => void
      }
    | {
        type: "multiple"
        value?: string[]
        defaultValue?: string[]
        onValueChange?: (value: string[]) => void
      }
  )

const toArray = (value: string | string[] | undefined) =>
  value === undefined ? undefined : Array.isArray(value) ? value : value ? [value] : []

function ToggleGroup({
  className,
  variant,
  size,
  spacing = 0,
  children,
  type,
  value,
  defaultValue,
  onValueChange,
  ...props
}: GroupProps) {
  return (
    <ToggleGroupPrimitive
      multiple={type === "multiple"}
      value={toArray(value)}
      defaultValue={toArray(defaultValue)}
      onValueChange={(next: string[]) => {
        if (type === "multiple") (onValueChange as ((v: string[]) => void) | undefined)?.(next)
        else (onValueChange as ((v: string) => void) | undefined)?.(next[0] ?? "")
      }}
      data-variant={variant}
      data-size={size}
      data-spacing={spacing}
      style={{ "--gap": spacing } as React.CSSProperties}
      className={cn(
        "group/toggle-group flex w-fit items-center gap-[--spacing(var(--gap))] rounded-md data-[spacing=default]:data-[variant=outline]:shadow-xs",
        className
      )}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size, spacing }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive>
  )
}

function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  ...props
}: Omit<React.ComponentProps<typeof TogglePrimitive>, "className"> &
  VariantProps<typeof toggleVariants> & { className?: string }) {
  const context = React.useContext(ToggleGroupContext)

  return (
    <TogglePrimitive
      data-variant={context.variant || variant}
      data-size={context.size || size}
      data-spacing={context.spacing}
      className={cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        "w-auto min-w-0 shrink-0 px-3 focus:z-10 focus-visible:z-10",
        "data-[spacing=0]:rounded-none data-[spacing=0]:shadow-none data-[spacing=0]:first:rounded-l-md data-[spacing=0]:last:rounded-r-md data-[spacing=0]:data-[variant=outline]:border-l-0 data-[spacing=0]:data-[variant=outline]:first:border-l",
        className
      )}
      {...props}
    >
      {children}
    </TogglePrimitive>
  )
}

export { ToggleGroup, ToggleGroupItem }
