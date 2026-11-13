import { useSyncExternalStore } from "react";

export interface ReadingState {
  engaged: boolean;
  progress: number;
  section: number;
  sections: number;
  heading: string;
  anchor: string;
  tocOpen: boolean;
}

const idle: ReadingState = {
  engaged: false,
  progress: 0,
  section: 0,
  sections: 0,
  heading: "",
  anchor: "",
  tocOpen: false,
};

let state: ReadingState = idle;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setReading(next: Partial<ReadingState>) {
  const merged = { ...state, ...next };
  const changed = (Object.keys(merged) as Array<keyof ReadingState>).some(
    (key) => merged[key] !== state[key],
  );
  if (!changed) return;
  state = merged;
  emit();
}

export function clearReading() {
  state = idle;
  emit();
}

export function setTocOpen(open: boolean) {
  setReading({ tocOpen: open });
}

export function useReading() {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => idle,
  );
}
