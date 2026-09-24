import { IsoStage } from "@/components/diagrams/iso-stage";
import { isoCanvas } from "@/components/diagrams/classes";
import { ArrowRightIcon } from "@/components/shared/icons";
import {
  Heading,
  SectionLabel,
  TypographyMuted,
} from "@/components/ui/typography";
import { cn } from "@/lib/cn";
import { formatShortDate } from "@/lib/date";
import { padIndex } from "@/lib/text";
import { postTransitionName } from "@/lib/view-transition";
import type { Route } from "next";
import Link from "next/link";
import { ViewTransition } from "react";
import type { BlogPost } from "./blogs-client";

interface PostCardProps {
  post: BlogPost;
  featured?: boolean;
}

function CoverMeta({ label, number, accent }: { label?: string; number: number; accent?: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between gap-3 p-4">
      {label && (
        <SectionLabel
          pixel
          className={cn("flex items-center gap-2", accent && "text-(--brand-text)")}
        >
          {accent && <span className="size-1.5 rounded-full bg-(--brand) motion-safe:animate-pulse" />}
          {label}
        </SectionLabel>
      )}
      <SectionLabel pixel className="ml-auto">
        No.{padIndex(number)}
      </SectionLabel>
    </div>
  );
}

function Tags({ tags, max }: { tags?: string[]; max: number }) {
  if (!tags || tags.length === 0) return null;
  return (
    <ul role="list" aria-label="Tags" className="flex flex-wrap gap-1.5">
      {tags.slice(0, max).map((tag) => (
        <li key={tag}>
          <TypographyMuted className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs">
            {tag}
          </TypographyMuted>
        </li>
      ))}
    </ul>
  );
}

export function PostCard({ post, featured = false }: PostCardProps) {
  const date = post.date ? formatShortDate(post.date) : undefined;

  return (
    <Link
      href={post.url as Route}
      className={cn(
        "group/iso group/post grid h-full outline-none transition-colors duration-300 hover:bg-surface-hover focus-visible:bg-surface-hover",
        featured ? "md:grid-cols-[3fr_2fr]" : "grid-rows-[auto_1fr]",
      )}
    >
      <IsoStage
        className={cn(
          isoCanvas,
          "relative aspect-video border-b border-line",
          featured && "md:aspect-auto md:min-h-80 md:border-r md:border-b-0",
        )}
      >
        {post.cover}
        <CoverMeta
          label={featured ? "Latest" : post.tags?.[0]}
          number={post.number}
          accent={featured}
        />
      </IsoStage>

      <div
        className={cn(
          "flex flex-col gap-3 p-gutter",
          featured && "justify-center gap-4 md:p-8",
        )}
      >
        {date && post.date && (
          <TypographyMuted asChild className="font-mono text-xs oldstyle-nums">
            <time dateTime={post.date}>{date}</time>
          </TypographyMuted>
        )}
        <ViewTransition name={postTransitionName(post.url)}>
          <Heading as="h2" level={featured ? "h3" : "h4"} className="text-pretty">
            {post.title}
          </Heading>
        </ViewTransition>
        {post.description && (
          <TypographyMuted className={cn("leading-relaxed", !featured && "line-clamp-2")}>
            {post.description}
          </TypographyMuted>
        )}
        <div className="mt-auto flex items-end justify-between gap-4 pt-2">
          <Tags tags={post.tags} max={featured ? 5 : 3} />
          <ArrowRightIcon
            aria-hidden="true"
            className="size-4 shrink-0 text-muted-foreground transition-[translate,color] duration-300 group-hover/post:translate-x-1 group-hover/post:text-foreground"
          />
        </div>
      </div>
    </Link>
  );
}
