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
            A unified system of identity components designed for{" "}
            <TypographyMark>scalability and visual clarity</TypographyMark>.
          </TypographyLead>
        </div>
      </Section>

      <Section aria-label="Typography">
        <div className="flex items-center gap-3 mb-10" aria-hidden="true">
          <SectionLabel>Typography</SectionLabel>
          <div className="flex-1 h-px bg-border/40" />
        </div>

        <ul role="list" aria-label="Typography variants" className="w-full max-w-5xl grid md:grid-cols-2 gap-6 lg:gap-8">
          {[
            { title: "Heading One", component: <TypographyH1>Heading One</TypographyH1> },
            { title: "Heading Two", component: <TypographyH2>Heading Two</TypographyH2> },
            { title: "Heading Three", component: <TypographyH3>Heading Three</TypographyH3> },
            { title: "Heading Four", component: <TypographyH4>Heading Four</TypographyH4> },
            {
              title: "Paragraph",
              component: (
                <TypographyP>
                  This is body text used across documentation and system pages.
                </TypographyP>
              ),
            },
            {
              title: "Lead",
              component: (
                <TypographyLead>
                  Lead text for section intros and important messaging.
                </TypographyLead>
              ),
            },
            {
              title: "Blockquote",
              component: (
                <TypographyBlockquote>
                  Strong opinions, loosely held.
                </TypographyBlockquote>
              ),
            },
            {
              title: "List",
              component: (
                <TypographyList>
                  <li>Reusable patterns</li>
                  <li>Scalable systems</li>
                  <li>Consistent hierarchy</li>
                </TypographyList>
              ),
            },
            {
              title: "Inline Code",
              component: (
                <TypographyP>
                  Install with{" "}
                  <TypographyInlineCode>npm install brand-system</TypographyInlineCode>
                </TypographyP>
              ),
            },
            {
              title: "Large",
              component: <TypographyLarge>Large Callout Text</TypographyLarge>,
            },
            {
              title: "Small",
              component: <TypographySmall>Small metadata label</TypographySmall>,
            },
            {
              title: "Muted",
              component: <TypographyMuted>Secondary information text.</TypographyMuted>,
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
                <TypographyMuted className="text-xs uppercase tracking-wider" aria-hidden="true">
                  {item.title}
                </TypographyMuted>
                {item.component}
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-14 max-w-3xl">
          <TypographyLead>
            Typography ensures{" "}
            <TypographyMark>readable hierarchy and structural clarity</TypographyMark>{" "}
            across every interface.
          </TypographyLead>
        </div>
      </Section>

      <Section aria-label="Logo Variants">
        <div className="flex items-center gap-3 mb-10" aria-hidden="true">
          <SectionLabel>Logo Variants</SectionLabel>
          <div className="flex-1 h-px bg-border/40" />
        </div>

        <ul role="list" aria-label="Logo variants" className="w-full max-w-5xl grid md:grid-cols-3 gap-6 lg:gap-8">
          {[
            { label: "Icon", props: {} },
            { label: "Wordmark", props: { showWordmark: true } },
            { label: "Full Name", props: { showWordmark: true, full: true } },
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
                  description="Usage ready"
                  logoProps={variant.props}
                />
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-14 max-w-3xl">
          <TypographyLead>
            Logos are optimized for{" "}
            <TypographyMark>clarity across contexts</TypographyMark>{" "}
            from favicon to full display usage.
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
            Social previews maintain{" "}
            <TypographyMark>brand recognition and visual consistency</TypographyMark>{" "}
            across platforms.
          </TypographyLead>
        </div>
      </Section>
    </>
  );
}
