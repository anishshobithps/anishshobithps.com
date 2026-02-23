"use client";

import { Section } from "@/components/layouts/page";
import { LogoDownloadCard } from "@/app/branding/logo-download-card";
import { BrandingOGPreview } from "./branding-og-preview";
import {
  TypographyH1,
  TypographyH2,
  TypographyH3,
  TypographyH4,
  TypographyP,
  TypographyLead,
  TypographyMuted,
  TypographyBlockquote,
  TypographyList,
  TypographyInlineCode,
  TypographyLarge,
  TypographySmall,
  TypographyMark,
  SectionLabel,
} from "@/components/ui/typography";
import { DecorIcon } from "@/components/ui/border";

export default function BrandingPage() {
  return (
    <>
      <Section aria-label="Brand System">
        <div className="flex items-center gap-3 mb-10" aria-hidden="true">
          <SectionLabel>Brand System</SectionLabel>
          <div className="flex-1 h-px bg-border/40" />
        </div>

        <div className="max-w-3xl space-y-6">
          <TypographyH1>Brand Infrastructure</TypographyH1>

          <TypographyLead>
            A unified system of identity components built so I never have to
            explain{" "}
            <TypographyMark>
              &ldquo;just use the same font&rdquo;
            </TypographyMark>{" "}
            again.
          </TypographyLead>
        </div>
      </Section>

      <Section aria-label="Typography">
        <div className="flex items-center gap-3 mb-10" aria-hidden="true">
          <SectionLabel>Typography</SectionLabel>
          <div className="flex-1 h-px bg-border/40" />
        </div>

        <ul
          role="list"
          aria-label="Typography variants"
          className="w-full max-w-5xl grid md:grid-cols-2 gap-6 lg:gap-8"
        >
          {[
            {
              title: "Heading One",
              component: <TypographyH1>I Shipped It</TypographyH1>,
            },
            {
              title: "Heading Two",
              component: <TypographyH2>It Worked Locally</TypographyH2>,
            },
            {
              title: "Heading Three",
              component: <TypographyH3>Something&apos;s On Fire</TypographyH3>,
            },
            {
              title: "Heading Four",
              component: <TypographyH4>Blame The Cache</TypographyH4>,
            },
            {
              title: "Paragraph",
              component: (
                <TypographyP>
                  Body text. The part your eyes drift past while hunting for the
                  button. If you&apos;re reading this sentence, you&apos;re in
                  the top 1% — or you just have too much free time.
                </TypographyP>
              ),
            },
            {
              title: "Lead",
              component: (
                <TypographyLead>
                  The paragraph that sets the tone before the actual content.
                  Usually written last. Definitely written last.
                </TypographyLead>
              ),
            },
            {
              title: "Blockquote",
              component: (
                <TypographyBlockquote>
                  It works on my machine.
                </TypographyBlockquote>
              ),
            },
            {
              title: "List",
              component: (
                <TypographyList>
                  <li>Works on my machine</li>
                  <li>TODO: document this</li>
                  <li>Close enough to done</li>
                </TypographyList>
              ),
            },
            {
              title: "Inline Code",
              component: (
                <TypographyP>
                  Commit message:{" "}
                  <TypographyInlineCode>
                    git commit -m &quot;fix&quot;
                  </TypographyInlineCode>
                </TypographyP>
              ),
            },
            {
              title: "Large",
              component: (
                <TypographyLarge>Deploy. Regret. Revert.</TypographyLarge>
              ),
            },
            {
              title: "Small",
              component: (
                <TypographySmall>the text nobody asked for</TypographySmall>
              ),
            },
            {
              title: "Muted",
              component: (
                <TypographyMuted>
                  the disclaimer. also nobody reads this.
                </TypographyMuted>
              ),
            },
            {
              title: "Mark",
              component: (
                <TypographyP>
                  The word you <TypographyMark>highlight</TypographyMark> when
                  you want to look like you read the whole thing.
                </TypographyP>
              ),
            },
            {
              title: "Section Label",
              component: <SectionLabel>Section Label</SectionLabel>,
            },
          ].map((item) => (
            <li
              key={item.title}
              className="p-0 border-0 lg:p-6 lg:border transition-all duration-300"
              aria-label={`${item.title} example`}
            >
              <div className="hidden lg:block" aria-hidden="true">
                <DecorIcon position="top-left" />
                <DecorIcon position="top-right" />
                <DecorIcon position="bottom-left" />
                <DecorIcon position="bottom-right" />
              </div>

              <div className="relative z-10 space-y-3">
                <TypographyMuted
                  className="text-xs uppercase tracking-wider"
                  aria-hidden="true"
                >
                  {item.title}
                </TypographyMuted>
                {item.component}
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-14 max-w-3xl">
          <TypographyLead>
            Typography is the reason your UI doesn&apos;t look like a ransom
            note. <TypographyMark>Hierarchy matters</TypographyMark> — and so
            does not picking a random Google Font at 2am.
          </TypographyLead>
        </div>
      </Section>

      <Section aria-label="Logo Variants">
        <div className="flex items-center gap-3 mb-10" aria-hidden="true">
          <SectionLabel>Logo Variants</SectionLabel>
          <div className="flex-1 h-px bg-border/40" />
        </div>

        <ul
          role="list"
          aria-label="Logo variants"
          className="w-full max-w-5xl grid md:grid-cols-3 gap-6 lg:gap-8"
        >
          {[
            { label: "Icon", props: {}, description: "Pocket-sized identity" },
            {
              label: "Wordmark",
              props: { showWordmark: true },
              description: "For when people forget how to read",
            },
            {
              label: "Full Name",
              props: { showWordmark: true, full: true },
              description: "The full send",
            },
          ].map((variant) => (
            <li key={variant.label} className="p-0 border-0 lg:p-6 lg:border">
              <div className="hidden lg:block" aria-hidden="true">
                <DecorIcon position="top-left" />
                <DecorIcon position="top-right" />
                <DecorIcon position="bottom-left" />
                <DecorIcon position="bottom-right" />
              </div>

              <div className="relative z-10">
                <LogoDownloadCard
                  label={variant.label}
                  description={variant.description}
                  logoProps={variant.props}
                />
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-14 max-w-3xl">
          <TypographyLead>
            From 16&times;16 favicon to full-bleed billboard — the logo survives
            it all. <TypographyMark>Unlike my confidence</TypographyMark> before
            a code review.
          </TypographyLead>
        </div>
      </Section>

      <Section aria-label="Open Graph">
        <div className="flex items-center gap-3 mb-10" aria-hidden="true">
          <SectionLabel>Open Graph</SectionLabel>
          <div className="flex-1 h-px bg-border/40" />
        </div>

        <div className="p-0 border-0 lg:p-6 lg:border max-w-5xl">
          <div className="hidden lg:block" aria-hidden="true">
            <DecorIcon position="top-left" />
            <DecorIcon position="top-right" />
            <DecorIcon position="bottom-left" />
            <DecorIcon position="bottom-right" />
          </div>

          <div className="relative z-10">
            <BrandingOGPreview />
          </div>
        </div>

        <div className="mt-14 max-w-3xl">
          <TypographyLead>
            The thumbnail that decides whether someone clicks or keeps
            scrolling. <TypographyMark>No pressure</TypographyMark> — just your
            entire first impression on the internet.
          </TypographyLead>
        </div>
      </Section>
    </>
  );
}
