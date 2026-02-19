import type { Metadata } from "next";
import { buildMeta } from "@/lib/og";
import { Logo } from "@/components/logo";
import { ScaledOG } from "./scaled-og";
import { OGImage } from "@/components/OG";
import {
  TypographyH1,
  TypographyH2,
  TypographyP,
  TypographyLead,
  TypographyBlockquote,
  TypographyList,
  TypographyInlineCode,
  TypographyLarge,
  TypographySmall,
  TypographyMuted,
  TypographyH3,
  TypographyH4,
} from "@/components/ui/typography";
import { Section } from "@/components/layouts/page";

export const metadata: Metadata = buildMeta({
  title: "Brand System",
  pageTitle: "Brand System",
  path: "home / branding",
  description: "Official logos, Open Graph templates, and typography scale.",
});

const LOGO_VARIANTS = [
  { key: "icon", label: "Icon", props: {} },
  { key: "wordmark", label: "Wordmark", props: { showWordmark: true } },
  {
    key: "wordmark-full",
    label: "Full Name",
    props: { showWordmark: true, full: true },
  },
] as const;

const OG_PREVIEWS = [
  {
    title: "Modern Web Architecture",
    description: "Scalable systems and beautiful UI foundations.",
    name: "Anish Shobith P S",
    role: "Software Developer",
    path: "/blog/architecture",
    tags: ["nextjs", "design", "typescript"],
    availableForHire: true,
  },
  {
    title: "Design Systems & Branding",
    description: "Building scalable UI foundations.",
    name: "Anish Shobith P S",
    role: "Software Developer",
    path: "/case-studies/design",
    tags: ["ui", "systems"],
    availableForHire: false,
  },
  {
    title: "Design Systems & Branding",
    description: "Building scalable UI foundations.",
    name: "Anish Shobith P S",
    role: "Software Developer",
    path: "/case-studies/design",
    tags: [],
    availableForHire: false,
  },
] as const;

export default function BrandingPage() {
  return (
    <>
      <Section variant="hero">
        <TypographyMuted className="tracking-widest uppercase text-xs font-mono">
          anishshobithps.com / brand
        </TypographyMuted>
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
        <div className="rounded-xl border divide-y overflow-hidden">
          {LOGO_VARIANTS.map((variant) => (
            <div
              key={variant.key}
              className="grid grid-cols-[1fr_80px] items-stretch"
            >
              {/* Preview */}
              <div className="flex items-center px-10 h-32 bg-muted/30">
                <Logo size={56} {...(variant.props as object)} copyOnClick />
              </div>
              {/* Label */}
              <div className="flex items-center justify-center border-l bg-muted/10 px-4">
                <TypographySmall className="font-medium text-center leading-tight">
                  {variant.label}
                </TypographySmall>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border p-5 grid grid-cols-2 sm:grid-cols-4 divide-x bg-muted/10">
          {[
            { label: "Minimum size", value: "32 × 32 px" },
            { label: "Clear space", value: "0.5× height" },
            { label: "Formats", value: "SVG · PNG" },
            { label: "Variants", value: "3 total" },
          ].map((item) => (
            <div
              key={item.label}
              className="px-5 first:pl-0 last:pr-0 space-y-1"
            >
              <TypographyMuted className="text-xs uppercase tracking-widest">
                {item.label}
              </TypographyMuted>
              <TypographySmall className="font-semibold">
                {item.value}
              </TypographySmall>
            </div>
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

        <div className="flex flex-col gap-6">
          {OG_PREVIEWS.map((og, i) => (
            <div key={i} className="border rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/20">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400/50" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/50" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-400/50" />
                <div className="flex-1 mx-2 h-5 rounded bg-muted/60 px-2 flex items-center overflow-hidden">
                  <TypographyMuted className="font-mono text-[10px] truncate leading-none">
                    anishshobithps.com{og.path}
                  </TypographyMuted>
                </div>
              </div>
              <ScaledOG>
                <OGImage
                  title={og.title}
                  description={og.description}
                  name={og.name}
                  role={og.role}
                  domain="anishshobithps.com"
                  path={og.path}
                  tags={[...og.tags]}
                  availableForHire={og.availableForHire}
                />
              </ScaledOG>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
