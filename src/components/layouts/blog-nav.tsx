"use client";

import Link from "next/link";
import {
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { TypographySmall } from "@/components/ui/typography";
import {
  ArrowLeftIcon,
  LinkIcon,
  XLogoIcon,
  LinkedinLogoIcon,
} from "@/components/shared/icons";
import { toast } from "sonner";
import type { Route } from "next";

function preventNavigation(event: React.MouseEvent) {
  event.preventDefault();
}

interface BlogPostNavProps {
  label?: string;
  pageUrl: string;
  title: string;
  prevPost?: { url: string; title: string } | null;
  nextPost?: { url: string; title: string } | null;
}

export function BlogPostNav({
  label = "Post navigation",
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
      <Button variant="outline" size="sm" asChild>
        <Link href="/blogs" aria-label="Back to all blog posts">
          <ArrowLeftIcon
            data-icon="inline-start"
            className="size-3.5 shrink-0"
            aria-hidden="true"
          />
          <TypographySmall>Blog</TypographySmall>
        </Link>
      </Button>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={handleCopy}
            aria-label="Copy link to this post"
            className="text-muted-foreground hover:text-foreground"
          >
            <LinkIcon className="size-4" aria-hidden="true" />
          </Button>

          <Button
            variant="outline"
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
              <XLogoIcon className="size-4" aria-hidden="true" />
            </a>
          </Button>

          <Button
            variant="outline"
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
              <LinkedinLogoIcon className="size-4" aria-hidden="true" />
            </a>
          </Button>
        </div>

        <nav aria-label={label}>
          <ButtonGroup>
            <PaginationPrevious
              href={(prevPost?.url ?? "#") as Route}
              aria-label={
                prevPost
                  ? `Previous post: ${prevPost.title}`
                  : "No previous post"
              }
              aria-disabled={!prevPost}
              onClick={prevPost ? undefined : preventNavigation}
              className={
                !prevPost ? "pointer-events-none opacity-30" : undefined
              }
            />
            <PaginationNext
              href={(nextPost?.url ?? "#") as Route}
              aria-label={
                nextPost ? `Next post: ${nextPost.title}` : "No next post"
              }
              aria-disabled={!nextPost}
              onClick={nextPost ? undefined : preventNavigation}
              className={
                !nextPost ? "pointer-events-none opacity-30" : undefined
              }
            />
          </ButtonGroup>
        </nav>
      </div>
    </>
  );
}
