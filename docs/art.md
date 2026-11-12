---
license: CC-BY-NC-ND-4.0
---

# The art

None of the illustrations are image exports. They're all drawn in code, so they follow the theme, scale cleanly, and animate without video.

Every figure is drawn the same way: a two-colour riso print. Black ink and the site's green, pulled on paper, with the green plate a hair out of register.

## Where things live

| Piece | Where |
| --- | --- |
| Print engine | [`packages/iso/src/`](../packages/iso/src/): `figure.ts` (the scene model and its markup), `iso-kit.ts` (projection, extruded solids, the plan oblique camera), `print.ts` (plates, halftone screens, register, flat shapes) |
| Scenes | [`packages/iso/src/scenes/`](../packages/iso/src/scenes/), one file per figure |
| Rendering a scene | [`iso-art.tsx`](../packages/diagrams/src/iso-art.tsx) draws it as inline SVG, and [`iso-stage.tsx`](../packages/diagrams/src/iso-stage.tsx) plays its motion while it's on screen |
| Page figures | [`page-art.tsx`](../packages/diagrams/src/page-art.tsx) maps a page name to a scene, and passes the page's real data to it |
| Blog covers | [`blog-covers.tsx`](../packages/diagrams/src/blog-covers.tsx) maps a post slug to a scene, and falls back to the numbered sheet |
| Shared animation classes | [`classes.ts`](../packages/diagrams/src/classes.ts) |
| Doodles and nudges | [`apps/web/src/components/shared/doodles.tsx`](../apps/web/src/components/shared/doodles.tsx) |
| Logo and mascot | `logo.tsx`, `logo-icon.tsx`, `logo-mascot.tsx` in `apps/web/src/components/shared/` |
| OpenGraph card | [`apps/web/src/components/shared/OG.tsx`](../apps/web/src/components/shared/OG.tsx), rendered by `/og`. The mascot is printed in ink with its green plate off register |
| Cursors | [`apps/web/scripts/cursors/generate.ts`](../apps/web/scripts/cursors/generate.ts) draws five cursors in light and dark from the theme tokens. Each one is inlined as a data URI in the `--cursor-*` variables of `apps/web/src/app/cursors.css`. `pnpm cursors` regenerates both |
| Home hero | [`workbench.ts`](../packages/iso/src/scenes/workbench.ts) draws a print shop floor with the robot shown at four stages: guide lines, ink, a green plate off register, and registered and awake |
| Footer strip | [`strip-art.tsx`](../packages/diagrams/src/strip-art.tsx) renders the [night shelf](../packages/iso/src/scenes/night-shelf.ts) and crops it to the middle on phones. In dark mode the lamp is on and the bot sleeps. In light mode the bot is awake |
| Band doodles | [`band-doodle.tsx`](../apps/web/src/components/shared/band-doodle.tsx) draws five small flat critters on the hatched dividers between sections. Pass `doodle` to `<Section>` |
| Cursor glow | [`mouse-glow.tsx`](../apps/web/src/components/shared/mouse-glow.tsx) lights a soft brand-green spotlight that follows the pointer |

The `/branding` page shows the type scale, logos, doodles, the cursors, and a live OG preview in one place.

## The language

| Rule | Detail |
| --- | --- |
| Two plates only | The ink plate is the foreground colour. The green plate is the site green. Paper is the background. Nothing else, except the fan deck on `/branding`, where the swatches are the content |
| The green is the subject | Each figure has one thing in solid green: what the page is about. Everything supporting is ink or paper. Figures whose marks are the content, such as the privacy sheet, may carry several green regions |
| Overprint | Where green and ink overlap the result is darker. Light theme multiplies and dark theme screens (`PLATE.blend`). Blend modes do not work inside `<use>` clones, so draw those layers with plain fills |
| Off register | Within each object the green plate sits `REGISTER` (about 1.6 by 1.1 units) off the ink. The offset is the same on every figure |
| Halftone, not tone | Shading is dot screens in three densities. Side faces take a screen by facing and top faces stay paper. There are no grey fills, gradients or soft shadows |
| One line weight | Ink line is 1.25 px with round caps and joins and non-scaling strokes |
| The figure stands on the page | No base plates, feet, screws or plinths. Axonometric figures sit on a few rows of the page's own dot grid |
| The view fits the idea | See the views below. Never default to 30° isometric |
| Made of real content | Where the page has data, the figure is built from it. It must keep working as posts, projects and guestbook entries are added |
| No links in the art | The drawings are never links and have no hover treatment of their own |
| Words stay out | No captions, title blocks or dimension lines. Labels appear only when they are real content, such as a post number, a visitor's initials or a code point, set in the pixel font |
| It prints in, then rests | When a figure scrolls into view the green plate slides into register once. Anything beyond that must say something true. Everything is still under `prefers-reduced-motion` |
| Both themes | Tokens only. Check every figure in light and dark |

Never use: base plates, feet, screws, ruler strips, label plates, knurled knobs, springs and cables for decoration, grey tone ramps, halos, floating cubes, sparkles, a machine standing in for an idea, a third colour, or noise and grain filters.

### Views

| View | What it is | Use it when |
| --- | --- | --- |
| Elevation | Straight on, no depth | The subject has a face or stands in a row: characters, a shelf edge, a sheet of paper, a strip |
| Plan | Straight down | The subject is a surface: a desk, a map, a tray, a kit of parts |
| Section | Elevation cut through the ground line | The idea is what is underneath |
| Plan oblique | True plan rotated about 30° with heights drawn straight up. Set `oblique` on the projection | The subject needs volume. Circles stay circles and squares stay squares on top faces |
| Exploded plan oblique | Plan oblique with layers lifted apart | The idea is that one thing is made of several |

## How a scene works

A scene is one drawn object: static SVG markup plus the keyframes that move it. The engine in `packages/iso/src/` touches neither React nor the DOM. It builds the markup as a string, and motion is sampled at build time.

On the site, `PageArt` and `BlogCover` build each scene once on the server and cache it. `IsoArt` writes the markup into an SVG, and `IsoStage` watches the element and plays the motion while it's visible. The registration settle is a one-shot track (`once`), and it plays again when the figure re-enters the view.

Elevation and plan figures are drawn directly in viewBox units with the helpers in `print.ts` (`rectD`, `circleD`, `inkPath`, `paperPath`, `greenPlate`, `screenPath`, `shadowOf`, `printText`). Plan oblique figures use `k.slabOf` and `k.extrude` for volume, `printSolid` to print each solid in painter's order, and `topMatrix` and `sideMatrix` to lay drawings onto a face.

### Adding a page figure

1. Add a file in `packages/iso/src/scenes/` that exports a function returning a `Scene`. Take the page's data as the first argument if the figure should grow with it.
2. Add it to the `scenes` object in `page-art.tsx`.
3. Render it with `<PageArt name="yourScene" data={...} />`. For data that needs a query, wrap it in an async server component inside `<Suspense>` and use the empty figure as the fallback.

Pages sized 16:9 (the home bands) and 4:3 (page heroes, contact, the 404) get scenes framed for that shape.

### Adding a blog cover

Every post already gets a cover: the numbered sheet, with a swipe of green that is different for every slug. To give a post its own scene, add its slug to the `covers` object in `blog-covers.tsx`. See [Writing posts](writing-posts.md).

## Colour

Colours come from the tokens in [`packages/styles/src/tokens.css`](../packages/styles/src/tokens.css): `--iso-plate-ink`, `--iso-plate-green`, `--iso-screen`, `--iso-paper` and `--iso-dot`, exposed as `fill-iso-*` and `stroke-iso-*`. The OG route runs on the server, where CSS variables don't exist, so [`packages/styles/src/theme-tokens.ts`](../packages/styles/src/theme-tokens.ts) reads that file and resolves `var()` and `color-mix()` into hex. The OG card has no blend modes, so its overprint is drawn as plain shapes.

## Licensing

The engine is MIT. The expressive artwork produced with it, meaning the scenes, doodles, mascot, and card design, is CC BY-NC-ND 4.0. [`LICENSE.md`](../LICENSE.md) lists the exact paths. See [Forking](forking.md) for what that means for a fork.
