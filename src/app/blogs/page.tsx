import { Section } from "@/components/layouts/page";
import { TypographyH1, TypographyLead } from "@/components/ui/typography";
import { buildMeta } from "@/lib/og";
import { source } from "@/lib/source";
import type { Metadata } from "next";
import { BlogsClient, type BlogPost } from "./blogs-client";

export const metadata: Metadata = buildMeta({
  title: "Blog",
  pageTitle: "Blog",
  description: "Thoughts on design, engineering, and the web.",
  path: "home / blog",
});

export default function BlogPage() {
  const pages = source.getPages().sort((a, b) => {
    const aDate = a.data.date ? new Date(a.data.date).getTime() : 0;
    const bDate = b.data.date ? new Date(b.data.date).getTime() : 0;
    return bDate - aDate;
  });

  const posts: BlogPost[] = pages.map((page) => ({
    url: page.url,
    title: page.data.title,
    description: page.data.description,
    date:
      page.data.date instanceof Date
        ? page.data.date.toISOString()
        : page.data.date,
    tags: page.data.tags,
  }));

  const allTags = Array.from(
    new Set(pages.flatMap((p) => p.data.tags ?? [])),
  ).sort();

  return (
    <>
      <Section variant="hero">
        <TypographyH1>Blog</TypographyH1>
        <TypographyLead>
          Thoughts on design, engineering, and the web.
        </TypographyLead>
      </Section>

      <Section className="pb-6">
        <BlogsClient posts={posts} allTags={allTags} />
      </Section>
    </>
  );
}
