"use client";

import { Section } from "@/components/layouts/page";
import { Button } from "@repo/ui/components/button";
import { SectionLabel, Text } from "@repo/ui/components/typography";
import { cn } from "@repo/ui/lib/cn";
import type { TOCItemType } from "fumadocs-core/toc";
import { ScrollProvider, useActiveAnchor } from "fumadocs-core/toc";
import { TOCProvider, TOCScrollArea } from "fumadocs-ui/components/toc";
import { LinkIcon } from "@repo/icons";
import { clearReading, setReading, setTocOpen, useReading } from "@/lib/reading-store";
import {
  currentSection,
  HalftoneMeter,
  PressList,
  useReadingProgress,
  useTOCState,
} from "@/components/layouts/blog-toc";
import { type ReactNode, useEffect, useRef, useState } from "react";

function DrawerTab({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Button
      type="button"
      variant={selected ? "outline" : "muted"}
      size="sm"
      aria-pressed={selected}
      onClick={onClick}
      className="flex-1"
    >
      {children}
    </Button>
  );
}

function ReadingPublisher({ progress, engaged }: { progress: number; engaged: boolean }) {
  const state = useTOCState();
  const section = currentSection(state);
  const item = section.index === -1 ? undefined : state.items[section.index];

  useEffect(() => {
    const anchor = item ? item.url.slice(1) : "";
    const heading =
      typeof item?.title === "string"
        ? item.title
        : (document.getElementById(anchor)?.textContent ?? "");
    setReading({
      engaged,
      progress,
      section: section.number,
      sections: state.sections,
      heading,
      anchor,
    });
  }, [engaged, progress, section.number, state.sections, item]);

  useEffect(() => () => clearReading(), []);

  return null;
}

function MobileTOC({ rail, railCount = 0 }: { rail?: ReactNode; railCount?: number }) {
  const state = useTOCState();
  const active = useActiveAnchor();
  const { tocOpen: open } = useReading();
  const [tab, setTab] = useState<"contents" | "links">("contents");
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const disabledAutoScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const onLinkClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest("a")) setTocOpen(false);
    };
    container.addEventListener("click", onLinkClick);
    return () => container.removeEventListener("click", onLinkClick);
  }, []);

  useEffect(() => {
    if (!open) return;
    const viewport = viewportRef.current;
    const activeEl = viewport?.querySelector<HTMLElement>('[data-active="true"]');
    if (!viewport || !activeEl) return;
    const viewportRect = viewport.getBoundingClientRect();
    const activeRect = activeEl.getBoundingClientRect();
    if (activeRect.top < viewportRect.top || activeRect.bottom > viewportRect.bottom) {
      activeEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [active, open]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Element;
      if (rootRef.current?.contains(target) || target.closest("[data-reading-trigger]")) return;
      setTocOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setTocOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => () => setTocOpen(false), []);

  if (state.items.length === 0) return null;

  return (
    <>
      {open && (
        <div
          className="pointer-events-none fixed inset-0 z-40 bg-background/60 animate-in fade-in-0 duration-200 xl:hidden"
          aria-hidden
        />
      )}
      <div ref={rootRef} className="sticky top-14 z-40 h-0 xl:hidden">
        <div
          id="post-contents"
          className={cn(
            "absolute -inset-x-px top-px overflow-hidden border border-t-0 border-line bg-background shadow-lg transition duration-200 ease-out motion-reduce:transition-none",
            open
              ? "visible translate-y-0 opacity-100"
              : "pointer-events-none invisible -translate-y-1 opacity-0",
          )}
        >
          <div className="px-gutter py-3" ref={scrollContainerRef}>
            {rail && (
              <div className="mb-2 flex gap-1 rounded-md bg-muted p-0.5">
                <DrawerTab selected={tab === "contents"} onClick={() => setTab("contents")}>
                  Contents
                </DrawerTab>
                <DrawerTab selected={tab === "links"} onClick={() => setTab("links")}>
                  Links {railCount}
                </DrawerTab>
              </div>
            )}
            {tab === "links" && rail ? (
              <div className="-mx-2.5 max-h-[60svh] overflow-y-auto overscroll-contain py-1">
                {rail}
              </div>
            ) : (
              <TOCScrollArea ref={viewportRef} className="max-h-[60svh] overscroll-contain">
                <ScrollProvider containerRef={disabledAutoScrollRef}>
                  <PressList />
                </ScrollProvider>
              </TOCScrollArea>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

interface BlogBodyProps {
  toc: TOCItemType[];
  rail?: ReactNode;
  railCount?: number;
  children: ReactNode;
}

export function BlogBody({ toc, rail, railCount, children }: BlogBodyProps) {
  const articleRef = useRef<HTMLElement>(null);
  const { progress, engaged } = useReadingProgress(articleRef);
  return (
    <TOCProvider toc={toc}>
      <ReadingPublisher progress={progress} engaged={engaged} />
      <MobileTOC rail={rail} railCount={railCount} />

      <Section variant="article">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_240px] gap-12">
          <article ref={articleRef} className="prose min-w-0">
            {children}
          </article>
          <div className="hidden xl:block relative border-l -mt-8 xl:-mt-12 pt-8 xl:pt-12 -mb-8 xl:-mb-12 pb-8 xl:pb-12">
            <div className="pl-8 sticky top-20 flex max-h-[calc(100vh-6rem)] flex-col gap-6">
              <nav aria-label="Table of contents" className="flex min-h-0 flex-col">
                <div className="mb-4 flex flex-col gap-2.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <SectionLabel pixel>On this page</SectionLabel>
                    <SectionLabel pixel accent>
                      {`${Math.round(progress * 100)}%`}
                    </SectionLabel>
                  </div>
                  <HalftoneMeter progress={progress} />
                </div>

                <TOCScrollArea className="**:data-[slot=scroll-area-viewport]:scroll-fade-effect-y">
                  <PressList />
                </TOCScrollArea>
              </nav>
              {rail && (
                <section
                  aria-labelledby="post-links-rail-heading"
                  className="shrink-0 border-t border-line pt-4"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5">
                      <LinkIcon
                        aria-hidden="true"
                        className="size-3.5 shrink-0 text-muted-foreground"
                      />
                      <Text as="h2" id="post-links-rail-heading" variant="caption">
                        Links from this post
                      </Text>
                    </span>
                    <span className="tabular-nums">
                      <Text as="span" variant="caption">
                        {railCount}
                      </Text>
                    </span>
                  </div>
                  <div className="-mx-2.5">{rail}</div>
                </section>
              )}
            </div>
          </div>
        </div>
      </Section>
    </TOCProvider>
  );
}
