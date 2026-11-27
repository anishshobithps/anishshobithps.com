"use client";

import { Button } from "@repo/ui/components/button";
import { TrashIcon } from "@repo/ui/icons";

export function DeleteButton({
  label,
  onDelete,
}: {
  label: string;
  onDelete: () => void;
}) {
  return (
    <Button
      variant="destructive-outline"
      size="sm"
      onClick={onDelete}
      aria-label={label}
    >
      <TrashIcon data-icon="inline-start" size={14} aria-hidden="true" />
      <span className="hidden sm:inline">Delete</span>
    </Button>
  );
}
