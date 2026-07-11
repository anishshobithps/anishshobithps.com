"use client";

import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { DecorIcon } from "@/components/ui/border";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { TypographySmall } from "@/components/ui/typography";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/cn";
import { ListIcon, XIcon } from "@/components/shared/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    if (mq.matches) setOpen(false);
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) setOpen(false);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        menuRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <header className="bg-background/80 fixed top-0 z-50 w-full backdrop-blur border-b border-border [view-transition-name:site-header]">
      <div
        className="relative mx-auto flex h-14 max-w-5xl items-center justify-between px-6 sm:px-8 lg:px-10
        before:pointer-events-none before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-border
        after:pointer-events-none after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-border"
      >
        <DecorIcon position="bottom-left" aria-hidden="true" pageBorder />
        <DecorIcon position="bottom-right" aria-hidden="true" pageBorder />

        <Link
          href="/"
          aria-label={`${siteConfig.name} — home`}
          className="cursor-pointer"
        >
          <Logo size={32} showWordmark aria-hidden="true" />
        </Link>

        <div className="flex items-center gap-1">
          <NavigationMenu className="max-md:hidden" aria-label="Main navigation">
            <NavigationMenuList className="gap-0.5">
              {siteConfig.nav.map((link) => (
                <NavigationMenuItem key={link.href}>
                  <NavigationMenuLink
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-md px-3 py-2 transition-colors aria-[current=page]:text-foreground aria-[current=page]:font-medium aria-[current=page]:bg-(--brand)/8 dark:aria-[current=page]:bg-accent"
                    aria-current={pathname === link.href ? "page" : undefined}
                  >
                    <TypographySmall>{link.label}</TypographySmall>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          <ThemeToggle className="max-md:hidden" />

          <div ref={triggerRef} className="md:hidden">
            <Button
              className="size-8 pointer-coarse:size-11"
              variant="ghost"
              size="icon"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-nav"
              onClick={() => setOpen((prev) => !prev)}
            >
              {open ? (
                <XIcon aria-hidden="true" />
              ) : (
                <ListIcon aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>
      </div>

      <div
        ref={menuRef}
        id="mobile-nav"
        className={cn(
          "absolute inset-x-0 top-full border-b border-border bg-background/95 shadow-md backdrop-blur-md transition duration-200 ease-out md:hidden",
          open
            ? "visible translate-y-0 opacity-100"
            : "pointer-events-none invisible -translate-y-1 opacity-0",
        )}
      >
        <nav className="flex flex-col divide-y" aria-label="Mobile navigation">
          {siteConfig.nav.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-foreground hover:text-muted-foreground hover:bg-accent px-6 py-3.5 transition-colors"
              aria-current={pathname === link.href ? "page" : undefined}
            >
              <TypographySmall>{link.label}</TypographySmall>
            </Link>
          ))}
          <div className="flex items-center justify-between px-6 py-3.5">
            <TypographySmall className="text-foreground" id="theme-label">
              Theme
            </TypographySmall>
            <ThemeToggle aria-labelledby="theme-label" />
          </div>
        </nav>
      </div>
    </header>
  );
}
