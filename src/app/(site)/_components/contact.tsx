import { ArtStage } from "@/components/layouts/hero-art";
import { PageArt } from "@/components/diagrams/page-art";
import Link from "next/link";
import { EnvelopeIcon, ArrowUpRightIcon } from "@/components/shared/icons";
import { Section } from "@/components/layouts/page";
import { Reveal } from "@/components/shared/reveal";
import {
  TypographyH2,
  TypographyLead,
  TypographyMuted,
  TypographyMark,
} from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/components/ui/button-group";
import { siteConfig } from "@/lib/config";
import { getPlatformIcon } from "@/components/shared/platform-icons";
import { Fragment } from "react";
import { SocialsNudge } from "@/app/(site)/_components/doodles";

export function Contact() {
  return (
    <Section aria-label="Contact" id="contact">
      <Reveal className="w-full max-w-5xl">
        <div className="iso-trigger @container grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_18rem] lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="min-w-0 space-y-8">
            <div className="space-y-4 max-w-2xl">
              <TypographyH2>Got something worth building?</TypographyH2>

              <TypographyLead>
                If you’re working on something ambitious and need a frontend
                engineer who prefers{" "}
                <TypographyMark>clarity over chaos</TypographyMark>, we’ll
                probably get along.
              </TypographyLead>

              <TypographyMuted>
                Open to full-time roles, collaborations, and projects that make
                sense (or at least teach me something).
              </TypographyMuted>
            </div>

            <nav aria-label="Contact links" className="pt-4 pb-10">
              <div className="flex flex-wrap items-center gap-3">
                <Button asChild size="lg" className="font-semibold">
                  <Link
                    href={`mailto:${siteConfig.email}`}
                    aria-label="Say hello, send an email"
                  >
                    <EnvelopeIcon
                      data-icon="inline-start"
                      className="size-4 shrink-0"
                      aria-hidden="true"
                    />
                    Say Hello
                  </Link>
                </Button>

                <div className="relative">
                  <ButtonGroup>
                    {siteConfig.social.map((item, index) => (
                      <Fragment key={item.platform}>
                        {index > 0 && <ButtonGroupSeparator />}
                        <Button
                          asChild
                          size="lg"
                          variant="outline"
                          className="font-semibold"
                        >
                          <a
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${item.label} profile (opens in new tab)`}
                          >
                            {getPlatformIcon(item.platform, "size-4")}
                            <span className="hidden sm:inline">
                              {item.label}
                            </span>
                            <ArrowUpRightIcon
                              data-icon="inline-end"
                              className="size-3.5 opacity-50 hidden @sm:inline-flex"
                              aria-hidden="true"
                            />
                          </a>
                        </Button>
                      </Fragment>
                    ))}
                  </ButtonGroup>
                  <SocialsNudge />
                </div>
              </div>
            </nav>
          </div>
          <ArtStage className="hidden aspect-[4/3] md:block">
            <PageArt name="contact" />
          </ArtStage>
        </div>
      </Reveal>
    </Section>
  );
}
