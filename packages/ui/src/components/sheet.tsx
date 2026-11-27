"use client";

import * as React from "react";
import { XIcon } from "@repo/ui/icons";
import {
  Drawer,
  DrawerBackdrop,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "@ui-sdk/react/drawer";

import { cn } from "@repo/ui/lib/cn";

type Styled<T> = Omit<T, "className" | "children"> & {
  className?: string;
  children?: React.ReactNode;
};

function Sheet({
  side = "right",
  ...props
}: React.ComponentProps<typeof Drawer>) {
  return <Drawer side={side} {...props} />;
}

function SheetTrigger(props: React.ComponentProps<typeof DrawerTrigger>) {
  return <DrawerTrigger {...props} />;
}

function SheetClose(props: React.ComponentProps<typeof DrawerClose>) {
  return <DrawerClose {...props} />;
}

function SheetContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: Styled<React.ComponentProps<typeof DrawerContent>> & {
  showCloseButton?: boolean;
}) {
  return (
    <>
      <DrawerBackdrop className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm" />
      <DrawerContent
        className={cn(
          "z-50 flex flex-col gap-4 bg-background shadow-lg outline-none",
          "data-[side=right]:h-full data-[side=right]:w-3/4 data-[side=right]:border-l data-[side=right]:sm:max-w-sm",
          "data-[side=left]:h-full data-[side=left]:w-3/4 data-[side=left]:border-r data-[side=left]:sm:max-w-sm",
          "data-[side=top]:h-auto data-[side=top]:w-full data-[side=top]:border-b",
          "data-[side=bottom]:h-auto data-[side=bottom]:w-full data-[side=bottom]:border-t",
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DrawerClose
            aria-label="Close"
            className="absolute top-4 right-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none"
          >
            <XIcon aria-hidden="true" className="size-4" />
          </DrawerClose>
        )}
      </DrawerContent>
    </>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5 p-4", className)}
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  );
}

function SheetTitle({
  className,
  ...props
}: Styled<React.ComponentProps<typeof DrawerTitle>>) {
  return (
    <DrawerTitle
      className={cn("font-semibold text-foreground", className)}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: Styled<React.ComponentProps<typeof DrawerDescription>>) {
  return (
    <DrawerDescription
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
