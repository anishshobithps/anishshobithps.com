---
license: CC-BY-NC-ND-4.0
---

# Admin

`/admin` is an owner-only dashboard for moderating content and managing the data that isn't in git.

## Access

Access is gated on `OWNER_CLERK_USER_ID` matching the signed-in Clerk user. There's no role system, just that one ID.

- Not signed in: you're sent to Clerk's sign-in, then back to `/admin`.
- Signed in as someone else: you see an unauthorized page.
- The pages are `noindex`, always rendered dynamically, and use their own layout with a sidebar.

The check isn't only in the layout. Every admin server action calls `assertAdmin()` through `adminMutation` ([`src/lib/admin-action.ts`](../src/lib/admin-action.ts)), so a mutation can't be triggered by calling the action directly.

Set `OWNER_CLERK_USER_ID` to your Clerk user ID. See [Getting started](getting-started.md#clerk).

## Pages

| Page | What you can do |
| --- | --- |
| `/admin` | See counts for guestbook entries, comments, unique reads, and reactions. Clear the cached resume PDF |
| `/admin/guestbook` | Search entries, pin or unpin them, and delete them |
| `/admin/comments` | Search comments across posts, pin or unpin them, and delete them |
| `/admin/projects` | Create, edit, enable or disable, reorder, and delete the projects shown on `/projects` and the home page |
| `/admin/links` | Create, edit, enable or disable, and delete short links and their aliases |

The overview shows both active and total counts. Deleted entries and comments are soft-deleted, so the total includes them. See [Database](database.md#moderation-and-deletion).

## Moderation

Pinning moves a guestbook entry or comment to the top. Deleting hides it and keeps the row. Signed-in visitors can delete their own entries and comments from the public pages, and the owner can delete anyone's, from the public pages or from here. Only the owner can pin.

When someone deletes their Clerk account, the webhook removes their rows for good, including soft-deleted ones.

## Projects

Projects live in Postgres rather than a hardcoded array, so changing them needs no deploy. Each has a title, description, highlight bullets, a live link, and a GitHub link. Order is a `sort_order` you change with the move controls, and a disabled project stays in the table but isn't shown.

Saving a change clears the cache behind `/projects` and the home page right away, so edits show up on the next load.

## Short links

Links are managed here, and `scripts/seed-links.ts` can seed a few. Validation lives in [`src/lib/links-schema.ts`](../src/lib/links-schema.ts). The form checks against `linkFormSchema`, and the server action validates again with the stricter `linkInputSchema` and checks for slug conflicts in the database. The rules: a target that's `http(s)` or `mailto:`, lowercase slugs, no reserved paths, and no duplicate or conflicting aliases. See [Short links](short-links.md) for what a link can do.

## Resume cache

The resume PDF is fetched from the latest GitHub release and cached for up to an hour. After publishing a new release, use the button on the overview page to clear the cache. The next visit to `/resume` pulls the new PDF.
