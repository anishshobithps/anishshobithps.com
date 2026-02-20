import { LogoDownloadCard } from "@/app/branding/logo-download-card";
import { ScaledOG } from "@/app/branding/scaled-og";
import { Section } from "@/components/layouts/page";
import { BrandingOGPreview } from "./branding-og-preview";
import { OGImage } from "@/components/shared/OG";
import {
  TypographyBlockquote,
  TypographyH1,
  TypographyH2,
  TypographyH3,
  TypographyH4,
  TypographyInlineCode,
  TypographyLarge,
  TypographyLead,
  TypographyList,
  TypographyMuted,
  TypographyP,
  TypographySmall,
} from "@/components/ui/typography";
import { buildMeta } from "@/lib/og";
import type { Metadata } from "next";
import { Input } from "@/components/ui/input";
import { InputGroup } from "@/components/ui/input-group";
import { Switch } from "@/components/ui/switch";

export const metadata: Metadata = buildMeta({
  title: "Brand System",
  pageTitle: "Brand System",
  path: "home / branding",
  description: "Official logos, Open Graph templates, and typography scale.",
});

const LOGO_VARIANTS: Array<{
  key: string;
  label: string;
  description: string;
  props: Record<string, any>;
}> = [
  {
    key: "icon",
    label: "Icon",
    description: "Mark only — use at small sizes",
    props: {},
  },
  {
    key: "wordmark",
    label: "Wordmark",
    description: "Mark + short name",
    props: { showWordmark: true },
  },
  {
    key: "wordmark-full",
    label: "Full Name",
    description: "Mark + full name",
    props: { showWordmark: true, full: true },
  },
];

export default function BrandingPage() {
  return (
    <>
      <Section variant="hero">
        <TypographyH1>Brand System</TypographyH1>
        <TypographyLead>
          Official logos, Open Graph templates, and typography scale.
        </TypographyLead>
      </Section>

      {/* 01 — Typography */}
      <Section>
        <div className="space-y-1">
          <TypographyMuted className="uppercase tracking-widest text-xs font-mono">
            01
          </TypographyMuted>
          <TypographyH2>Typography</TypographyH2>
        </div>

        <div className="rounded-xl border divide-y overflow-hidden">
          {[
            {
              tag: "H1",
              node: <TypographyH1>The quick brown fox</TypographyH1>,
              role: "Display",
            },
            {
              tag: "H2",
              node: (
                <TypographyH2 className="border-none pb-0">
                  Section Heading
                </TypographyH2>
              ),
              role: "Section",
            },
            {
              tag: "H3",
              node: <TypographyH3>Sub Heading</TypographyH3>,
              role: "Sub",
            },
            {
              tag: "H4",
              node: <TypographyH4>Card Heading</TypographyH4>,
              role: "Card",
            },
            {
              tag: "Lead",
              node: (
                <TypographyLead>
                  Lead text — used for hero sections and page intros.
                </TypographyLead>
              ),
              role: "Intro",
            },
            {
              tag: "P",
              node: (
                <TypographyP className="mt-0">
                  Paragraph text used across documentation and content pages.
                </TypographyP>
              ),
              role: "Body",
            },
            {
              tag: "BQ",
              node: (
                <TypographyBlockquote className="mt-0">
                  Blockquote — emphasis and highlights.
                </TypographyBlockquote>
              ),
              role: "Quote",
            },
            {
              tag: "LG",
              node: (
                <TypographyLarge>
                  Large text — useful for statistics.
                </TypographyLarge>
              ),
              role: "Callout",
            },
            {
              tag: "SM",
              node: (
                <TypographySmall>
                  Small text — metadata and labels.
                </TypographySmall>
              ),
              role: "Meta",
            },
            {
              tag: "MU",
              node: (
                <TypographyMuted>Muted text — secondary info.</TypographyMuted>
              ),
              role: "Secondary",
            },
          ].map(({ tag, node, role }) => (
            <div
              key={tag}
              className="grid grid-cols-[72px_1fr_100px] items-baseline gap-6 px-6 py-5"
            >
              <TypographyMuted className="font-mono text-xs">
                {tag}
              </TypographyMuted>
              {node}
              <TypographyMuted className="text-right text-xs">
                {role}
              </TypographyMuted>
            </div>
          ))}

          <div className="grid grid-cols-[72px_1fr_100px] items-baseline gap-6 px-6 py-5">
            <TypographyMuted className="font-mono text-xs">
              Code
            </TypographyMuted>
            <TypographyP className="mt-0">
              Run{" "}
              <TypographyInlineCode>
                npm install brand-system
              </TypographyInlineCode>{" "}
              to get started.
            </TypographyP>
            <TypographyMuted className="text-right text-xs">
              Inline
            </TypographyMuted>
          </div>

          <div className="grid grid-cols-[72px_1fr_100px] items-start gap-6 px-6 py-5">
            <TypographyMuted className="font-mono text-xs pt-1">
              List
            </TypographyMuted>
            <TypographyList className="my-0">
              <li>List Item One</li>
              <li>List Item Two</li>
              <li>List Item Three</li>
            </TypographyList>
            <TypographyMuted className="text-right text-xs pt-1">
              Bullets
            </TypographyMuted>
          </div>
        </div>
      </Section>

      {/* 02 — Logo Variants */}
      <Section>
        <div className="space-y-1">
          <TypographyMuted className="uppercase tracking-widest text-xs font-mono">
            02
          </TypographyMuted>
          <TypographyH2>Logo Variants</TypographyH2>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {LOGO_VARIANTS.map((variant) => (
            <LogoDownloadCard
              key={variant.key}
              label={variant.label}
              description={variant.description}
              logoProps={variant.props}
            />
          ))}
        </div>
      </Section>

      {/* 03 — Open Graph */}
      <Section>
        <div className="space-y-1">
          <TypographyMuted className="uppercase tracking-widest text-xs font-mono">
            03
          </TypographyMuted>
          <TypographyH2>Open Graph</TypographyH2>
        </div>

        <BrandingOGPreview />
      </Section>
    </>
  );
}
