"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandItemIcon,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@ui-sdk/react/command";
import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@ui-sdk/react/dialog";
import { Button } from "@repo/ui/components/button";
import { Text } from "@repo/ui/components/typography";
import {
  BookOpenIcon,
  BriefcaseIcon,
  CopyIcon,
  DownloadIcon,
  EnvelopeIcon,
  FileTextIcon,
  GearIcon,
  GithubLogoIcon,
  HouseIcon,
  LinkedinLogoIcon,
  MagnifyingGlassIcon,
  MoonIcon,
  PauseIcon,
  PencilIcon,
  PlayIcon,
  SpeakerHighIcon,
  SpeakerSlashIcon,
  SunIcon,
  XIcon,
  XLogoIcon,
} from "@repo/ui/icons";
import {
  setCommandMenuOpen,
  useCommandMenuOpen,
} from "@/components/command-menu/store";
import { siteConfig } from "@repo/core/site-config";
import { themeCue } from "@repo/sounds/sound-cues";
import { disableSound, enableSound, playCue } from "@repo/sounds/sound-player";
import { useSoundPreferences } from "@repo/sounds/use-sound-preferences";
import { useMotionSetting } from "@repo/ui/hooks/use-prefers-reduced-motion";
import { copyEmail } from "@/components/shared/copy-email";
import { useHeadlessConsentUI } from "@c15t/nextjs/headless";
import { track } from "@/lib/analytics/events";
import { setMotionOff } from "@repo/ui/lib/motion-preference";

const NAV_ICONS = {
  "/projects": BriefcaseIcon,
  "/blogs": BookOpenIcon,
  "/resume": FileTextIcon,
  "/guestbook": PencilIcon,
} as const;

const SOCIAL_ICONS = {
  github: GithubLogoIcon,
  linkedin: LinkedinLogoIcon,
  x: XLogoIcon,
} as const;

const ICON_CLASS = "size-5 text-muted-foreground";

function MenuItem({
  icon,
  label,
  hint,
  shortcut,
  onSelect,
}: {
  icon: React.ReactNode;
  label: string;
  hint?: string;
  shortcut?: string;
  onSelect: () => void;
}) {
  return (
    <CommandItem
      label={label}
      onSelect={onSelect}
      className="flex cursor-default items-center gap-2 rounded-sm px-2 py-3 text-sm outline-none select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-accent data-highlighted:text-accent-foreground"
    >
      <CommandItemIcon className="flex shrink-0">{icon}</CommandItemIcon>
      {label}
      {shortcut ? (
        <CommandShortcut
          shortcut={shortcut}
          translate="no"
          className="ms-auto text-xs tracking-widest text-muted-foreground"
        />
      ) : hint ? (
        <Text as="span" variant="caption" className="ms-auto">
          {hint}
        </Text>
      ) : null}
    </CommandItem>
  );
}

function MenuGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <CommandGroup className="p-1 text-foreground">
      <CommandGroupLabel className="px-2 py-1.5">
        <Text as="span" variant="caption">
          {label}
        </Text>
      </CommandGroupLabel>
      {children}
    </CommandGroup>
  );
}

export function CommandMenu() {
  const open = useCommandMenuOpen();
  const router = useRouter();
  const { setTheme } = useTheme();
  const { enabled: soundEnabled } = useSoundPreferences();
  const motionSetting = useMotionSetting();
  const { openDialog: openConsentSettings } = useHeadlessConsentUI();

  const runCommand = useCallback(
    (command: string, action: () => void, target?: string) => {
      track(
        "command_menu_command",
        target ? { command, target } : { command },
      );
      setCommandMenuOpen(false);
      action();
    },
    [],
  );

  const applyTheme = useCallback(
    (theme: "light" | "dark") => {
      playCue(themeCue(theme));
      setTheme(theme);
    },
    [setTheme],
  );

  return (
    <Dialog open={open} onOpenChange={setCommandMenuOpen}>
      <DialogBackdrop className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-none" />
      <DialogContent className="fixed inset-0 z-50 m-auto h-fit w-full max-w-[calc(100%-2rem)] overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-lg outline-none transition duration-200 ease-out data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 motion-reduce:transition-none sm:max-w-lg">
        <DialogTitle className="sr-only">Command menu</DialogTitle>
        <DialogDescription className="sr-only">
          Jump to a page or run a quick action.
        </DialogDescription>
        <Command>
          <div className="flex h-12 items-center gap-2 border-b border-border ps-3 pe-2">
            <MagnifyingGlassIcon
              aria-hidden="true"
              className="size-5 shrink-0 text-muted-foreground"
            />
            <CommandInput
              aria-label="Search commands"
              placeholder="Type a command or search…"
              className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <DialogClose
              aria-label="Close"
              render={<Button variant="ghost" size="icon-sm" />}
            >
              <XIcon aria-hidden="true" />
            </DialogClose>
          </div>
          <CommandEmpty className="py-6 text-center not-data-empty:hidden">
            <Text variant="muted">No results found.</Text>
          </CommandEmpty>
          <CommandList className="max-h-75 scroll-py-1 overflow-x-hidden overflow-y-auto">
            <MenuGroup label="Navigation">
              <MenuItem
                icon={<HouseIcon aria-hidden="true" className={ICON_CLASS} />}
                label="Home"
                onSelect={() =>
                  runCommand("navigate", () => router.push("/"), "/")
                }
              />
              {siteConfig.nav.map((item) => {
                const NavIcon = NAV_ICONS[item.href];
                return (
                  <MenuItem
                    key={item.href}
                    icon={<NavIcon aria-hidden="true" className={ICON_CLASS} />}
                    label={item.label}
                    onSelect={() =>
                      runCommand(
                        "navigate",
                        () => router.push(item.href),
                        item.href,
                      )
                    }
                  />
                );
              })}
              <MenuItem
                icon={<EnvelopeIcon aria-hidden="true" className={ICON_CLASS} />}
                label="Contact"
                onSelect={() =>
                  runCommand(
                    "navigate",
                    () => router.push("/#contact"),
                    "/#contact",
                  )
                }
              />
            </MenuGroup>

            <CommandSeparator className="h-px bg-border" />

            <MenuGroup label="Actions">
              <MenuItem
                icon={<CopyIcon aria-hidden="true" className={ICON_CLASS} />}
                label="Copy email address"
                onSelect={() =>
                  runCommand("copy_email", () => void copyEmail("command_menu"))
                }
              />
              <MenuItem
                icon={<SunIcon aria-hidden="true" className={ICON_CLASS} />}
                label="Switch to light theme"
                shortcut="mod+shift+d"
                onSelect={() =>
                  runCommand("theme", () => applyTheme("light"), "light")
                }
              />
              <MenuItem
                icon={<MoonIcon aria-hidden="true" className={ICON_CLASS} />}
                label="Switch to dark theme"
                shortcut="mod+shift+d"
                onSelect={() =>
                  runCommand("theme", () => applyTheme("dark"), "dark")
                }
              />
              <MenuItem
                icon={<DownloadIcon aria-hidden="true" className={ICON_CLASS} />}
                label="Download resume"
                hint="PDF"
                onSelect={() =>
                  runCommand("download_resume", () => {
                    playCue("download");
                    Object.assign(document.createElement("a"), {
                      href: "/api/resume/download",
                      download: "",
                    }).click();
                  })
                }
              />
              <MenuItem
                icon={
                  soundEnabled ? (
                    <SpeakerSlashIcon aria-hidden="true" className={ICON_CLASS} />
                  ) : (
                    <SpeakerHighIcon aria-hidden="true" className={ICON_CLASS} />
                  )
                }
                label={soundEnabled ? "Turn sound off" : "Turn sound on"}
                hint="SFX"
                onSelect={() =>
                  runCommand("sound", () => {
                    if (soundEnabled) disableSound();
                    else void enableSound();
                  })
                }
              />
              <MenuItem
                icon={<GearIcon aria-hidden="true" className={ICON_CLASS} />}
                label="Privacy settings"
                onSelect={() =>
                  runCommand("privacy_settings", openConsentSettings)
                }
              />
              {motionSetting !== "system" && (
                <MenuItem
                  icon={
                    motionSetting === "on" ? (
                      <PauseIcon aria-hidden="true" className={ICON_CLASS} />
                    ) : (
                      <PlayIcon aria-hidden="true" className={ICON_CLASS} />
                    )
                  }
                  label={
                    motionSetting === "on" ? "Turn motion off" : "Turn motion on"
                  }
                  onSelect={() =>
                    runCommand("motion", () =>
                      setMotionOff(motionSetting === "on"),
                    )
                  }
                />
              )}
            </MenuGroup>

            <CommandSeparator className="h-px bg-border" />

            <MenuGroup label="Elsewhere">
              {siteConfig.social.map((item) => {
                const SocialIcon = SOCIAL_ICONS[item.platform];
                return (
                  <MenuItem
                    key={item.platform}
                    icon={
                      <SocialIcon aria-hidden="true" className={ICON_CLASS} />
                    }
                    label={item.label}
                    onSelect={() =>
                      runCommand(
                        "social",
                        () => {
                          window.open(
                            item.href,
                            "_blank",
                            "noopener,noreferrer",
                          );
                        },
                        item.platform,
                      )
                    }
                  />
                );
              })}
            </MenuGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
