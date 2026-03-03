import { BlogsClient, type BlogPost } from "@/app/blogs/blogs-client";
import { Section } from "@/components/layouts/page";
import { JsonLd } from "@/components/shared/json-ld";
import {
  TypographyH1,
  TypographyLead,
  TypographyMark,
} from "@/components/ui/typography";
import { siteConfig } from "@/lib/config";
import { buildMeta } from "@/lib/og";
import { source } from "@/lib/source";
import type { Metadata } from "next";
import { Suspense } from "react";
import { toISOString, toTimestamp } from "@/lib/date";

export const metadata: Metadata = buildMeta({
  title: "Blogs",
  pageTitle: "Blog Posts & Writing",
  description:
    "Structured thoughts, semi-structured experiments, and occasional overengineering. Deep dives into engineering, design, and the things I build at 2am.",
  path: "home / blogs",
  canonicalPath: "/blogs",
  type: "website",
});

export default function BlogPage() {
  const pages = source.getPages().sort((a, b) => {
    return toTimestamp(b.data.date) - toTimestamp(a.data.date);
  });

  const posts: BlogPost[] = pages.map((page) => ({
    url: page.url,
    title: page.data.title,
    description: page.data.description,
    date: page.data.date ? toISOString(page.data.date) : undefined,
    tags: page.data.tags,
  }));

  const allTags = Array.from(
    new Set(pages.flatMap((p) => p.data.tags ?? [])),
  ).sort();

  return (
    <>
      <JsonLd
        type="webpage"
        title="Blogs"
        description="Structured thoughts, semi-structured experiments, and occasional overengineering."
        canonicalUrl={`${siteConfig.baseUrl}/blogs`}
      />
      <Section variant="hero" aria-label="Blog header">
        <TypographyH1>Blogs</TypographyH1>
        <TypographyLead>
          Engineering thoughts,{" "}
          <TypographyMark>design experiments</TypographyMark>, and things I
          overthought at 2AM.
        </TypographyLead>
      </Section>

      <Section className="pb-6" aria-label="Blog posts">
        <Suspense
          fallback={
            <p aria-live="polite">Loading... probably compiling thoughts.</p>
          }
        >
          <BlogsClient posts={posts} allTags={allTags} />
        </Suspense>
      </Section>
    </>
  );
}
