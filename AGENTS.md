<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Workspace

A pnpm workspace run by Turborepo. Node 24, pnpm 11.

| Path | What |
| --- | --- |
| `apps/web` | The Next.js app: routes, proxy, MDX content, tests, scripts |
| `packages/*` | Private `@repo/*` packages whose `exports` point at source, so there is no per-package build |
| `docs/` | Project documentation |

## Commands

| Command | Does |
| --- | --- |
| `pnpm dev` | Dev server for `apps/web` |
| `pnpm turbo run types:check test` | Typecheck and test every workspace |
| `pnpm lint:ws` | sherif: dependency versions line up across the workspace |
| `pnpm knip` | Unused files, exports, and dependencies |
| `pnpm --filter web exec varlock load` | Check `apps/web/.env.local` against the schema |

## Rules

- No code comments in any file you touch.
- pnpm only. Next.js 16: use `updateTag`, not `revalidateTag`.
- Commit only when asked. Plans list their own split, single-line commits with no co-author trailer. Never push.
- Never `pkill next`. The owner's dev server holds port 3000, so use another port.
- The `.env.schema` files are the source of truth for environment variables. Never print `.env.local` values.
- Text goes through the Typography components, and forms through the shadcn `Form`.

## ui-sdk

`@ui-sdk/react` and `@ui-sdk/core` are installed in `apps/web`. Before using ui-sdk, follow the ui-sdk skill if it's installed, and read `apps/web/node_modules/@ui-sdk/react/docs/llms.txt`. To build a new component, also search `apps/web/node_modules/@ui-sdk/react/docs/core.md` by heading, and read `rendering.md` next to it.

ui-sdk parts ship unstyled. Style them only with the shadcn theme tokens (`bg-background`, `text-foreground`, `bg-muted`, `border-input`, `ring-ring`, `bg-popover`, `text-muted-foreground`, and the rest in `packages/ui/src/styles/tokens.css`), never raw palette classes like `neutral-300` or hex values, and never the fallback colours in ui-sdk's demo CSS. State goes through the `data-*` variants, for example `data-pressed:bg-accent`. Don't import `@ui-sdk/core/web.css` for its look; if a part needs it, point its `--ui-*` tokens at the shadcn variables (`--ui-background: var(--background)` and so on) so nothing renders off-theme. The `@layer ui-sdk;` line at the top of `apps/web/src/app/global.css` must stay above `@import "tailwindcss"`. The no-comments rule above beats the skill's "comments are rare" rule.
