"use client";

import { Divider } from "@repo/ui/components/divider";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@repo/ui/components/input-group";
import { buttonVariants } from "@repo/ui/components/button";
import { TypographyMuted } from "@repo/ui/components/typography";
import { Reveal } from "@repo/ui/blocks/reveal";
import { cn } from "@repo/ui/lib/cn";
import { playCue } from "@repo/sounds/sound-player";
import {
  CaretDownIcon,
  CaretLeftIcon,
  CaretRightIcon,
  CheckIcon,
  DotsThreeIcon,
  MagnifyingGlassIcon,
  XIcon,
} from "@repo/ui/icons";
import {
  Pagination,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationList,
  PaginationNext,
  PaginationPrevious,
} from "@ui-sdk/react/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectTrigger,
  SelectValue,
} from "@ui-sdk/react/select";
import {
  createSerializer,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  useQueryStates,
} from "nuqs";
import {
  type ReactNode,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { PostCard } from "@/app/(site)/blogs/post-card";
import { postGrid } from "@/app/(site)/blogs/post-grid";
import { TagFilter } from "@/app/(site)/blogs/tag-filter";
import { track } from "@/lib/analytics/events";

export type BlogPost = {
  url: string;
  title: string;
  description?: string;
  date?: string;
  tags?: string[];
  number: number;
  cover: ReactNode;
};

const PER_PAGE_OPTIONS = [5, 10, 15, 20].map((n) => ({
  value: String(n),
  label: `${n} per page`,
}));

const searchParsers = {
  q: parseAsString.withDefault(""),
  tags: parseAsArrayOf(parseAsString).withDefault([]),
  page: parseAsInteger.withDefault(1),
  per: parseAsInteger.withDefault(10),
};

const serialize = createSerializer(searchParsers);

const stepClass = ({ disabled }: { disabled: boolean }) =>
  cn(
    buttonVariants({ variant: "outline" }),
    "gap-1 px-2.5",
    disabled && "pointer-events-none opacity-50",
  );

export function BlogsClient({
  posts,
  allTags,
  filler,
}: {
  posts: BlogPost[];
  allTags: string[];
  filler: ReactNode;
}) {
  const [params, setParams] = useQueryStates(searchParsers);
  const { q, tags, page, per } = params;

  const deferredQuery = useDeferredValue(q);
  const isFiltering = q !== deferredQuery;

  const filtered = useMemo(() => {
    let result = posts;
    if (deferredQuery.trim()) {
      const lower = deferredQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(lower) ||
          p.description?.toLowerCase().includes(lower) ||
          p.tags?.some((t) => t.toLowerCase().includes(lower)),
      );
    }
    if (tags.length > 0) {
      result = result.filter((p) => tags.every((t) => p.tags?.includes(t)));
    }
    return result;
  }, [posts, deferredQuery, tags]);

  const trimmedQuery = deferredQuery.trim();
  const tagKey = tags.join(",");
  const resultCount = filtered.length;
  const lastFilter = useRef("");

  useEffect(() => {
    const key = JSON.stringify([trimmedQuery, tagKey]);
    if (key === lastFilter.current) return;
    if (!lastFilter.current && !trimmedQuery && !tagKey) {
      lastFilter.current = key;
      return;
    }
    const id = setTimeout(() => {
      lastFilter.current = key;
      track("blog_list_filtered", {
        query: trimmedQuery,
        tags: tagKey ? tagKey.split(",") : [],
        results: resultCount,
      });
    }, 800);
    return () => clearTimeout(id);
  }, [trimmedQuery, tagKey, resultCount]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filtered.length / per)),
    [filtered.length, per],
  );

  const currentPage = useMemo(
    () => Math.min(Math.max(1, page), totalPages),
    [page, totalPages],
  );

  const paginated = useMemo(
    () => filtered.slice((currentPage - 1) * per, currentPage * per),
    [filtered, currentPage, per],
  );

  const featured =
    currentPage === 1 && !deferredQuery.trim() && tags.length === 0
      ? paginated[0]
      : undefined;
  const grid = postGrid(paginated, Boolean(featured));

  return (
    <div className="flex flex-col -mt-6">
      <div
        role="search"
        aria-label="Filter blog posts"
        className="flex flex-wrap sm:flex-nowrap sm:justify-end gap-3 pb-6"
      >
        <div className="w-full sm:w-auto sm:flex-1 min-w-0">
          <InputGroup data-pending={isFiltering || undefined}>
            <InputGroupAddon align="inline-start">
              <MagnifyingGlassIcon aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput
              autoComplete="off"
              placeholder="Search posts…"
              value={q}
              aria-label="Search blog posts"
              onChange={(e) => setParams({ q: e.target.value, page: 1 })}
              className="w-full"
            />
            {q && (
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  onClick={() => setParams({ q: "", page: 1 })}
                  aria-label="Clear search"
                >
                  <XIcon className="size-4" aria-hidden="true" />
                </InputGroupButton>
              </InputGroupAddon>
            )}
          </InputGroup>
        </div>

        <div className="flex w-full gap-3 sm:w-auto">
          {allTags.length > 0 && (
            <div className="min-w-0 flex-1 sm:w-72 sm:flex-none">
              <TagFilter
                allTags={allTags}
                tags={tags}
                onTagsChange={(next) => {
                  playCue("select");
                  setParams({ tags: next, page: 1 });
                }}
              />
            </div>
          )}

          <Select
            items={PER_PAGE_OPTIONS}
            value={String(per)}
            onValueChange={(val) => {
              if (typeof val === "string") {
                setParams({ per: parseInt(val, 10), page: 1 });
              }
            }}
          >
            <SelectTrigger
              aria-label="Posts per page"
              className="flex h-9 shrink-0 cursor-pointer items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 text-sm font-semibold whitespace-nowrap shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50"
            >
              <SelectValue />
              <CaretDownIcon
                aria-hidden="true"
                className="size-4 text-muted-foreground"
              />
            </SelectTrigger>
            <SelectContent
              align="end"
              sideOffset={4}
              className="max-h-[min(18rem,var(--available-height))] min-w-(--anchor-width) origin-(--transform-origin) overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md transition-[opacity,scale] duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 motion-reduce:transition-none"
            >
              {PER_PAGE_OPTIONS.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm font-semibold select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground"
                >
                  {option.label}
                  <SelectItemIndicator className="ms-auto text-primary">
                    <CheckIcon aria-hidden="true" className="size-4" />
                  </SelectItemIndicator>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <TypographyMuted role="status" className="sr-only">
        {deferredQuery.trim() || tags.length > 0
          ? `${filtered.length} ${filtered.length === 1 ? "post" : "posts"} found`
          : ""}
      </TypographyMuted>

      <Divider />

      <div>
        {paginated.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            {posts.length === 0 ? (
              <>
                <TypographyMuted>No posts published yet.</TypographyMuted>
                <TypographyMuted className="font-mono text-xs">
                  {"// check back soon."}
                </TypographyMuted>
              </>
            ) : (
              <>
                <TypographyMuted>Nothing matched that search.</TypographyMuted>
                <TypographyMuted className="font-mono text-xs">
                  {"// try different terms or clear the filters."}
                </TypographyMuted>
              </>
            )}
          </div>
        ) : (
          <ul
            role="list"
            aria-label="Blog posts"
            className="-mx-gutter grid grid-cols-1 gap-px bg-line md:grid-cols-2"
          >
            {grid.cells.map((cell, index) => {
              const corners = grid.corners(index);
              if (cell === "filler") {
                return (
                  <li
                    key="filler"
                    aria-hidden="true"
                    className={cn("hidden overflow-hidden bg-background md:block", corners)}
                  >
                    {filler}
                  </li>
                );
              }
              const isFeatured = cell === featured;
              return (
                <li
                  key={cell.url}
                  className={cn(
                    "overflow-hidden bg-background",
                    isFeatured && "md:col-span-2",
                    corners,
                  )}
                >
                  <Reveal delay={Math.min(index, 6) * 55} className="h-full">
                    <PostCard post={cell} featured={isFeatured} />
                  </Reveal>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {filtered.length > 0 && (
        <>
          <Divider />
          <div className="flex flex-col items-center gap-3 pt-6">
            <TypographyMuted className="text-xs tabular-nums">
              Showing {(currentPage - 1) * per + 1} to{" "}
              {Math.min(currentPage * per, filtered.length)} of{" "}
              {filtered.length} post{filtered.length !== 1 ? "s" : ""}
            </TypographyMuted>
            {totalPages > 1 && (
              <Pagination
                aria-label="Blog pages"
                page={currentPage}
                pageCount={totalPages}
                getHref={(target) => serialize({ ...params, page: target })}
                onPageChange={(target, details) => {
                  details.cancel();
                  playCue("flip");
                  setParams({ page: target });
                }}
                className="mx-auto flex w-full justify-center"
              >
                <PaginationList className="flex flex-row items-center gap-1">
                  {({ items }) => (
                    <>
                      <PaginationItem>
                        <PaginationPrevious
                          aria-label="Go to previous page"
                          className={stepClass}
                        >
                          <CaretLeftIcon aria-hidden="true" />
                          <span className="hidden sm:block">Previous</span>
                        </PaginationPrevious>
                      </PaginationItem>
                      {items.map((item) => (
                        <PaginationItem key={item}>
                          {typeof item === "number" ? (
                            <PaginationLink
                              page={item}
                              aria-label={`Go to page ${item}`}
                              className={({ current }) =>
                                buttonVariants({
                                  variant: current ? "default" : "outline",
                                  size: "icon",
                                })
                              }
                            />
                          ) : (
                            <PaginationEllipsis className="flex size-9 items-center justify-center">
                              <DotsThreeIcon
                                aria-hidden="true"
                                className="size-4"
                              />
                            </PaginationEllipsis>
                          )}
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          aria-label="Go to next page"
                          className={stepClass}
                        >
                          <span className="hidden sm:block">Next</span>
                          <CaretRightIcon aria-hidden="true" />
                        </PaginationNext>
                      </PaginationItem>
                    </>
                  )}
                </PaginationList>
              </Pagination>
            )}
          </div>
        </>
      )}
    </div>
  );
}
