import NextImage from "next/image";
import Link from "next/link";
import { IconFileText, IconMail } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/components/ui/button-group";
import { Badge } from "@/components/ui/badge";
import { Section, Card } from "@/components/layouts/page";
import { siteConfig } from "@/lib/config";
import {
  TypographyH1,
  TypographyLead,
  TypographyMuted,
  TypographyMark,
  SectionLabel,
} from "@/components/ui/typography";
import { LocationTag } from "@/components/ui/location";
import { IconCircleFilled } from "@tabler/icons-react";
import { DecorIcon } from "@/components/ui/border";

export function Hero() {
  return (
    <Section variant="hero" aria-label="Introduction">
      <div className="flex items-center gap-3 mb-6" aria-hidden="true">
        <SectionLabel>Who am I?</SectionLabel>
        <div className="flex-1 h-px bg-border/40" />
      </div>

      <div className="w-full max-w-5xl flex flex-col gap-6">
        {siteConfig.availableForHire && (
          <Badge
            variant="outline"
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs self-start"
            aria-label="Currently available for hire"
          >
            <IconCircleFilled
              className="size-2 fill-green-500 text-green-500 animate-pulse"
              aria-hidden="true"
            />
            Available for hire
          </Badge>
        )}

        <div className="relative w-full border rounded-md overflow-hidden lg:max-h-95">
          <DecorIcon position="top-left" />
          <DecorIcon position="top-right" />
          <DecorIcon position="bottom-left" />
          <DecorIcon position="bottom-right" />
          <NextImage
            src="/profile.avif"
            alt={`Profile photo of ${siteConfig.name}`}
            width={6000}
            height={4000}
            unoptimized
            priority
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="w-full h-auto lg:h-95 lg:object-cover lg:object-center"
          />
        </div>

        <Card className="@sm:p-8 flex flex-col gap-8 bg-background/80 backdrop-blur-md">
          <div className="space-y-4">
            <TypographyH1>{siteConfig.name}</TypographyH1>
            <TypographyMuted aria-label={`Role: ${siteConfig.role}`}>
              {siteConfig.role}
            </TypographyMuted>
            <LocationTag />
          </div>

          <TypographyLead>
            I build{" "}
            <TypographyMark>
              interfaces, bots, and questionable automation scripts
            </TypographyMark>{" "}
            — mostly so I don't have to repeat myself.
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
                  <IconFileText
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
                  <IconMail className="size-5 shrink-0" aria-hidden="true" />
                  <span>Contact</span>
                </a>
              </Button>
            </ButtonGroup>
          </nav>
        </Card>
      </div>
    </Section>
  );
}
