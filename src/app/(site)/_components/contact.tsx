import Link from "next/link";
import { EnvelopeIcon, ArrowUpRightIcon } from "@/components/shared/icons";
import { Section, Card } from "@/components/layouts/page";
import {
  TypographyH2,
  TypographyLead,
  TypographyMuted,
  TypographyMark,
  SectionHeader,
} from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/components/ui/button-group";
import { siteConfig } from "@/lib/config";
import { getPlatformIcon } from "@/components/shared/platform-icons";
import { Fragment } from "react";

export function Contact() {
  return (
    <Section aria-label="Contact" id="contact">
      <SectionHeader>Contact</SectionHeader>
      <div className="w-full max-w-5xl">
        <Card className="@lg:p-10">
          <div className="space-y-8">
            <div className="space-y-4 max-w-2xl">
              <TypographyH2 className="border-none pb-0">
                Let's Build Something
              </TypographyH2>

              <TypographyLead>
                If you're working on something ambitious and need a frontend
                engineer who prefers{" "}
                <TypographyMark>clarity over chaos</TypographyMark>, we'll
                probably get along.
              </TypographyLead>

              <TypographyMuted>
                Open to full-time roles, collaborations, and projects that make
                sense (or at least teach me something).
              </TypographyMuted>
            </div>

            <nav aria-label="Contact links" className="pt-4">
              <ButtonGroup>
                <Button asChild size="lg" className="font-semibold">
                  <Link
                    href={`mailto:${siteConfig.email}`}
                    aria-label="Say Hello — send an email"
                  >
                    <EnvelopeIcon
                      className="size-4 shrink-0"
                      aria-hidden="true"
                    />
                    <span className="hidden @sm:inline">Say Hello</span>
                  </Link>
                </Button>

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
                        <span className="hidden @sm:inline">{item.label}</span>
                        <ArrowUpRightIcon
                          className="size-3.5 opacity-50 hidden @sm:inline-flex"
                          aria-hidden="true"
                        />
                      </a>
                    </Button>
                  </Fragment>
                ))}
              </ButtonGroup>
            </nav>
          </div>
        </Card>
      </div>
    </Section>
  );
}
