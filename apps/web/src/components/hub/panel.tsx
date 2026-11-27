"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

import { Button } from "@repo/ui/components/button";
import { Text, TypographyMuted } from "@repo/ui/components/typography";
import { ArrowDownIcon, DownloadIcon } from "@repo/ui/icons";
import { LogoMascot } from "@repo/ui/brand/logo-mascot";
import {
  LinkPreviewPanel,
  MotionPanel,
  SoundPanel,
} from "@/components/preferences/panels";
import {
  CommentBubble,
  ReadingProgress,
} from "@/components/hub/widgets";
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

const HubAuth = dynamic(() => import("@/components/hub/auth"), {
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

export default function HubPanel({
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
    <div
      className="flex flex-col gap-6 p-4"
      style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}
    >
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
        <HubLabel>Motion</HubLabel>
        <MotionPanel />
      </section>

      <section className="flex flex-col gap-2">
        <HubLabel>Repository</HubLabel>
        {repoCard}
      </section>

      <DragTip />
    </div>
  );
}

