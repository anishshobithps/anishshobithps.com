"use client";

import { DecorIcon } from "@/components/ui/border";
import { Button } from "@/components/ui/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/components/ui/button-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Divider } from "@/components/ui/divider";
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
import { cn } from "@/lib/cn";
import { SearchIcon, TagIcon, X } from "lucide-react";
import Link from "next/link";
import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  useQueryStates,
} from "nuqs";
import { useMemo } from "react";

export type BlogPost = {
  url: string;
  title: string;
  description?: string;
  date?: string;
  tags?: string[];
};

const PER_PAGE_OPTIONS = [5, 10, 15, 20];

const searchParsers = {
  q: parseAsString.withDefault(""),
  tags: parseAsArrayOf(parseAsString).withDefault([]),
  page: parseAsInteger.withDefault(1),
  per: parseAsInteger.withDefault(5),
};

export function BlogsClient({
  posts,
  allTags,
}: {
  posts: BlogPost[];
  allTags: string[];
}) {
  const [params, setParams] = useQueryStates(searchParsers);
  const { q, tags, page, per } = params;

  const filtered = useMemo(() => {
    let result = posts;
    if (q.trim()) {
      const lower = q.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(lower) ||
          p.description?.toLowerCase().includes(lower),
      );
    }
    if (tags.length > 0) {
      result = result.filter((p) => tags.every((t) => p.tags?.includes(t)));
    }
    return result;
  }, [posts, q, tags]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / per));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const paginated = filtered.slice((currentPage - 1) * per, currentPage * per);

  return (
    <div className="flex flex-col -mt-6">
      <div className="flex flex-wrap sm:flex-nowrap sm:justify-end gap-3 pb-6">
        <div className="w-full sm:w-auto sm:flex-1 min-w-0">
          <InputGroup>
            <InputGroupAddon align="inline-start">
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search posts…"
              value={q}
              onChange={(e) => setParams({ q: e.target.value, page: 1 })}
              className="w-full"
            />
            {q && (
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  onClick={() => setParams({ q: "", page: 1 })}
                  aria-label="Clear search"
                >
                  <X className="size-4" />
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
                    className="cursor-pointer gap-1.5 shrink-0 justify-start font-semibold"
                  >
                    <TagIcon className="size-4" />
                    <span className="text-left">Tags</span>
                    {tags.length > 0 && (
                      <span className="flex items-center justify-center rounded-full bg-primary text-primary-foreground size-5 text-xs">
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
                        variant="ghost"
                        size="xs"
                        onClick={() => setParams({ tags: [], page: 1 })}
                        className="cursor-pointer h-auto px-1 py-0"
                        aria-label="Clear all tags"
                      >
                        <X className="size-4" />
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-col gap-0.5 max-h-56 overflow-y-auto">
                    {allTags.map((tag) => (
                      <label
                        key={tag}
                        className="flex items-center gap-2 rounded-sm px-2 py-1.5 cursor-pointer hover:bg-accent transition-colors"
                      >
                        <Checkbox
                          checked={tags.includes(tag)}
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
                      </label>
                    ))}
                  </div>
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
            <SelectTrigger className="cursor-pointer font-semibold w-full">
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

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pb-3">
          {tags.map((tag) => (
            <Button
              key={tag}
              variant="ghost"
              size="xs"
              onClick={() =>
                setParams({ tags: tags.filter((t) => t !== tag), page: 1 })
              }
              className="flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 font-mono text-xs text-primary hover:bg-primary/20 cursor-pointer h-auto"
            >
              {tag}
              <X className="size-3" />
            </Button>
          ))}
        </div>
      )}

      <div className="relative -mx-6 sm:-mx-8 lg:-mx-10">
        <DecorIcon position="top-left" />
        <DecorIcon position="top-right" />
        <Divider short />
      </div>

      <div>
        {paginated.length === 0 ? (
          <div className="py-12 text-center">
            <TypographyMuted>No posts found.</TypographyMuted>
          </div>
        ) : (
          paginated.map((post, index) => {
            const date = post.date
              ? new Date(post.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : null;

            return (
              <div key={post.url}>
                {index > 0 && <Divider plain />}
                <Link
                  href={post.url}
                  className="group relative flex flex-col gap-2 py-6 pl-0 hover:pl-4 transition-[padding-left] duration-200 cursor-pointer"
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-0 left-0 w-0.5 rounded-full bg-foreground/30 scale-y-0 origin-center transition-transform duration-200 group-hover:scale-y-100"
                  />
                  <div className="flex items-baseline justify-between gap-4">
                    <TypographySmall className="text-base font-semibold text-foreground transition-colors group-hover:text-primary">
                      {post.title}
                    </TypographySmall>
                    {date && (
                      <TypographyMuted className="shrink-0 font-mono text-xs">
                        {date}
                      </TypographyMuted>
                    )}
                  </div>
                  {post.description && (
                    <TypographyMuted className="leading-relaxed">
                      {post.description}
                    </TypographyMuted>
                  )}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {post.tags.map((tag) => (
                        <TypographyMuted
                          key={tag}
                          className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs"
                        >
                          {tag}
                        </TypographyMuted>
                      ))}
                    </div>
                  )}
                </Link>
              </div>
            );
          })
        )}
      </div>

      {filtered.length > 0 && (
        <>
          <div className="relative -mx-6 sm:-mx-8 lg:-mx-10">
            <DecorIcon position="top-left" />
            <DecorIcon position="top-right" />
            <Divider short />
          </div>
          <div className="flex flex-col items-center gap-3 pt-6">
            <TypographyMuted className="text-xs">
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
                      className={cn(
                        "cursor-pointer",
                        currentPage <= 1 && "pointer-events-none opacity-50",
                      )}
                      aria-disabled={currentPage <= 1}
                    />
                  </PaginationItem>
                  {buildPageNumbers(currentPage, totalPages).map((p, i) =>
                    p === "..." ? (
                      <PaginationItem key={`ellipsis-${i}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={p}>
                        <PaginationLink
                          href="#"
                          isActive={p === currentPage}
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
                      className={cn(
                        "cursor-pointer",
                        currentPage >= totalPages &&
                          "pointer-events-none opacity-50",
                      )}
                      aria-disabled={currentPage >= totalPages}
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
