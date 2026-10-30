"use client";

import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

function getSnapshot() {
  return /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);
}

function getServerSnapshot() {
  return false;
}

export function useIsMac() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
