"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useShortcut } from "@ui-sdk/react/shortcuts";
import {
  toggleCommandMenu,
  useCommandMenuOpen,
} from "@/components/command-menu/store";

const CommandMenu = dynamic(
  () => import("@/components/command-menu/menu").then((m) => m.CommandMenu),
  { ssr: false },
);

export function CommandMenuHost() {
  const open = useCommandMenuOpen();
  const [loaded, setLoaded] = useState(false);
  if (open && !loaded) setLoaded(true);

  useShortcut("mod+k", toggleCommandMenu, {
    allowInInput: true,
    description: "Search and commands",
  });

  return loaded ? <CommandMenu /> : null;
}
