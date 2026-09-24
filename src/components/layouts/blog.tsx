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
import { TOCItem, TOCItems } from "fumadocs-ui/components/toc/clerk";
import {
  TOCProvider,
  TOCScrollArea,
  useTOCItems,
} from "fumadocs-ui/components/toc";
import { CaretDownIcon, TextAlignLeftIcon } from "@/components/shared/icons";
import {
  type ComponentProps,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function TOCList() {
  const items = useTOCItems();
  if (items.length === 0) return null;
  return (
    <TOCItems className="[--color-fd-primary:var(--brand)]">
      {items.map((item) => (
        <TOCItem
          key={item.url}
          item={item}
          className="data-[active=true]:font-medium data-[active=true]:text-(--brand-text)!"
        />
      ))}
    </TOCItems>
  );
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
        className="transition-[stroke-dashoffset] duration-300 ease-out"
      />
      {normalized > 0 && normalized < max && (
        <circle
          cx={tipX}
          cy={tipY}
          r={strokeWidth * 0.85}
          fill="currentColor"
          className="transition-[cx,cy] duration-300 ease-out"
        />
      )}
    </svg>
  );
}

function MobileTOC() {
  const items = useTOCItems();
  const active = useActiveAnchor();
  const [open, setOpen] = useState(false);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollContainerRef.current) return;
    const activeEl = scrollContainerRef.current.querySelector(
      '[data-active="true"]',
    );
    activeEl?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [active]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const onLinkClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest("a")) setOpen(false);
    };
    container.addEventListener("click", onLinkClick);
    return () => container.removeEventListener("click", onLinkClick);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const selected = useMemo(
    () => items.findIndex((item) => active === item.url.slice(1)),
    [items, active],
  );

  if (items.length === 0) return null;

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 xl:hidden bg-background/60 pointer-events-none animate-in fade-in-0 duration-200"
          aria-hidden
        />
      )}
      <div
        ref={rootRef}
        className="sticky top-14 z-40 -mt-px border border-line bg-background xl:hidden"
      >
        <Collapsible open={open} onOpenChange={setOpen}>
          <header
            className={cn(
              "transition-shadow",
              open && "shadow-lg",
            )}
          >
            <CollapsibleTrigger
              className="flex w-full h-10 items-center text-sm gap-2.5 px-gutter cursor-pointer"
            >
              <ProgressCircle
                value={(selected + 1) / Math.max(1, items.length)}
                max={1}
                className={cn(
                  "size-4 text-muted-foreground transition-colors",
                  selected !== -1 && "text-(--brand)",
                )}
              />
              <span className="sr-only">Table of contents, </span>
              <span
                className={cn(
                  "flex-1 truncate text-start",
                  selected !== -1 ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {selected !== -1 ? items[selected]?.title : "On this page"}
              </span>
              <span className="shrink-0 font-mono text-xs text-muted-foreground tabular-nums">
                {selected !== -1 ? selected + 1 : 0}
                <span className="mx-0.5" aria-hidden="true">/</span>
                <span className="sr-only"> of </span>
                {items.length}
              </span>
              <CaretDownIcon
                aria-hidden="true"
                className={cn(
                  "size-4 shrink-0 text-muted-foreground transition-transform",
                  open && "rotate-180",
                )}
              />
            </CollapsibleTrigger>

            <CollapsibleContent
              className={cn(
                "overflow-hidden bg-background",
                mounted &&
                  "data-[state=open]:animate-fd-collapsible-down data-[state=closed]:animate-fd-collapsible-up",
              )}
            >
              <div
                className="px-gutter pb-3"
                ref={scrollContainerRef}
              >
                <TOCScrollArea className="max-h-[50vh]">
                  <TOCList />
                </TOCScrollArea>
              </div>
            </CollapsibleContent>
          </header>
        </Collapsible>
      </div>
    </>
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

      <Section variant="article">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_240px] gap-12">
          <article className="prose min-w-0">{children}</article>
          <nav
            aria-label="Table of contents"
            className="hidden xl:block relative border-l -mt-8 xl:-mt-12 pt-8 xl:pt-12 -mb-8 xl:-mb-12 pb-8 xl:pb-12"
          >
            <div className="pl-8 sticky top-20 flex flex-col gap-6">
              <div>
                <TypographySmall className="text-muted-foreground mb-3 flex items-center gap-1.5">
                  <TextAlignLeftIcon className="size-3.5 shrink-0" aria-hidden="true" />
                  On this page
                </TypographySmall>

                <TOCScrollArea className="max-h-[calc(100vh-8rem)] **:data-[slot=scroll-area-viewport]:scroll-fade-effect-y">
                  <TOCList />
                </TOCScrollArea>
              </div>
            </div>
          </nav>
        </div>
      </Section>
    </TOCProvider>
  );
}
