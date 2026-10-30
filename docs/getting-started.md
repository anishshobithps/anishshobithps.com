---
license: CC-BY-NC-ND-4.0
---

# Getting started

Run the site locally, with the services it talks to.

## Requirements

- Node 24 or newer. CI runs on 24.
- pnpm 11. The repo pins `packageManager`, so `corepack enable` is enough.
- A Postgres database on [Neon](https://neon.tech). The free tier works. The app uses Neon's serverless HTTP driver (`packages/db/src/index.ts`), so a plain local Postgres won't connect.
- A [Clerk](https://clerk.com) application for sign-in. It powers the guestbook, comments, and admin.

Spotify, WakaTime, a GitHub token, and Umami are optional. See [Environment variables](#environment-variables).

## First run

```bash
pnpm install
pnpm --filter web exec varlock load   # checks apps/web/.env.local against the schema
pnpm db:migrate         # applies the committed migrations in packages/db/drizzle/
pnpm dev                # http://localhost:3000
```

`pnpm install` also runs `fumadocs-mdx`, which generates the `.source/` folder the blog reads from. `pnpm db:migrate` needs `DATABASE_URL`, so create `apps/web/.env.local` first.

Only one `next dev` can run per project at a time. Next takes a lock and a second one exits.

## Environment variables

Create `apps/web/.env.local`. [varlock](https://varlock.dev) validates it against `apps/web/.env.schema`, which also imports the schemas in `packages/site-config` and `packages/db`. `pnpm --filter web exec varlock load` names anything that is missing or malformed, and the build and `pnpm dev` stop for the same reason. Six variables are required: `DATABASE_URL`, `IP_HASH_SALT`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`, and `OWNER_CLERK_USER_ID`.

```env
DATABASE_URL=postgresql://...
IP_HASH_SALT=some-random-secret

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
OWNER_CLERK_USER_ID=user_...
CLERK_WEBHOOK_SECRET=whsec_...

SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
SPOTIFY_REFRESH_TOKEN=

NEXT_PUBLIC_BASE_URL=https://anishshobithps.com
NEXT_PUBLIC_UMAMI_WEBSITE_ID=
GITHUB_TOKEN=
WAKATIME_API_KEY=
SHORTLINK_DOMAIN=
```

| Variable | Used for | Notes |
| --- | --- | --- |
| `DATABASE_URL` | All stored data, the `db:*` scripts, the seed scripts | Required. A Neon connection string. |
| `IP_HASH_SALT` | Read counts and reactions | Required. Any long random string, kept secret. Without it `hashIp` throws instead of hashing with nothing. |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | Sign-in, guestbook, comments, admin | `apps/web/src/proxy.ts` runs Clerk's middleware on page requests, so set both before the first run. |
| `OWNER_CLERK_USER_ID` | Admin access | The one Clerk user ID that gets admin. There is no role system. |
| `CLERK_WEBHOOK_SECRET` | `/api/webhooks/clerk` | The endpoint answers 500 without it. See [Clerk](#clerk). |
| `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REFRESH_TOKEN` | The "now playing" line in the footer | See [Spotify](#spotify). |
| `NEXT_PUBLIC_BASE_URL` | Canonical URLs, sitemap, feeds, OpenGraph | Falls back to `NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL`, then `http://localhost:3000`. |
| `NEXT_PUBLIC_UMAMI_WEBSITE_ID` | Analytics | Optional. The script is only added in production builds. |
| `GITHUB_TOKEN` | The repo card and the `/svg` cards | Optional. Lifts GitHub's anonymous rate limit. |
| `WAKATIME_API_KEY` | `/svg?type=activity&source=wakatime` and `both` | Optional. |
| `SHORTLINK_DOMAIN` | A second domain that serves short links only | Optional. `NEXT_PUBLIC_SHORTLINK_DOMAIN` is read as a fallback. See [Short links](short-links.md). |
| `VERCEL_DEPLOYMENT_ID` | Cache keys for the `/svg` loaders | Set by Vercel. Leave it alone. |

## Services

### Clerk

1. Create an application and turn on the sign-in providers you want. The privacy policy page lists GitHub, Google, and Discord, so edit it if yours differ.
2. Copy the publishable and secret keys into `apps/web/.env.local`.
3. Sign in once, then copy your user ID from the Clerk dashboard into `OWNER_CLERK_USER_ID`. That account gets `/admin`.
4. Add a webhook that points at `https://<your-domain>/api/webhooks/clerk` and listens for `user.deleted`. Copy its signing secret into `CLERK_WEBHOOK_SECRET`.

The webhook keeps the database clean. When someone deletes their Clerk account, the handler verifies the signature (svix) and deletes that user's guestbook entries, comments, and likes. Clerk can't reach `localhost`, so skip the webhook locally or use a tunnel.

### Spotify

1. Create an app in the [Spotify dashboard](https://developer.spotify.com/dashboard).
2. Register `http://127.0.0.1:3000` as a redirect URI. The token exchange fails without it.
3. Put the client ID and secret in `apps/web/.env.local`.
4. Run `pnpm spotify:token`. It prints an authorize URL. Open it and approve. Spotify redirects to `http://127.0.0.1:3000/?code=...`, and that page won't load, which is expected. Paste the `code` value back into the prompt and it prints a refresh token.
5. Put the refresh token in `SPOTIFY_REFRESH_TOKEN`.

The script asks for two read-only scopes: `user-read-currently-playing` and `user-read-recently-played`.

## Seeding

```bash
pnpm db:seed:links                  # adds /github, /linkedin and /mail short links
pnpm db:seed:guestbook              # 15 fake guestbook entries
pnpm db:seed:guestbook --count 40
pnpm db:seed:guestbook:cleanup      # removes what the script made
```

`db:seed:links` is idempotent and skips slugs that already exist. The targets are mine, so edit `apps/web/scripts/seed-links.ts` first on a fork.

`db:seed:guestbook` creates real users in whichever Clerk instance `CLERK_SECRET_KEY` belongs to. Use a development instance. It records the IDs it made in `apps/web/scripts/.seed-guestbook-ids.json` (git-ignored), and the cleanup command deletes those users and their entries.

## When something is off

- **`IP_HASH_SALT is not set`**: add it to `apps/web/.env.local`. Counting a read and recording a reaction both need it.
- **Types or MDX imports are missing**: run `pnpm types:check`, which regenerates `.source/` and the route types.
- **A second `next dev` exits immediately**: one is already running on the project.
- **The resume doesn't update**: the PDF is cached for up to an hour. Admin has a button to clear it. See [Admin](admin.md).

Next: [Architecture](architecture.md) for how the pieces fit, or [Development](development.md) for the day-to-day commands.
