"use client";

import { Avatar } from "@/app/blog/[[...slug]]/avatar";
import { CommentComposer } from "@/app/blog/[[...slug]]/comment-composer";
import { PencilIcon, SignInIcon, SignOutIcon } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/components/ui/button-group";
import { TypographyMuted, TypographySmall } from "@/components/ui/typography";
import { SignInButton } from "@clerk/nextjs";
import Link from "next/link";

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
            leaving your mark on the guestbook
          </Link>{" "}
          — it&apos;s like a comments section but less chaotic.
        </TypographyMuted>
      </div>
      <SignInButton mode="modal">
        <Button variant="outline" size="sm" className="gap-1.5 shrink-0">
          <SignInIcon size={14} aria-hidden="true" />
          Sign in
        </Button>
      </SignInButton>
    </div>
  );
}
