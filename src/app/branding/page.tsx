"use client";

import React from "react";
import { Logo } from "@/components/logo";
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

const LOGO_VARIANTS = [
  { key: "default", label: "Default", darkBg: false, props: {} },
  {
    key: "nocontainer",
    label: "No Container",
    darkBg: false,
    props: { container: false },
  },
  {
    key: "accent",
    label: "Accent BG",
    darkBg: false,
    props: { accentBackground: true },
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

/* Scales a fixed 1200×630 OGImage to fill its container width */
function ScaledOG({ children }: { children: React.ReactNode }) {
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = React.useState(1);

  React.useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / 1200);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="w-full overflow-hidden"
      style={{ height: 630 * scale }}
    >
      <div
        style={{
          width: 1200,
          height: 630,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {children}
      </div>
    </div>
  );
}

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
      <Section>
        <div className="space-y-1">
          <TypographyMuted className="uppercase tracking-widest text-xs font-mono">
            01
          </TypographyMuted>
          <TypographyH2>Typography</TypographyH2>
        </div>

        <div className="rounded-xl border divide-y overflow-hidden">
          <div className="grid grid-cols-[72px_1fr_100px] items-baseline gap-6 px-6 py-5">
            <TypographyMuted className="font-mono text-xs">H1</TypographyMuted>
            <TypographyH1>The quick brown fox</TypographyH1>
            <TypographyMuted className="text-right text-xs">
              Display
            </TypographyMuted>
          </div>

          <div className="grid grid-cols-[72px_1fr_100px] items-baseline gap-6 px-6 py-5">
            <TypographyMuted className="font-mono text-xs">H2</TypographyMuted>
            <TypographyH2 className="border-none pb-0">
              Section Heading
            </TypographyH2>
            <TypographyMuted className="text-right text-xs">
              Section
            </TypographyMuted>
          </div>

          <div className="grid grid-cols-[72px_1fr_100px] items-baseline gap-6 px-6 py-5">
            <TypographyMuted className="font-mono text-xs">H3</TypographyMuted>
            <TypographyH3>Sub Heading</TypographyH3>
            <TypographyMuted className="text-right text-xs">
              Sub
            </TypographyMuted>
          </div>

          <div className="grid grid-cols-[72px_1fr_100px] items-baseline gap-6 px-6 py-5">
            <TypographyMuted className="font-mono text-xs">H4</TypographyMuted>
            <TypographyH4>Card Heading</TypographyH4>
            <TypographyMuted className="text-right text-xs">
              Card
            </TypographyMuted>
          </div>

          <div className="grid grid-cols-[72px_1fr_100px] items-baseline gap-6 px-6 py-5">
            <TypographyMuted className="font-mono text-xs">
              Lead
            </TypographyMuted>
            <TypographyLead>
              Lead text — used for hero sections and page intros.
            </TypographyLead>
            <TypographyMuted className="text-right text-xs">
              Intro
            </TypographyMuted>
          </div>

          <div className="grid grid-cols-[72px_1fr_100px] items-baseline gap-6 px-6 py-5">
            <TypographyMuted className="font-mono text-xs">P</TypographyMuted>
            <TypographyP className="mt-0">
              Paragraph text used across documentation and content pages.
            </TypographyP>
            <TypographyMuted className="text-right text-xs">
              Body
            </TypographyMuted>
          </div>

          <div className="grid grid-cols-[72px_1fr_100px] items-baseline gap-6 px-6 py-5">
            <TypographyMuted className="font-mono text-xs">BQ</TypographyMuted>
            <TypographyBlockquote className="mt-0">
              Blockquote — emphasis and highlights.
            </TypographyBlockquote>
            <TypographyMuted className="text-right text-xs">
              Quote
            </TypographyMuted>
          </div>

          <div className="grid grid-cols-[72px_1fr_100px] items-baseline gap-6 px-6 py-5">
            <TypographyMuted className="font-mono text-xs">LG</TypographyMuted>
            <TypographyLarge>
              Large text — useful for statistics.
            </TypographyLarge>
            <TypographyMuted className="text-right text-xs">
              Callout
            </TypographyMuted>
          </div>

          <div className="grid grid-cols-[72px_1fr_100px] items-baseline gap-6 px-6 py-5">
            <TypographyMuted className="font-mono text-xs">SM</TypographyMuted>
            <TypographySmall>Small text — metadata and labels.</TypographySmall>
            <TypographyMuted className="text-right text-xs">
              Meta
            </TypographyMuted>
          </div>

          <div className="grid grid-cols-[72px_1fr_100px] items-baseline gap-6 px-6 py-5">
            <TypographyMuted className="font-mono text-xs">MU</TypographyMuted>
            <TypographyMuted>Muted text — secondary info.</TypographyMuted>
            <TypographyMuted className="text-right text-xs">
              Secondary
            </TypographyMuted>
          </div>

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

      <Section>
        <div className="space-y-1">
          <TypographyMuted className="uppercase tracking-widest text-xs font-mono">
            02
          </TypographyMuted>
          <TypographyH2>Logo Variants</TypographyH2>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          {LOGO_VARIANTS.map((variant) => (
            <div
              key={variant.key}
              className="border rounded-xl overflow-hidden"
            >
              <div
                className={[
                  "flex items-center justify-center p-10 min-h-50",
                  variant.darkBg ? "bg-neutral-950" : "bg-muted/30",
                ].join(" ")}
              >
                <Logo
                  id={variant.key}
                  size={128}
                  {...(variant.props as object)}
                />
              </div>
              <div className="px-4 py-3 border-t bg-muted/10">
                <TypographySmall className="font-medium">
                  {variant.label}
                </TypographySmall>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border p-5 grid grid-cols-2 sm:grid-cols-4 divide-x bg-muted/10">
          {[
            { label: "Minimum size", value: "64 × 64 px" },
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
              {/* Mock browser chrome */}
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
