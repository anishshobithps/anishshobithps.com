/// <reference types="astro/client" />

type DeeplyNonNullable<T> = T extends object
  ? {
      [K in keyof T]: DeeplyNonNullable<T[K]>;
    }
  : NonNullable<T>;
