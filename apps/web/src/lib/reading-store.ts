import { createPopoverController } from "@ui-sdk/react/popover";
import { useSyncExternalStore } from "react";
import { createStore } from "@repo/core/store";

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

const reading = createStore<ReadingState>(idle, (a, b) =>
  (Object.keys(a) as Array<keyof ReadingState>).every((key) => a[key] === b[key]),
);

export function setReading(next: Partial<ReadingState>) {
  reading.set({ ...reading.get(), ...next });
}

export function clearReading() {
  reading.set(idle);
}

export const tocPopover = createPopoverController();

export function setTocOpen(open: boolean) {
  setReading({ tocOpen: open });
}

export function useReading() {
  return useSyncExternalStore(reading.subscribe, reading.get, reading.getServer);
}

export function useReadingSelector<T>(select: (state: ReadingState) => T) {
  return useSyncExternalStore(
    reading.subscribe,
    () => select(reading.get()),
    () => select(idle),
  );
}
