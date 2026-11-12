import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import type { Route } from "next";
import { cva } from "class-variance-authority";
import { cn } from "@repo/ui/lib/cn";
import { Text } from "@repo/ui/components/typography";
import { ArrowUpRightIcon } from "@repo/icons";
import { RepoCard } from "@/components/repo-card";
import { resolveLinkPreview } from "@/lib/link-preview/resolve";
import type { LinkPreview } from "@/lib/link-preview/types";
import { LinkImage } from "./link-image";
import {
  toCardModel,
  type CardModel,
  type CardStat,
  type MediaShape,
} from "./link-card-model";

export type LinkCardVariant = "default" | "compact" | "row" | "preview";

export interface LinkCardProps {
  url: string;
  label?: string;
  note?: string;
  variant?: LinkCardVariant;
  className?: string;
}

const frameVariants = cva(
  "not-prose group relative flex min-w-0 text-left no-underline outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
  {
    variants: {
      variant: {
        default:
          "items-start gap-4 rounded-lg border border-border bg-card p-4 shadow-xs hover:border-foreground/20 hover:bg-accent/50",
        compact:
          "items-start gap-3 rounded-lg border border-border bg-card p-3 hover:border-foreground/20 hover:bg-accent/50",
        row: "items-center gap-2.5 rounded-md px-2.5 py-2 hover:bg-accent/60",
        preview: "w-80 max-w-[calc(100vw-3rem)] flex-col gap-3",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

const SHAPES: Record<MediaShape, string> = {
  wide: "aspect-video w-24 rounded-md sm:w-36",
  square: "size-16 rounded-md sm:size-20",
  round: "size-14 rounded-full",
};

const SKELETON_HEIGHT: Record<LinkCardVariant, string> = {
  default: "h-28",
  compact: "h-24",
  row: "h-9",
  preview: "h-24 w-80 max-w-[calc(100vw-3rem)]",
};

function Stats({ stats, className }: { stats: CardStat[]; className?: string }) {
  if (stats.length === 0) return null;
  return (
    <ul
      role="list"
      className={cn("flex flex-wrap items-center gap-x-3 gap-y-1", className)}
    >
      {stats.map((stat) => (
        <li key={stat.key} className="inline-flex items-center gap-1 tabular-nums">
          {stat.dot && (
            <span
              aria-hidden="true"
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: stat.dot }}
            />
          )}
          {stat.icon}
          <Text as="span" variant="caption">
            {stat.text}
          </Text>
        </li>
      ))}
    </ul>
  );
}

function Media({ media, className }: { media: CardModel["media"]; className?: string }) {
  if (!media) return null;
  return <LinkImage src={media.src} className={cn(SHAPES[media.shape], className)} />;
}

function Eyebrow({ model }: { model: CardModel }) {
  return (
    <span className="flex min-w-0 items-center gap-1.5">
      {model.icon}
      <span className="block min-w-0 truncate">
        <Text as="span" variant="caption">
          {model.eyebrow}
        </Text>
      </span>
    </span>
  );
}

function Arrow({ external }: { external: boolean }) {
  if (!external) return null;
  return (
    <ArrowUpRightIcon
      aria-hidden="true"
      className="size-3.5 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-px group-hover:translate-x-px group-hover:text-foreground"
    />
  );
}

function Title({ children, lines = 1 }: { children: ReactNode; lines?: 1 | 2 }) {
  return (
    <span className={cn("block min-w-0", lines === 1 ? "truncate" : "line-clamp-2")}>
      <Text as="span" variant="title">
        {children}
      </Text>
    </span>
  );
}

function Description({ children, lines }: { children: ReactNode; lines: 1 | 2 | 3 }) {
  return (
    <span
      className={cn(
        "block min-w-0",
        lines === 1 && "line-clamp-1",
        lines === 2 && "line-clamp-2",
        lines === 3 && "line-clamp-3",
      )}
    >
      <Text as="span" variant="caption">
        {children}
      </Text>
    </span>
  );
}

function Shell({
  model,
  variant,
  label,
  className,
  children,
}: {
  model: CardModel;
  variant: LinkCardVariant;
  label: string;
  className?: string;
  children: ReactNode;
}) {
  const classes = cn(frameVariants({ variant }), className);

  if (variant === "preview") {
    return (
      <div data-slot="link-card" data-kind="preview" className={classes}>
        {children}
      </div>
    );
  }

  const ariaLabel = `${label}, ${model.eyebrow}${model.external ? ", opens in a new tab" : ""}`;

  if (!model.external) {
    return (
      <Link
        href={model.href as Route}
        data-slot="link-card"
        aria-label={ariaLabel}
        className={classes}
      >
        {children}
      </Link>
    );
  }

  return (
    <a
      href={model.href}
      target="_blank"
      rel="noopener noreferrer"
      data-slot="link-card"
      aria-label={ariaLabel}
      className={classes}
    >
      {children}
    </a>
  );
}

interface ViewProps {
  preview: LinkPreview;
  variant?: LinkCardVariant;
  label?: string;
  note?: string;
  className?: string;
}

export function LinkCardView({
  preview,
  variant = "default",
  label,
  note,
  className,
}: ViewProps) {
  if (preview.kind === "github-repo" && variant === "default") {
    return (
      <div className={cn("not-prose", className)}>
        <RepoCard
          owner={preview.data.fullName.split("/")[0] ?? ""}
          repo={preview.data.fullName.split("/")[1] ?? ""}
          data={preview.data}
          release={preview.release}
          note={note}
          href={preview.url}
        />
      </div>
    );
  }

  const model = toCardModel(preview);
  const title = label ?? model.title;
  const description = note ?? model.description;

  if (variant === "row") {
    const trailing = model.stats.find((stat) => stat.key === "stars") ?? model.stats[0];
    return (
      <Shell model={model} variant={variant} label={title} className={className}>
        {model.icon}
        <Title>{title}</Title>
        {trailing && (
          <span className="ml-auto inline-flex shrink-0 items-center gap-1 tabular-nums">
            {trailing.icon}
            <Text as="span" variant="caption">
              {trailing.text}
            </Text>
          </span>
        )}
        <Arrow external={model.external} />
      </Shell>
    );
  }

  if (variant === "preview") {
    return (
      <Shell model={model} variant={variant} label={title} className={className}>
        {model.media?.shape === "wide" && (
          <Media media={model.media} className="w-full sm:w-full" />
        )}
        <span className="flex items-start gap-3">
          {model.media && model.media.shape !== "wide" && <Media media={model.media} />}
          <span className="flex min-w-0 flex-1 flex-col gap-1.5">
            <Eyebrow model={model} />
            <Title lines={2}>{title}</Title>
            {description && <Description lines={3}>{description}</Description>}
            <Stats stats={model.stats} className="mt-0.5" />
          </span>
        </span>
      </Shell>
    );
  }

  const compact = variant === "compact";
  return (
    <Shell model={model} variant={variant} label={title} className={className}>
      <span className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className="flex items-center justify-between gap-3">
          <Eyebrow model={model} />
          <Arrow external={model.external} />
        </span>
        <Title lines={compact ? 1 : 2}>{title}</Title>
        {description && <Description lines={compact ? 1 : 2}>{description}</Description>}
        <Stats stats={model.stats} className="mt-0.5" />
      </span>
      {!compact && <Media media={model.media} />}
    </Shell>
  );
}

async function LinkCardBody({ url, ...rest }: LinkCardProps) {
  const preview = await resolveLinkPreview(url);
  return <LinkCardView preview={preview} {...rest} />;
}

export function LinkCardSkeleton({
  variant = "default",
  className,
}: {
  variant?: LinkCardVariant;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "not-prose animate-pulse rounded-lg border border-border/60 bg-muted/30",
        SKELETON_HEIGHT[variant],
        className,
      )}
    />
  );
}

export function LinkCard(props: LinkCardProps) {
  return (
    <Suspense
      fallback={<LinkCardSkeleton variant={props.variant} className={props.className} />}
    >
      <LinkCardBody {...props} />
    </Suspense>
  );
}
