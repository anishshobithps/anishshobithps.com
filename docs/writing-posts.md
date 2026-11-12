---
license: CC-BY-NC-ND-4.0
---

# Writing posts

Posts are MDX files in `apps/web/content/blog/`. Adding one is a file and a push.

## The file

Drop an `.mdx` file in `apps/web/content/blog/`. The filename is the slug, so `making-my-resume-machine-readable.mdx` is served at `/blog/making-my-resume-machine-readable`. Frontmatter is validated by [`source.config.ts`](../source.config.ts):

```yaml
---
title: The Hidden Architecture of Emoji
description: One or two sentences. Also used for the OG image, the RSS feed, and the meta description.
date: 2026-03-19
tags:
  - Unicode
  - Typography
updates:
  - date: 2026-04-02
    kind: correction
    note: Fixed the year the format shipped.
---
```

| Field | Required | Notes |
| --- | --- | --- |
| `title` | Yes | Shown in the header, cards, feed, and OG image |
| `description` | No, but write one | The meta description, the RSS summary, and the OG card text |
| `date` | No | Publication date. The blog index lists posts newest first by it |
| `tags` | No | Free-form strings, and the blog index filters by them |
| `updates` | No | The revision log. See [Revisions](#revisions) |
| `lastModified` | No | Overrides the date taken from `updates`. Rarely needed |
| `links` | No | The links worth surfacing while someone reads. See [Links](#links) |

The modified date is manual on purpose. It used to come from git history, but shallow clones on the deploy host re-dated every post on every push. It is the newest `updates` date, or `lastModified` when that is set, and the sitemap, the structured data and the page metadata all use it. The sitemap falls back to `date`.

## Revisions

Record an edit worth announcing as an entry in `updates`:

```yaml
updates:
  - date: 2026-04-02
    kind: correction
    note: The 10:09 watch is the ⌚ emoji, not a clock face.
  - date: 2026-04-02
    kind: sources
    note: Added 54 numbered sources.
```

`kind` is `correction`, `addition`, `sources` or `edit`, and defaults to `edit`. `note` is one or two sentences saying what changed, so write it for a reader and not as a commit message. Entries on the same date keep the order you write them and share one date heading, and a run of the same `kind` shows its label once, so put corrections before sources.

A post with `updates` shows a "Revised" chip in its header instead of a plain date. Clicking it opens a revision log, a small timeline of every entry ending at the publish date. A reader who has visited before and not opened the log since the latest entry sees a dot on the chip, and the entries they have not seen are marked "New for you". A first-time reader never gets the dot, since they are reading the current version. What a reader has seen is kept in their browser only, under `revision-seen:` keys, and never sent anywhere.

Fix typos without logging them. Log a correction when a reader who trusted the old text would have been misled.

Reading time is computed at build time by a remark plugin ([`apps/web/src/lib/remarkReadingTime.ts`](../apps/web/src/lib/remarkReadingTime.ts)).

## What you can use in a post

Everything `fumadocs-ui` provides by default for MDX works: headings, tables, callouts, cards, and fenced code with syntax highlighting (`github-light` and `github-dark`, following the site theme). Two more things are available without an import:

- `<TypographyMark>` and `<TypographyMuted>`
- The fumadocs tab components
- `<Steps>` with `<Step>` children, and `<Files>` with `<Folder>` and `<File>` for a file tree
- `<LinkCard url="…" />`, covered below

## Links

A post can list the links a reader should not miss, in frontmatter:

```yaml
links:
  - url: https://github.com/anishshobithps/resume
    label: Resume source
    note: One line on why it matters.
    featured: true
  - https://exiftool.org/
```

An entry is a bare URL or an object with `url`, and optionally `label`, `note` and `featured`. Every entry shows up in a "Links" block under the table of contents (inside the contents drawer on phones), and in a "Links from this post" grid before the end of the post. The first entry with `featured: true` also gets a full card at the top of the post. Leave `featured` off when no link is the post's source.

`label` replaces the card's title, and `note` replaces its description. Both are optional, and a card falls back to what the linked page says about itself. The full-size card for a GitHub repo always shows the repo's name, so there `label` only renames it in the side list and the grid, and `note` is added as an extra line.

Cards are built on the server from the URL alone:

| URL | Card shows |
| --- | --- |
| GitHub repo | Description, topics, language, stars, forks, license, latest release |
| GitHub file, folder, release or profile | Path and repo, release tag and date, or followers and repos |
| npm package | Version, weekly downloads, license |
| YouTube video | Thumbnail, title, channel |
| Wikipedia article | Summary and lead image |
| Discord invite | Server name, icon, members, online now |
| A post or page on this site | Title, description, date, reading time |
| Anything else | Title, description, site name, image and favicon from the page's own metadata |

A link that can't be fetched falls back to a plain card with its host. Results are cached for an hour (GitHub, npm, Discord) or a day, and a failed lookup is retried after five minutes.

## Citations

Cite a source with a footnote. Put the marker after the claim and define the source at the end of the post:

```md
The stadium runs at a reduced capacity of 28,000[^capacity].

[^capacity]: NewsX, [M Chinnaswamy New Guidelines For IPL 2026](https://www.newsx.com/…).
```

Numbers follow the order the markers first appear, and citing the same id again reuses its number. The definitions become a "Sources" list at the end of the post, and a "Sources" entry in the contents. Hovering a number previews the source with the link text from its definition as the title, so write the real title there. The first `https` link in a definition is the one that gets previewed. Prefer this to an inline hyperlink when the link is evidence for a claim and not something the reader needs to follow.

## Link cards

To place a card in the body, write `<LinkCard url="https://…" />`, or put a URL on a line of its own and it becomes one. Passing `label` or `note` works the same as in frontmatter. Ordinary links in prose keep working as they were, and an external one opens a small preview when hovered.

Video goes through the media player in `packages/media-player/src/index.tsx`. Import it at the top of the post, and see an existing post for the pattern. Videos stream from Cloudinary, which needs `res.cloudinary.com` allowed in the CSP, and it already is. Images inside posts are served from this domain.

## The cover

Every post gets an isometric cover. To give a post its own scene, add its slug to the `covers` map in [`packages/diagrams/src/blog-covers.tsx`](../packages/diagrams/src/blog-covers.tsx), pointing at a scene from `packages/iso/src/scenes/`. A post without an entry gets the typewriter scene (`blogsScene`) until it has its own. See [The art](art.md) for how scenes are built.

## What a post gets for free

- A page at `/blog/<slug>` with reading time, a cover, and previous and next links.
- Anonymous reactions, a unique read count, and threaded comments. Rows are created the first time they're needed, and only for slugs that exist in `apps/web/content/blog`.
- An entry in `/blogs`, `/feed.xml`, `/sitemap.xml`, and `/llms.txt`.
- Raw MDX at `/blog/<slug>.mdx`, for tools that want the source. The `/blogs/latest` route redirects to the newest post.
- An OpenGraph card from `/og`, built from the title and description.

## Publishing

1. Write the post and run `pnpm dev` to see it.
2. Run `pnpm types:check`. It validates frontmatter against the schema.
3. Push to `main`. Posts are compiled at build time, so a deploy is what publishes it.

Renaming a post changes its URL and orphans its reactions and comments, which are keyed by slug. Add a redirect in `next.config.mjs` when you rename one. There is already one there for an earlier title.

Prose in `content/` is CC BY-NC-ND 4.0, and code blocks in posts are MIT. See [`LICENSE.md`](../LICENSE.md).
