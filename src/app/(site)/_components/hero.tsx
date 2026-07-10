import NextImage from "next/image";
import Link from "next/link";
import {
  FileTextIcon,
  EnvelopeIcon,
  CircleIcon,
} from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/components/ui/button-group";
import { Badge } from "@/components/ui/badge";
import { Section } from "@/components/layouts/page";
import { siteConfig } from "@/lib/config";
import {
  TypographyH1,
  TypographyLead,
  TypographyMuted,
  TypographyMark,
} from "@/components/ui/typography";
import { LocationTag } from "@/components/ui/location";

export function Hero() {
  return (
    <Section variant="hero" aria-label="Introduction">
      <div className="w-full max-w-5xl flex flex-col gap-8">
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

        <div className="flex flex-col gap-6 px-1 animate-in fade-in-0 slide-in-from-bottom-6 duration-700 fill-mode-backwards [animation-delay:180ms]">
          <div className="flex flex-col gap-3">
            {siteConfig.availableForHire && (
              <div>
                <Badge
                  variant="outline"
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-xs border-(--brand)/30 text-(--brand-text) bg-(--brand)/8"
                  aria-label="Currently available for hire"
                >
                  <CircleIcon
                    className="size-2 fill-(--color-available) text-(--color-available) animate-pulse"
                    weight="fill"
                    aria-hidden="true"
                  />
                  Available for hire
                </Badge>
              </div>
            )}
            <TypographyH1>{siteConfig.name}</TypographyH1>
            <div className="flex flex-wrap items-center gap-3">
              <TypographyMuted aria-label={`Role: ${siteConfig.role}`}>
                {siteConfig.role}
              </TypographyMuted>
              <LocationTag />
            </div>
          </div>

          <TypographyLead>
            I build{" "}
            <TypographyMark>interfaces and tooling</TypographyMark>, the
            occasional bot, and questionable automation scripts — mostly so I
            don&apos;t have to repeat myself.
          </TypographyLead>

          <nav aria-label="Primary actions">
            <ButtonGroup>
              <Button asChild size="lg" className="font-semibold px-3 @sm:px-5">
                <Link
                  href="/resume"
                  prefetch={false}
                  aria-label="View resume"
                  className="flex items-center justify-center gap-2"
                >
                  <FileTextIcon
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
                    className="size-5 shrink-0"
                    aria-hidden="true"
                  />
                  <span>Contact</span>
                </a>
              </Button>
            </ButtonGroup>
          </nav>
        </div>
      </div>
    </Section>
  );
}
