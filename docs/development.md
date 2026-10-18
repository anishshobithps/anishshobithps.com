---
license: CC-BY-NC-ND-4.0
---

# Development

Day-to-day commands, the checks that run, and the rules the code follows.

## Commands

```bash
pnpm dev          # dev server, http://localhost:3000
pnpm build        # next build
pnpm start        # production server
pnpm types:check  # fumadocs codegen, next typegen, then tsc --noEmit
pnpm lint         # ESLint
pnpm test         # Vitest, once
pnpm test:watch   # Vitest, watching
pnpm knip         # unused code and dependency check

pnpm db:migrate   # apply committed migrations
pnpm db:push      # push the schema directly (dev only, skips migrations)
pnpm db:studio    # Drizzle Studio

pnpm db:seed:guestbook          # seed fake guestbook entries
pnpm db:seed:guestbook:cleanup  # remove the seeded entries
pnpm db:seed:links              # seed short links
pnpm spotify:token              # get a Spotify refresh token
```

The database and seed commands need `.env.local`. See [Getting started](getting-started.md).

`next dev` and `next build` use separate output folders (`.next/dev` and `.next`), so you can build while the dev server is running.

## Checks

### Types

`pnpm types:check` is the one that matters most. It regenerates the MDX collections and route types first, so it also catches a post with broken frontmatter and a link to a route that doesn't exist (`typedRoutes` is on).

### Tests

Vitest, in a Node environment, running `tests/**/*.test.ts`. The tests cover pure logic and contracts rather than rendered pages: date and text helpers, IP hashing and header parsing, pagination, the short-link schema, theme tokens, the `/svg` route and its loaders, XML escaping, inline-script escaping, and the sound preference store and player.

Path aliases work in tests, so import from `@/lib/...` like the app does. For code that touches `window` or `localStorage`, stub the globals with `vi.stubGlobal` and re-import the module after `vi.resetModules()` so module state starts fresh. `tests/sound-preferences.test.ts` is a worked example.

### Lint

`pnpm lint` runs ESLint 9 with Next's `core-web-vitals` config and the `@shadcn/lint` rules on `src/**`:

- `no-restyle`: a shadcn component owns its colour, spacing, shape, and typography. Pick a variant or size instead of passing classes that fight it. Layout classes are allowed.
- `no-raw-colors`, `no-arbitrary-values`, `no-inline-styles`, `no-unknown-classes`, `require-static-classes`: use tokens and static class names.
- Raw `<button>`, `<input>`, `<select>`, `<textarea>`, `<label>`, `<hr>`, `<kbd>`, `<dialog>`, `<details>`, `<summary>`, and table elements are banned in TSX. Use the components in `src/components/ui/`.

`src/components/ui/**` is exempt from the restyle rules, and a few files that render without Tailwind (the OG card, the `/svg` templates, the generated icons) are exempt from the class rules. See `eslint.config.mjs`.

ESLint is pinned to 9. Version 10 crashes inside the parser that `eslint-config-next` wraps, and that needs a fix upstream. Lint isn't part of CI because the codebase still has existing violations, so a red `pnpm lint` isn't necessarily yours. Compare against `main`, and keep the files you touch clean.

### Knip

`pnpm knip` finds unused files, exports, and dependencies. [`knip.config.mjs`](../knip.config.mjs) lists what it can't see, like MDX-only components and the fumadocs config. If you add something that's reached only from MDX or a generated file, add it there.

### CI

[`.github/workflows/ci.yml`](../.github/workflows/ci.yml) runs `pnpm types:check` and `pnpm test` on every push to `main` and every pull request, with a read-only token. Lint and knip are local only.

## Conventions

- **Text uses the Typography components.** `Text`, `TypographyMuted`, `TypographySmall`, the heading components, and the rest in `src/components/ui/typography.tsx`. Not raw `<p>`, `<span>`, or `<small>`. Use `asChild` when text has to be another element, like an `<a>`.
- **Forms use the shadcn `Form`** (`src/components/ui/form.tsx`, react-hook-form underneath) rather than hand-wired `useState`. With zod 4, resolve with `standardSchemaResolver` from `@hookform/resolvers/standard-schema`, because `zodResolver` has a type mismatch with `@hookform/resolvers` 5.
- **Icons come from `@/components/shared/icons`**, which re-exports the Phosphor icons the site uses. Add an icon there before using it.
- **Class names merge through `cn`** from `@/lib/cn`.
- **Server actions return an `ActionResult`** (`src/lib/action-result.ts`) instead of throwing, and client code runs them through `useActionMutation`, which turns failures into toasts. Admin mutations go through `adminMutation` so the owner check can't be forgotten.
- **Reads that can fail use `safeQuery`**, so a database hiccup shows a fallback instead of an error page.
- **New code has no comments.** Names and types carry the meaning.
- **Commits are one-line conventional commits**, like `feat(links): add slug helper`.

## Adding a UI component

The shadcn CLI is configured in [`components.json`](../components.json), with the default registry plus `@diceui`, `@jalco`, and `@soundcn`.

```bash
pnpm exec shadcn add slider
```

The CLI may write `import { cn } from "cn"`. Change it to `@/lib/cn` to match the rest of the code. New components land in `src/components/ui/`, and they're exempt from the restyle lint rules, so keep the primitives generic and put site-specific styling in the component that uses them.

## Browser support

[`.browserslistrc`](../.browserslistrc) targets Chrome 96, Firefox 94, Safari 15, and Edge 96, or newer.
