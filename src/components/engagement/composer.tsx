"use client";

import { PaperPlaneTiltIcon } from "@/components/shared/icons";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TypographyMuted } from "@/components/ui/typography";
import { useAutoResizeTextarea } from "@/hooks/use-auto-resize-textarea";
import { cn } from "@/lib/cn";
import { useEffect, useId, useRef, useState } from "react";

type ComposerSubmitResult = void | boolean;

export type ComposerSubmitHandler = (
  value: string,
) => ComposerSubmitResult | Promise<ComposerSubmitResult>;

export interface ComposerProps {
  maxLength: number;
  onSubmit: ComposerSubmitHandler;
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
  const [emptyError, setEmptyError] = useState(false);
  const errorId = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useAutoResizeTextarea(textareaRef, value, maxHeight);
  const pending = disabled || submitting;

  useEffect(() => {
    if (!autoFocus) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    textareaRef.current?.focus();
  }, [autoFocus]);

  const trimmed = value.trim();
  const remaining = maxLength - value.length;

  const restoreDraft = (body: string) => {
    setValue(body);
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    });
  };

  const submit = () => {
    if (pending) return;
    if (!trimmed) {
      setEmptyError(true);
      textareaRef.current?.focus();
      return;
    }
    const body = trimmed;
    setValue("");

    let result: ComposerSubmitResult | Promise<ComposerSubmitResult>;
    try {
      result = onSubmit(body);
    } catch {
      restoreDraft(body);
      return;
    }

    if (result === false) {
      restoreDraft(body);
      return;
    }

    if (!(result instanceof Promise)) return;

    setSubmitting(true);
    result
      .then((ok) => ok !== false)
      .catch(() => false)
      .then((ok) => {
        setSubmitting(false);
        if (!ok) restoreDraft(body);
      });
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
        onChange={(e) => {
          setValue(e.target.value);
          if (emptyError) setEmptyError(false);
        }}
        onKeyDown={handleKeyDown}
        rows={rows}
        maxLength={maxLength}
        placeholder={placeholder}
        aria-label={ariaLabel}
        aria-describedby={
          [emptyError ? errorId : null, counterId].filter(Boolean).join(" ") ||
          undefined
        }
        aria-invalid={emptyError || undefined}
        disabled={pending}
        className="resize-none min-h-20 max-h-50"
        autoComplete="off"
      />
      {emptyError && (
        <TypographyMuted id={errorId} className="text-xs text-destructive">
          Write a message before sending.
        </TypographyMuted>
      )}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <span
            id={counterId}
            aria-label={`${remaining} of ${maxLength} characters remaining`}
            className={cn(
              "text-sm font-medium tabular-nums transition-colors duration-150",
              remaining <= dangerThreshold
                ? "text-destructive"
                : remaining <= warnThreshold
                  ? "text-amber-700 dark:text-amber-500"
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
              variant="outline"
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
            disabled={pending}
            aria-busy={pending}
            className="gap-1.5 font-semibold"
          >
            {pending ? (
              <Spinner
                data-icon="inline-start"
                className="size-3.5"
                aria-hidden="true"
              />
            ) : (
              <PaperPlaneTiltIcon data-icon="inline-start" size={14} aria-hidden="true" />
            )}
            {submitLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
