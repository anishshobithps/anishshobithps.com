"use client";

import * as React from "react";
import { XIcon } from "@repo/ui/icons";
import {
  Dialog as DialogPrimitive,
  DialogBackdrop,
  DialogClose as DialogClosePrimitive,
  DialogContent as DialogContentPrimitive,
  DialogDescription as DialogDescriptionPrimitive,
  DialogTitle as DialogTitlePrimitive,
  DialogTrigger as DialogTriggerPrimitive,
} from "@ui-sdk/react/dialog";

import { cn } from "@repo/ui/lib/cn";
import { Button } from "@repo/ui/components/button";

type WithClassName<T> = Omit<T, "className" | "children"> & {
  className?: string;
  children?: React.ReactNode;
};

function Dialog(props: React.ComponentProps<typeof DialogPrimitive>) {
  return <DialogPrimitive {...props} />;
}

function DialogTrigger({
  asChild = false,
  children,
  ...props
}: React.ComponentProps<typeof DialogTriggerPrimitive> & { asChild?: boolean }) {
  if (asChild && React.isValidElement(children)) {
    return <DialogTriggerPrimitive render={children} {...props} />;
  }
  return <DialogTriggerPrimitive {...props}>{children}</DialogTriggerPrimitive>;
}

function DialogClose({
  asChild = false,
  children,
  ...props
}: React.ComponentProps<typeof DialogClosePrimitive> & { asChild?: boolean }) {
  if (asChild && React.isValidElement(children)) {
    return <DialogClosePrimitive render={children} {...props} />;
  }
  return <DialogClosePrimitive {...props}>{children}</DialogClosePrimitive>;
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: WithClassName<React.ComponentProps<typeof DialogContentPrimitive>> & {
  showCloseButton?: boolean;
}) {
  return (
    <>
      <DialogBackdrop className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-none" />
      <DialogContentPrimitive
        className={cn(
          "fixed inset-0 z-50 m-auto grid h-fit max-h-[calc(100dvh-2rem)] w-full max-w-[calc(100%-2rem)] gap-4 rounded-lg border bg-background p-6 text-foreground shadow-lg outline-none transition duration-200 ease-out data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 motion-reduce:transition-none sm:max-w-lg",
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogClosePrimitive
            aria-label="Close"
            className="absolute top-4 right-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
          >
            <XIcon aria-hidden="true" />
          </DialogClosePrimitive>
        )}
      </DialogContentPrimitive>
    </>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean;
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogClosePrimitive render={<Button variant="outline" />}>
          Close
        </DialogClosePrimitive>
      )}
    </div>
  );
}

function DialogTitle({
  className,
  ...props
}: WithClassName<React.ComponentProps<typeof DialogTitlePrimitive>>) {
  return (
    <DialogTitlePrimitive
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: WithClassName<React.ComponentProps<typeof DialogDescriptionPrimitive>>) {
  return (
    <DialogDescriptionPrimitive
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
};
