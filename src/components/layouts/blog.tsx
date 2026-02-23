"use client";

import { Section } from "@/components/layouts/page";
import { FullWidthDivider, DecorIcon } from "@/components/ui/border";
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
import { ChevronDown, TextAlignStart } from "lucide-react";
import {
  type ComponentProps,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
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
  const angle = -Math.PI / 2 + (normalized / max) * 2 * Math.PI;
  const tipX = size / 2 + radius * Math.cos(angle);
  const tipY = size / 2 + radius * Math.sin(angle);

  const cp = {
    cx: size / 2,
    cy: size / 2,
    r: radius,
    fill: "none",
    strokeWidth,
  };

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      aria-valuenow={normalized}
      aria-valuemin={min}
      aria-valuemax={max}
      className={className}
      {...props}
      role="progressbar"
      aria-label={`Reading progress: ${Math.round(normalized)}%`}
    >
      <circle {...cp} className="stroke-current/20" />
      <circle
        {...cp}
        stroke="currentColor"
        strokeDasharray={circumference}
        strokeDashoffset={circumference - progress}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        className="transition-all duration-300 ease-out"
      />
      {normalized > 0 && normalized < max && (
        <circle
          cx={tipX}
          cy={tipY}
          r={strokeWidth * 0.85}
          fill="currentColor"
          className="transition-all duration-300 ease-out"
        />
      )}
    </svg>
  );
}

export function MobileTOC() {
  const items = useTOCItems();
  const active = useActiveAnchor();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollContainerRef.current) return;
    const activeEl = scrollContainerRef.current.querySelector(
      '[data-active="true"]',
    );
    activeEl?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [active]);

  const selected = useMemo(
    () => items.findIndex((item) => active === item.url.slice(1)),
    [items, active],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="sticky top-14 z-50 xl:hidden bg-background shadow-sm before:pointer-events-none before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-border after:pointer-events-none after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-border backdrop-blur-md supports-backdrop-filter:bg-background/80">
      <FullWidthDivider position="top" />
      <DecorIcon position="top-left" />
      <DecorIcon position="top-right" />
      <DecorIcon position="bottom-left" />
      <DecorIcon position="bottom-right" />
      <Collapsible open={open} onOpenChange={setOpen}>
        <header
          className={cn(
            "backdrop-blur-sm transition-colors bg-background/80",
            open && "shadow-lg",
          )}
        >
          <CollapsibleTrigger className="flex w-full h-10 items-center text-sm gap-2.5 px-6 sm:px-8 lg:px-10 cursor-pointer">
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
            <span className="shrink-0 font-mono text-xs text-muted-foreground/60 tabular-nums">
              {selected !== -1 ? selected + 1 : 0}
              <span className="mx-0.5">/</span>
              {items.length}
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
                "data-[state=open]:animate-fd-collapsible-down data-[state=closed]:animate-fd-collapsible-up bg-background/80",
            )}
          >
            <div
              className="px-6 sm:px-8 lg:px-10 pb-3"
              ref={scrollContainerRef}
            >
              <TOCScrollArea className="max-h-[50vh]">
                <TOCItems />
              </TOCScrollArea>
            </div>
          </CollapsibleContent>
        </header>
      </Collapsible>
      <FullWidthDivider position="bottom" />
    </div>
  );
}

interface BlogBodyProps {
  toc: TOCItemType[];
  children: ReactNode;
}

export function BlogBody({ toc, children }: BlogBodyProps) {
  return (
    <TOCProvider toc={toc}>
      <MobileTOC />

      <Section noTopDivider>
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_240px] gap-12">
          <article className="prose min-w-0">{children}</article>
          <aside className="hidden xl:block relative border-l -mt-8 xl:-mt-12 pt-8 xl:pt-12 -mb-8 xl:-mb-12 pb-8 xl:pb-12">
            <DecorIcon position="top-left" />
            <DecorIcon position="bottom-left" />
            <div className="pl-8 sticky top-20 flex flex-col gap-6">
              <div>
                <TypographySmall className="text-muted-foreground mb-3 flex items-center gap-1.5">
                  <TextAlignStart className="size-3.5 shrink-0" />
                  On this page
                </TypographySmall>

                <TOCScrollArea className="max-h-[calc(100vh-8rem)] **:data-[slot=scroll-area-viewport]:scroll-fade-effect-y">
                  <TOCItems />
                </TOCScrollArea>
              </div>
            </div>
          </aside>
        </div>
      </Section>
    </TOCProvider>
  );
}
