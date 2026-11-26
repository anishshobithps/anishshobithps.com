"use client";

import { useCallback, useSyncExternalStore } from "react";
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
} from "@repo/ui/components/command";
import {
  BookOpenIcon,
  BriefcaseIcon,
  CopyIcon,
  DownloadIcon,
  EnvelopeIcon,
  FileTextIcon,
  GithubLogoIcon,
  HouseIcon,
  LinkedinLogoIcon,
  MoonIcon,
  PauseIcon,
  PencilIcon,
  PlayIcon,
  SpeakerHighIcon,
  SpeakerSlashIcon,
  SunIcon,
  XLogoIcon,
} from "@repo/icons";
import {
  getCommandMenuOpen,
  getCommandMenuServerSnapshot,
  setCommandMenuOpen,
  subscribeCommandMenu,
} from "@/lib/command-menu-store";
import { siteConfig } from "@repo/site-config";
import { themeCue } from "@repo/sounds/sound-cues";
import { disableSound, enableSound, playCue } from "@repo/sounds/sound-player";
import { useIsMac } from "@/hooks/use-is-mac";
import { useSoundPreferences } from "@repo/sounds/use-sound-preferences";
import { useMotionSetting } from "@repo/ui/hooks/use-prefers-reduced-motion";
import { copyEmail } from "@/lib/copy-email";
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

export function CommandMenu() {
  const open = useSyncExternalStore(
    subscribeCommandMenu,
    getCommandMenuOpen,
    getCommandMenuServerSnapshot,
  );
  const router = useRouter();
  const { setTheme } = useTheme();
  const { enabled: soundEnabled } = useSoundPreferences();
  const motionSetting = useMotionSetting();
  const isMac = useIsMac();
  const themeShortcut = isMac ? "⇧⌘D" : "Ctrl+Shift+D";

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
          <CommandItem
            onSelect={() => runCommand("navigate", () => router.push("/"), "/")}
          >
            <HouseIcon aria-hidden="true" />
            Home
          </CommandItem>
          {siteConfig.nav.map((item) => {
            const Icon = NAV_ICONS[item.href];
            return (
              <CommandItem
                key={item.href}
                onSelect={() =>
                  runCommand(
                    "navigate",
                    () => router.push(item.href),
                    item.href,
                  )
                }
              >
                <Icon aria-hidden="true" />
                {item.label}
              </CommandItem>
            );
          })}
          <CommandItem
            onSelect={() =>
              runCommand(
                "navigate",
                () => router.push("/#contact"),
                "/#contact",
              )
            }
          >
            <EnvelopeIcon aria-hidden="true" />
            Contact
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Actions">
          <CommandItem
            onSelect={() =>
              runCommand("copy_email", () => void copyEmail("command_menu"))
            }
          >
            <CopyIcon aria-hidden="true" />
            Copy email address
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand("theme", () => applyTheme("light"), "light")
            }
          >
            <SunIcon aria-hidden="true" />
            Switch to light theme
            <CommandShortcut translate="no">{themeShortcut}</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand("theme", () => applyTheme("dark"), "dark")
            }
          >
            <MoonIcon aria-hidden="true" />
            Switch to dark theme
            <CommandShortcut translate="no">{themeShortcut}</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand("download_resume", () => {
                playCue("download");
                // eslint-disable-next-line @next/next/no-location-assign-relative-destination
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
              runCommand("sound", () => {
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
          {motionSetting !== "system" && (
            <CommandItem
              onSelect={() =>
                runCommand("motion", () =>
                  setMotionOff(motionSetting === "on"),
                )
              }
            >
              {motionSetting === "on" ? (
                <PauseIcon aria-hidden="true" />
              ) : (
                <PlayIcon aria-hidden="true" />
              )}
              {motionSetting === "on" ? "Turn motion off" : "Turn motion on"}
            </CommandItem>
          )}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Elsewhere">
          {siteConfig.social.map((item) => {
            const Icon = SOCIAL_ICONS[item.platform];
            return (
              <CommandItem
                key={item.platform}
                onSelect={() =>
                  runCommand(
                    "social",
                    () => {
                      window.open(item.href, "_blank", "noopener,noreferrer");
                    },
                    item.platform,
                  )
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
