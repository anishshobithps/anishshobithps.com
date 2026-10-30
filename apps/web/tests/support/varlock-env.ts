export const ENV: Record<string, string | undefined> = new Proxy(
  {},
  {
    get: (_target, key) =>
      typeof key === "string" ? process.env[key] : undefined,
  },
);
