type Listener = () => void;

export interface Store<T> {
  get: () => T;
  getServer: () => T;
  set: (next: T) => void;
  subscribe: (listener: Listener) => () => void;
}

interface StoredValueOptions<T> {
  key: string;
  fallback: T;
  parse: (raw: string | null) => T;
  serialize: (value: T) => string | null;
  equal?: (a: T, b: T) => boolean;
  onChange?: (value: T) => void;
}

function listenerSet(onFirst?: () => void, onLast?: () => void) {
  const listeners = new Set<Listener>();
  return {
    emit: () => {
      for (const listener of listeners) listener();
    },
    subscribe: (listener: Listener) => {
      listeners.add(listener);
      if (listeners.size === 1) onFirst?.();
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) onLast?.();
      };
    },
  };
}

export function createStore<T>(
  initial: T,
  equal: (a: T, b: T) => boolean = Object.is,
): Store<T> {
  let value = initial;
  const { emit, subscribe } = listenerSet();
  return {
    get: () => value,
    getServer: () => initial,
    set: (next) => {
      if (equal(value, next)) return;
      value = next;
      emit();
    },
    subscribe,
  };
}

export function createStoredValue<T>({
  key,
  fallback,
  parse,
  serialize,
  equal = Object.is,
  onChange,
}: StoredValueOptions<T>): Store<T> {
  let value = fallback;
  let loaded = false;

  const onStorage = (event: StorageEvent) => {
    if (event.key !== null && event.key !== key) return;
    loaded = true;
    const next = parse(event.newValue);
    if (equal(value, next)) return;
    value = next;
    onChange?.(next);
    emit();
  };

  const { emit, subscribe } = listenerSet(
    () => window.addEventListener("storage", onStorage),
    () => {
      window.removeEventListener("storage", onStorage);
      loaded = false;
    },
  );

  const get = () => {
    if (!loaded && typeof window !== "undefined") {
      loaded = true;
      try {
        value = parse(window.localStorage.getItem(key));
      } catch {
        value = fallback;
      }
    }
    return value;
  };

  return {
    get,
    getServer: () => fallback,
    set: (next) => {
      if (equal(get(), next)) return;
      value = next;
      try {
        const raw = serialize(next);
        if (raw === null) window.localStorage.removeItem(key);
        else window.localStorage.setItem(key, raw);
      } catch {
        void 0;
      }
      onChange?.(next);
      emit();
    },
    subscribe,
  };
}
