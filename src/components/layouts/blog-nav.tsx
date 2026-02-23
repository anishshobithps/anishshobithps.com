"use client";

import { ArrowLeft, Link2 } from "lucide-react";
import Link from "next/link";
import {
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { TypographySmall } from "@/components/ui/typography";
import {
  IconBrandLinkedinFilled,
  IconBrandTwitterFilled,
} from "@tabler/icons-react";
import { toast } from "sonner";

interface BlogPostNavProps {
  pageUrl: string;
  title: string;
  prevPost?: { url: string; title: string } | null;
  nextPost?: { url: string; title: string } | null;
}

export function BlogPostNav({
  pageUrl,
  title,
  prevPost,
  nextPost,
}: BlogPostNavProps) {
  const handleCopy = async () => {
    await navigator.clipboard.writeText(pageUrl);
    toast.success("Link copied to clipboard");
  };

  const utmPageUrl = `${pageUrl}?utm_source=x&utm_medium=social&utm_campaign=blog`;
  const utmLinkedinUrl = `${pageUrl}?utm_source=linkedin&utm_medium=social&utm_campaign=blog`;

  const xUrl = `https://x.com/intent/post?url=${encodeURIComponent(utmPageUrl)}&text=${encodeURIComponent(title)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(utmLinkedinUrl)}`;

  return (
    <>
      <Button variant="ghost" size="sm" asChild>
        <Link href="/blogs" aria-label="Back to all blog posts">
          <ArrowLeft className="size-3.5 shrink-0" aria-hidden="true" />
          <TypographySmall>Blog</TypographySmall>
        </Link>
      </Button>

      <div
        className="flex items-center gap-0.5"
        role="toolbar"
        aria-label="Post actions"
      >
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleCopy}
          aria-label="Copy link to this post"
          className="text-muted-foreground hover:text-foreground"
        >
          <Link2 className="size-4" aria-hidden="true" />
        </Button>

        <Button
          variant="ghost"
          size="icon-sm"
          asChild
          className="text-muted-foreground hover:text-foreground"
        >
          <a
            href={xUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Share "${title}" on X (opens in new tab)`}
          >
            <IconBrandTwitterFilled className="size-4" aria-hidden="true" />
          </a>
        </Button>

        <Button
          variant="ghost"
          size="icon-sm"
          asChild
          className="text-muted-foreground hover:text-foreground"
        >
          <a
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Share "${title}" on LinkedIn (opens in new tab)`}
          >
            <IconBrandLinkedinFilled className="size-4" aria-hidden="true" />
          </a>
        </Button>

        <div className="mx-1 h-4 w-px bg-border shrink-0" aria-hidden="true" />

        <nav aria-label="Post navigation">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={prevPost?.url ?? "#"}
                aria-label={
                  prevPost
                    ? `Previous post: ${prevPost.title}`
                    : "No previous post"
                }
                aria-disabled={!prevPost}
                className={
                  !prevPost ? "pointer-events-none opacity-30" : undefined
                }
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                href={nextPost?.url ?? "#"}
                aria-label={
                  nextPost ? `Next post: ${nextPost.title}` : "No next post"
                }
                aria-disabled={!nextPost}
                className={
                  !nextPost ? "pointer-events-none opacity-30" : undefined
                }
              />
            </PaginationItem>
          </PaginationContent>
        </nav>
      </div>
    </>
  );
}
