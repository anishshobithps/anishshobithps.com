import type { Query, Theme } from "@repo/svg-kit/template";

/** Inline text allows `[label](url)` links and nothing else. */
type Inline = string;

export type Block =
  | { kind: "heading"; n: number; title: string }
  | { kind: "paragraph"; text: Inline }
  | { kind: "list"; items: Inline[] }
  | { kind: "card"; type: string; query?: Query; alt: string; href: string };

const SITE = "https://anishshobithps.com";

/**
 * A profile README built only from /svg cards and a little prose, so every
 * template shows up the way GitHub would render it.
 */
export const README: Block[] = [
  {
    kind: "card",
    type: "banner",
    alt: "Anish Shobith P S, software developer: a silhouette against the sky over Mangalore, and a link to anishshobithps.com.",
    href: SITE,
  },
  {
    kind: "paragraph",
    text: "I build interfaces and tooling, the occasional bot, and questionable automation scripts, mostly so I don't have to repeat myself. Most days that means TypeScript, React and Next.js.",
  },
  {
    kind: "paragraph",
    text: `[Website](${SITE}) / [Projects](${SITE}/projects) / [Blog](${SITE}/blogs) / [Résumé](${SITE}/resume) / [Guestbook](${SITE}/guestbook)`,
  },
  {
    kind: "card",
    type: "local",
    alt: "Mangalore right now: the local time, what I'm probably doing, and the weather.",
    href: SITE,
  },
  { kind: "heading", n: 1, title: "Now" },
  {
    kind: "list",
    items: [
      `Shipping v3 of [anishshobithps.com](https://github.com/anishshobithps/anishshobithps.com): isometric art drawn in code, a guestbook, and these cards.`,
      "Studying cryptology and ethical hacking at MSIS, Manipal. Breaking things, but with a syllabus.",
      "Looking for a full-time role. Also open to collaborations that make sense, or at least teach me something.",
    ],
  },
  {
    kind: "card",
    type: "calendar",
    alt: "Contributions over the last 12 months, with my current and longest streak.",
    href: "https://github.com/anishshobithps",
  },
  { kind: "heading", n: 2, title: "When I code" },
  {
    kind: "paragraph",
    text: "My last 500 public commits, bucketed by the hour written in each one. The late-night column is not a bug.",
  },
  {
    kind: "card",
    type: "activity",
    alt: "When I code: a weekday by hour grid of my commits in local time.",
    href: "https://github.com/anishshobithps",
  },
  { kind: "heading", n: 3, title: "Off the main branch" },
  {
    kind: "card",
    type: "post",
    alt: "My latest blog post.",
    href: `${SITE}/blogs/latest`,
  },
  {
    kind: "card",
    type: "posts",
    query: { limit: "3" },
    alt: "My three newest posts with reading time and reads.",
    href: `${SITE}/blogs`,
  },
  { kind: "heading", n: 4, title: "Résumé" },
  {
    kind: "paragraph",
    text: `LaTeX in Docker, released by CI, with metadata ATS parsers can read. [Here's why.](${SITE}/blog/making-my-resume-machine-readable)`,
  },
  {
    kind: "card",
    type: "resume",
    alt: "The latest résumé build and downloads per release.",
    href: `${SITE}/resume`,
  },
  { kind: "heading", n: 5, title: "Say hello" },
  {
    kind: "paragraph",
    text: `If you're building something ambitious and need an engineer who prefers clarity over chaos, we'll probably get along. [anish.shobith19@gmail.com](mailto:anish.shobith19@gmail.com) / [LinkedIn](https://www.linkedin.com/in/anishshobithps/) / [X](https://x.com/n10nce)`,
  },
  {
    kind: "card",
    type: "guestbook",
    query: { limit: "3" },
    alt: "The latest signatures in my guestbook. Sign it before you go.",
    href: `${SITE}/guestbook`,
  },
];

export const LINK = /\[([^\]]+)\]\(([^)]+)\)/g;

export function cardUrl(base: string, type: string, query: Query, theme: Theme) {
  return `${base}/svg?${new URLSearchParams({ type, theme, ...query })}`;
}

/** The README as it would be committed: absolute card URLs and a cache-busting `v`. */
export function toMarkdown(blocks: Block[]) {
  const url = (type: string, query: Query, theme: Theme) =>
    cardUrl(SITE, type, { ...query, v: "1" }, theme);
  const picture = (type: string, query: Query, img: string) =>
    `<picture><source media="(prefers-color-scheme: dark)" srcset="${url(type, query, "dark")}"><img src="${url(type, query, "light")}" ${img}></picture>`;

  return blocks
    .map((block) => {
      switch (block.kind) {
        case "heading":
          return `## ${picture("heading", { n: String(block.n) }, 'alt="" height="22"')} ${block.title}`;
        case "paragraph":
          return block.text;
        case "list":
          return block.items.map((item) => `- ${item}`).join("\n");
        case "card":
          return [
            `<a href="${block.href}">`,
            `  ${picture(block.type, block.query ?? {}, `width="100%" alt="${block.alt}"`)}`,
            `</a>`,
          ].join("\n");
      }
    })
    .join("\n\n")
    .concat("\n");
}
