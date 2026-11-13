"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import type { RefObject } from "react";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@repo/ui/components/drawer";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@repo/ui/components/popover";
import { ScrollArea } from "@repo/ui/components/scroll-area";
import { Button } from "@repo/ui/components/button";
import { Text, TypographyMuted } from "@repo/ui/components/typography";
import { ArrowDownIcon, DownloadIcon } from "@repo/icons";
import { LogoMascot } from "@/components/shared/logo-mascot";
import { LinkPreviewPanel } from "@/components/shared/link-preview-panel";
import { SoundPanel } from "@/components/shared/sound-controls";
import {
  CommentBubble,
  ReadingProgress,
} from "@/components/shared/hub-widgets";
import { useEngagementAnchor } from "@/hooks/use-engagement-anchor";

const CARD_CLASS =
  "group h-auto w-full justify-start gap-3 rounded-lg border border-border bg-muted/30 p-3 text-left whitespace-normal hover:border-foreground/25 hover:bg-muted/50";

function HubLabel({ children }: { children: React.ReactNode }) {
  return (
    <TypographyMuted className="text-xs">
      {children}
    </TypographyMuted>
  );
}

function greetingFor(pathname: string) {
  if (pathname.startsWith("/blog/"))
    return [
      "enjoying the read?",
      "Reactions, comments and the repo live here.",
    ];
  if (pathname === "/resume")
    return ["hiring? nice.", "The PDF is one tap away."];
  if (pathname.startsWith("/guestbook"))
    return ["leaving a mark?", "Sign in below, then say hi."];
  return ["psst, shortcuts", "The stuff that didn't fit in the header."];
}

function HubHeader() {
  const pathname = usePathname();
  const [title, subtitle] = greetingFor(pathname);
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/30 text-foreground">
        <LogoMascot size={30} waving />
      </span>
      <div className="flex min-w-0 flex-col gap-1">
        <Text
          as="p"
          variant="small"
          className="font-pixel text-xs text-(--brand-text)"
        >
          {title}
        </Text>
        <Text as="p" variant="muted" className="text-xs">
          {subtitle}
        </Text>
      </div>
    </div>
  );
}

function DragTip() {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="size-5 shrink-0 overflow-visible"
      >
        <path
          d="M12 3 V21 M3 12 H21 M9 6 L12 3 L15 6 M9 18 L12 21 L15 18 M6 9 L3 12 L6 15 M18 9 L21 12 L18 15"
          fill="none"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="2 2.5"
          className="animate-mascot-march stroke-(--brand)"
        />
      </svg>
      <Text as="p" variant="muted" className="text-xs">
        Tip: drag this button anywhere. It remembers the spot.
      </Text>
    </div>
  );
}

const HubAuth = dynamic(() => import("@/components/shared/hub-auth"), {
  loading: () => <AuthSkeleton />,
});

function AuthSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="h-14 animate-pulse rounded-lg border border-border bg-muted/30"
    />
  );
}

function AuthSection({ onClose }: { onClose: () => void }) {
  return (
    <section className="flex flex-col gap-2">
      <HubLabel>Account</HubLabel>
      <HubAuth onClose={onClose} />
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
    pathname.startsWith("/guestbook") || pathname.startsWith("/blog/");
  const isResume = pathname === "/resume";

  return (
    // eslint-disable-next-line shadcn/no-arbitrary-values
    <div className="flex flex-col gap-6 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
      <HubHeader />

      {engagement.present && (
        <section className="flex flex-col gap-2">
          <HubLabel>This post</HubLabel>
          <ReadingProgress />
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              onClose();
              engagement.scrollToEngagement();
            }}
            className={CARD_CLASS}
          >
            <CommentBubble count={engagement.commentCount} />
            <span className="flex min-w-0 flex-1 flex-col">
              <Text as="span" variant="small" className="text-foreground">
                Reactions &amp; comments
              </Text>
              <Text as="span" variant="muted" className="text-xs">
                {engagement.commentCount === 0
                  ? "Quiet in here. Be the first to say something"
                  : engagement.commentCount != null
                    ? `Jump to the ${engagement.commentCount} ${engagement.commentCount === 1 ? "comment" : "comments"}`
                    : "Jump to the discussion"}
              </Text>
            </span>
            <ArrowDownIcon
              data-icon="inline-end"
              aria-hidden="true"
              className="size-4 text-muted-foreground transition-transform group-hover:translate-y-0.5"
            />
          </Button>
        </section>
      )}

      {isResume && (
        <section className="flex flex-col gap-2">
          <HubLabel>Resume</HubLabel>
          <Button asChild variant="secondary" className={CARD_CLASS}>
            <a
              href="/api/resume/download"
              download
              data-sound="download"
              onClick={onClose}
            >
              <DownloadIcon
                data-icon="inline-start"
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

      {pathname.startsWith("/blog/") && (
        <section className="flex flex-col gap-2">
          <HubLabel>Reading</HubLabel>
          <LinkPreviewPanel />
        </section>
      )}

      <section className="flex flex-col gap-2">
        <HubLabel>Sound</HubLabel>
        <SoundPanel />
      </section>

      <section className="flex flex-col gap-2">
        <HubLabel>Repository</HubLabel>
        {repoCard}
      </section>

      <DragTip />
    </div>
  );
}


interface HubPanelProps {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  isMobile: boolean;
  boundary: Element | null;
  fabRef: RefObject<HTMLButtonElement | null>;
  repoCard: React.ReactNode;
}

export default function HubPanel({
  open,
  onOpenChange,
  isMobile,
  boundary,
  fabRef,
  repoCard,
}: HubPanelProps) {
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerTitle className="sr-only">Quick menu</DrawerTitle>
          <DrawerDescription className="sr-only">
            Quick actions for this page and the source repository.
          </DrawerDescription>
          <ScrollArea className="w-full [&>[data-slot=scroll-area-viewport]]:max-h-[70dvh]">
            <div className="mx-auto w-full max-w-md">
              <HubBody
                repoCard={repoCard}
                onClose={() => onOpenChange(false)}
              />
            </div>
          </ScrollArea>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverAnchor virtualRef={fabRef} />
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
        <HubBody repoCard={repoCard} onClose={() => onOpenChange(false)} />
      </PopoverContent>
    </Popover>
  );
}
