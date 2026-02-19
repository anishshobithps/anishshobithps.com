"use client";

import { useState } from "react";
import { ArrowLeft, Check, Link2, TwitterIcon, LinkedinIcon } from "lucide-react";
import Link from "next/link";
import {
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { TypographySmall } from "@/components/ui/typography";

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
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(pageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const xUrl = `https://x.com/intent/post?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(title)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`;

  return (
    <>
      <Button variant="ghost" size="sm" asChild>
        <Link href="/blogs">
          <ArrowLeft className="size-3.5 shrink-0" />
          <TypographySmall>Blog</TypographySmall>
        </Link>
      </Button>

      <div className="flex items-center gap-0.5">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleCopy}
          title="Copy link"
          className="text-muted-foreground hover:text-foreground"
        >
          {copied ? <Check className="size-4" /> : <Link2 className="size-4" />}
        </Button>

        <Button variant="ghost" size="icon-sm" asChild className="text-muted-foreground hover:text-foreground">
          <a href={xUrl} target="_blank" rel="noopener noreferrer" title="Share on X">
            <TwitterIcon className="size-4" />
          </a>
        </Button>

        <Button variant="ghost" size="icon-sm" asChild className="text-muted-foreground hover:text-foreground">
          <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" title="Share on LinkedIn">
            <LinkedinIcon className="size-4" />
          </a>
        </Button>

        <div className="mx-1 h-4 w-px bg-border shrink-0" />

        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href={prevPost?.url ?? "#"}
              title={prevPost ? `Previous: ${prevPost.title}` : undefined}
              aria-disabled={!prevPost}
              className={
                !prevPost ? "pointer-events-none opacity-30" : undefined
              }
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              href={nextPost?.url ?? "#"}
              title={nextPost ? `Next: ${nextPost.title}` : undefined}
              aria-disabled={!nextPost}
              className={
                !nextPost ? "pointer-events-none opacity-30" : undefined
              }
            />
          </PaginationItem>
        </PaginationContent>
      </div>
    </>
  );
}
