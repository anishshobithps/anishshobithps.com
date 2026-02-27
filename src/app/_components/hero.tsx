import { Image } from "@/components/ui/image";
import Link from "next/link";
import { IconFileText, IconMail } from "@tabler/icons-react";
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
  SectionLabel,
} from "@/components/ui/typography";
import { DecorIcon } from "@/components/ui/border";
import { LocationTag } from "@/components/ui/location";
import { IconCircleFilled } from "@tabler/icons-react";
import { cn } from "@/lib/cn";

export function Hero() {
  return (
    <Section variant="hero" aria-label="Introduction">
      <div className="flex items-center gap-3 mb-6" aria-hidden="true">
        <SectionLabel>Who am I?</SectionLabel>
        <div className="flex-1 h-px bg-border/40" />
      </div>

      <div className="w-full max-w-5xl grid lg:grid-cols-[1fr_300px] gap-8 lg:gap-12 items-stretch">
        <div
          className={cn(
            "relative flex flex-col justify-between",
            "bg-background/80 backdrop-blur-md",
            "p-0 border-0",
            "lg:p-8 lg:border",
          )}
        >
          <div className="hidden lg:block" aria-hidden="true">
            <DecorIcon position="top-left" />
            <DecorIcon position="top-right" />
            <DecorIcon position="bottom-left" />
            <DecorIcon position="bottom-right" />
          </div>

          <div className="space-y-5 relative z-10">
            {siteConfig.availableForHire && (
              <Badge
                variant="outline"
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs"
                aria-label="Currently available for hire"
              >
                <IconCircleFilled
                  className="size-2 fill-green-500 text-green-500 animate-pulse"
                  aria-hidden="true"
                />
                Available for hire
              </Badge>
            )}

            <div className="space-y-4">
              <TypographyH1>{siteConfig.name}</TypographyH1>
              <TypographyMuted
                className="mt-2"
                aria-label={`Role: ${siteConfig.role}`}
              >
                {siteConfig.role}
              </TypographyMuted>
              <div className="pt-2">
                <LocationTag />
              </div>
            </div>

            <TypographyLead>
              I build{" "}
              <TypographyMark>
                interfaces, bots, and questionable automation scripts
              </TypographyMark>{" "}
              — mostly so I don't have to repeat myself.
            </TypographyLead>
          </div>

          <nav aria-label="Primary actions" className="mt-8">
            <ButtonGroup>
              <Button asChild size="lg" className="font-semibold">
                <Link href="/resume" prefetch={false} aria-label="View resume">
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
                className="font-semibold"
              >
                <a href="#contact" aria-label="Jump to contact section">
                  <IconMail className="size-5 shrink-0" aria-hidden="true" />
                  <span>Contact</span>
                </a>
              </Button>
            </ButtonGroup>
          </nav>
        </div>

        <div className="hidden lg:block relative border" aria-hidden="true">
          <DecorIcon position="top-left" />
          <DecorIcon position="top-right" />
          <DecorIcon position="bottom-left" />
          <DecorIcon position="bottom-right" />

          <div className="relative w-full h-full">
            <Image
              src="/profile.avif"
              alt={`Profile photo of ${siteConfig.name}`}
              aspect="auto"
              preload
              sizes="300px"
              fill
              unoptimized
              containerClassName="w-full h-full"
            />
            <div
              className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.6))]"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </Section>
  );
}
