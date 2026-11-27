"use client";

import * as React from "react";
import {
  NavigationMenu as NavigationMenuPrimitive,
  NavigationMenuItem as NavigationMenuItemPrimitive,
  NavigationMenuLink as NavigationMenuLinkPrimitive,
  NavigationMenuList as NavigationMenuListPrimitive,
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
  NavigationMenuLink,
};
