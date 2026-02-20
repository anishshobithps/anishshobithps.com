import { DecorIcon, FullWidthDivider } from "@/components/ui/border";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/config";
import { GithubIcon, LinkedinIcon, TwitterIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { TypographyMuted, TypographySmall } from "./ui/typography";
import { Logo } from "./logo";
import { ThemeToggle } from "./shared/theme-toggle";

const platformIcons: Record<
  (typeof siteConfig.social)[number]["platform"],
  ReactNode
> = {
  github: <GithubIcon />,
  linkedin: <LinkedinIcon />,
  x: <TwitterIcon />,
};

const footerNav = [...siteConfig.nav, { href: "/branding", label: "Branding" }];

export function Footer() {
  return (
    <footer className="relative mt-auto">
      <div className="relative mx-auto flex max-w-5xl flex-col gap-8 px-6 py-12 sm:px-8 lg:px-10 before:pointer-events-none before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-border after:pointer-events-none after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-border">
        <DecorIcon position="top-left" />
        <DecorIcon position="top-right" />
        <FullWidthDivider position="top" />

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-[1fr_auto]">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <Link href="/" aria-label="Home">
              <Logo size={32} showWordmark />
            </Link>
            <TypographyMuted className="max-w-xs text-balance">
              {siteConfig.description}
            </TypographyMuted>
            <div className="flex gap-2">
              {siteConfig.social.map((item) => (
                <Button
                  key={item.label}
                  asChild
                  size="icon-sm"
                  variant="outline"
                >
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.label}
                  >
                    {platformIcons[item.platform]}
                  </a>
                </Button>
              ))}
            </div>
          </div>

          {/* Nav links */}
          <div className="flex flex-col gap-2">
            <TypographyMuted className="uppercase tracking-widest font-mono mb-1">
              Pages
            </TypographyMuted>
            {footerNav.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-muted-foreground hover:text-foreground transition-colors w-max"
              >
                <TypographySmall>{label}</TypographySmall>
              </Link>
            ))}
          </div>
        </div>

        <FullWidthDivider position="bottom" />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TypographyMuted className="font-mono">
            &copy; 2022 - {new Date().getFullYear()} {siteConfig.name}. All
            rights reserved.
          </TypographyMuted>
          <ThemeToggle className="self-start" />
        </div>
      </div>
    </footer>
  );
}
