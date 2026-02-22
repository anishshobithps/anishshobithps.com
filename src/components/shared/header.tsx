"use client";

import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { DecorIcon } from "@/components/ui/border";
import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TypographySmall } from "@/components/ui/typography";
import { siteConfig } from "@/lib/config";
import { MenuIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) setOpen(false);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <header className="bg-background/80 sticky top-0 z-50 w-full backdrop-blur">
      <div
        className="relative mx-auto flex h-14 max-w-5xl items-center justify-between px-6 sm:px-8 lg:px-10
        before:pointer-events-none before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-border
        after:pointer-events-none after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-border"
      >
        <DecorIcon position="bottom-left" aria-hidden="true" />
        <DecorIcon position="bottom-right" aria-hidden="true" />

        <Link
          href="/"
          aria-label={`${siteConfig.name} — home`}
          className="cursor-pointer"
        >
          <Logo
            size={32}
            className="sm:hidden cursor-pointer"
            aria-hidden="true"
          />
          <Logo
            size={32}
            showWordmark
            className="hidden sm:inline-flex"
            aria-hidden="true"
          />
        </Link>

        <div className="flex items-center gap-1">
          <NavigationMenu
            className="max-md:hidden"
            aria-label="Main navigation"
          >
            <NavigationMenuList className="gap-0.5">
              {siteConfig.nav.map((link) => (
                <NavigationMenuItem key={link.href}>
                  <NavigationMenuLink
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-md px-3 py-1.5 transition-colors"
                    aria-current={pathname === link.href ? "page" : undefined}
                  >
                    <TypographySmall>{link.label}</TypographySmall>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          <ThemeToggle className="max-md:hidden" />

          <div className="md:hidden">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  className="size-8"
                  variant="ghost"
                  size="icon"
                  aria-label={open ? "Close menu" : "Open menu"}
                  aria-expanded={open}
                >
                  <MenuIcon aria-hidden="true" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                sideOffset={8}
                className="bg-background/95 w-screen rounded-none border-x-0 p-0 shadow-md backdrop-blur-md"
              >
                <nav
                  id="mobile-nav"
                  className="flex flex-col divide-y"
                  aria-label="Mobile navigation"
                >
                  {siteConfig.nav.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-foreground hover:text-muted-foreground hover:bg-accent px-6 py-3.5 transition-colors"
                      aria-current={pathname === link.href ? "page" : undefined}
                    >
                      <TypographySmall>{link.label}</TypographySmall>
                    </Link>
                  ))}
                  <div className="flex items-center justify-between px-6 py-3.5">
                    <TypographySmall
                      className="text-foreground"
                      id="theme-label"
                    >
                      Theme
                    </TypographySmall>
                    <ThemeToggle aria-labelledby="theme-label" />
                  </div>
                </nav>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
      <Divider plain />
    </header>
  );
}
