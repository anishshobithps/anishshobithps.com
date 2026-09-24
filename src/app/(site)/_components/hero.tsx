import NextImage from "next/image";
import Link from "next/link";
import { FileTextIcon, EnvelopeIcon } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/components/ui/button-group";
import { Section } from "@/components/layouts/page";
import { siteConfig } from "@/lib/config";
import {
  TypographyH1,
  TypographyLead,
  TypographyMuted,
  TypographyMark,
} from "@/components/ui/typography";
import { LocationTag } from "@/components/ui/location";
import { HireSign } from "@/app/(site)/_components/hire-sign";
import { HeroNudges } from "@/app/(site)/_components/hero-nudges";
import { IceCreamNote, PhotoCallout } from "@/app/(site)/_components/doodles";
import { source } from "@/lib/source";
import { toTimestamp } from "@/lib/date";

export function Hero() {
  const [latest] = source
    .getPages()
    .sort((a, b) => toTimestamp(b.data.date) - toTimestamp(a.data.date));

  return (
    <Section variant="hero" aria-label="Introduction">
      <div className="w-full max-w-5xl flex flex-col gap-8">
        <div className="relative">
          <PhotoCallout />
          <div className="relative w-full border rounded-md overflow-hidden lg:max-h-95">
            <NextImage
              src="/profile.avif"
              alt={`Profile photo of ${siteConfig.name}`}
              width={6000}
              height={4000}
              priority
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="w-full h-auto lg:h-95 lg:object-cover lg:object-center"
            />
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-end">
          <div className="flex min-w-0 flex-col gap-6 px-1 animate-in fade-in-0 slide-in-from-bottom-6 duration-700 fill-mode-backwards [animation-delay:180ms]">
            <div className="flex flex-col gap-3">
              {siteConfig.availableForHire && (
                <div>
                  <HireSign />
                </div>
              )}
              <TypographyH1>{siteConfig.name}</TypographyH1>
              <div className="flex flex-wrap items-center gap-3">
                <TypographyMuted>{siteConfig.role}</TypographyMuted>
                <IceCreamNote />
                <LocationTag />
              </div>
            </div>

            <TypographyLead>
              I build <TypographyMark>interfaces and tooling</TypographyMark>,
              the occasional bot, and questionable automation scripts, mostly so
              I don&apos;t have to repeat myself.
            </TypographyLead>

            <nav aria-label="Primary actions">
              <ButtonGroup>
                <Button
                  asChild
                  size="lg"
                  className="font-semibold px-3 @sm:px-5"
                >
                  <Link
                    href="/resume"
                    prefetch={false}
                    aria-label="View resume"
                    className="flex items-center justify-center gap-2"
                  >
                    <FileTextIcon
                      data-icon="inline-start"
                      className="size-5 shrink-0"
                      aria-hidden="true"
                    />
                    <span>Resume</span>
                  </Link>
                </Button>
                <ButtonGroupSeparator />
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="font-semibold px-3 @sm:px-5"
                >
                  <a
                    href="#contact"
                    aria-label="Jump to contact section"
                    className="flex items-center justify-center gap-2"
                  >
                    <EnvelopeIcon
                      data-icon="inline-start"
                      className="size-5 shrink-0"
                      aria-hidden="true"
                    />
                    <span>Contact</span>
                  </a>
                </Button>
              </ButtonGroup>
            </nav>
          </div>
          <HeroNudges
            latest={latest && { url: latest.url, title: latest.data.title }}
          />
        </div>
      </div>
    </Section>
  );
}
