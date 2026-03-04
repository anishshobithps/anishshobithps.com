"use client";

import { Section } from "@/components/layouts/page";
import { getPlatformIcon } from "@/components/shared/platform-icons";
import { DecorIcon } from "@/components/ui/border";
import { Button } from "@/components/ui/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/components/ui/button-group";
import {
  SectionLabel,
  TypographyH2,
  TypographyLead,
  TypographyMark,
  TypographyMuted,
} from "@/components/ui/typography";
import { siteConfig } from "@/lib/config";
import { IconArrowUpRight, IconMail } from "@tabler/icons-react";
import Link from "next/link";
import { Fragment } from "react";

export function Contact() {
  return (
    <Section aria-label="Contact" id="contact">
      <div className="flex items-center gap-3 mb-10" aria-hidden="true">
        <SectionLabel>Contact</SectionLabel>
        <div className="flex-1 h-px bg-border/40" />
      </div>

      <div className="w-full max-w-5xl">
        <div className="relative p-0 border-0 lg:p-10 lg:border">
          <div className="hidden lg:block" aria-hidden="true">
            <DecorIcon position="top-left" />
            <DecorIcon position="top-right" />
            <DecorIcon position="bottom-left" />
            <DecorIcon position="bottom-right" />
          </div>

          <div className="relative z-10 space-y-8">
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

            <nav
              aria-label="Contact links"
              className="flex flex-wrap gap-3 pt-4"
            >
              <ButtonGroup>
                <Button asChild size="lg" className="font-semibold">
                  <Link
                    href={`mailto:${siteConfig.email}`}
                    aria-label="Say Hello — send an email"
                  >
                    <IconMail
                      className="size-4 shrink-0"
                      stroke={1.5}
                      aria-hidden="true"
                    />
                    <span className="hidden sm:inline">Say Hello</span>
                  </Link>
                </Button>
                {siteConfig.social.map((item, index) => (
                  <Fragment key={item.platform}>
                    {index > 0 && (
                      <ButtonGroupSeparator key={`sep-${item.platform}`} />
                    )}
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
                        {getPlatformIcon(item.platform)}
                        <span className="hidden sm:inline">{item.label}</span>
                        <IconArrowUpRight
                          className="size-3.5 opacity-50 hidden sm:block"
                          stroke={1.5}
                          aria-hidden="true"
                        />
                      </a>
                    </Button>
                  </Fragment>
                ))}
              </ButtonGroup>
            </nav>
          </div>
        </div>
      </div>
    </Section>
  );
}
