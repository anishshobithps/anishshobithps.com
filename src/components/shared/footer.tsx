import { EndOfPage } from "@/components/shared/end-of-page";
import { Logo } from "@/components/shared/logo";
import { NowPlaying } from "@/components/shared/now-playing";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  SectionLabel,
  TypographyMuted,
  TypographySmall,
} from "@/components/ui/typography";
import { siteConfig } from "@/lib/config";
import { getPlatformIcon } from "@/components/shared/platform-icons";
import { currentYear } from "@/lib/date";
import Link from "next/link";
import { Suspense } from "react";
import type { Route } from "next";

const linkGroups = [
  { title: "Pages", links: siteConfig.nav },
  {
    title: "Site",
    links: [
      { href: "/branding", label: "Branding" },
      { href: "/privacy-policy", label: "Privacy Policy" },
    ],
  },
];

function ThemeNudge() {
  return (
    <div aria-hidden="true" className="flex items-center gap-1.5">
      <SectionLabel pixel className="text-(--brand-text)">
        <span className="dark:hidden">lights off?</span>
        <span className="hidden dark:inline">lights on?</span>
      </SectionLabel>
      <svg viewBox="0 0 34 22" className="h-5.5 w-8.5 overflow-visible">
        <path
          d="M2 16 C10 20, 22 18, 31 9 M24.5 8.5 L31 9 L30 15.5"
          fill="none"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="stroke-(--brand)"
        />
      </svg>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="relative -mt-px" aria-label="Site footer">
      <div className="mx-auto max-w-5xl border border-b-0 border-line bg-line">
        <div className="flex flex-col gap-14 rounded-t-2xl bg-background px-gutter pt-12 pb-12">
          <EndOfPage />

          <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_auto] md:gap-16">
            <div className="flex flex-col gap-4">
              <Link
                href="/"
                aria-label={`${siteConfig.name}, home`}
                className="w-max"
              >
                <Logo size={32} showWordmark aria-hidden="true" />
              </Link>
              <TypographyMuted className="max-w-sm text-balance leading-relaxed">
                {siteConfig.description}
              </TypographyMuted>

              <TypographySmall className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Building opinionated interfaces for the web.
              </TypographySmall>

              <nav aria-label="Social links" className="flex gap-2">
                {siteConfig.social.map((item) => (
                  <Button
                    key={item.label}
                    asChild
                    size="icon-sm"
                    variant="outline"
                    className="bg-background/70 pointer-coarse:size-11"
                  >
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${item.label} (opens in new tab)`}
                    >
                      {getPlatformIcon(item.platform)}
                    </a>
                  </Button>
                ))}
              </nav>

              <Suspense
                fallback={
                  <div
                    className="flex items-center gap-1.5"
                    aria-hidden="true"
                  >
                    <div className="size-9 rounded-full bg-muted animate-pulse shrink-0" />
                    <div className="h-2.5 w-36 rounded bg-muted animate-pulse" />
                  </div>
                }
              >
                <NowPlaying />
              </Suspense>
            </div>

            <div className="grid grid-cols-2 gap-8 sm:gap-12">
              {linkGroups.map(({ title, links }) => (
                <nav
                  key={title}
                  aria-label={`${title} links`}
                  className="flex flex-col gap-3"
                >
                  <SectionLabel>{title}</SectionLabel>
                  <ul role="list" className="flex flex-col gap-1">
                    {links.map(({ href, label }) => (
                      <li key={href}>
                        <Link
                          href={href as Route}
                          className="inline-flex min-h-8 items-center text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline pointer-coarse:min-h-11"
                        >
                          <TypographySmall>{label}</TypographySmall>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
            <TypographyMuted className="font-mono tabular-nums">
              &copy; 2022–{currentYear()} {siteConfig.name}. All rights
              reserved.
            </TypographyMuted>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <ThemeNudge />
              <ThemeToggle aria-label="Toggle theme" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
