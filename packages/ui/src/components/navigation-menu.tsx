"use client";

import * as React from "react";
import { cva } from "class-variance-authority";
import { CaretDownIcon } from "@repo/ui/icons";
import {
  NavigationMenu as NavigationMenuPrimitive,
  NavigationMenuContent as NavigationMenuContentPrimitive,
  NavigationMenuItem as NavigationMenuItemPrimitive,
  NavigationMenuLink as NavigationMenuLinkPrimitive,
  NavigationMenuList as NavigationMenuListPrimitive,
  NavigationMenuTrigger as NavigationMenuTriggerPrimitive,
} from "@ui-sdk/react/navigation-menu";

import { cn } from "@repo/ui/lib/cn";

type Styled<T> = Omit<T, "className" | "children"> & {
  className?: string;
  children?: React.ReactNode;
};

function NavigationMenu({
  className,
  ...props
}: Styled<React.ComponentProps<typeof NavigationMenuPrimitive>>) {
  return (
    <NavigationMenuPrimitive
      className={cn(
        "group/navigation-menu relative flex max-w-max flex-1 items-center justify-center",
        className,
      )}
      {...props}
    />
  );
}

function NavigationMenuList({
  className,
  ...props
}: Styled<React.ComponentProps<typeof NavigationMenuListPrimitive>>) {
  return (
    <NavigationMenuListPrimitive
      className={cn(
        "group flex flex-1 list-none items-center justify-center gap-1",
        className,
      )}
      {...props}
    />
  );
}

function NavigationMenuItem({
  className,
  ...props
}: Styled<React.ComponentProps<typeof NavigationMenuItemPrimitive>>) {
  return (
    <NavigationMenuItemPrimitive className={cn("relative", className)} {...props} />
  );
}

const navigationMenuTriggerStyle = cva(
  "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-open:hover:bg-accent data-open:text-accent-foreground data-open:focus:bg-accent data-open:bg-accent/50 focus-visible:ring-ring/50 outline-none transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1",
);

function NavigationMenuTrigger({
  className,
  children,
  ...props
}: Styled<React.ComponentProps<typeof NavigationMenuTriggerPrimitive>>) {
  return (
    <NavigationMenuTriggerPrimitive
      className={cn(navigationMenuTriggerStyle(), className)}
      {...props}
    >
      {children}{" "}
      <CaretDownIcon
        className="relative top-px ml-1 size-3 transition duration-300 group-data-open:rotate-180"
        aria-hidden="true"
      />
    </NavigationMenuTriggerPrimitive>
  );
}

function NavigationMenuContent({
  className,
  sideOffset = 6,
  ...props
}: Styled<React.ComponentProps<typeof NavigationMenuContentPrimitive>>) {
  return (
    <NavigationMenuContentPrimitive
      sideOffset={sideOffset}
      className={cn(
        "bg-popover text-popover-foreground z-50 origin-(--transform-origin) overflow-hidden rounded-md border p-2 shadow transition-[opacity,scale] duration-200 data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0 motion-reduce:transition-none",
        className,
      )}
      {...props}
    />
  );
}

function NavigationMenuLink({
  className,
  asChild = false,
  children,
  ...props
}: Styled<React.ComponentProps<typeof NavigationMenuLinkPrimitive>> & {
  asChild?: boolean;
}) {
  const linkClassName = cn(
    "data-[active=true]:focus:bg-accent data-[active=true]:hover:bg-accent data-[active=true]:bg-accent/50 data-[active=true]:text-accent-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:ring-ring/50 [&_svg:not([class*='text-'])]:text-muted-foreground flex flex-col gap-1 rounded-sm p-2 text-sm transition-[color,background-color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1 [&_svg:not([class*='size-'])]:size-4",
    className,
  );
  if (asChild && React.isValidElement(children)) {
    return (
      <NavigationMenuLinkPrimitive
        render={children}
        className={linkClassName}
        {...props}
      />
    );
  }
  return (
    <NavigationMenuLinkPrimitive className={linkClassName} {...props}>
      {children}
    </NavigationMenuLinkPrimitive>
  );
}

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
};
