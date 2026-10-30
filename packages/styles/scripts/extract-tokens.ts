export type Tokens = Record<string, string>;

function declarations(css: string, selector: string): Tokens {
  const escaped = selector.replace(".", "\\.");
  const block =
    css.match(new RegExp(`^${escaped} \\{([^}]*)\\}`, "m"))?.[1] ?? "";
  const entries = block.matchAll(/--([\w-]+):\s*([^;]+);/g);
  return Object.fromEntries(
    Array.from(entries, ([, name, value]) => [name, value.trim()]),
  );
}

export function extractTokens(css: string) {
  return {
    root: declarations(css, ":root"),
    dark: declarations(css, ".dark"),
  };
}
