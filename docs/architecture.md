---
license: CC-BY-NC-ND-4.0
---

# Architecture

What's in the site, where it lives, how a request moves, what's stored, and the owner-only admin.

## Stack

- Next.js (App Router, Turbopack), React, TypeScript, and Tailwind CSS 4.
- Primitives in `packages/ui/src/components/`, built on [ui-sdk](https://ui-sdk.dev) and styled with shadcn tokens.
- Posts are MDX, loaded through [fumadocs](https://fumadocs.dev).
- Postgres on Neon through Drizzle, and Clerk for sign-in, with TanStack Query for optimistic updates.
- OG images and the `/svg` cards are rendered with [takumi](https://github.com/kane50613/takumi).
- Environment variables are checked by varlock. Deployed on Vercel.

## Routes

| Route | What it does |
| --- | --- |
| `/` | Hero, project teasers, latest post, guestbook rotator |
| `/blogs`, `/blog/*` | MDX posts with covers, reading time, reactions, view counts, and threaded comments |
| `/projects` | Projects from the database, ordered from the admin |
| `/resume` | The PDF from the latest GitHub release, rendered inline. `/api/resume/download` saves it |
| `/guestbook` | Signed-in messages with likes, pinning, and soft delete |
| `/branding` | Type scale, logo downloads, the doodle set, and a live OG preview |
| `/privacy-policy` | What gets stored, where, and why |
| `/admin/*` | The owner-only dashboard, below |
| `/og`, `/svg` | Link-preview images, and cards for GitHub READMEs. See [Design](design.md#svg-cards) |
| `/blogs/latest` | Redirects to the newest post |
| `/feed.xml`, `/sitemap.xml`, `/robots.txt`, `/llms.txt` | Feeds and summaries. Every post also serves raw MDX at `/blog/<slug>.mdx` |
| `/<slug>`, `/<tag>/<slug>` | Short links, below |
| `/api/webhooks/clerk` | Removes a deleted Clerk user's rows |
| `/api/c15t/*` | The consent backend. See [Analytics and consent](analytics.md) |
| `/stats/*`, `/relay/*` | Rewrites to Umami and PostHog |

Every page also has a command palette (<kbd>⌘</kbd> <kbd>K</kbd>), a draggable quick menu fronted by the mascot, Spotify's now playing in the footer, opt-in UI sounds, and the consent banner where the law asks for one.

## How a request moves

1. **`apps/web/src/proxy.ts`** runs Clerk's middleware. On the short-link domain it skips Clerk and redirects anything that belongs to the main site.
2. **`apps/web/src/instrumentation-client.ts`** starts PostHog before hydration in production. **`app/layout.tsx`** sets up fonts, the theme, icons, analytics context, the consent root, the command menu, sounds, the toaster, and the WebMCP agent bridge.
3. **`app/(site)/layout.tsx`** adds Clerk, the header, the footer, and the quick menu. **`app/admin/layout.tsx`** has its own gate and sidebar.
4. **Pages** read from Postgres or the MDX source. Reads that can fail go through `safeQuery`, so a database hiccup degrades a number instead of breaking the page.
5. **Mutations** are server actions in `actions.ts` files next to their pages. They check identity, write, and revalidate. The client updates optimistically and rolls back on failure.

| Data | From | Cache |
| --- | --- | --- |
| Now playing | Spotify, on the server | 60 seconds |
| Resume PDF | The latest release behind `siteConfig.resumeURL` | An hour, tagged `resume-pdf`, clearable from the admin |
| Projects | Postgres | Tagged `public-projects`, cleared by admin edits |
| `/svg` card data | GitHub, WakaTime, Open-Meteo, Postgres | Per loader |
| Posts | `apps/web/content/blog` | Built at build time |
| Admin analytics | PostHog's query API and Postgres | Five minutes, tagged `admin-analytics` |

## Layout

```
apps/web/
  content/blog/      MDX posts
  scripts/           seeding, the Spotify token, cursors, icons
  tests/             vitest
  .env.schema        every environment variable
  src/
    proxy.ts
    app/(site)/      public pages
    app/admin/       the dashboard
    app/api/         resume, Clerk webhook, consent backend
    app/[...link]/   short-link resolver, kept last
    app/og/, app/svg/
    components/      header, footer, quick menu, engagement, consent, preferences
    lib/             everything not React: admin, analytics, consent, svg, remark plugins
packages/
  core/              pure TypeScript: text, dates, numbers, IP hashing, schemas, site config, the store
  db/                Drizzle schema, client, and committed migrations
  sounds/            the sound engine, cues, and preferences
  ui/                components, blocks, brand, art, cards, icons, hooks, styles
  eslint-config/, tsconfig/, vitest-config/
```

Every package is private and its `exports` point at source, so nothing builds per package. Inside `@repo/ui`, `components/` holds the primitives, and composed pieces live in `blocks/`, `brand/`, `art/`, and `cards/` so the lint rules only treat primitives as primitives.

## Database

The schema is [`packages/db/src/schema.ts`](../packages/db/src/schema.ts).

| Table | Holds |
| --- | --- |
| `blog_posts` | One row per slug, created when first needed |
| `blog_reads`, `blog_reactions` | A read, or a mood, per post and IP hash |
| `blog_comments`, `blog_comment_likes` | Comments and replies with pin and soft-delete flags, and likes by Clerk user |
| `guestbook_entries`, `guestbook_likes` | Entries with pin and soft-delete flags, and likes by Clerk user |
| `projects` | Title, description, highlights, links, `enabled`, `sort_order` |
| `links`, `link_slugs` | A short link's target, preview fields, and click count, and the paths that resolve to it |

Deletes cascade: a post takes its reads, reactions, and comments, and a link takes its slugs. Names, emails, and avatars stay in Clerk and are fetched at render.

**Anonymous identity.** Reads and reactions are unique per visitor without knowing who they are. `getClientIp` in [`packages/core/src/ip.ts`](../packages/core/src/ip.ts) takes the first valid address from Vercel's forwarding headers, and `hashIp` stores the SHA-256 of `ip:IP_HASH_SALT`. The raw address is never written, and a missing salt throws. Picking the same mood again deletes the row.

**Consent records** live in their own `c15t` schema, created by `pnpm db:consent:migrate`. Drizzle only reads `public`, so it never sees them. Neon's pooled host refuses the `search_path` they need, so these use the direct host.

**Migrations** are committed SQL in `packages/db/drizzle/`. To change the schema, edit `schema.ts`, run `pnpm exec drizzle-kit generate`, read and commit the SQL with `drizzle/meta/`, then run `pnpm db:migrate` against development and then production. The build never migrates.

## Short links

Any unclaimed path can be a short link, resolved by `app/[...link]/page.tsx` as `/<slug>` or `/<tag>/<slug>`. A link has one primary slug and up to 24 aliases, all lowercase letters, numbers, and single dashes. Targets are `http(s)` or `mailto:` URLs.

- With no title, description, or OG, it redirects straight away, temporary or permanent.
- With any of those, it renders a `noindex` preview page with Open Graph tags for unfurling, then redirects in the browser.
- Clicks are counted in `after()`, and only the counter is stored.

Slugs can't take a path the site owns. The list is [`packages/core/src/reserved-segments.ts`](../packages/core/src/reserved-segments.ts), so add every new top-level route there.

`SHORTLINK_DOMAIN` serves the same links from a shorter domain. The proxy resolves slugs on that host without Clerk and 308s everything else to the main domain. Add the domain to the same Vercel project.

## Admin

`/admin` is gated on `OWNER_CLERK_USER_ID`. Signed-out visitors go to sign-in, and anyone else sees an unauthorized page. Every admin action also calls `assertAdmin()` through `adminMutation`, so calling an action directly doesn't get around the gate.

| Page | What it does |
| --- | --- |
| `/admin` | Visitors, views, readers, conversations, link clicks, top pages and posts, and the resume cache button |
| `/admin/behavior` | PostHog: sessions, frustrated clicks, errors, web vitals, events, referrers, devices |
| `/admin/content` | Database: readers, reactions, comments, signatures, and likes per day, and every post's numbers |
| `/admin/guestbook`, `/admin/comments` | Search, pin, and delete |
| `/admin/projects` | Create, edit, enable, reorder, and delete projects |
| `/admin/links` | Create, edit, enable, and delete short links and aliases |

The analytics pages share a 7, 30, or 90 day range in `?range=`, each compared with the period before. Umami's numbers stay in Umami, because its API needs a paid plan.

Deleting hides an entry or comment and keeps the row, so replies stay attached. Visitors can delete their own, and the owner can delete and pin anyone's. A deleted Clerk account loses its rows for good through the webhook.
