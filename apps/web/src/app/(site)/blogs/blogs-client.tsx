"use client";

import { Divider } from "@repo/ui/components/divider";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@repo/ui/components/input-group";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@repo/ui/components/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { TypographyMuted } from "@repo/ui/components/typography";
import { Reveal } from "@repo/ui/blocks/reveal";
import { cn } from "@repo/ui/lib/cn";
import { playCue } from "@repo/sounds/sound-player";
import { MagnifyingGlassIcon, XIcon } from "@repo/ui/icons";
import {
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

const PER_PAGE_OPTIONS = [5, 10, 15, 20];

const searchParsers = {
  q: parseAsString.withDefault(""),
  tags: parseAsArrayOf(parseAsString).withDefault([]),
  page: parseAsInteger.withDefault(1),
  per: parseAsInteger.withDefault(10),
};

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

  const pageNumbers = useMemo(
    () => buildPageNumbers(currentPage, totalPages),
    [currentPage, totalPages],
  );

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
            value={String(per)}
            onValueChange={(val) =>
              setParams({ per: parseInt(val, 10), page: 1 })
            }
          >
            <SelectTrigger
              className="cursor-pointer font-semibold shrink-0"
              aria-label="Posts per page"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PER_PAGE_OPTIONS.map((n) => (
                <SelectItem
                  key={n}
                  value={String(n)}
                  className="cursor-pointer font-semibold"
                >
                  {n} per page
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
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) {
                          playCue("flip");
                          setParams({ page: currentPage - 1 });
                        }
                      }}
                      aria-label="Go to previous page"
                      aria-disabled={currentPage <= 1}
                      className={cn(
                        "cursor-pointer",
                        currentPage <= 1 && "pointer-events-none opacity-50",
                      )}
                    />
                  </PaginationItem>
                  {pageNumbers.map((p, i) =>
                    p === "..." ? (
                      <PaginationItem
                        key={`ellipsis-${pageNumbers[i - 1] ?? "start"}`}
                      >
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={p}>
                        <PaginationLink
                          href="#"
                          isActive={p === currentPage}
                          aria-label={`Go to page ${p}`}
                          aria-current={p === currentPage ? "page" : undefined}
                          onClick={(e) => {
                            e.preventDefault();
                            if (p !== currentPage) playCue("flip");
                            setParams({ page: p as number });
                          }}
                          className="cursor-pointer"
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    ),
                  )}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) {
                          playCue("flip");
                          setParams({ page: currentPage + 1 });
                        }
                      }}
                      aria-label="Go to next page"
                      aria-disabled={currentPage >= totalPages}
                      className={cn(
                        "cursor-pointer",
                        currentPage >= totalPages &&
                          "pointer-events-none opacity-50",
                      )}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function buildPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "...", total];
  if (current >= total - 3)
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "...", current - 1, current, current + 1, "...", total];
}
