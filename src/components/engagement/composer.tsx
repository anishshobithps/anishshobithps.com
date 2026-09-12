"use client";

import { PaperPlaneTiltIcon, SpinnerIcon } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TypographyMuted } from "@/components/ui/typography";
import { useAutoResizeTextarea } from "@/hooks/use-auto-resize-textarea";
import { cn } from "@/lib/cn";
import { useEffect, useRef, useState } from "react";

export interface ComposerProps {
  maxLength: number;
  onSubmit: (value: string) => void | Promise<void>;
  onCancel?: () => void;
  placeholder?: string;
  submitLabel: string;
  ariaLabel?: string;
  counterId?: string;
  rows?: number;
  autoFocus?: boolean;
  maxHeight?: number;
  warnThreshold?: number;
  dangerThreshold?: number;
  className?: string;
  disabled?: boolean;
}

export function Composer({
  maxLength,
  onSubmit,
  onCancel,
  placeholder,
  submitLabel,
  ariaLabel,
  counterId,
  rows = 3,
  autoFocus = false,
  maxHeight = 200,
  warnThreshold = 100,
  dangerThreshold = 20,
  className,
  disabled = false,
}: ComposerProps) {
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useAutoResizeTextarea(textareaRef, value, maxHeight);
  const pending = disabled || submitting;

  useEffect(() => {
    if (autoFocus) textareaRef.current?.focus();
  }, [autoFocus]);

  const trimmed = value.trim();
  const remaining = maxLength - value.length;

  const submit = () => {
    if (!trimmed || pending) return;
    const body = trimmed;
    setValue("");
    const result = onSubmit(body);
    if (result instanceof Promise) {
      setSubmitting(true);
      result.finally(() => setSubmitting(false));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={rows}
        maxLength={maxLength}
        placeholder={placeholder}
        aria-label={ariaLabel}
        aria-describedby={counterId}
        disabled={pending}
        className="resize-none min-h-20 max-h-50"
        autoComplete="off"
      />
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <span
            id={counterId}
            aria-live="polite"
            aria-label={`${remaining} of ${maxLength} characters remaining`}
            className={cn(
              "text-sm font-medium tabular-nums transition-colors duration-150",
              remaining <= dangerThreshold
                ? "text-destructive"
                : remaining <= warnThreshold
                  ? "text-amber-500"
                  : "text-muted-foreground",
            )}
          >
            {remaining}
          </span>
          <TypographyMuted className="text-xs">/ {maxLength}</TypographyMuted>
        </div>
        <div className="flex gap-2">
          {onCancel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              disabled={pending}
            >
              Cancel
            </Button>
          )}
          <Button
            size="sm"
            onClick={submit}
            disabled={!trimmed || pending}
            aria-busy={pending}
            className="gap-1.5 font-semibold"
          >
            {pending ? (
              <SpinnerIcon
                data-icon="inline-start"
                size={14}
                className="animate-spin"
                aria-hidden="true"
              />
            ) : (
              <PaperPlaneTiltIcon data-icon="inline-start" size={14} aria-hidden="true" />
            )}
            {pending ? "Sending…" : submitLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
