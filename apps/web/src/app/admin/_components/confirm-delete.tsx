"use client";

import type { ReactElement, ReactNode } from "react";
import { buttonVariants } from "@repo/ui/components/button";
import { Text } from "@repo/ui/components/typography";
import { cn } from "@repo/ui/lib/cn";
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@ui-sdk/react/alert-dialog";

export function ConfirmDelete({
  trigger,
  title,
  description,
  confirm,
  onConfirm,
  compact = false,
}: {
  trigger: ReactElement;
  title: ReactNode;
  description: ReactNode;
  confirm: string;
  onConfirm: () => void;
  compact?: boolean;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger render={trigger} />
      <AlertDialogBackdrop className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-none" />
      <AlertDialogContent
        className={cn(
          "fixed inset-0 z-50 m-auto grid h-fit w-full gap-4 rounded-lg border border-border bg-background p-6 text-foreground shadow-lg outline-none transition duration-200 ease-out data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 motion-reduce:transition-none",
          compact
            ? "max-w-xs text-center"
            : "max-w-[calc(100%-2rem)] text-center sm:max-w-lg sm:text-start",
        )}
      >
        <div className="grid gap-1.5 wrap-anywhere">
          <AlertDialogTitle render={<Text as="h2" variant="large" />}>
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription render={<Text variant="muted" />}>
            {description}
          </AlertDialogDescription>
        </div>
        <div
          className={
            compact
              ? "grid grid-cols-2 gap-2"
              : "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"
          }
        >
          <AlertDialogClose className={buttonVariants({ variant: "outline" })}>
            Cancel
          </AlertDialogClose>
          <AlertDialogClose
            value="confirm"
            data-agent-confirm={confirm}
            action={onConfirm}
            className={buttonVariants({ variant: "destructive" })}
          >
            Delete
          </AlertDialogClose>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
