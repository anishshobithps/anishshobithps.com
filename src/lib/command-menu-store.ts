let open = false;
const listeners = new Set<() => void>();

export function subscribeCommandMenu(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getCommandMenuOpen() {
  return open;
}

export function getCommandMenuServerSnapshot() {
  return false;
}

export function setCommandMenuOpen(next: boolean) {
  if (open === next) return;
  open = next;
  for (const listener of listeners) listener();
}

export function toggleCommandMenu() {
  setCommandMenuOpen(!open);
}
