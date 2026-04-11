"use client";

import { PaperPlaneTiltIcon } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TypographyMuted } from "@/components/ui/typography";
import { cn } from "@/lib/cn";
import { useEffect, useRef, useState } from "react";

export function CommentComposer({
  userName,
  placeholder,
  onSubmit,
  onCancel,
  isReply = false,
}: {
  userName: string | null;
  placeholder?: string;
  onSubmit: (body: string) => void;
  onCancel?: () => void;
  isReply?: boolean;
}) {
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const MAX = 1000;
  const remaining = MAX - body.length;

  const resolvedPlaceholder =
    placeholder ??
    (userName
      ? `${userName}, say something. I dare you.`
      : "Say something. I dare you.");

  useEffect(() => {
    if (isReply) textareaRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 240) + "px";
  }, [body]);

  const handleSubmit = () => {
    if (!body.trim() || submitting) return;
    const trimmed = body.trim();
    setBody("");
    onSubmit(trimmed);
    setSubmitting(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="space-y-2">
      <Textarea
        ref={textareaRef}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={resolvedPlaceholder}
        rows={isReply ? 2 : 3}
        maxLength={MAX}
        aria-label={isReply ? "Write a reply" : "Write a comment"}
        className="resize-none overflow-hidden min-h-15"
      />
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <span
            aria-live="polite"
            className={cn(
              "text-sm font-medium tabular-nums transition-colors duration-150",
              remaining <= 20
                ? "text-destructive"
                : remaining <= 100
                  ? "text-amber-500"
                  : "text-muted-foreground",
            )}
          >
            {remaining}
          </span>
          <TypographyMuted className="text-xs">
            / {MAX} characters left
          </TypographyMuted>
        </div>
        <div className="flex gap-2">
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!body.trim() || submitting || body.length > MAX}
            aria-busy={submitting}
            className="gap-1.5 font-semibold"
          >
            <PaperPlaneTiltIcon size={14} aria-hidden="true" />
            {submitting ? "Posting…" : isReply ? "Reply" : "Comment"}
          </Button>
        </div>
      </div>
    </div>
  );
}
