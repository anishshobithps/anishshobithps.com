import { PageArt } from "@/components/diagrams/page-art";
import { HeroWithArt } from "@/components/layouts/hero-art";
import { SectionMargins } from "@/components/layouts/section-margins";
import {
  Section,
  Card,
  CardGrid,
  CardGridItem,
} from "@/components/layouts/page";
import { LogoDownloadCard } from "@/app/(site)/branding/logo-download-card";
import { BrandingOGPreview } from "@/app/(site)/branding/branding-og-preview";
import {
  CricketDoodle,
  GroupGlyph,
  HoverNudge,
  IceCreamNote,
  OnlinePing,
  PhotoCallout,
  ReactionMascot,
  Signpost,
  SocialsNudge,
  ThemeNudge,
  TypingBubble,
} from "@/components/shared/doodles";
import { LoaderCaption, LogoLoader } from "@/components/shared/loader";
import { Logo } from "@/components/shared/logo";
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
  SectionHeader,
} from "@/components/ui/typography";
import { cn } from "@/lib/cn";
import { siteConfig } from "@/lib/config";
import type { ReactNode } from "react";

function DoodleStage({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex h-24 items-center justify-center",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface ShowcaseItem {
  title: string;
  description: string;
  component: ReactNode;
  className?: string;
}

function ShowcaseCard({
  title,
  description,
  component,
  className,
}: ShowcaseItem) {
  return (
    <CardGridItem aria-label={`${title} example`} className={className}>
      <div className="space-y-3">
        <TypographyMuted
          className="text-xs uppercase tracking-wider"
          aria-hidden="true"
        >
          {title}
        </TypographyMuted>
        {component}
        <TypographySmall className="block font-normal text-muted-foreground">
          {description}
        </TypographySmall>
      </div>
    </CardGridItem>
  );
}

const moods = ["", "terrible", "bad", "good", "amazing"] as const;

const motion: ShowcaseItem[] = [
  {
    title: "Sketch Loader",
    description:
      "Pencil draws the mark, colors it in, then it wakes up. Plays while pages load.",
    component: (
      <DoodleStage className="h-44">
        <div className="flex flex-col items-center gap-3">
          <LogoLoader size={88} />
          <LoaderCaption />
        </div>
      </DoodleStage>
    ),
  },
  {
    title: "Live Mark",
    description:
      "The header logo. Its eyes follow your cursor, and it cheers up when you hover.",
    component: (
      <DoodleStage className="h-44">
        <div className="flex flex-col items-center gap-1">
          <div className="group/logo">
            <Logo size={56} showWordmark alive aria-hidden="true" />
          </div>
          <div className="ml-16">
            <HoverNudge />
          </div>
        </div>
      </DoodleStage>
    ),
  },
  {
    title: "Margin Notes",
    description:
      "Every section is measured like a drawing sheet. The ruler reads your scroll, and the section you're in gets its dimension line inked in green.",
    className: "md:col-span-2",
    component: (
      <div className="flex h-72 flex-col overflow-hidden rounded-lg border border-line">
        <div className="hatch h-6 shrink-0 border-b border-line" />
        <div className="relative mx-24 flex-1 border-x border-line bg-background">
          <SectionMargins label="Motion" index="07" demo />
        </div>
        <div className="hatch h-6 shrink-0 border-t border-line" />
      </div>
    ),
  },
];

export default function BrandingPage() {
  return (
    <>
      <Section aria-label="Brand System">
        <SectionHeader as="p">Brand System</SectionHeader>
        <HeroWithArt art={<PageArt name="branding" />}>
          <TypographyH1>Brand Infrastructure</TypographyH1>
          <TypographyLead>
            A unified system of identity components built so I never have to
            explain{" "}
            <TypographyMark>
              &ldquo;just use the same font&rdquo;
            </TypographyMark>{" "}
            again.
          </TypographyLead>
        </HeroWithArt>
      </Section>

      <Section aria-label="Typography">
        <SectionHeader>Typography</SectionHeader>
        <CardGrid>
          {[
            {
              title: "Heading One",
              component: <TypographyH1 as="p">I Shipped It</TypographyH1>,
            },
            {
              title: "Heading Two",
              component: <TypographyH2 as="p">It Worked Locally</TypographyH2>,
            },
            {
              title: "Heading Three",
              component: (
                <TypographyH3 as="p">Something&apos;s On Fire</TypographyH3>
              ),
            },
            {
              title: "Heading Four",
              component: <TypographyH4 as="p">Blame The Cache</TypographyH4>,
            },
            {
              title: "Paragraph",
              component: (
                <TypographyP>
                  Body text. The part your eyes drift past while hunting for the
                  button. If you&apos;re reading this sentence, you&apos;re in
                  the top 1%, or you just have too much free time.
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
            <CardGridItem key={item.title} aria-label={`${item.title} example`}>
              <div className="space-y-3">
                <TypographyMuted
                  className="text-xs uppercase tracking-wider"
                  aria-hidden="true"
                >
                  {item.title}
                </TypographyMuted>
                {item.component}
              </div>
            </CardGridItem>
          ))}
        </CardGrid>

        <div className="mt-14 max-w-3xl">
          <TypographyLead>
            Typography is the reason your UI doesn&apos;t look like a ransom
            note. <TypographyMark>Hierarchy matters</TypographyMark>, and so
            does not picking a random Google Font at 2am.
          </TypographyLead>
        </div>
      </Section>

      <Section aria-label="Logo Variants">
        <SectionHeader>Logo Variants</SectionHeader>
        <CardGrid columns={3}>
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
            <CardGridItem key={variant.label}>
              <LogoDownloadCard
                label={variant.label}
                description={variant.description}
                logoProps={variant.props}
              />
            </CardGridItem>
          ))}
        </CardGrid>

        <div
          role="note"
          aria-label="Logo usage"
          className="mt-6 max-w-3xl space-y-1.5 rounded-lg border border-border bg-muted/30 p-4"
        >
          <SectionLabel>Before you download</SectionLabel>
          <TypographySmall className="block font-normal leading-relaxed text-muted-foreground">
            Everything on this page is here for reference. The artwork may be
            shared unmodified, for non-commercial use and with attribution,
            under{" "}
            <a
              href="https://creativecommons.org/licenses/by-nc-nd/4.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="link-external"
            >
              CC BY-NC-ND 4.0
            </a>
            . It does not give permission to use {siteConfig.name},{" "}
            {siteConfig.domain}, the logo, wordmark, or mascot as your own
            brand, or to imply endorsement. The{" "}
            <a
              href={`${siteConfig.repoUrl}/blob/main/LICENSE.md`}
              target="_blank"
              rel="noopener noreferrer"
              className="link-external"
            >
              license
            </a>{" "}
            has the details.
          </TypographySmall>
        </div>

        <div className="mt-14 max-w-3xl">
          <TypographyLead>
            From 16&times;16 favicon to full-bleed billboard, the logo survives
            it all. <TypographyMark>Unlike my confidence</TypographyMark> before
            a code review.
          </TypographyLead>
        </div>
      </Section>

      <Section aria-label="Doodles">
        <SectionHeader>Doodles</SectionHeader>
        <CardGrid>
          {[
            {
              title: "Photo Callout",
              description:
                "Points out the profile photo, flips text when it's too dark to see.",
              component: (
                <div className="pt-12">
                  <DoodleStage className="h-12">
                    <PhotoCallout />
                  </DoodleStage>
                </div>
              ),
            },
            {
              title: "Socials Nudge",
              description:
                "Tells you DMs are open before you scroll past the proof.",
              component: (
                <div className="pb-10">
                  <DoodleStage className="h-12">
                    <SocialsNudge />
                  </DoodleStage>
                </div>
              ),
            },
            {
              title: "Ice Cream Note",
              description: "Unverified nutritional claim, fully verified vibe.",
              component: (
                <DoodleStage>
                  <IceCreamNote />
                </DoodleStage>
              ),
            },
            {
              title: "Theme Nudge",
              description:
                "Lights on, lights off, still shipping the same bugs.",
              component: (
                <DoodleStage>
                  <ThemeNudge />
                </DoodleStage>
              ),
            },
            {
              title: "Online Ping",
              description: "Radar for “technically reachable.”",
              component: (
                <DoodleStage>
                  <OnlinePing />
                </DoodleStage>
              ),
            },
            {
              title: "Nav Glyphs",
              description:
                "So the footer's link groups don't read like a sitemap dump.",
              component: (
                <DoodleStage>
                  <div className="flex items-center gap-8">
                    <div className="flex flex-col items-center gap-2">
                      <GroupGlyph variant="pages" />
                      <TypographyMuted className="text-3xs uppercase tracking-wider">
                        Pages
                      </TypographyMuted>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <GroupGlyph variant="site" />
                      <TypographyMuted className="text-3xs uppercase tracking-wider">
                        Site
                      </TypographyMuted>
                    </div>
                  </div>
                </DoodleStage>
              ),
            },
            {
              title: "Cricket Doodle",
              description: "What an empty comment section sounds like.",
              component: (
                <DoodleStage>
                  <CricketDoodle />
                </DoodleStage>
              ),
            },
            {
              title: "Typing Bubble",
              description:
                "Someone's composing a reply. Probably regretting it already.",
              component: (
                <DoodleStage>
                  <TypingBubble />
                </DoodleStage>
              ),
            },
            {
              title: "Signpost",
              description:
                "Four directions out of a page. All of them more scrolling.",
              component: (
                <DoodleStage className="h-40">
                  <div className="relative h-36 w-28">
                    <Signpost />
                  </div>
                </DoodleStage>
              ),
            },
            {
              title: "Reaction Mascot",
              description: "Same face, five moods, zero self-control.",
              component: (
                <DoodleStage className="h-auto py-4">
                  <div className="flex flex-wrap items-end justify-center gap-x-3 gap-y-4">
                    {moods.map((mood) => (
                      <div
                        key={mood || "neutral"}
                        className="flex flex-col items-center gap-1.5"
                      >
                        <ReactionMascot mood={mood} />
                        <TypographyMuted className="text-3xs uppercase tracking-wider">
                          {mood || "neutral"}
                        </TypographyMuted>
                      </div>
                    ))}
                  </div>
                </DoodleStage>
              ),
            },
          ].map((item) => (
            <ShowcaseCard key={item.title} {...item} />
          ))}
        </CardGrid>

        <div className="mt-14 max-w-3xl">
          <TypographyLead>
            The small hand-drawn stuff.{" "}
            <TypographyMark>Not load-bearing</TypographyMark>, but the site
            feels off without it.
          </TypographyLead>
        </div>
      </Section>

      <Section aria-label="Motion">
        <SectionHeader>Motion</SectionHeader>
        <CardGrid>
          {motion.map((item) => (
            <ShowcaseCard key={item.title} {...item} />
          ))}
        </CardGrid>

        <div className="mt-14 max-w-3xl">
          <TypographyLead>
            The bits that move.{" "}
            <TypographyMark>Every one of them sits still</TypographyMark> when
            your system asks for reduced motion.
          </TypographyLead>
        </div>
      </Section>

      <Section aria-label="Open Graph">
        <SectionHeader>Open Graph</SectionHeader>
        <Card className="max-w-5xl p-0 @lg:p-0 overflow-hidden">
          <BrandingOGPreview />
        </Card>
        <div className="mt-14 max-w-3xl">
          <TypographyLead>
            The thumbnail that decides whether someone clicks or keeps
            scrolling. <TypographyMark>No pressure</TypographyMark>, just your
            entire first impression on the internet.
          </TypographyLead>
        </div>
      </Section>
    </>
  );
}
