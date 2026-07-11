"use client";

import { useCallback, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Text, TypographyMuted } from "@/components/ui/typography";
import {
  ArrowDownIcon,
  ChatCircleIcon,
  DownloadIcon,
  HeartIcon,
  SignInIcon,
  SignOutIcon,
  XIcon,
} from "@/components/shared/icons";
import { LogoIcon } from "@/components/shared/logo-icon";
import { Avatar } from "@/components/engagement/avatar";
import { SignInButton, useClerk, useUser } from "@clerk/nextjs";
import { useDraggable } from "@/hooks/use-draggable";
import { useEngagementAnchor } from "@/hooks/use-engagement-anchor";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/cn";

const FAB_SIZE = 48;

const CARD_CLASS =
  "group h-auto w-full justify-start gap-3 rounded-lg border border-border bg-muted/30 p-3 text-left whitespace-normal hover:border-foreground/25 hover:bg-muted/50";

function HubLabel({ children }: { children: React.ReactNode }) {
  return (
    <TypographyMuted className="font-mono text-[11px] uppercase tracking-widest">
      {children}
    </TypographyMuted>
  );
}

function AuthSection({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();
  const { user, isSignedIn, isLoaded } = useUser();
  const { signOut } = useClerk();

  return (
    <section className="flex flex-col gap-2">
      <HubLabel>Account</HubLabel>
      {!isLoaded ? (
        <div
          aria-hidden="true"
          className="h-14 animate-pulse rounded-lg border border-border bg-muted/30"
        />
      ) : isSignedIn && user ? (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
          <Avatar
            imageUrl={user.imageUrl}
            name={user.fullName || user.username || "You"}
            size="size-8"
          />
          <div className="min-w-0 flex-1">
            <Text as="p" variant="small" className="truncate text-foreground">
              {user.fullName || user.username || "You"}
            </Text>
            {user.primaryEmailAddress?.emailAddress && (
              <Text as="p" variant="muted" className="truncate text-xs">
                {user.primaryEmailAddress.emailAddress}
              </Text>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              onClose();
              signOut({ redirectUrl: pathname });
            }}
            className="shrink-0 gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <SignOutIcon aria-hidden="true" className="size-3.5" />
            Sign out
          </Button>
        </div>
      ) : (
        <SignInButton
          mode="modal"
          forceRedirectUrl={pathname}
          signUpForceRedirectUrl={pathname}
        >
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2 pointer-coarse:h-11"
          >
            <SignInIcon aria-hidden="true" className="size-4" />
            Sign in
          </Button>
        </SignInButton>
      )}
    </section>
  );
}

function HubBody({
  repoCard,
  onClose,
}: {
  repoCard: React.ReactNode;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const engagement = useEngagementAnchor();
  const showAuth =
    pathname.startsWith("/guestbook") || pathname.startsWith("/blog");
  const isResume = pathname === "/resume";

  return (
    <div className="flex flex-col gap-6 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
      {engagement.present && (
        <section className="flex flex-col gap-2">
          <HubLabel>This post</HubLabel>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              onClose();
              engagement.scrollToEngagement();
            }}
            className={CARD_CLASS}
          >
            <span className="flex items-center gap-1.5 text-rose-500">
              <HeartIcon weight="fill" aria-hidden="true" className="size-4" />
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <Text as="span" variant="small" className="text-foreground">
                Reactions &amp; comments
              </Text>
              <Text as="span" variant="muted" className="text-xs">
                {engagement.commentCount != null
                  ? `${engagement.commentCount} ${engagement.commentCount === 1 ? "comment" : "comments"} · jump to the discussion`
                  : "Jump to the discussion"}
              </Text>
            </span>
            <ChatCircleIcon
              aria-hidden="true"
              className="size-4 text-muted-foreground"
            />
            <ArrowDownIcon
              aria-hidden="true"
              className="size-4 text-muted-foreground transition-transform group-hover:translate-y-0.5"
            />
          </Button>
        </section>
      )}

      {isResume && (
        <section className="flex flex-col gap-2">
          <HubLabel>Resume</HubLabel>
          <Button asChild variant="ghost" className={CARD_CLASS}>
            <a href="/api/resume/download" download onClick={onClose}>
              <DownloadIcon
                aria-hidden="true"
                className="size-4 shrink-0 text-foreground"
              />
              <span className="flex min-w-0 flex-1 flex-col">
                <Text as="span" variant="small" className="text-foreground">
                  Download resume
                </Text>
                <Text as="span" variant="muted" className="truncate text-xs">
                  Grab the latest PDF
                </Text>
              </span>
            </a>
          </Button>
        </section>
      )}

      {showAuth && <AuthSection onClose={onClose} />}

      <section className="flex flex-col gap-2">
        <HubLabel>Repository</HubLabel>
        {repoCard}
      </section>
    </div>
  );
}

export function FloatingHub({ repoCard }: { repoCard: React.ReactNode }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [boundary, setBoundary] = useState<Element | null>(null);
  const fabRef = useRef<HTMLButtonElement>(null);
  const { position, dragging, moved, handlers } = useDraggable(
    "floating-hub:position",
    FAB_SIZE,
  );

  const toggle = useCallback(() => {
    if (moved.current) return;
    setBoundary(document.getElementById("main-content"));
    setOpen((prev) => !prev);
  }, [moved]);

  if (!position) return null;

  const fab = (
    <Button
      ref={fabRef}
      type="button"
      variant="ghost"
      size="icon"
      aria-label={open ? "Close quick menu" : "Open quick menu"}
      aria-haspopup="dialog"
      aria-expanded={open}
      {...handlers}
      onClick={toggle}
      className={cn(
        "size-12 touch-none rounded-full border border-border bg-background/90 shadow-lg backdrop-blur-md transition-[transform,box-shadow,border-color] select-none hover:bg-background/90",
        dragging
          ? "scale-105 cursor-grabbing shadow-xl"
          : "cursor-grab hover:-translate-y-0.5 hover:shadow-xl active:scale-95",
        open && "border-foreground/30",
      )}
    >
      {open ? (
        <XIcon aria-hidden="true" className="size-5 text-foreground" />
      ) : (
        <LogoIcon
          size={22}
          aria-hidden="true"
          className="size-[22px] text-foreground"
        />
      )}
    </Button>
  );

  return (
    <div
      style={{ position: "fixed", left: position.x, top: position.y, zIndex: 40 }}
      className="print:hidden"
    >
      {isMobile ? (
        <>
          {fab}
          <Drawer open={open} onOpenChange={setOpen}>
            <DrawerContent>
              <DrawerTitle className="sr-only">Quick menu</DrawerTitle>
              <DrawerDescription className="sr-only">
                Quick actions for this page and the source repository.
              </DrawerDescription>
              <ScrollArea className="w-full [&>[data-slot=scroll-area-viewport]]:max-h-[70dvh]">
                <div className="mx-auto w-full max-w-md">
                  <HubBody
                    repoCard={repoCard}
                    onClose={() => setOpen(false)}
                  />
                </div>
              </ScrollArea>
            </DrawerContent>
          </Drawer>
        </>
      ) : (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverAnchor asChild>{fab}</PopoverAnchor>
          <PopoverContent
            side="top"
            align="end"
            sideOffset={12}
            collisionPadding={16}
            collisionBoundary={boundary ?? undefined}
            onInteractOutside={(event) => {
              if (fabRef.current?.contains(event.target as Node)) {
                event.preventDefault();
              }
            }}
            className="max-h-[80vh] w-96 overflow-y-auto p-0"
            aria-label="Quick menu"
          >
            <HubBody repoCard={repoCard} onClose={() => setOpen(false)} />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
