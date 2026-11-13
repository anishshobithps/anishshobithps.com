const MOTION_STORAGE_KEY = "motion";

type MotionSetting = "on" | "off" | "system";

const QUERY = "(prefers-reduced-motion: reduce)";

export const MOTION_INIT_SCRIPT = `try{if(localStorage.getItem("${MOTION_STORAGE_KEY}")==="reduce")document.documentElement.dataset.motion="reduce"}catch(e){}`;

const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function applyAttribute(off: boolean) {
  const root = document.documentElement;
  if (off) root.dataset.motion = "reduce";
  else delete root.dataset.motion;
}

function systemReducesMotion() {
  return window.matchMedia(QUERY).matches;
}

function userTurnedMotionOff() {
  return document.documentElement.dataset.motion === "reduce";
}

export function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return systemReducesMotion() || userTurnedMotionOff();
}

export function getMotionSetting(): MotionSetting {
  if (systemReducesMotion()) return "system";
  return userTurnedMotionOff() ? "off" : "on";
}

export function getServerMotionSetting(): MotionSetting {
  return "on";
}

export function setMotionOff(off: boolean) {
  applyAttribute(off);
  try {
    if (off) window.localStorage.setItem(MOTION_STORAGE_KEY, "reduce");
    else window.localStorage.removeItem(MOTION_STORAGE_KEY);
  } catch {
    void 0;
  }
  emit();
}

function onStorage(event: StorageEvent) {
  if (event.key !== null && event.key !== MOTION_STORAGE_KEY) return;
  applyAttribute(event.newValue === "reduce");
  emit();
}

export function subscribeMotion(listener: () => void) {
  listeners.add(listener);
  const query = window.matchMedia(QUERY);
  query.addEventListener("change", listener);
  if (listeners.size === 1) window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    query.removeEventListener("change", listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}
