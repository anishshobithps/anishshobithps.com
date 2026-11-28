---
license: CC-BY-NC-ND-4.0
---

# Development

Run the site locally, the checks it has to pass, and the rules the code follows.

## Requirements

- Node 24 or newer, and pnpm 11. The repo pins `packageManager`, so `corepack enable` is enough.
- A Postgres database on [Neon](https://neon.tech). The client uses Neon's serverless HTTP driver, so a plain local Postgres won't connect.
- A [Clerk](https://clerk.com) application. It powers sign-in, the guestbook, comments, and the admin.

Spotify, WakaTime, a GitHub token, Umami, and PostHog are optional.

## First run

```bash
pnpm install
pnpm --filter web exec varlock load
pnpm db:migrate
pnpm db:consent:migrate
pnpm dev
```

Create `apps/web/.env.local` before the migrations, which need `DATABASE_URL`. `pnpm install` also runs `fumadocs-mdx`, which generates the `.source/` folder the blog reads from. Only one `next dev` can run per project, because Next takes a lock.

## Environment variables

[varlock](https://varlock.dev) checks `apps/web/.env.local` against [`apps/web/.env.schema`](../apps/web/.env.schema), which imports the schemas in `packages/core` and `packages/db`. The schema is the full list, with each variable's format and whether it is secret. `varlock load` names anything missing or malformed, and `pnpm dev` and the build stop for the same reason.

Six are required: `DATABASE_URL`, `IP_HASH_SALT`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`, and `OWNER_CLERK_USER_ID`. A few that need explaining:

- `IP_HASH_SALT` is any long random string. Treat it as permanent: changing it makes every past reader count as new.
- `OWNER_CLERK_USER_ID` is the one Clerk user who gets `/admin`. There is no role system.
- `NEXT_PUBLIC_BASE_URL` falls back to Vercel's production URL, then `http://localhost:3000`.
- `POSTHOG_PERSONAL_API_KEY` needs the Query: Read scope, limited to the site's project. Without it the admin's PostHog panels say so and the rest works.
- `C15T_DATABASE_URL` is optional. The consent backend otherwise uses the direct host of `DATABASE_URL`.

### Clerk

1. Create an application and turn on the providers you want. The privacy policy lists GitHub, Google, and Discord, so edit it if yours differ.
2. Copy the publishable and secret keys into `.env.local`.
3. Sign in once and copy your user ID into `OWNER_CLERK_USER_ID`.
4. Add a webhook at `https://<your-domain>/api/webhooks/clerk` for `user.deleted`, and copy its signing secret into `CLERK_WEBHOOK_SECRET`. When an account is deleted it removes that user's entries, comments, and likes. Clerk can't reach `localhost`, so skip it locally or use a tunnel.

### Spotify

1. Create an app in the [Spotify dashboard](https://developer.spotify.com/dashboard) and register `http://127.0.0.1:3000` as a redirect URI.
2. Put the client ID and secret in `.env.local`.
3. Run `pnpm spotify:token`, open the URL it prints, and approve. The redirect page won't load, which is expected. Paste the `code` from its URL into the prompt.
4. Put the refresh token it prints in `SPOTIFY_REFRESH_TOKEN`.

## Commands

```bash
pnpm dev
pnpm build
pnpm turbo run types:check test
pnpm lint
pnpm knip
pnpm lint:ws

pnpm db:migrate
pnpm db:push
pnpm db:studio
pnpm db:consent:plan
pnpm db:consent:migrate

pnpm db:seed:links
pnpm db:seed:guestbook --count 40
pnpm db:seed:guestbook:cleanup
pnpm spotify:token
```

`next dev` and `next build` write to separate folders, so you can build while the dev server runs. `db:push` skips migrations and is for throwaway databases only.

`db:seed:links` skips slugs that already exist, and its targets are mine, so edit `apps/web/scripts/seed-links.ts` on a fork. `db:seed:guestbook` creates real users in whichever Clerk instance `CLERK_SECRET_KEY` belongs to, so use a development instance. The cleanup deletes the users it recorded in `apps/web/scripts/.seed-guestbook-ids.json`.

## Checks

CI ([`.github/workflows/ci.yml`](../.github/workflows/ci.yml)) runs sherif, then `pnpm turbo run types:check test`, on every push to `main` and every pull request.

- **Types.** The app's `types:check` regenerates the MDX collections and route types first, so it also catches broken frontmatter and links to routes that don't exist (`typedRoutes` is on).
- **Tests.** Vitest in two projects: `apps/web/tests/**/*.test.ts` runs in Node, and `*.test.tsx` runs in jsdom with Testing Library. Path aliases work, so import from `@/...` like the app does. For code that touches `window` or `localStorage`, stub with `vi.stubGlobal` and re-import after `vi.resetModules()`.
- **Lint.** ESLint 10 with Next's `core-web-vitals` config and the `@shadcn/lint` rules: a primitive owns its colour, spacing, shape, and type, so pick a variant instead of overriding it, and use tokens and static class names. Raw `<button>`, `<input>`, `<dialog>`, table elements and the like are banned in TSX. Lint isn't in CI because older violations remain, so compare against `main` and keep the files you touch clean.
- **Knip.** [`knip.config.mjs`](../knip.config.mjs) lists what it can't see, like MDX-only components. Add an entry when something is reached only from MDX or a generated file.

## Conventions

- **No relative imports.** Use `@/*` and `@scripts/*` in `apps/web`, and the package's own name inside a package, such as `@repo/ui/lib/cn`.
- **Text goes through the Typography components** in `packages/ui/src/components/typography.tsx`, not raw `<p>` or `<span>`.
- **Forms use the shadcn `Form`** with react-hook-form, resolved with `standardSchemaResolver` from `@hookform/resolvers/standard-schema`.
- **Icons come from `@repo/ui/icons`.** To add one, list it in `packages/ui/src/icons/index.tsx` and run `pnpm --filter web icons`.
- **Server actions return an `ActionResult`** (`packages/core/src/action-result.ts`) instead of throwing, and the client runs them through `useActionMutation`, which turns failures into toasts. Admin actions go through `adminMutation` in `apps/web/src/lib/admin.ts`.
- **Reads that can fail use `safeQuery`**, which logs and returns a fallback.
- **No code comments.**
- **Commits are one-line conventional commits**, like `feat(links): add slug helper`.

New primitives come from the shadcn CLI, configured in [`packages/ui/components.json`](../packages/ui/components.json). If it writes `import { cn } from "cn"`, change it to `@repo/ui/lib/cn`. Keep primitives generic and put site-specific styling in the component that uses them.

## When something is off

- **`IP_HASH_SALT is not set`**: add it to `.env.local`.
- **Types or MDX imports are missing**: run `pnpm types:check`, which regenerates `.source/` and the route types.
- **A second `next dev` exits at once**: one is already running.
- **"Can't resolve" a file that exists**: delete `apps/web/.next/cache` and restart.
- **The resume doesn't update**: it is cached for an hour, and the admin overview has a button to clear it.
