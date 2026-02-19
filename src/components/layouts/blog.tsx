"use client";

import { Section } from "@/components/layouts/page";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { TypographySmall } from "@/components/ui/typography";
import { cn } from "@/lib/cn";
import type { TOCItemType } from "fumadocs-core/toc";
import { useActiveAnchor } from "fumadocs-core/toc";
import { TOCItems } from "fumadocs-ui/components/toc/clerk";
import {
  TOCProvider,
  TOCScrollArea,
  useTOCItems,
} from "fumadocs-ui/components/toc/index";
import { CalendarDays, ChevronDown, Clock, TextAlignStart } from "lucide-react";
import {
  type ComponentProps,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function ProgressCircle({
  value,
  strokeWidth = 2,
  size = 24,
  min = 0,
  max = 100,
  className,
  ...props
}: ComponentProps<"svg"> & {
  value: number;
  strokeWidth?: number;
  size?: number;
  min?: number;
  max?: number;
}) {
  const normalized = clamp(value, min, max);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (normalized / max) * circumference;
  const cp = {
    cx: size / 2,
    cy: size / 2,
    r: radius,
    fill: "none",
    strokeWidth,
  };
  return (
    <svg
      role="progressbar"
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      aria-valuenow={normalized}
      aria-valuemin={min}
      aria-valuemax={max}
      className={className}
      {...props}
    >
      <circle {...cp} className="stroke-current/25" />
      <circle
        {...cp}
        stroke="currentColor"
        strokeDasharray={circumference}
        strokeDashoffset={circumference - progress}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        className="transition-all"
      />
    </svg>
  );
}

function MobileTOC() {
  const items = useTOCItems();
  const active = useActiveAnchor();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const selected = useMemo(
    () => items.findIndex((item) => active === item.url.slice(1)),
    [items, active],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="sticky top-18 z-10 xl:hidden">
      <Collapsible open={open} onOpenChange={setOpen}>
        <header
          className={cn(
            "border-b backdrop-blur-sm transition-colors bg-background/80",
            open && "shadow-lg",
          )}
        >
          <CollapsibleTrigger className="flex w-full h-10 items-center text-sm gap-2.5 px-6 sm:px-8 lg:px-10 focus-visible:outline-none cursor-pointer">
            <ProgressCircle
              value={(selected + 1) / Math.max(1, items.length)}
              max={1}
              className={cn(
                "size-4 text-muted-foreground",
                selected !== -1 && "text-primary",
              )}
            />
            <span className="flex-1 truncate text-start text-muted-foreground">
              {selected !== -1 ? items[selected]?.title : ""}
            </span>
            <ChevronDown
              className={cn(
                "size-4 shrink-0 text-muted-foreground transition-transform",
                open && "rotate-180",
              )}
            />
          </CollapsibleTrigger>
          <CollapsibleContent
            className={cn(
              "overflow-hidden",
              mounted &&
                "data-[state=open]:animate-fd-collapsible-down data-[state=closed]:animate-fd-collapsible-up",
            )}
          >
            <div className="px-6 sm:px-8 lg:px-10 pb-3">
              <TOCScrollArea className="max-h-[50vh]">
                <TOCItems />
              </TOCScrollArea>
            </div>
          </CollapsibleContent>
        </header>
      </Collapsible>
    </div>
  );
}

interface BlogBodyProps {
  toc: TOCItemType[];
  children: ReactNode;
  createdAt?: Date;
  lastModified?: Date;
  tags?: string[];
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function BlogBody({
  toc,
  children,
  createdAt,
  lastModified,
}: BlogBodyProps) {
  return (
    <TOCProvider toc={toc}>
      <MobileTOC />
      <Section>
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_220px] gap-10">
          <article className="prose min-w-0">{children}</article>
          <aside className="hidden xl:flex flex-col bg-muted/40 px-4 -mr-6 sm:-mr-8 lg:-mr-10 pr-6 sm:pr-8 lg:pr-10 -mb-20 pb-20 -mt-14 pt-14">
            <div className="sticky top-18 pt-4 flex flex-col gap-4">
              <div>
                <TypographySmall className="text-muted-foreground mb-3 flex items-center gap-1.5">
                  <TextAlignStart className="size-3.5 shrink-0" /> On this page
                </TypographySmall>
                <TOCScrollArea>
                  <TOCItems />
                </TOCScrollArea>
              </div>
              {createdAt && (
                <div className="border-t pt-4">
                  <TypographySmall className="text-muted-foreground flex items-center gap-1.5">
                    <CalendarDays className="size-3.5 shrink-0" /> Created
                  </TypographySmall>
                  <TypographySmall className="mt-1 font-mono text-xs text-foreground">
                    {formatDate(createdAt)}
                  </TypographySmall>
                </div>
              )}
              {lastModified && (
                <div
                  className={cn(
                    !createdAt && "border-t",
                    "pt-4",
                    createdAt && "pt-2",
                  )}
                >
                  <TypographySmall className="text-muted-foreground flex items-center gap-1.5">
                    <Clock className="size-3.5 shrink-0" /> Last modified
                  </TypographySmall>
                  <TypographySmall className="mt-1 font-mono text-xs text-foreground">
                    {formatDate(lastModified)}
                  </TypographySmall>
                </div>
              )}
            </div>
          </aside>
        </div>
      </Section>
    </TOCProvider>
  );
}
