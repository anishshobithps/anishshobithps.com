import { createStoredValue } from "@repo/core/store";

const MOTION_STORAGE_KEY = "motion";

type MotionSetting = "on" | "off" | "system";

const QUERY = "(prefers-reduced-motion: reduce)";

export const MOTION_INIT_SCRIPT = `try{if(localStorage.getItem("${MOTION_STORAGE_KEY}")==="reduce")document.documentElement.dataset.motion="reduce"}catch(e){}`;

const motionOff = createStoredValue({
  key: MOTION_STORAGE_KEY,
  fallback: false,
  parse: (raw) => raw === "reduce",
  serialize: (off) => (off ? "reduce" : null),
  onChange: (off) => {
    const root = document.documentElement;
    if (off) root.dataset.motion = "reduce";
    else delete root.dataset.motion;
  },
});

function systemReducesMotion() {
  return window.matchMedia(QUERY).matches;
}

export function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return systemReducesMotion() || motionOff.get();
}

export function getMotionSetting(): MotionSetting {
  if (systemReducesMotion()) return "system";
  return motionOff.get() ? "off" : "on";
}

export function getServerMotionSetting(): MotionSetting {
  return "on";
}

export const setMotionOff = motionOff.set;

export function subscribeMotion(listener: () => void) {
  const query = window.matchMedia(QUERY);
  query.addEventListener("change", listener);
  const stop = motionOff.subscribe(listener);
  return () => {
    query.removeEventListener("change", listener);
    stop();
  };
}
