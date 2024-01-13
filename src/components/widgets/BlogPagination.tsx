import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
  PaginationPrevious,
  PaginationNext,
} from "@components/ui/pagination";

interface BlogPaginationProps {
  length: number;
  currentPage: number;
  firstUrl: string;
  prevUrl: string;
  nextUrl: string;
}

export const BlogPagination: React.FC<BlogPaginationProps> = ({
  length,
  currentPage,
  firstUrl,
  prevUrl,
  nextUrl,
}) => {
  // Define a threshold to decide when to display ellipsis
  const ellipsisThreshold = 2;

  // Modify firstUrl to be website/blog/ instead of website/blog/1
  const modifiedFirstUrl = firstUrl.endsWith("/1")
    ? firstUrl.slice(0, -2)
    : firstUrl;

  // Determine the range of pagination numbers to display
  const startPage = Math.max(1, currentPage - 1);
  const endPage = Math.min(length, startPage + 2);

  return (
    <Pagination>
      <PaginationContent>
        {currentPage !== 1 && (
          <PaginationItem>
            <PaginationPrevious href={prevUrl} />
          </PaginationItem>
        )}
        {startPage > ellipsisThreshold && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}
        {[...Array(endPage - startPage + 1)].map((_, index) => {
          const page = startPage + index;
          return (
            <PaginationItem key={page}>
              <PaginationLink
                href={page === 1 ? modifiedFirstUrl : `${firstUrl}/${page}`}
                isActive={page === currentPage}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          );
        })}
        {endPage < length - ellipsisThreshold + 1 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}
        {currentPage !== length && (
          <PaginationItem>
            <PaginationNext href={nextUrl} />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
};
