"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandInput,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  BookOpenIcon,
  BriefcaseIcon,
  DownloadIcon,
  FileTextIcon,
  GithubLogoIcon,
  HouseIcon,
  LinkedinLogoIcon,
  MoonIcon,
  PencilIcon,
  SpeakerHighIcon,
  SpeakerSlashIcon,
  SunIcon,
  XLogoIcon,
} from "@/components/shared/icons";
import {
  getCommandMenuOpen,
  getCommandMenuServerSnapshot,
  setCommandMenuOpen,
  subscribeCommandMenu,
  toggleCommandMenu,
} from "@/lib/command-menu-store";
import { siteConfig } from "@/lib/config";
import { themeCue } from "@/lib/sound-cues";
import { disableSound, enableSound, playCue } from "@/lib/sound-player";
import { useIsMac } from "@/hooks/use-is-mac";
import { useSoundPreferences } from "@/hooks/use-sound-preferences";

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

const EDITABLE_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (EDITABLE_TAGS.has(target.tagName)) return true;
  return target.isContentEditable;
}

export function CommandMenu() {
  const open = useSyncExternalStore(
    subscribeCommandMenu,
    getCommandMenuOpen,
    getCommandMenuServerSnapshot,
  );
  const router = useRouter();
  const { setTheme } = useTheme();
  const { enabled: soundEnabled } = useSoundPreferences();
  const isMac = useIsMac();
  const themeShortcut = isMac ? "⇧⌘D" : "Ctrl+Shift+D";

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const isCmdOrCtrlK =
        event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey);
      if (!isCmdOrCtrlK || isEditableTarget(event.target)) return;

      event.preventDefault();
      toggleCommandMenu();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const runCommand = useCallback((action: () => void) => {
    setCommandMenuOpen(false);
    action();
  }, []);

  const applyTheme = useCallback(
    (theme: "light" | "dark") => {
      playCue(themeCue(theme));
      setTheme(theme);
    },
    [setTheme],
  );

  return (
    <CommandDialog
      open={open}
      onOpenChange={setCommandMenuOpen}
      title="Command menu"
      description="Jump to a page or run a quick action."
    >
      <CommandInput placeholder="Type a command or search…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runCommand(() => router.push("/"))}>
            <HouseIcon aria-hidden="true" />
            Home
          </CommandItem>
          {siteConfig.nav.map((item) => {
            const Icon = NAV_ICONS[item.href];
            return (
              <CommandItem
                key={item.href}
                onSelect={() => runCommand(() => router.push(item.href))}
              >
                <Icon aria-hidden="true" />
                {item.label}
              </CommandItem>
            );
          })}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => runCommand(() => applyTheme("light"))}>
            <SunIcon aria-hidden="true" />
            Switch to light theme
            <CommandShortcut translate="no">{themeShortcut}</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => applyTheme("dark"))}>
            <MoonIcon aria-hidden="true" />
            Switch to dark theme
            <CommandShortcut translate="no">{themeShortcut}</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => {
                playCue("download");
                window.location.href = "/api/resume/download";
              })
            }
          >
            <DownloadIcon aria-hidden="true" />
            Download resume
            <CommandShortcut>PDF</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => {
                if (soundEnabled) disableSound();
                else void enableSound();
              })
            }
          >
            {soundEnabled ? (
              <SpeakerSlashIcon aria-hidden="true" />
            ) : (
              <SpeakerHighIcon aria-hidden="true" />
            )}
            {soundEnabled ? "Turn sound off" : "Turn sound on"}
            <CommandShortcut>SFX</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Elsewhere">
          {siteConfig.social.map((item) => {
            const Icon = SOCIAL_ICONS[item.platform];
            return (
              <CommandItem
                key={item.platform}
                onSelect={() =>
                  runCommand(() => {
                    window.open(item.href, "_blank", "noopener,noreferrer");
                  })
                }
              >
                <Icon aria-hidden="true" />
                {item.label}
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
