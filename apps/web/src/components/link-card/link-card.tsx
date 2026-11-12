import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import type { Route } from "next";
import { cva } from "class-variance-authority";
import { cn } from "@repo/ui/lib/cn";
import { Text } from "@repo/ui/components/typography";
import { ArrowUpRightIcon } from "@repo/icons";
import { resolveLinkPreview } from "@/lib/link-preview/resolve";
import type { LinkPreview } from "@/lib/link-preview/types";
import { LinkImage } from "./link-image";
import {
  toCardModel,
  type CardModel,
  type CardStat,
  type MediaShape,
} from "./link-card-model";

type LinkCardVariant = "default" | "compact" | "row" | "preview";

export interface LinkCardProps {
  url: string;
  label?: string;
  note?: string;
  variant?: LinkCardVariant;
  className?: string;
}

const MAX_STATS = 4;

const frameVariants = cva(
  "not-prose group relative flex min-w-0 text-left no-underline outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
  {
    variants: {
      variant: {
        default:
          "items-start gap-3 rounded-lg border border-border p-3 hover:border-foreground/25 hover:bg-accent/40",
        compact:
          "items-start gap-3 rounded-lg border border-border p-3 hover:border-foreground/25 hover:bg-accent/40",
        row: "items-center gap-2.5 rounded-md px-2.5 py-2 hover:bg-accent/60",
        preview: "w-80 max-w-[calc(100vw-3rem)] items-start gap-3",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

const SHAPES: Record<MediaShape, string> = {
  wide: "aspect-video w-20 rounded-md",
  square: "size-12 rounded-md",
  round: "size-10 rounded-full",
};

const DESCRIPTION_LINES: Record<LinkCardVariant, 1 | 2 | 3> = {
  default: 2,
  compact: 1,
  row: 1,
  preview: 3,
};

function Footer({ model, stats }: { model: CardModel; stats: CardStat[] }) {
  return (
    <ul role="list" className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
      <li className="inline-flex min-w-0 items-center gap-1.5">
        {model.icon}
        <span className="block min-w-0 truncate *:text-nowrap">
          <Text as="span" variant="caption">
            {model.eyebrow}
          </Text>
        </span>
      </li>
      {stats.map((stat) => (
        <li key={stat.key} className="inline-flex items-center gap-1 tabular-nums">
          {stat.dot && (
            <span
              aria-hidden="true"
              className="size-2 shrink-0 rounded-full"
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

function Title({ children }: { children: ReactNode }) {
  return (
    <span className="block min-w-0 truncate *:text-nowrap">
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

function Arrow({ external }: { external: boolean }) {
  if (!external) return null;
  return (
    <ArrowUpRightIcon
      aria-hidden="true"
      className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
    />
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

function LinkCardView({ preview, variant = "default", label, note, className }: ViewProps) {
  const base = toCardModel(preview);
  const model =
    label && preview.kind.startsWith("github") ? { ...base, eyebrow: base.title } : base;
  const title = label ?? model.title;
  const description = note ?? model.description;

  if (variant === "row") {
    const trailing = model.stats.find((stat) => stat.key === "stars");
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

  return (
    <Shell model={model} variant={variant} label={title} className={className}>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-center justify-between gap-3">
          <Title>{title}</Title>
          <Arrow external={model.external} />
        </span>
        {description && (
          <Description lines={DESCRIPTION_LINES[variant]}>{description}</Description>
        )}
        <Footer model={model} stats={model.stats.slice(0, MAX_STATS)} />
      </span>
      {variant !== "compact" && model.media && (
        <LinkImage src={model.media.src} className={SHAPES[model.media.shape]} />
      )}
    </Shell>
  );
}

async function LinkCardBody({ url, ...rest }: LinkCardProps) {
  const preview = await resolveLinkPreview(url);
  return <LinkCardView preview={preview} {...rest} />;
}

function LinkCardSkeleton({
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
        variant === "row" ? "h-9" : "h-20",
        variant === "preview" && "w-80 max-w-[calc(100vw-3rem)]",
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
