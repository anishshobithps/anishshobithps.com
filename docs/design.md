---
license: CC-BY-NC-ND-4.0
---

# Design

The art, the `/svg` cards, and the UI sounds. None of the illustrations are image exports: they are drawn in code, so they follow the theme, scale cleanly, and animate without video.

## The art

Every figure is a two-colour riso print: black ink and the site's green on paper, with the green plate a hair out of register.

### Where things live

| Piece | Where |
| --- | --- |
| Print engine | [`packages/ui/src/art/`](../packages/ui/src/art/): `figure.ts` (the scene model), `geometry.ts` (projection, solids, the plan oblique camera), `print.ts` (plates, halftone screens, register) |
| Scenes | `packages/ui/src/art/scenes/`, one file per figure |
| Rendering | `iso-art.tsx` writes a scene as inline SVG, and `iso-stage.tsx` plays its motion while it's on screen |
| Page figures and covers | `page-art.tsx` maps a page to a scene with its real data, and `blog-cover.tsx` maps a slug to one |
| Band doodles, inline art, footer strip | `band-doodle.tsx`, `inline-art.tsx`, `strip-art.tsx` |
| Logo and mascot | `packages/ui/src/brand/` |
| Doodles and the OG card | `apps/web/src/components/shared/doodles.tsx` and `OG.tsx` |
| Cursors | `apps/web/scripts/cursors/generate.ts`, inlined into `apps/web/src/app/cursors.css` by `pnpm cursors` |
| Icons | `@repo/ui/icons`: Phosphor shapes as green glass, coloured by the `--glass-*` tokens |

`/branding` shows the type scale, logos, doodles, cursors, and a live OG preview together.

### The language

- **Two plates only.** Ink is the foreground colour, green is the site green, paper is the background. No third colour.
- **The green is the subject.** Each figure has one thing in solid green, what the page is about. Everything supporting is ink or paper.
- **Overprint.** Where the plates overlap it gets darker: multiply in light, screen in dark (`PLATE.blend`). Blend modes don't work inside `<use>` clones, so draw those with plain fills.
- **Off register.** The green sits `REGISTER` off the ink, the same on every figure.
- **Halftone, not tone.** Shading is dot screens in three densities. No grey fills, gradients, or soft shadows.
- **One line weight.** 1.25 px, round caps and joins, non-scaling.
- **The figure stands on the page.** No base plates, feet, or plinths. Axonometric figures sit on the page's own dot grid.
- **Made of real content.** Where the page has data, the figure is built from it and grows with it.
- **Words stay out.** No captions or dimension lines. Labels only when they are content, set in the pixel font.
- **It prints in, then rests.** The green slides into register once on scroll. Everything holds still under `prefers-reduced-motion`.
- **Both themes.** Tokens only, checked in light and dark.

Never use screws, ruler strips, label plates, decorative springs or cables, halos, floating cubes, sparkles, noise filters, or a machine standing in for an idea.

| View | Use it when |
| --- | --- |
| Elevation, straight on | The subject has a face or stands in a row |
| Plan, straight down | The subject is a surface: a desk, a map, a tray |
| Section | The idea is what's underneath |
| Plan oblique (`oblique` on the projection) | The subject needs volume. Circles stay circles on top faces |
| Exploded plan oblique | One thing is made of several |

Never default to 30° isometric.

### Adding a figure

The engine touches neither React nor the DOM. A scene is SVG markup as a string plus keyframes sampled at build time. Elevation and plan figures use the helpers in `print.ts` (`rectD`, `inkPath`, `greenPlate`, `screenPath`, `printText`, …). Plan oblique figures use `k.slabOf` and `k.extrude`, and `printSolid` prints solids in painter's order.

1. Add a file in `scenes/` that exports a function returning a `Scene`, taking the page's data first if it should grow with it.
2. Add it to `scenes` in `page-art.tsx`.
3. Render `<PageArt name="yourScene" data={...} />`. For data behind a query, wrap it in an async server component inside `<Suspense>` with the empty figure as the fallback.

Colours come from the `--iso-*` tokens in [`packages/ui/src/styles/tokens.css`](../packages/ui/src/styles/tokens.css). The OG route has no CSS variables, so `theme-tokens.ts` resolves the tokens to hex on the server.

## SVG cards

`/svg` renders README cards from the site's own data, tokens, and fonts. Text is drawn as glyph outlines, so GitHub's image proxy shows exactly what the site renders.

```
GET /svg?type=<template>&theme=light|dark&v=<n>&<options>
```

`theme` is required because the SVG can't follow the viewer's theme, so pick one per `<picture>` source. `v` is ignored and only busts GitHub's image cache.

| `type` | Shows | Options |
| --- | --- | --- |
| `banner` | Photo, name, domain, and role | `role` |
| `heading` | A numbered section heading | `n`, `title` |
| `post` | The newest post | `slug` |
| `posts` | The newest posts with reads | `limit` (1 to 8) |
| `activity` | A weekday by hour grid of when I code | `source=github\|wakatime\|both` |
| `calendar` | A year of contributions and streaks | none |
| `guestbook` | The latest signatures | `limit` (1 to 6) |
| `local` | A place's time, weather, and daylight | `city` and `country`, or `lat` and `lon`, plus `name` and `units=c\|f` |
| `resume` | The latest resume build and downloads | none |

```html
<a href="https://anishshobithps.com/blogs/latest">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://anishshobithps.com/svg?type=post&theme=dark&v=1">
    <img src="https://anishshobithps.com/svg?type=post&theme=light&v=1" width="100%" alt="Latest post on anishshobithps.com">
  </picture>
</a>
```

How it fits together:

- `apps/web/src/app/svg/route.tsx` finds the template in `lib/svg/registry.ts`, validates its options with zod, loads its data, and renders with takumi.
- Templates live in `apps/web/src/lib/svg/templates/` and never fetch. Loaders live in `lib/svg/data/` and never render. They're cached from half an hour to six hours, keyed by deployment ID, and anything clock-based is worked out at render.
- Every response, errors included, is `image/svg+xml` with no-store caching and a sandboxed CSP. `/svg` is left out of the site's header rule so that CSP isn't replaced.
- `activity` only searches public repos. Guestbook avatars are inlined as data URIs, so a card never points at another host.

`/svg/preview` renders every template's fixtures in both themes, and `/svg/preview/readme` lays them out as a profile README. Both are development only.

To add a card, export `defineTemplate({ params, size, load, revalidate, fixtures, render })` from a new file in `templates/` and add one line to the registry.

## Sound

UI sounds from [soundcn](https://www.soundcn.xyz/), CC0 by Kenney. They are off until a visitor turns them on, and nothing plays, loads, or creates an audio context before that.

- **Opt-in.** The header speaker, the mobile menu, the quick menu (with volume), or the command palette. Turning it on is the gesture that unlocks audio.
- **Never the only signal.** Every cue has a visual twin, and the site works the same muted.
- **Silent where it's frequent.** Hover, scroll, typing, decorative motion, and the admin stay silent. Frequent cues are short and quiet.
- **Lazy.** The palette is reached only through a dynamic `import()` after opt-in. All 24 sounds are one chunk no page loads up front.
- **Paired, not doubled.** Each cue has a cooldown, and overlapping voices are capped. Hidden tabs are silent.

The code is in `packages/sounds/src/`. `sounds/palette.ts` is the only file that maps a cue to an asset, with its gain and cooldown, so re-skinning the site changes only that file. Rising pitch means on or open, falling means off or removing, and a negative reaction is a soft thud rather than a buzzer.

Play a cue with `playCue("tap")` from a handler, or `data-sound="tap"` on an element, which one delegated listener reads so server components can opt in.

To add one:

```bash
pnpm exec shadcn add @soundcn/click-003
mv apps/web/src/lib/click-003.ts packages/sounds/src/sounds/
```

Then import it in `palette.ts` and point a cue at it, or add a name to `cueNames` in `sound-cues.ts` and give it an entry. Check the sound's license first.
