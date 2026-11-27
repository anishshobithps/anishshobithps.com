import { useSyncExternalStore } from "react";
import { createStore } from "@repo/core/store";
import { playCue } from "@repo/sounds/sound-player";

export const commandMenu = createStore(false);

export function setCommandMenuOpen(next: boolean) {
  if (commandMenu.get() === next) return;
  playCue(next ? "open" : "close");
  commandMenu.set(next);
}

export function toggleCommandMenu() {
  setCommandMenuOpen(!commandMenu.get());
}

export function useCommandMenuOpen() {
  return useSyncExternalStore(
    commandMenu.subscribe,
    commandMenu.get,
    commandMenu.getServer,
  );
}
