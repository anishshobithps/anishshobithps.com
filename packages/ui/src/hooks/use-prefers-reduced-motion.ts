import { useSyncExternalStore } from "react";

import {
  getMotionSetting,
  getServerMotionSetting,
  subscribeMotion,
} from "@repo/ui/lib/motion-preference";

export function useMotionSetting() {
  return useSyncExternalStore(
    subscribeMotion,
    getMotionSetting,
    getServerMotionSetting,
  );
}

export function usePrefersReducedMotion() {
  return useMotionSetting() !== "on";
}
