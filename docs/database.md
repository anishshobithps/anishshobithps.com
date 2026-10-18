---
license: CC-BY-NC-ND-4.0
---

# Database

What's stored, how anonymous visitors are counted without being identified, and how the schema changes.

The schema is [`src/lib/schema.ts`](../src/lib/schema.ts), written with Drizzle. The client in [`src/lib/db.ts`](../src/lib/db.ts) is Neon's serverless HTTP driver, so the database has to be on Neon.

## Tables

| Table | Holds | Keyed by |
| --- | --- | --- |
| `blog_posts` | One row per post slug, created the first time a known slug is needed | `id`, unique `slug` |
| `blog_reads` | Unique reads: a post and an IP hash | `(post_id, ip_hash)` |
| `blog_reactions` | A mood per post and IP hash: `terrible`, `bad`, `good`, or `amazing` | `(post_id, ip_hash)` |
| `blog_comments` | Comments and replies, with `parent_id`, `is_pinned`, `is_deleted` | `id` |
| `blog_comment_likes` | A Clerk user ID and a comment | `(comment_id, clerk_user_id)` |
| `guestbook_entries` | A Clerk user ID, the message, `is_pinned`, `is_deleted` | `id` |
| `guestbook_likes` | A Clerk user ID and an entry | `(entry_id, clerk_user_id)` |
| `projects` | Title, description, highlights, live and GitHub links, `enabled`, `sort_order` | `id` |
| `links` | A short link's target, preview fields, `permanent`, `enabled`, and a `clicks` counter | `id` |
| `link_slugs` | The paths that resolve to a link: a `tag` and a `slug`, one marked primary | unique `(tag, slug)` |

Deletes cascade where it makes sense. Removing a post removes its reads, reactions, and comments. Removing a comment removes its replies and likes. Removing a link removes its slugs.

Nothing here stores a name, email, or avatar. Those live in Clerk and are fetched when a page renders. See [`/privacy-policy`](https://anishshobithps.com/privacy-policy) for the plain-language version.

## Anonymous identity

Reads and reactions need to be unique per visitor without knowing who the visitor is. [`src/lib/ip.ts`](../src/lib/ip.ts) does it in two steps.

1. `getClientIp` takes the first valid address from `x-vercel-forwarded-for`, then `x-forwarded-for`, then `x-real-ip`. If none is usable it returns `127.0.0.1`, so every visitor it can't identify shares one hash.
2. `hashIp` returns the SHA-256 of `ip:IP_HASH_SALT` as hex. The raw address is never written anywhere. It throws if the salt is missing, because a hash with no secret salt is easy to reverse.

A post's read and reaction rows are keyed by `(post_id, ip_hash)`, so reloading doesn't count twice. Picking a different mood updates the row, and clicking the same mood again deletes it, so taking a reaction back leaves nothing behind.

Changing `IP_HASH_SALT` re-hashes everyone. Existing visitors would count as new and could react again, so treat the salt as permanent.

## Moderation and deletion

Guestbook entries and comments use `is_deleted` for soft deletes. The row stays and is hidden from the page, which keeps a comment's replies attached to something. A signed-in user can delete their own comments and entries, and the site owner can delete any. Pinning is the `is_pinned` flag, which only the owner can set.

When a Clerk account is deleted, `/api/webhooks/clerk` removes that user's guestbook likes, entries, comment likes, and comments outright, soft-deleted ones included.

Reads degrade rather than fail. Loaders wrap queries in `safeQuery`, which logs the error and returns a fallback such as `0` or an empty list.

## Migrations

Migrations are SQL files in `drizzle/` with their snapshots in `drizzle/meta/`. They're committed, and the config is [`drizzle.config.ts`](../drizzle.config.ts). It reads `DATABASE_URL`, and loads `.env.local` itself when the variable isn't already set.

```bash
pnpm db:migrate         # apply the committed migrations
pnpm db:push            # push the schema straight to the database, skipping migrations (dev only)
pnpm db:studio          # Drizzle Studio
```

To change the schema:

1. Edit `src/lib/schema.ts`.
2. Run `pnpm exec drizzle-kit generate`. It writes a new numbered `.sql` file and its snapshot.
3. Read the SQL, then commit the schema, the SQL, and `drizzle/meta/`.
4. Run `pnpm db:migrate`, first against a development database, then against production.

The build never migrates. `next build` doesn't touch the database, so a deploy that needs a schema change needs `pnpm db:migrate` run against production on your side, ideally before the new code goes live. `db:push` is for throwaway development databases only, because it leaves no migration behind.

See also: [Getting started](getting-started.md#seeding) for the seed scripts, and [Short links](short-links.md) for how `links` and `link_slugs` fit together.
