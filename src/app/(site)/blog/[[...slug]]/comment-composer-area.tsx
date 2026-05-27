"use client";

import { Avatar } from "./avatar";
import {
  PaperPlaneTiltIcon,
  PencilIcon,
  SignInIcon,
  SignOutIcon,
} from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/components/ui/button-group";
import { Textarea } from "@/components/ui/textarea";
import { TypographyMuted, TypographySmall } from "@/components/ui/typography";
import { cn } from "@/lib/cn";
import { SignInButton } from "@clerk/nextjs";
import Link from "next/link";
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

export interface CommentComposerAreaProps {
  isLoaded: boolean;
  isSignedIn: boolean | undefined;
  user:
    | {
        id: string;
        fullName: string | null;
        username: string | null;
        imageUrl: string;
      }
    | null
    | undefined;
  userName: string | null;
  onSubmit: (body: string) => void;
  onSignOut: () => void;
}

export function CommentComposerArea({
  isLoaded,
  isSignedIn,
  user,
  userName,
  onSubmit,
  onSignOut,
}: CommentComposerAreaProps) {
  if (!isLoaded) return null;

  if (isSignedIn && user) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar
              imageUrl={user.imageUrl}
              name={user.fullName || user.username || "You"}
              size="size-6"
            />
            <TypographyMuted className="text-xs truncate">
              Commenting as{" "}
              <span className="text-foreground font-medium">
                {user.fullName || user.username}
              </span>
            </TypographyMuted>
          </div>
          <ButtonGroup>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="gap-1.5 text-xs"
            >
              <Link href="/guestbook">
                <PencilIcon size={13} aria-hidden="true" />
                <span className="hidden sm:inline">Checkout Guestbook!!</span>
              </Link>
            </Button>
            <ButtonGroupSeparator />
            <Button
              variant="outline"
              size="sm"
              onClick={onSignOut}
              className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              aria-label="Sign out"
            >
              <SignOutIcon size={13} aria-hidden="true" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </ButtonGroup>
        </div>
        <CommentComposer userName={userName} onSubmit={onSubmit} />
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 px-4 border bg-muted/30">
      <div className="space-y-0.5">
        <TypographySmall className="font-semibold">
          Got something to say?
        </TypographySmall>
        <TypographyMuted className="text-xs">
          Sign in to comment. Also consider{" "}
          <Link
            href="/guestbook"
            className="underline underline-offset-4 hover:text-foreground transition-colors"
          >
            leave a note in the guestbook
          </Link>{" "}
          — it&apos;s like a comments section but less chaotic.
        </TypographyMuted>
      </div>
      <SignInButton mode="modal">
        <Button size="sm" className="gap-1.5 shrink-0">
          <SignInIcon size={14} aria-hidden="true" />
          Sign in to comment
        </Button>
      </SignInButton>
    </div>
  );
}
