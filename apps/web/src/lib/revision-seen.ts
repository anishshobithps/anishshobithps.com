import { useSyncExternalStore } from "react";

const PREFIX = "revision-seen:";
const listeners = new Set<() => void>();

export function readRevisionSeen(slug: string): string | null {
  try {
    return window.localStorage.getItem(PREFIX + slug);
  } catch {
    return null;
  }
}

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  if (listeners.size === 0) window.addEventListener("storage", emit);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", emit);
  };
}

export function markRevisionSeen(slug: string, day: string) {
  try {
    window.localStorage.setItem(PREFIX + slug, day);
  } catch {
    void 0;
  }
  emit();
}

export function useSeenRevision(slug: string): string | null {
  return useSyncExternalStore(
    subscribe,
    () => readRevisionSeen(slug),
    () => null,
  );
}
