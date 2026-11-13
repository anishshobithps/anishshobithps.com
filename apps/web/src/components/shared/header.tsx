"use client";

import { AppearanceControl } from "@/components/shared/appearance-control";
import { pad, RegisterDial } from "@/components/layouts/blog-toc";
import { Logo } from "@/components/shared/logo";
import { SoundToggle } from "@/components/shared/sound-controls";
import { ThemeCycle } from "@/components/shared/theme-toggle";
import { Button } from "@repo/ui/components/button";
import { ButtonGroup } from "@repo/ui/components/button-group";
import { Kbd } from "@repo/ui/components/kbd";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@repo/ui/components/navigation-menu";
import { SectionLabel, TypographySmall } from "@repo/ui/components/typography";
import { siteConfig } from "@repo/site-config";
import { cn } from "@repo/ui/lib/cn";
import { setCommandMenuOpen } from "@/lib/command-menu-store";
import { type ReadingState, setTocOpen, useReading } from "@/lib/reading-store";
import { playCue } from "@repo/sounds/sound-player";
import { useIsMac } from "@/hooks/use-is-mac";
import {
  CaretDownIcon,
  ListIcon,
  MagnifyingGlassIcon,
  XIcon,
} from "@repo/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  type CSSProperties,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

function isActive(pathname: string, href: string) {
  if (pathname === href) return true;
  return href === "/blogs" && pathname.startsWith("/blog/");
}

const WIDE = "(min-width: 80rem)";

function subscribeWide(onChange: () => void) {
  const query = window.matchMedia(WIDE);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function useWide() {
  return useSyncExternalStore(
    subscribeWide,
    () => window.matchMedia(WIDE).matches,
    () => false,
  );
}

function ReadingBar({ reading }: { reading: ReadingState }) {
  return (
    <Button
      type="button"
      variant="ghost"
      data-reading-trigger=""
      aria-label={`Table of contents, section ${reading.section} of ${reading.sections}: ${reading.heading}`}
      aria-expanded={reading.tocOpen}
      onClick={() => {
        playCue(reading.tocOpen ? "close" : "open");
        setTocOpen(!reading.tocOpen);
      }}
      size="sm"
      className="h-9 min-w-0 flex-1 justify-start"
    >
      <RegisterDial progress={reading.progress} size={16} className="shrink-0" />
      <SectionLabel pixel accent asChild className="shrink-0">
        <span>
          {pad(reading.section)}/{pad(reading.sections)}
        </span>
      </SectionLabel>
      <span className="block min-w-0 truncate *:text-nowrap">
        <TypographySmall>{reading.heading}</TypographySmall>
      </span>
      <CaretDownIcon
        aria-hidden="true"
        className={cn(
          "size-3.5 shrink-0 text-muted-foreground transition-transform",
          reading.tocOpen && "rotate-180",
        )}
      />
    </Button>
  );
}

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
        className="max-md:hidden rounded-full px-1.5 font-mono text-3xs"
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
  const navRef = useRef<HTMLDivElement>(null);
  const reading = useReading();
  const wide = useWide();
  const engaged = !wide && reading.engaged && reading.sections > 0;

  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const place = () => {
      const current = nav.querySelector<HTMLElement>("[data-current]");
      if (!current) {
        nav.style.setProperty("--rule-width", "0px");
        return;
      }
      const box = nav.getBoundingClientRect();
      const rect = current.getBoundingClientRect();
      nav.style.setProperty("--rule-left", `${rect.left - box.left + 10}px`);
      nav.style.setProperty("--rule-width", `${rect.width - 20}px`);
    };
    place();
    const observer = new ResizeObserver(place);
    observer.observe(nav);
    return () => observer.disconnect();
  }, [pathname, engaged]);

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
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-background/80 backdrop-blur [view-transition-name:site-header]">
      <div className="relative mx-auto max-w-5xl border-x border-line bg-background">
        <div className="flex h-14 items-center justify-between px-gutter">
          <Link
            href="/"
            prefetch={false}
            data-sound="tap"
            aria-label={`${siteConfig.name}, home`}
            className="group/logo cursor-pointer rounded-md transition-[scale] duration-150 ease-out active:scale-96"
          >
            <Logo size={32} showWordmark={!engaged} alive aria-hidden="true" />
          </Link>

          {engaged && (
            <div className="mx-2 flex min-w-0 flex-1 animate-in fade-in-0 slide-in-from-bottom-1 duration-300 motion-reduce:animate-none md:mx-6">
              <ReadingBar reading={reading} />
            </div>
          )}

          <div className="flex items-center gap-1">
            {engaged ? null : (
            <div
              ref={navRef}
              className="relative max-md:hidden animate-in fade-in-0 slide-in-from-top-1 duration-300 motion-reduce:animate-none"
            >
            <NavigationMenu aria-label="Main navigation">
              <NavigationMenuList className="gap-0.5">
                {siteConfig.nav.map((link) => {
                  const active = isActive(pathname, link.href);
                  return (
                    <NavigationMenuItem key={link.href}>
                      <NavigationMenuLink
                        asChild
                        data-current={active || undefined}
                        className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-md px-3 py-2 transition-colors data-current:text-foreground"
                      >
                        <Link
                          href={link.href}
                          data-sound="tap"
                          aria-current={
                            pathname === link.href
                              ? "page"
                              : active
                                ? "true"
                                : undefined
                          }
                        >
                          <TypographySmall>{link.label}</TypographySmall>
                        </Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  );
                })}
              </NavigationMenuList>
            </NavigationMenu>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-0.5 left-(--rule-left,0) h-0.5 w-(--rule-width,0) translate-x-0.5 translate-y-0.75 rounded-full bg-(--brand) transition-[left,width] delay-75 duration-700 ease-out motion-reduce:transition-none"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-0.5 left-(--rule-left,0) h-0.5 w-(--rule-width,0) rounded-full bg-foreground transition-[left,width] duration-200 ease-out motion-reduce:transition-none"
              />
            </div>
            )}

            <ButtonGroup className="max-md:hidden">
              <CommandMenuButton isMac={isMac} />
              <SoundToggle className="h-8.5 w-9 pointer-coarse:size-11" />
              <ThemeCycle className="h-8.5 w-9 rounded-r-full pointer-coarse:size-11" />
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
                onClick={() => {
                  playCue(open ? "close" : "open");
                  setOpen(!open);
                }}
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
            "absolute -inset-x-px top-full mt-px overflow-hidden border border-t-0 border-line bg-background shadow-md transition duration-200 ease-out md:hidden",
            open
              ? "visible translate-y-0 opacity-100"
              : "pointer-events-none invisible -translate-y-1 opacity-0",
          )}
        >
          <nav
            className="flex flex-col divide-y"
            aria-label="Mobile navigation"
          >
            {siteConfig.nav.map((link, index) => {
              const active = isActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  data-sound="tap"
                  onClick={() => setOpen(false)}
                  className={cn(
                    "relative px-6 py-3.5 text-foreground transition-[opacity,translate,background-color] delay-(--stagger) duration-300 ease-out hover:bg-accent motion-reduce:transition-none",
                    open ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0",
                  )}
                  style={{ "--stagger": `${open ? 40 + index * 45 : 0}ms` } as CSSProperties}
                  aria-current={
                    pathname === link.href
                      ? "page"
                      : active
                        ? "true"
                        : undefined
                  }
                >
                  {active && (
                    <>
                      <span aria-hidden="true" className="absolute inset-y-3 left-3 w-0.5 translate-x-0.5 translate-y-0.5 rounded-full bg-(--brand)" />
                      <span aria-hidden="true" className="absolute inset-y-3 left-3 w-0.5 rounded-full bg-foreground" />
                    </>
                  )}
                  <TypographySmall>{link.label}</TypographySmall>
                </Link>
              );
            })}
            <div
              className={cn(
                "flex items-center justify-between gap-4 px-6 py-3 transition-[opacity,translate] delay-(--stagger) duration-300 ease-out motion-reduce:transition-none",
                open ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0",
              )}
              style={{ "--stagger": `${open ? 40 + siteConfig.nav.length * 45 : 0}ms` } as CSSProperties}
            >
              <TypographySmall>Appearance</TypographySmall>
              <AppearanceControl />
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
