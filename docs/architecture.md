---
license: CC-BY-NC-ND-4.0
---

# Architecture

What's in the site, where it lives, and how a request moves through it.

## Stack

- Next.js (App Router, Turbopack), React, and TypeScript, with Tailwind CSS 4 and shadcn-style primitives in `packages/ui/src/components/`.
- Posts are MDX, loaded through [fumadocs](https://fumadocs.dev) (`fumadocs-mdx`, `fumadocs-core`).
- Postgres on Neon, through Drizzle.
- Clerk for sign-in, with TanStack Query for optimistic updates on the client.
- OpenGraph images and the `/svg` cards are rendered with [takumi](https://github.com/kane50613/takumi), not Satori.
- Vitest for tests, pnpm for packages, deployed on Vercel.

## Routes

| Route | What it does |
| --- | --- |
| `/` | Hero with doodles, project teasers, latest post, guestbook rotator |
| `/blogs`, `/blog/*` | MDX posts, isometric covers, reading time, anonymous reactions, view counts, threaded comments |
| `/projects` | Pulled from the database, not a hardcoded array. Ordered and toggled from the admin |
| `/resume` | PDF rendered inline with react-pdf, streamed from the latest GitHub release. `/api/resume/download` saves it |
| `/guestbook` | Clerk-authenticated messages with likes, pinning, and soft delete |
| `/branding` | Type scale, logo downloads (SVG or PNG, 16 to 512 px), the doodle set, and a live OG preview |
| `/privacy-policy` | What gets stored, where, and why |
| `/admin/*` | Owner-only dashboard. See [Admin](admin.md) |
| `/og` | Generated OpenGraph cards with the isometric mascot |
| `/svg` | SVG cards for GitHub READMEs. See [SVG cards](svg-cards.md) |
| `/blogs/latest` | Redirects to the newest post, so a README link always matches the post card |
| `/feed.xml` | RSS 2.0 feed of every post, linked from page metadata for autodiscovery |
| `/llms.txt` | Machine-readable site summary. Every post also serves raw MDX at `/blog/<slug>.mdx` |
| `/sitemap.xml`, `/robots.txt` | The sitemap is built from the post source, so new posts show up without touching it |
| `/<slug>`, `/<tag>/<slug>` | Short-link resolver with click counts. See [Short links](short-links.md) |
| `/api/webhooks/clerk` | Receives Clerk's `user.deleted` event and removes that user's rows |

On every page:

- <kbd>⌘</kbd> <kbd>K</kbd> (or <kbd>Ctrl</kbd> <kbd>K</kbd>) opens a command palette for navigation, theme switching, the resume, socials, and the sound toggle. <kbd>⇧</kbd> <kbd>⌘</kbd> <kbd>D</kbd> flips the theme without opening anything.
- A floating quick menu, fronted by the logo mascot. On a post it shows reading progress and jumps to the comments. On `/resume` it downloads the PDF. On the blog and guestbook it holds the sign-in pass. It also holds the sound settings. Drag it anywhere and it remembers the spot.
- The footer shows what I'm listening to on Spotify, refreshed every minute through the server.
- Optional UI sounds, off until a visitor turns them on. See [Sound](sound.md).

## How a request moves

1. **`apps/web/src/proxy.ts`** sees every request first. On the main domain it hands off to Clerk's middleware. If `SHORTLINK_DOMAIN` is set and the request arrives on that host, Clerk is skipped. Slugs pass through, and anything that belongs to the main site is redirected to the main domain with a 308. The list of main-site paths is in `packages/core/src/reserved-segments.ts`.
2. **`apps/web/src/app/layout.tsx`** sets up the fonts, theme (next-themes), URL state (nuqs), TanStack Query, tooltips, the icon provider, the command menu, the sound effects, and the toaster.
3. **`apps/web/src/app/(site)/layout.tsx`** wraps the public pages in `ClerkProvider`, the header, the footer, the floating quick menu, and the page shell. **`apps/web/src/app/admin/layout.tsx`** has its own gate and sidebar.
4. **Pages** read from Postgres or the MDX source. Reads that can fail go through `safeQuery` (`apps/web/src/lib/safe-query.ts`), which logs the error and returns a fallback, so a database hiccup degrades a number instead of breaking a page.
5. **Mutations** are server actions in `actions.ts` files next to the pages. They check identity, write, and `revalidatePath` the affected page. The client updates optimistically and rolls back if the action reports a failure.

## Data and caching

| Data | Where it comes from | Cache |
| --- | --- | --- |
| Now playing | Spotify Web API, server side | `unstable_cache`, 60 seconds |
| Resume PDF | The latest GitHub release behind `siteConfig.resumeURL` | `fetch` revalidates every hour, tagged `resume-pdf`. The admin can clear it |
| Projects | Postgres | `unstable_cache` tagged `public-projects`, cleared by admin edits |
| Repo card | GitHub API, server side | Cached on the server |
| `/svg` card data | GitHub, WakaTime, Open-Meteo, Postgres | Per-loader `unstable_cache`. See [SVG cards](svg-cards.md) |
| Posts | `apps/web/content/blog` through fumadocs | Built at build time |

Everything the browser needs from a third party goes through this site. Spotify, GitHub, and the resume are fetched on the server, and fonts are self-hosted. [Deployment](deployment.md) lists the few exceptions the CSP allows.

## Project layout

```
apps/web/              the Next.js app
  content/blog/        MDX posts, the only place posts live
  public/              static files and fonts
  scripts/             one-off tsx scripts (seeding, Spotify token)
  tests/               vitest, node environment
  .env.schema          every environment variable, checked by varlock
  src/
    proxy.ts           Clerk middleware and short-link domain routing
    app/(site)/        public pages
    app/admin/         owner-only dashboard
    app/api/           resume proxy and Clerk webhook
    app/[...link]/     short-link resolver (catch-all, keep it last)
    app/og/            OpenGraph image route
    app/svg/           SVG card route and the dev-only /svg/preview
    components/
      shared/          header, footer, quick menu, command palette, doodles, logo and mascot, OG card
      engagement/      comment and guestbook panels
      layouts/         page, blog, and hero shells
    hooks/             client hooks (draggable, engagement anchor, ...)
    lib/               everything not React that belongs to the app
    lib/svg/           SVG card templates, loaders, and the post data they read
packages/              the workspace packages, listed below
docs/                  these pages
.github/               CI workflow and the README artwork
```

Imports use the `@/*` alias for `apps/web/src/*`. The `.source/` folder is generated by `fumadocs-mdx` and git-ignored.

## Workspace

The repo is a pnpm workspace run by Turborepo. Every package is private and just-in-time: its `exports` point at TypeScript source, so there is no per-package build and Next compiles them with the app.

| Package | Path | Purpose | Depends on |
| --- | --- | --- | --- |
| `@repo/core` | `packages/core` | Pure TypeScript: text, date, xml, pagination, schemas | none |
| `@repo/data-table` | `packages/data-table` | TanStack Table features and the sortable header | icons, ui |
| `@repo/db` | `packages/db` | Drizzle schema, client, and committed migrations | none |
| `@repo/diagrams` | `packages/diagrams` | React components that draw the iso scenes, page art, and blog covers | iso, ui |
| `@repo/eslint-config` | `packages/eslint-config` | Shared ESLint config with the shadcn rules | none |
| `@repo/icons` | `packages/icons` | Phosphor icon re-exports | none |
| `@repo/iso` | `packages/iso` | Isometric SVG engine and every scene | none |
| `@repo/media-player` | `packages/media-player` | The video player and media-chrome | icons, ui |
| `@repo/pdf-viewer` | `packages/pdf-viewer` | react-pdf viewer | icons, ui |
| `@repo/query` | `packages/query` | TanStack Query client, provider, prefetch, and mutation hook | core |
| `@repo/site-config` | `packages/site-config` | Site name, links, and the env schema it needs | none |
| `@repo/sounds` | `packages/sounds` | Sound engine, player, cues, preferences, and the palette | none |
| `@repo/styles` | `packages/styles` | Design tokens, theme tokens, and their build scripts | none |
| `@repo/svg-kit` | `packages/svg-kit` | Fonts, palette, primitives, and the renderer for /svg cards | core, site-config, styles |
| `@repo/tsconfig` | `packages/tsconfig` | Base, Next, and library tsconfig presets | none |
| `@repo/ui` | `packages/ui` | shadcn primitives, Typography, cn, and UI hooks | core, icons |
| `@repo/virtual` | `packages/virtual` | TanStack Virtual list hook | none |
| `@repo/vitest-config` | `packages/vitest-config` | Shared Vitest config | none |

Commands run through Turborepo from the root: `pnpm dev`, `pnpm build`, `pnpm turbo run types:check test`, and `pnpm lint:ws` (sherif) for dependency consistency. Lint config, tsconfig, and Vitest config come from the three tooling packages, so a rule changes in one place.

## Things worth knowing

- Reactions and view counts are anonymous, with no account needed. Identity is a SHA-256 of `ip:IP_HASH_SALT` (`apps/web/src/lib/ip.ts`), giving one row per post per hash. The raw IP is never stored. See [Database](database.md).
- Comments and the guestbook need Clerk. Deleting a Clerk account removes that user's rows through the webhook.
- Projects, links, and engagement live in Postgres, and posts live in `apps/web/content/blog`. Nothing is hardcoded that shouldn't be.
- The artwork is authored in code rather than imported as raster exports. The isometric scenes, blog covers, doodles, mascot, and OG card are SVG drawn in TypeScript and TSX, coloured from the same CSS tokens as the rest of the UI, and they respect `prefers-reduced-motion`. See [The art](art.md).
- The build never migrates the database. Schema changes are applied by hand. See [Database](database.md#migrations).
