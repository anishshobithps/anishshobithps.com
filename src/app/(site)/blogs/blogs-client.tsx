"use client";

import { Button } from "@/components/ui/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/components/ui/button-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Divider } from "@/components/ui/divider";
import { Label } from "@/components/ui/label";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TypographyMuted, TypographySmall } from "@/components/ui/typography";
import { Reveal } from "@/components/shared/reveal";
import { cn } from "@/lib/cn";
import {
  MagnifyingGlassIcon,
  TagIcon,
  XIcon,
} from "@/components/shared/icons";
import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  useQueryStates,
} from "nuqs";
import { type ReactNode, useDeferredValue, useMemo } from "react";
import { PostCard } from "./post-card";
import { postGrid } from "./post-grid";

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

        <ButtonGroup className="w-full sm:w-auto [&>button]:flex-1 *:data-[slot=select-trigger]:flex-1">
          {allTags.length > 0 && (
            <>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    aria-label={
                      tags.length > 0
                        ? `Filter by tags, ${tags.length} selected`
                        : "Filter by tags"
                    }
                    className="cursor-pointer gap-1.5 shrink-0 justify-start font-semibold"
                  >
                    <TagIcon
                  data-icon="inline-start"
                  className="size-4"
                  aria-hidden="true"
                />

                    <span className="text-left">Tags</span>
                    {tags.length > 0 && (
                      <span
                        aria-hidden="true"
                        className="flex items-center justify-center rounded-full bg-primary text-primary-foreground size-5 text-xs"
                      >
                        {tags.length}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-52 p-3">
                  <div className="flex items-center justify-between w-full mb-2">
                    <TypographySmall>Filter by tag</TypographySmall>
                    {tags.length > 0 && (
                      <Button
                        variant="secondary"
                        size="xs"
                        onClick={() => setParams({ tags: [], page: 1 })}
                        className="cursor-pointer h-auto px-1 py-0"
                        aria-label="Clear all tag filters"
                      >
                        <XIcon className="size-4" aria-hidden="true" />
                      </Button>
                    )}
                  </div>
                  <ul
                    role="list"
                    aria-label="Available tags"
                    className="flex flex-col gap-0.5 max-h-56 overflow-y-auto"
                  >
                    {allTags.map((tag) => (
                      <li key={tag}>
                        <Label className="rounded-sm px-2 py-1.5 cursor-pointer hover:bg-accent transition-colors">
                          <Checkbox
                            checked={tags.includes(tag)}
                            aria-label={`Filter by ${tag}`}
                            onCheckedChange={(checked) =>
                              setParams({
                                tags:
                                  checked === true
                                    ? [...tags, tag]
                                    : tags.filter((t) => t !== tag),
                                page: 1,
                              })
                            }
                          />
                          <TypographySmall className="font-semibold uppercase">
                            {tag}
                          </TypographySmall>
                        </Label>
                      </li>
                    ))}
                  </ul>
                </PopoverContent>
              </Popover>
              <ButtonGroupSeparator />
            </>
          )}

          <Select
            value={String(per)}
            onValueChange={(val) =>
              setParams({ per: parseInt(val, 10), page: 1 })
            }
          >
            <SelectTrigger
              className="cursor-pointer font-semibold w-full"
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
        </ButtonGroup>
      </div>

      <TypographyMuted role="status" className="sr-only">
        {deferredQuery.trim() || tags.length > 0
          ? `${filtered.length} ${filtered.length === 1 ? "post" : "posts"} found`
          : ""}
      </TypographyMuted>

      {tags.length > 0 && (
        <ul
          role="list"
          aria-label="Active tag filters"
          className="flex flex-wrap gap-1.5 pb-3"
        >
          {tags.map((tag) => (
            <li key={tag}>
              <Button
                variant="secondary"
                size="xs"
                onClick={() =>
                  setParams({ tags: tags.filter((t) => t !== tag), page: 1 })
                }
                aria-label={`Remove ${tag} filter`}
                className="flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 font-mono text-xs text-primary hover:bg-primary/20 cursor-pointer h-auto"
              >
                {tag}
                <XIcon className="size-3" aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      )}

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
              Showing {(currentPage - 1) * per + 1}–
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
                        if (currentPage > 1)
                          setParams({ page: currentPage - 1 });
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
                        if (currentPage < totalPages)
                          setParams({ page: currentPage + 1 });
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
