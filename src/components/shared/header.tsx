"use client";

import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { DecorIcon } from "@/components/ui/border";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Kbd } from "@/components/ui/kbd";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { TypographySmall } from "@/components/ui/typography";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/cn";
import { setCommandMenuOpen } from "@/lib/command-menu-store";
import { useIsMac } from "@/hooks/use-is-mac";
import {
  ListIcon,
  MagnifyingGlassIcon,
  XIcon,
} from "@/components/shared/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

function CommandMenuButton({ isMac }: { isMac: boolean }) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => setCommandMenuOpen(true)}
      aria-label="Search and commands"
      aria-keyshortcuts={isMac ? "Meta+K" : "Control+K"}
      className="h-8.5 gap-1.5 rounded-l-full px-2.5 text-muted-foreground hover:text-foreground pointer-coarse:h-11"
    >
      <MagnifyingGlassIcon aria-hidden="true" className="size-4" />
      <Kbd
        translate="no"
        aria-hidden="true"
        className="max-md:hidden rounded-full px-1.5 font-mono text-[10px]"
      >
        {isMac ? "\u2318\u00A0K" : "Ctrl\u00A0K"}
      </Kbd>
    </Button>
  );
}

export function Header() {
  const pathname = usePathname();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;
  const setOpen = useCallback(
    (next: boolean) => setOpenPath(next ? pathname : null),
    [pathname],
  );
  const isMac = useIsMac();
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const closeOnDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setOpenPath(null);
    };
    mq.addEventListener("change", closeOnDesktop);
    return () => mq.removeEventListener("change", closeOnDesktop);
  }, []);

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
      setOpenPath(null);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenPath(null);
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
        <DecorIcon
          position="bottom-left"
          alignY="outer"
          aria-hidden="true"
          pageBorder
        />
        <DecorIcon
          position="bottom-right"
          alignY="outer"
          aria-hidden="true"
          pageBorder
        />

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

          <ButtonGroup className="max-md:hidden">
            <CommandMenuButton isMac={isMac} />
            <ThemeToggle className="rounded-r-full" />
          </ButtonGroup>

          <ButtonGroup className="md:hidden">
            <CommandMenuButton isMac={isMac} />
            <Button
              ref={triggerRef}
              className="size-8.5 rounded-r-full pointer-coarse:size-11"
              variant="outline"
              size="icon"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-nav"
              onClick={() => setOpen(!open)}
            >
              {open ? (
                <XIcon aria-hidden="true" />
              ) : (
                <ListIcon aria-hidden="true" />
              )}
            </Button>
          </ButtonGroup>
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
