"use client";

import Link from "next/link";
import { Button } from "@repo/ui/components/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@repo/ui/components/hover-card";
import {
  SectionLabel,
  Text,
  TypographyMuted,
  TypographySmall,
} from "@repo/ui/components/typography";
import { cn } from "@repo/ui/lib/cn";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  LinkIcon,
  XLogoIcon,
  LinkedinLogoIcon,
} from "@repo/icons";
import { playCue } from "@repo/sounds/sound-player";
import { toast } from "@/lib/toast";
import type { Route } from "next";
import type { ReactNode } from "react";

interface BlogPostNavProps {
  pageUrl: string;
  title: string;
}

export function BlogPostNav({ pageUrl, title }: BlogPostNavProps) {
  const handleCopy = async () => {
    await navigator.clipboard.writeText(pageUrl);
    playCue("copy");
    toast.success("Link copied to clipboard");
  };

  const utmPageUrl = `${pageUrl}?utm_source=x&utm_medium=social&utm_campaign=blog`;
  const utmLinkedinUrl = `${pageUrl}?utm_source=linkedin&utm_medium=social&utm_campaign=blog`;

  const xUrl = `https://x.com/intent/post?url=${encodeURIComponent(utmPageUrl)}&text=${encodeURIComponent(title)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(utmLinkedinUrl)}`;

  return (
    <>
      <Button variant="outline" size="sm" asChild>
        <Link href="/blogs" data-sound="tap">
          <ArrowLeftIcon
            data-icon="inline-start"
            className="size-3.5 shrink-0"
            aria-hidden="true"
          />
          <TypographySmall>All posts</TypographySmall>
        </Link>
      </Button>

      <div role="group" aria-label="Share this post" className="flex items-center gap-2">
        <TypographyMuted aria-hidden="true">Share</TypographyMuted>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={handleCopy}
            aria-label="Copy link to this post"
            title="Copy link"
          >
            <LinkIcon className="size-4" aria-hidden="true" />
          </Button>

          <Button variant="outline" size="icon-sm" asChild>
            <a
              href={xUrl}
              data-sound="tap"
              target="_blank"
              rel="noopener noreferrer"
              title="Share on X"
              aria-label={`Share "${title}" on X (opens in new tab)`}
            >
              <XLogoIcon className="size-4" aria-hidden="true" />
            </a>
          </Button>

          <Button variant="outline" size="icon-sm" asChild>
            <a
              href={linkedinUrl}
              data-sound="tap"
              target="_blank"
              rel="noopener noreferrer"
              title="Share on LinkedIn"
              aria-label={`Share "${title}" on LinkedIn (opens in new tab)`}
            >
              <LinkedinLogoIcon className="size-4" aria-hidden="true" />
            </a>
          </Button>
        </div>
      </div>
    </>
  );
}

interface PostLink {
  url: string;
  title: string;
  description?: string;
  date?: string;
  readingTime?: string;
  tags?: string[];
  cover?: ReactNode;
}

function PostPreview({ post }: { post: PostLink }) {
  const meta = [post.date, post.readingTime].filter(Boolean);
  return (
    <div className="flex w-72 flex-col gap-3">
      {post.cover && (
        <div className="relative aspect-video overflow-hidden rounded-md border border-line bg-background">
          {post.cover}
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        {meta.length > 0 && (
          <Text as="p" variant="caption">
            {meta.join(", ")}
          </Text>
        )}
        <Text as="p" variant="title">
          {post.title}
        </Text>
        {post.description && (
          <div className="line-clamp-3">
            <TypographyMuted>{post.description}</TypographyMuted>
          </div>
        )}
      </div>
      {post.tags && post.tags.length > 0 && (
        <ul className="flex flex-wrap gap-1">
          {post.tags.map((tag) => (
            <li key={tag} className="rounded-sm bg-muted px-1.5 py-0.5">
              <Text as="span" variant="caption">
                {tag}
              </Text>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function PagerCard({ post, direction }: { post: PostLink; direction: "older" | "newer" }) {
  const newer = direction === "newer";
  const Arrow = newer ? ArrowRightIcon : ArrowLeftIcon;
  return (
    <HoverCard openDelay={250} closeDelay={120}>
      <HoverCardTrigger asChild>
    <Link
      href={post.url as Route}
      data-sound="flip"
      aria-label={`${newer ? "Newer" : "Older"} post: ${post.title}`}
      className={cn(
        "group flex flex-col gap-2 rounded-lg border border-line p-4 transition-colors hover:border-foreground/20 hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-ring",
        newer && "sm:col-start-2 sm:items-end sm:text-end",
      )}
    >
      <span className={cn("flex items-center gap-1.5", newer && "flex-row-reverse")}>
        <Arrow
          aria-hidden="true"
          className={cn(
            "size-3.5 text-muted-foreground transition-transform",
            newer ? "group-hover:translate-x-0.5" : "group-hover:-translate-x-0.5",
          )}
        />
        <SectionLabel pixel>{newer ? "Newer post" : "Older post"}</SectionLabel>
      </span>
      <Text as="span" variant="title">
        {post.title}
      </Text>
    </Link>
      </HoverCardTrigger>
      <HoverCardContent side="top" align={newer ? "end" : "start"}>
        <PostPreview post={post} />
      </HoverCardContent>
    </HoverCard>
  );
}

export function PostPager({ older, newer }: { older?: PostLink | null; newer?: PostLink | null }) {
  if (!older && !newer) return null;
  return (
    <nav aria-label="More posts" className="grid w-full gap-3 sm:grid-cols-2">
      {older && <PagerCard post={older} direction="older" />}
      {newer && <PagerCard post={newer} direction="newer" />}
    </nav>
  );
}
