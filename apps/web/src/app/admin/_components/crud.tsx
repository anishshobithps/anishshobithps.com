"use client";

import type { ReactNode } from "react";
import { Button } from "@repo/ui/components/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@repo/ui/components/button-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { Spinner } from "@repo/ui/components/spinner";
import { PencilIcon, TrashIcon } from "@repo/ui/icons";
import { ConfirmDelete } from "@/app/admin/_components/confirm-delete";

export function RowActions({
  noun,
  disabled,
  onEdit,
  onDelete,
  deleteTitle,
  deleteDescription,
  deleteConfirm,
}: {
  noun: string;
  disabled: boolean;
  onEdit: () => void;
  onDelete: () => void;
  deleteTitle: ReactNode;
  deleteDescription: ReactNode;
  deleteConfirm: string;
}) {
  return (
    <ButtonGroup className="justify-end">
      <Button
        variant="secondary"
        size="icon"
        className="size-7"
        onClick={onEdit}
        aria-label={`Edit ${noun}`}
      >
        <PencilIcon className="size-3.5" />
      </Button>
      <ButtonGroupSeparator />
      <ConfirmDelete
        trigger={
          <Button
            variant="secondary"
            size="icon"
            className="size-7 text-destructive hover:text-destructive hover:bg-destructive/10"
            disabled={disabled}
            aria-label={`Delete ${noun}`}
          >
            <TrashIcon className="size-3.5" />
          </Button>
        }
        title={deleteTitle}
        description={deleteDescription}
        confirm={deleteConfirm}
        onConfirm={onDelete}
      />
    </ButtonGroup>
  );
}

export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  className,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={className}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

export function FormActions({
  onCancel,
  submitting,
}: {
  onCancel: () => void;
  submitting: boolean;
}) {
  return (
    <DialogFooter>
      <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
        Cancel
      </Button>
      <Button type="submit" disabled={submitting} aria-busy={submitting}>
        {submitting && <Spinner data-icon="inline-start" aria-hidden="true" />}
        Save
      </Button>
    </DialogFooter>
  );
}
