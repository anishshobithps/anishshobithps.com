import { Logo } from "@/components/shared/logo";
import { NowPlaying } from "@/components/shared/now-playing";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { DecorIcon, FullWidthDivider } from "@/components/ui/border";
import { Button } from "@/components/ui/button";
import { TypographyMuted, TypographySmall } from "@/components/ui/typography";
import { siteConfig } from "@/lib/config";
import { getPlatformIcon } from "@/components/shared/platform-icons";
import { currentYear } from "@/lib/date";
import Link from "next/link";
import { Suspense } from "react";

const footerNav = [
  ...siteConfig.nav,
  { href: "/branding", label: "Branding" },
  { href: "/privacy-policy", label: "Privacy Policy" },
];

export function Footer() {
  return (
    <footer className="relative mt-auto" aria-label="Site footer">
      <div className="relative mx-auto flex max-w-5xl flex-col gap-8 px-6 py-12 sm:px-8 lg:px-10 before:pointer-events-none before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-border after:pointer-events-none after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-border">
        <div aria-hidden="true">
          <DecorIcon position="top-left" pageBorder />
          <DecorIcon position="top-right" pageBorder />
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-10">
          <div className="flex flex-col gap-4">
            <Link href="/" aria-label={`${siteConfig.name} — home`}>
              <Logo size={32} showWordmark aria-hidden="true" />
            </Link>
            <TypographyMuted className="max-w-sm text-balance leading-relaxed">
              {siteConfig.description}
            </TypographyMuted>

            <TypographySmall className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground/80">
              Building opinionated interfaces for the web.
            </TypographySmall>

            <nav aria-label="Social links" className="flex gap-2">
              {siteConfig.social.map((item) => (
                <Button
                  key={item.label}
                  asChild
                  size="icon-sm"
                  variant="outline"
                  className="bg-background/70"
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
                  className="flex items-center gap-1.5 h-5"
                  aria-hidden="true"
                >
                  <div className="size-3.5 rounded-full bg-muted animate-pulse shrink-0" />
                  <div className="h-2.5 w-36 rounded bg-muted animate-pulse" />
                </div>
              }
            >
              <NowPlaying />
            </Suspense>
          </div>

          <nav aria-label="Footer navigation" className="flex flex-col gap-2">
            <TypographyMuted
              className="mb-1 font-mono uppercase tracking-widest"
              aria-hidden="true"
            >
              Pages
            </TypographyMuted>

            <div className="flex flex-wrap gap-2 sm:max-w-68 sm:justify-end">
              {footerNav.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="w-max rounded-full border border-border bg-background/70 px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <TypographySmall className="leading-none">
                    {label}
                  </TypographySmall>
                </Link>
              ))}
            </div>
          </nav>
        </div>

        <div aria-hidden="true">
          <FullWidthDivider position="bottom" />
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TypographyMuted
            className="font-mono tabular-nums"
            aria-label={`© 2022 to ${currentYear()} ${siteConfig.name}. All rights reserved.`}
          >
            &copy; 2022 - {currentYear()} {siteConfig.name}. All rights
            reserved.
          </TypographyMuted>
          <ThemeToggle
            aria-label="Toggle theme"
            className="self-start sm:self-auto"
          />
        </div>
      </div>
    </footer>
  );
}
