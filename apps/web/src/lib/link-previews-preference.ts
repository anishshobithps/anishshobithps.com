import { useSyncExternalStore } from "react";

const STORAGE_KEY = "link-previews";

let current = true;
let loaded = false;
const listeners = new Set<() => void>();

function readStorage(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== "off";
  } catch {
    return true;
  }
}

function emit() {
  for (const listener of listeners) listener();
}

function onStorage(event: StorageEvent) {
  if (event.key !== null && event.key !== STORAGE_KEY) return;
  loaded = true;
  const next = event.newValue !== "off";
  if (next === current) return;
  current = next;
  emit();
}

function getSnapshot(): boolean {
  if (!loaded && typeof window !== "undefined") {
    loaded = true;
    current = readStorage();
  }
  return current;
}

function getServerSnapshot(): boolean {
  return true;
}

function subscribe(listener: () => void): () => void {
  if (listeners.size === 0) window.addEventListener("storage", onStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

export function setLinkPreviewsEnabled(next: boolean) {
  loaded = true;
  current = next;
  try {
    if (next) window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, "off");
  } catch {
    void 0;
  }
  emit();
}

export function useLinkPreviewsEnabled(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
