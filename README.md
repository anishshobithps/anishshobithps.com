<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset=".github/banner-dark.svg"/>
    <img alt="anishshobithps.com banner: Anish Shobith P S, the source for a portfolio, blog, and guestbook. An isometric drawing shows the logo mascot standing on slabs labelled Postgres, Next.js, and React." src=".github/banner-light.svg" width="100%"/>
  </picture>
</p>

<p align="center">
  <a href="https://anishshobithps.com">Live site</a> /
  <a href="https://anishshobithps.com/blogs">Blog</a> /
  <a href="https://anishshobithps.com/feed.xml">RSS</a> /
  <a href="https://anishshobithps.com/branding">Branding</a> /
  <a href="https://anishshobithps.com/privacy-policy">Privacy</a>
</p>

Source code for [anishshobithps.com](https://anishshobithps.com): a portfolio, blog, and guestbook. Interfaces, bots, and questionable automation scripts, mostly so I don't have to repeat myself.

<div align="center">

[![GitHub Stars](https://www.shieldcn.dev/github/stars/anishshobithps/anishshobithps.com.svg?variant=secondary&size=sm)](https://github.com/anishshobithps/anishshobithps.com/stargazers) [![GitHub Forks](https://www.shieldcn.dev/github/forks/anishshobithps/anishshobithps.com.svg?variant=secondary&size=sm)](https://github.com/anishshobithps/anishshobithps.com/network/members) [![Last Commit](https://www.shieldcn.dev/github/last-commit/anishshobithps/anishshobithps.com.svg?variant=secondary&size=sm)](https://github.com/anishshobithps/anishshobithps.com/commits)

[![License](https://www.shieldcn.dev/group/badge/Code-MIT-22C55E%2Bbadge/Writing_%26_art-CC_BY--NC--ND_4.0-F97316%2Bbadge/Brand-Reserved-71717A.svg?size=sm)](LICENSE.md)

![Next.js](https://www.shieldcn.dev/badge/Next.js_16-000000.svg?logo=nextdotjs&logoColor=fff&variant=branded&size=sm) ![React](https://www.shieldcn.dev/badge/React_19-61DAFB.svg?logo=react&logoColor=000&variant=branded&size=sm) ![TypeScript](https://www.shieldcn.dev/badge/TypeScript-3178C6.svg?logo=typescript&logoColor=fff&variant=branded&size=sm) ![Tailwind CSS](https://www.shieldcn.dev/badge/Tailwind_CSS_4-06B6D4.svg?logo=tailwindcss&logoColor=fff&variant=branded&size=sm) ![Drizzle](https://www.shieldcn.dev/badge/Drizzle-C5F74F.svg?logo=drizzle&logoColor=000&variant=branded&size=sm) ![PostgreSQL](https://www.shieldcn.dev/badge/PostgreSQL-4169E1.svg?logo=postgresql&logoColor=fff&variant=branded&size=sm) ![pnpm](https://www.shieldcn.dev/badge/pnpm-F69220.svg?logo=pnpm&logoColor=fff&variant=branded&size=sm) ![ESLint](https://www.shieldcn.dev/badge/ESLint-4B32C3.svg?logo=eslint&logoColor=fff&variant=branded&size=sm)

</div>

> ### License at a glance
>
> - **Functional code**, including the code examples in this README and in blog posts: MIT
> - **Writing, original artwork, and creative copy**, including this README's prose: CC BY-NC-ND 4.0
> - **Logo, wordmark, and mascot:** CC BY-NC-ND 4.0 as artwork, not licensed as branding
> - **Name, domain, likeness, photograph, and brand identity:** reserved
> - **Third-party material:** its original license
>
> This repository is intentionally mixed-license, and so is this README. See [`LICENSE.md`](LICENSE.md) for the exact scope.

---

## What's in here

| Route                        | What it does                                                                                                        |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `/`                          | Hero with doodles, project teasers, latest post, guestbook rotator                                                  |
| `/blogs`, `/blog/*`          | MDX posts via [fumadocs](https://fumadocs.dev), isometric covers, reading time, anonymous reactions, view counts, threaded comments |
| `/projects`                  | Pulled from the database, not a hardcoded array; ordered and toggled from the admin                                 |
| `/resume`                    | PDF rendered inline with react-pdf, streamed from the latest GitHub release; `/api/resume/download` saves it         |
| `/guestbook`                 | Clerk-authenticated messages with likes, pinning, and soft delete                                                    |
| `/branding`                  | Type scale, logo downloads (SVG or PNG, 16 to 512 px), the doodle set, and a live OG preview                         |
| `/privacy-policy`            | What gets stored, where, and why                                                                                     |
| `/admin/*`                   | Owner-only dashboard for comments, guestbook, links, and projects                                                    |
| `/og`                        | Generated OpenGraph cards with the isometric mascot ([takumi](https://github.com/kane50613/takumi), not Satori)      |
| `/svg`                       | SVG cards for my GitHub READMEs: headings, posts, activity, calendar, guestbook and more, see [SVG cards](#svg-cards) |
| `/blogs/latest`              | Redirects to the newest post, so a README link always matches the post card                                          |
| `/feed.xml`                  | RSS 2.0 feed of every post, linked from page metadata for autodiscovery                                              |
| `/llms.txt`                  | Machine-readable site summary; every post also serves raw MDX at `/blog/<slug>.mdx`                                  |
| `/sitemap.xml`, `/robots.txt`| The sitemap is built from the post source, so new posts show up without touching it                                  |
| `/<slug>`                    | Short-link resolver with click counts, see [Short links](#short-links)                                              |

On every page:

- <kbd>⌘</kbd> <kbd>K</kbd> (or <kbd>Ctrl</kbd> <kbd>K</kbd>) opens a command palette for navigation, theme switching, the resume, and socials. <kbd>⇧</kbd> <kbd>⌘</kbd> <kbd>D</kbd> flips the theme without opening anything.
- A floating quick menu, fronted by the logo mascot. On a post it shows reading progress and jumps to the comments; on `/resume` it downloads the PDF; on the blog and guestbook it holds the sign-in pass. Drag it anywhere and it remembers the spot.
- The footer shows what I'm listening to on Spotify, refreshed every minute through the server.

A few things worth calling out:

- Reactions and view counts are anonymous, no account needed. Identity is a SHA-256 of `ip:IP_HASH_SALT` (see [`src/lib/ip.ts`](src/lib/ip.ts)), giving one row per post per hash. The raw IP is never stored.
- Comments and the guestbook need Clerk. Deleting your Clerk account cleans up your rows via the webhook below.
- Projects, links, and engagement all live in Postgres, and posts live in `content/blog`. Nothing is hardcoded that shouldn't be.
- The artwork is authored directly in code rather than imported as raster exports. The isometric scenes, blog covers, doodles, mascot, and OG card are SVG drawn in TSX, coloured from the same CSS tokens as the rest of the UI, and they respect `prefers-reduced-motion`. See [The art](#the-art).

---

## Running locally

Node 22+ and pnpm 11 (the repo pins `packageManager`, so `corepack enable` is enough).

```bash
pnpm install
pnpm db:migrate         # applies the committed migrations in drizzle/
pnpm dev                # http://localhost:3000
```

You'll need a few things first:

| What       | Where                                                     |
| ---------- | --------------------------------------------------------- |
| PostgreSQL | [neon.tech](https://neon.tech) (free tier works)          |
| Auth       | [clerk.com](https://clerk.com) (for guestbook & comments) |
| Spotify    | run `pnpm spotify:token` once                             |

Create `.env.local` at the root:

```env
DATABASE_URL=postgresql://...
IP_HASH_SALT=some-random-secret        # required — any long random string; keep it secret

SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
SPOTIFY_REFRESH_TOKEN=

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
OWNER_CLERK_USER_ID=user_...           # your user ID = admin powers
CLERK_WEBHOOK_SECRET=whsec_...         # Clerk > Webhooks > Signing Secret

NEXT_PUBLIC_BASE_URL=https://anishshobithps.com
NEXT_PUBLIC_UMAMI_WEBSITE_ID=...       # optional, or remove from layout.tsx
GITHUB_TOKEN=ghp_...                   # optional — lifts the GitHub API rate limit for repo cards and /svg
WAKATIME_API_KEY=waka_...              # optional — only for /svg?type=activity&source=wakatime|both
SHORTLINK_DOMAIN=                      # optional — a second domain that only serves short links
```

Only `DATABASE_URL` and `IP_HASH_SALT` are truly required to boot. `IP_HASH_SALT` throws loudly if missing rather than silently hashing with nothing. `NEXT_PUBLIC_BASE_URL` falls back to the Vercel production URL, then `http://localhost:3000`.

Clerk webhook: point `https://yourdomain.com/api/webhooks/clerk` at `user.deleted` to keep the DB clean when users delete their accounts.

Spotify token: `pnpm spotify:token` prints the authorize URL to open, then swaps the code it gives back for a refresh token. Register `http://127.0.0.1:3000` as a redirect URI in the Spotify dashboard first, or the exchange fails.

---

## Project layout

```
content/blog/          MDX posts — the only place posts live
drizzle/               committed SQL migrations + meta
scripts/               one-off tsx scripts (seeding, Spotify token)
tests/                 vitest, node environment, pure logic plus the /svg route contract
.github/               CI workflow and the README artwork
src/
  proxy.ts             Clerk middleware + short-link domain routing
  app/(site)/          public pages
  app/admin/           owner-only dashboard
  app/api/             resume proxy + Clerk webhook
  app/[...link]/       short-link resolver (catch-all, keep it last)
  app/og/              OpenGraph image route
  app/svg/             SVG card route + dev-only /svg/preview
  components/
    diagrams/          isometric engine (iso.tsx) and every scene drawn with it
    shared/            header, footer, quick menu, command palette, doodles, logo + mascot, OG card
    engagement/        comment and guestbook panels
    layouts/           page, blog, and hero shells
    ui/                shadcn primitives
  hooks/               client hooks (draggable, engagement anchor, …)
  lib/                 db, schema, and everything not React
  lib/svg/             SVG card templates, primitives, loaders, fonts shared with /og
```

---

## Commands

```bash
pnpm dev          # dev server — http://localhost:3000
pnpm build        # next build
pnpm start        # production server
pnpm types:check  # fumadocs codegen + next typegen + tsc --noEmit
pnpm lint         # ESLint
pnpm test         # Vitest
pnpm test:watch   # Vitest, watching
pnpm knip         # unused code/dependency check

pnpm db:migrate   # apply committed migrations
pnpm db:push      # push schema directly (dev only — skips migrations)
pnpm db:studio    # Drizzle Studio
pnpm db:seed:guestbook          # seed fake guestbook entries
pnpm db:seed:guestbook:cleanup  # remove seeded entries
pnpm db:seed:links              # seed short links
```

CI ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) runs `types:check` and `test` on every push to `main` and every PR, with a read-only token. Lint and knip are local-only for now.

---

## Writing a post

Drop an `.mdx` file in `content/blog/`. The filename is the slug. Frontmatter is validated by [`source.config.ts`](source.config.ts):

```yaml
---
title: The Hidden Architecture of Emoji
description: One or two sentences. Also used for the OG image, the RSS feed, and the meta description.
date: 2026-03-19
tags:
  - Unicode
  - Typography
lastModified: 2026-04-02   # optional — set it by hand when an edit is worth announcing
---
```

`lastModified` is deliberately manual. It used to come from git history, but shallow clones on the deploy host re-dated every post on every push. Reading time is computed at build time by a remark plugin.

`<TypographyMark>` and `<TypographyMuted>` are available in every post without an import. Video goes through the media player in `src/components/ui/media-player.tsx`, imported at the top of the post.

Every post gets an isometric cover. Give it a bespoke scene by adding the slug to `covers` in [`src/components/diagrams/blog-covers.tsx`](src/components/diagrams/blog-covers.tsx); anything without one gets a block cover generated from the slug.

---

## Admin

`/admin` is gated on `OWNER_CLERK_USER_ID` matching the signed-in Clerk user. There's no role system, just the one ID. It gives you stats, comment and guestbook moderation (pin, soft delete), project CRUD with ordering, short-link management, and a button to bust the cached resume PDF.

---

## Short links

Any unclaimed path resolves through `/[...link]`, in one of two shapes:

```
/<slug>          →  tag = "" (the default bucket)
/<tag>/<slug>    →  namespaced, e.g. /talk/react-india
```

Slugs are unique per `(tag, slug)`. Each link can redirect straight through (permanent or temporary), or, if it has a title, description, or OG image, render an interstitial with preview metadata first, which is the point when you're posting into something that unfurls links. Clicks are counted in `after()` so the redirect isn't waiting on the write, and only the count is stored.

Set `SHORTLINK_DOMAIN` to serve the same links from a second, shorter domain pointed at this deployment. [`src/proxy.ts`](src/proxy.ts) lets slugs through on that host and sends anything that belongs to the main site (`/blog`, `/admin`, `/api`, …) to the main domain with a 308. The list of main-site paths lives in [`src/lib/reserved-segments.ts`](src/lib/reserved-segments.ts), so add new top-level routes there too.

---

## SVG cards

`/svg` renders cards for my GitHub READMEs from the site's own data, tokens, and fonts. Each response is a static SVG with its text drawn as glyph outlines, so GitHub's image proxy shows exactly what the site renders, with no fonts, scripts, or external requests inside.

```
GET /svg?type=<template>&theme=light|dark&v=<n>&<template options>
```

| Param   | Notes                                                                                                   |
| ------- | ------------------------------------------------------------------------------------------------------- |
| `type`  | Required. One of the templates below. Anything else returns an error card with status 400.               |
| `theme` | Required. `light` or `dark`. The SVG can't follow the viewer's theme, so the README picks one with `<picture>`. |
| `v`     | Ignored by the server. Bump it in the README to bust GitHub's image cache after a design change.         |

| `type`          | Shows                                                       | Options                                                                                   |
| --------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `banner`        | The name header: my photo in the old README's notched frame, the name stacked large, the domain, and my role in a turned pill. Transparent, so it sits on GitHub's canvas | `role` (up to 24 characters, defaults to `siteConfig.role`) |
| `heading`       | A numbered section heading                                  | `n` (1–99), `title` (optional, cut at 40 characters; without it you get a 24 px circle to sit inline in a Markdown heading) |
| `post`          | The newest post: title, description, date, reading time and tags | `slug` (defaults to the newest post)                                                 |
| `activity`      | When I code: a weekday × hour grid in local time            | `source=github\|wakatime\|both` (default `github`)                                        |
| `calendar`      | The last 12 months of contributions, with current and longest streak, best day and active days | none                                                               |
| `posts`         | The newest posts with reading time, reads and date          | `limit` (1–8, default 3)                                                                  |
| `guestbook`     | The latest guestbook signatures with avatars and the total  | `limit` (1–6, default 3)                                                                  |
| `local`         | Any place right now (Mangalore by default): the time, what the hour is for, the weather, and today's daylight as 24 hour cells | `city` (geocoded) with optional `country` (two letters, e.g. `country=US` for the other Paris), or `lat` + `lon`; `name` relabels the place; `units=c\|f` (default `c`) |
| `resume`        | The latest résumé build and downloads per release           | none                                                                                      |

In a README:

```html
<a href="https://anishshobithps.com/blogs/latest">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://anishshobithps.com/svg?type=post&theme=dark&v=1">
    <img src="https://anishshobithps.com/svg?type=post&theme=light&v=1" width="100%" alt="Latest post on anishshobithps.com">
  </picture>
</a>
```

`/blogs/latest` redirects to the newest post, so the link lands on the post the card shows.

How it fits together:

- [`src/app/svg/route.tsx`](src/app/svg/route.tsx) reads `type`, finds the template in [`src/lib/svg/registry.ts`](src/lib/svg/registry.ts), validates the options with the template's zod schema, loads its data, and renders it with takumi's `renderSvg()`.
- Each template is one file in [`src/lib/svg/templates/`](src/lib/svg/templates/), built from the primitives in [`primitives.tsx`](src/lib/svg/primitives.tsx). Colours go through `themeColor()`, the same path as the OG card. Fonts load once per server in [`fonts.ts`](src/lib/svg/fonts.ts), shared with `/og`.
- Templates never fetch and loaders never render. Loaders live in [`src/lib/svg/data/`](src/lib/svg/data/) and are cached with `unstable_cache`: half an hour for `local`'s weather, an hour for `post`, `posts` and `guestbook`, six hours for the GitHub-backed cards. Anything that depends on the clock (the time on `local`, "3d ago") is worked out at render, so it stays right between refreshes. The cache key includes the deployment ID, so a new deploy never reads data shaped by older code. With camo's cache switched off, every README view reaches the route, so a warm response is a cache read and a render.
- Every response, errors included, is `image/svg+xml` with `Cache-Control: max-age=0, no-cache, no-store, must-revalidate`, `Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'; sandbox`, and `X-Content-Type-Options: nosniff`. Errors are small SVG cards (400 for bad input, 500 when data or rendering fails), never an HTML page.
- `/svg` is left out of the global header rule in [`next.config.mjs`](next.config.mjs). Otherwise the site's CSP replaces the card's sandboxed one.

About the data:

- `activity` only searches public repos (`is:public`), so a `GITHUB_TOKEN` that can see private repos never puts their names on a card. Without a token, GitHub's anonymous search limit is enough at this cache length.
- `activity` with `source=github` buckets my last 500 public commits by the local hour written in each commit's timestamp. GitHub's own calendar can't show that view. `wakatime` and `both` need `WAKATIME_API_KEY` and read the last seven days of durations; `both` averages each source's share, so commits and minutes weigh the same.
- `calendar` reads the contribution calendar over GraphQL when `GITHUB_TOKEN` is set and works. Without a token, or if GraphQL rejects it, it parses the public graph at `github.com/users/<me>/contributions`, the same one visitors see on my profile. The two can disagree on a few days: GraphQL counts days in the token owner's time zone, the public page in UTC. An empty today doesn't break the current streak.
- `local` uses [Open-Meteo](https://open-meteo.com/) for geocoding and weather, which needs no key. A city resolves to the most populous match, and the time zone comes from the forecast for those coordinates. A city that doesn't exist is a 400, like any other bad option. Coordinates are rounded to two decimals so nearby requests share a cache entry. `resume` reads the releases behind `siteConfig.resumeURL`, so downloads only count the releases still published.
- Guestbook avatars are fetched by the loader and cached as data URIs (capped at 120 KB each), so the SVG never points at another host. Emoji in guestbook messages come from takumi's twemoji provider, also inlined.

[`/svg/preview`](http://localhost:3000/svg/preview) renders every template's fixtures in both themes through the same renderer, with each card's size and a link to its live version. It only exists in development.

Adding a card means one file in `templates/` that exports `defineTemplate({ params, size, load, revalidate, fixtures, render })`, plus one line in the registry. Geist Pixel glyphs are heavy as outlines (about 20 KB each), so the pixel face is kept to a card's title label and the heading number, and the rest of the small labels use Fira Code. Cards come out between 40 and 280 KB and gzip to about a tenth of that.

---

## The art

None of the illustrations are image exports. They're all drawn in code:

| Piece                         | Where                                                                                     |
| ----------------------------- | ----------------------------------------------------------------------------------------- |
| Isometric engine              | [`src/components/diagrams/iso.tsx`](src/components/diagrams/iso.tsx): projector, boxes, plates, labels, lifts |
| Page scenes and blog covers   | `page-art.tsx`, `blog-covers.tsx`, `git-chaos.tsx`, `layers.tsx` in the same folder         |
| Doodles and nudges            | [`src/components/shared/doodles.tsx`](src/components/shared/doodles.tsx)                    |
| Logo and mascot               | `logo.tsx`, `logo-icon.tsx`, `logo-mascot.tsx` in `src/components/shared/`                  |
| OpenGraph card                | [`src/components/shared/OG.tsx`](src/components/shared/OG.tsx), rendered by `/og`           |

Colours come from the tokens in [`src/app/global.css`](src/app/global.css). The OG route runs on the server, where CSS variables don't exist, so [`src/lib/theme-tokens.ts`](src/lib/theme-tokens.ts) resolves `var()` and `color-mix()` from that file into hex. The README artwork in `.github/` is built the same way, with its text converted to outlines so it renders identically on GitHub in both themes.

The engine is MIT. The expressive artwork produced with it, meaning the scenes, doodles, mascot, and card design, is CC BY-NC-ND 4.0. See [License](#license).

---

## Deploy

<div align="center">

[![Vercel](https://www.shieldcn.dev/badge/Vercel-000000.svg?logo=vercel&logoColor=fff&variant=branded&size=sm)](https://vercel.com) [![Neon](https://www.shieldcn.dev/badge/Neon-34D59A.svg?logo=neon&logoColor=000&variant=branded&size=sm)](https://neon.tech) [![Clerk](https://www.shieldcn.dev/badge/Clerk-6C47FF.svg?logo=clerk&logoColor=fff&variant=branded&size=sm)](https://clerk.com) [![Spotify](https://www.shieldcn.dev/badge/Spotify-1DB954.svg?logo=spotify&logoColor=fff&variant=branded&size=sm)](https://developer.spotify.com) [![Cloudinary](https://www.shieldcn.dev/badge/Cloudinary-3448C5.svg?logo=cloudinary&logoColor=fff&variant=branded&size=sm)](https://cloudinary.com) [![Umami](https://www.shieldcn.dev/badge/Umami-000000.svg?logo=umami&logoColor=fff&variant=branded&size=sm)](https://umami.is)

</div>

Add the env vars and point `DATABASE_URL` at Neon. The build runs `next build` only. It never migrates, so run `pnpm db:migrate` against the production database yourself when the schema changes.

Three things that bite on a fresh deploy:

- CSP in [`next.config.mjs`](next.config.mjs) hardcodes `clerk.anishshobithps.com`, so point that at your own Clerk frontend domain.
- Any new remote image host needs adding to both `images.remotePatterns` and the CSP.
- If you use `SHORTLINK_DOMAIN`, add that domain to the same Vercel project, or the proxy never sees its requests.

---

## Forking

Fork the machinery, not the words. A fork can keep, modify, and redistribute the MIT code. It can't publish modified versions of the CC BY-NC-ND writing and art, and it can't use my name, logo, or mascot as its own branding. If a fork keeps any of that writing or art unmodified, CC BY-NC-ND 4.0 still applies to it; forking doesn't turn it into MIT. Before a fork goes live:

- [ ] Delete `content/blog/` and write your own posts
- [ ] Update [`src/lib/config.ts`](src/lib/config.ts): name, domain, email, socials, repo, resume URL, `availableForHire`
- [ ] Replace the logo and mascot (`logo.tsx`, `logo-icon.tsx`, `logo-mascot.tsx`) and `public/favicon-*.svg`
- [ ] Replace or remove the doodles, page scenes, blog covers, and the OG card design. The isometric engine stays, so draw your own
- [ ] Change the fallback name, domain, and role in [`src/app/og/route.tsx`](src/app/og/route.tsx)
- [ ] Remove `public/profile.avif` and the README artwork in `.github/` (`banner-*.svg`, `license-*.svg`)
- [ ] Check the license of `public/fonts/LastoriaBoldRegular.otf` (the signature font) before shipping it
- [ ] Write your own privacy policy in `src/app/(site)/privacy-policy/page.tsx`; this one describes my setup
- [ ] Point the CSP, Clerk domain, and redirects in [`next.config.mjs`](next.config.mjs) at your own

---

## License

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset=".github/license-dark.svg"/>
    <img alt="Fork the machinery, not the words. Code is MIT; writing and artwork are CC BY-NC-ND 4.0; the brand is reserved. The waving mascot stands between a crate labelled MIT, marked take this, and a crate labelled CC, marked not this." src=".github/license-light.svg" width="100%"/>
  </picture>
</p>

Code is [MIT](LICENSE.md), including the code blocks in this README and in blog posts. The prose and artwork (including artwork drawn in code) are [CC BY-NC-ND 4.0](LICENSE.md). Some brand assets, like the logo and mascot, are also covered by that copyright license, but their use as a name, logo, identity, or endorsement is not licensed. [`LICENSE.md`](LICENSE.md) spells out where the line falls, how to attribute, and what a fork may keep. None of it licenses my name, likeness, or brand identity for use as your own.
