<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset=".github/banner-dark.svg"/>
    <img alt="anishshobithps.com" src=".github/banner-light.svg" width="100%"/>
  </picture>
</p>

Source code for [anishshobithps.com](https://anishshobithps.com): a portfolio, blog, and guestbook. Interfaces, bots, and questionable automation scripts, mostly so I don't have to repeat myself.

<div align="center">

[![GitHub Stars](https://www.shieldcn.dev/github/stars/anishshobithps/anishshobithps.com.svg?variant=secondary&size=sm)](https://github.com/anishshobithps/anishshobithps.com/stargazers) [![GitHub Forks](https://www.shieldcn.dev/github/forks/anishshobithps/anishshobithps.com.svg?variant=secondary&size=sm)](https://github.com/anishshobithps/anishshobithps.com/network/members) [![Last Commit](https://www.shieldcn.dev/github/last-commit/anishshobithps/anishshobithps.com.svg?variant=secondary&size=sm)](https://github.com/anishshobithps/anishshobithps.com/commits)

[![License](https://www.shieldcn.dev/group/badge/Code-MIT-22C55E%2Bbadge/Content-CC_BY--NC--ND_4.0-F97316.svg?size=sm)](LICENSE.md)

![Next.js](https://www.shieldcn.dev/badge/Next.js-000000.svg?logo=nextdotjs&logoColor=fff&variant=branded&size=sm) ![React](https://www.shieldcn.dev/badge/React-61DAFB.svg?logo=react&logoColor=000&variant=branded&size=sm) ![TypeScript](https://www.shieldcn.dev/badge/TypeScript-3178C6.svg?logo=typescript&logoColor=fff&variant=branded&size=sm) ![Tailwind CSS](https://www.shieldcn.dev/badge/Tailwind_CSS-06B6D4.svg?logo=tailwindcss&logoColor=fff&variant=branded&size=sm) ![Drizzle](https://www.shieldcn.dev/badge/Drizzle-C5F74F.svg?logo=drizzle&logoColor=000&variant=branded&size=sm) ![PostgreSQL](https://www.shieldcn.dev/badge/PostgreSQL-4169E1.svg?logo=postgresql&logoColor=fff&variant=branded&size=sm) ![pnpm](https://www.shieldcn.dev/badge/pnpm-F69220.svg?logo=pnpm&logoColor=fff&variant=branded&size=sm) ![ESLint](https://www.shieldcn.dev/badge/ESLint-4B32C3.svg?logo=eslint&logoColor=fff&variant=branded&size=sm)

</div>

---

## What's in here

| Route                | What it does                                                                                                     |
| -------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `/`                  | Hero, project teasers, latest post, guestbook rotator, Spotify now-playing                                        |
| `/blogs`, `/blog/*`  | MDX posts via [fumadocs](https://fumadocs.dev), reading time, anonymous reactions, view counts, threaded comments |
| `/projects`          | Pulled from the database, not a hardcoded array — ordered and toggled from the admin                              |
| `/resume`            | PDF rendered inline with react-pdf, streamed from the latest GitHub release                                       |
| `/guestbook`         | Clerk-authenticated messages with likes, pinning, and soft delete                                                 |
| `/branding`          | Logo and colour usage, so people stop stretching the mark                                                         |
| `/admin/*`           | Owner-only dashboard for comments, guestbook, links, and projects                                                 |
| `/og`                | Generated OpenGraph images ([takumi](https://github.com/kane50613/takumi), not Satori)                            |
| `/llms.txt`          | Machine-readable site summary; every post also serves raw MDX at `/blog/<slug>.mdx`                               |
| `/<slug>`            | Short-link resolver with click counts — see [Short links](#short-links)                                           |

A few things worth calling out:

- **Reactions and view counts are anonymous.** No account needed. Identity is a SHA-256 of `ip:IP_HASH_SALT` (see [`src/lib/ip.ts`](src/lib/ip.ts)) — one row per post per hash, and the raw IP is never stored.
- **Comments and guestbook need Clerk.** Deleting your Clerk account cleans up your rows via the webhook below.
- **Nothing is hardcoded that shouldn't be.** Projects, links, and engagement all live in Postgres; posts live in `content/blog`.

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
| Spotify    | run `scripts/get-spotify-refresh-token.ts` once           |

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
GITHUB_TOKEN=ghp_...                   # optional — only lifts the API rate limit on repo cards
```

Only `DATABASE_URL` and `IP_HASH_SALT` are truly required to boot. `IP_HASH_SALT` throws loudly if missing rather than silently hashing with nothing. `NEXT_PUBLIC_BASE_URL` falls back to the Vercel production URL, then `http://localhost:3000`.

**Clerk webhook:** point `https://yourdomain.com/api/webhooks/clerk` at `user.deleted` to keep the DB clean when users delete their accounts.

---

## Project layout

```
content/blog/       MDX posts — the only place posts live
drizzle/            committed SQL migrations + meta
scripts/            one-off tsx scripts (seeding, Spotify token)
tests/              vitest, node environment, pure logic only
src/
  app/(site)/       public pages
  app/admin/        owner-only dashboard
  app/api/          resume proxy + Clerk webhook
  app/[...link]/    short-link resolver (catch-all, keep it last)
  components/       ui/ (shadcn), shared/, engagement/, layouts/
  lib/              db, schema, and everything not React
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

CI ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) runs `types:check` and `test` on every push to `main` and every PR. Lint and knip are local-only for now.

---

## Writing a post

Drop an `.mdx` file in `content/blog/`. The filename is the slug. Frontmatter is validated by [`source.config.ts`](source.config.ts):

```yaml
---
title: The Hidden Architecture of Emoji
description: One or two sentences. Also used for the OG image and meta description.
date: 2026-03-19
tags:
  - Unicode
  - Typography
lastModified: 2026-04-02   # optional — set it by hand when an edit is worth announcing
---
```

`lastModified` is deliberately manual. It used to come from git history, but shallow clones on the deploy host re-dated every post on every push. Reading time is computed at build time by a remark plugin.

---

## Admin

`/admin` is gated on `OWNER_CLERK_USER_ID` matching the signed-in Clerk user — there's no role system, just the one ID. It gives you stats, comment and guestbook moderation (pin, soft delete), project CRUD with ordering, short-link management, and a button to bust the cached resume PDF.

---

## Short links

Any unclaimed path resolves through `/[...link]`, in one of two shapes:

```
/<slug>          →  tag = "" (the default bucket)
/<tag>/<slug>    →  namespaced, e.g. /talk/react-india
```

Slugs are unique per `(tag, slug)`. Each link can redirect straight through (permanent or temporary), or — if it has a title, description, or OG image — render an interstitial with preview metadata first, which is the point when you're posting into something that unfurls links. Clicks are counted in `after()` so the redirect isn't waiting on the write.

---

## Deploy

<div align="center">

[![Vercel](https://www.shieldcn.dev/badge/Vercel-000000.svg?logo=vercel&logoColor=fff&variant=branded&size=sm)](https://vercel.com) [![Neon](https://www.shieldcn.dev/badge/Neon-34D59A.svg?logo=neon&logoColor=000&variant=branded&size=sm)](https://neon.tech) [![Clerk](https://www.shieldcn.dev/badge/Clerk-6C47FF.svg?logo=clerk&logoColor=fff&variant=branded&size=sm)](https://clerk.com) [![Spotify](https://www.shieldcn.dev/badge/Spotify-1DB954.svg?logo=spotify&logoColor=fff&variant=branded&size=sm)](https://developer.spotify.com) [![Cloudinary](https://www.shieldcn.dev/badge/Cloudinary-3448C5.svg?logo=cloudinary&logoColor=fff&variant=branded&size=sm)](https://cloudinary.com) [![Umami](https://www.shieldcn.dev/badge/Umami-000000.svg?logo=umami&logoColor=fff&variant=branded&size=sm)](https://umami.is)

</div>

Add the env vars and point `DATABASE_URL` at Neon. The build runs `next build` only — it does **not** migrate. Run `pnpm db:migrate` against the production database yourself when the schema changes.

Two things that bite on a fresh deploy: CSP in [`next.config.mjs`](next.config.mjs) hardcodes `clerk.anishshobithps.com`, so point that at your own Clerk frontend domain, and any new remote image host needs adding to both `images.remotePatterns` and the CSP.

---

## License

Code is [MIT](LICENSE.md). The writing in `content/`, the branding, and the design are [CC BY-NC-ND 4.0](LICENSE.md) — fork the machinery, not the words.
