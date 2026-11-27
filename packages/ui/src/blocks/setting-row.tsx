"use client";

import { type ReactNode, useId } from "react";
import { Label } from "@repo/ui/components/label";
import { Text, TypographyMuted } from "@repo/ui/components/typography";

export function SettingRow({
  icon,
  label,
  hint,
  control,
  children,
}: {
  icon: ReactNode;
  label: string;
  hint: ReactNode;
  control: (ids: { id: string; "aria-describedby": string }) => ReactNode;
  children?: ReactNode;
}) {
  const id = useId();
  const controlId = `${id}-control`;
  const hintId = `${id}-hint`;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/30 p-3">
      <div className="flex items-center gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-background text-foreground">
          {icon}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Label htmlFor={controlId}>
            <Text as="span" variant="small">
              {label}
            </Text>
          </Label>
          <TypographyMuted id={hintId}>{hint}</TypographyMuted>
        </div>
        {control({ id: controlId, "aria-describedby": hintId })}
      </div>
      {children}
    </div>
  );
}
