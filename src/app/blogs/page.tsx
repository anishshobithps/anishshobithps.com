import { Section } from "@/components/layouts/page";
import {
  TypographyH1,
  TypographyLead,
  TypographyMuted,
  TypographySmall,
} from "@/components/ui/typography";
import { buildMeta } from "@/lib/og";
import { source } from "@/lib/source";
import type { Metadata } from "next";
import Link from "next/link";

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

  return (
    <>
      <Section variant="hero">
        <TypographyH1>Blog</TypographyH1>
        <TypographyLead>
          Thoughts on design, engineering, and the web.
        </TypographyLead>
      </Section>

      <Section>
        <div className="divide-y">
          {pages.map((page) => {
            const date = page.data.date
              ? new Date(page.data.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : null;

            return (
              <Link
                key={page.url}
                href={page.url}
                className="group relative flex flex-col gap-2 py-6 first:pt-0 last:pb-0 pl-0 hover:pl-4 transition-[padding-left] duration-200"
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 left-0 w-0.5 rounded-full bg-foreground/30 scale-y-0 origin-center transition-transform duration-200 group-hover:scale-y-100"
                />
                <div className="flex items-baseline justify-between gap-4">
                  <TypographySmall className="text-base font-semibold text-foreground transition-colors group-hover:text-primary">
                    {page.data.title}
                  </TypographySmall>
                  {date && (
                    <TypographyMuted className="shrink-0 font-mono text-xs">
                      {date}
                    </TypographyMuted>
                  )}
                </div>
                {page.data.description && (
                  <TypographyMuted className="leading-relaxed">
                    {page.data.description}
                  </TypographyMuted>
                )}
                {page.data.tags && page.data.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {page.data.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </Section>
    </>
  );
}
