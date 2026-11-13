---
name: anishshobithps.com
description: A portfolio, blog, and guestbook laid out like a ruled workbench, printed in ink and one register green.
colors:
  ink: "oklch(0.141 0.005 285.823)"
  paper: "oklch(1 0.005 155)"
  register-green: "oklch(0.58 0.14 155)"
  register-green-text: "oklch(0.44 0.13 155)"
  register-green-night: "oklch(0.72 0.15 155)"
  highlighter: "oklch(0.82 0.155 155)"
  highlighter-ink: "oklch(0.112 0.008 155)"
  press-black: "oklch(0.21 0.006 285.885)"
  bench-grey: "oklch(0.967 0.001 286.375)"
  pencil-grey: "oklch(0.53 0.016 285.938)"
  hairline: "oklch(0.92 0.004 286.32)"
  night-ink: "oklch(0.985 0 0)"
  night-card: "oklch(0.21 0.006 285.885)"
  night-bench: "oklch(0.274 0.006 286.033)"
  night-pencil: "oklch(0.705 0.015 286.067)"
  neon-open: "oklch(0.72 0.19 142)"
  alarm-red: "oklch(0.577 0.245 27.325)"
typography:
  display:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 1.4rem + 3.4vw, 3.5rem)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 1.2rem + 2.2vw, 2.5rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.375rem, 1.05rem + 1.4vw, 1.75rem)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  lead:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.0625rem, 1.5cqi + 0.75rem, 1.25rem)"
    fontWeight: 400
    lineHeight: 1.625
  body:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.75
  label:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.5
  pixel:
    fontFamily: "Geist Pixel, Geist Mono, ui-monospace, monospace"
    fontSize: "0.6875rem"
    fontWeight: 400
    lineHeight: 1.4
    fontVariation: "\"ELSH\" 25"
  mono:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "0.625rem"
    fontWeight: 400
    lineHeight: 1.4
rounded:
  sm: "6px"
  md: "8px"
  lg: "10px"
  panel: "14px"
  section: "16px"
  full: "9999px"
spacing:
  gutter: "1.5rem"
  gutter-tablet: "2rem"
  gutter-desktop: "2.5rem"
  section-band: "2rem"
  section: "3rem"
  hero: "3.5rem"
  cell: "1.5rem"
components:
  button-primary:
    backgroundColor: "{colors.press-black}"
    textColor: "{colors.night-ink}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "36px"
  button-primary-hover:
    backgroundColor: "{colors.ink}"
  button-outline:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "36px"
  button-outline-hover:
    backgroundColor: "{colors.bench-grey}"
  nav-item:
    textColor: "{colors.pencil-grey}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
  nav-item-current:
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
  badge:
    backgroundColor: "{colors.bench-grey}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    padding: "2px 8px"
    typography: "{typography.label}"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "4px 12px"
    height: "36px"
  mark:
    backgroundColor: "{colors.highlighter}"
    textColor: "{colors.highlighter-ink}"
    rounded: "{rounded.sm}"
    padding: "0 0.25em"
  card-cell:
    backgroundColor: "{colors.paper}"
    padding: "{spacing.cell}"
  hire-sign:
    textColor: "{colors.register-green-text}"
    rounded: "{rounded.full}"
    padding: "4px 12px 4px 6px"
---

# Design System: anishshobithps.com

## Overview

**Creative North Star: "The Workbench"**

The site is a maker's bench. A single ruled column, framed by hairlines, holds the work: sections are numbered and separated by hatched bands like the gaps between boards, cards sit edge to edge on a one-pixel grid, and the tools are laid out where you can reach them (a command palette, a draggable quick menu fronted by the mascot, a sound switch). Nothing is staged behind glass. The bench is in use.

Everything on the bench is printed in two inks. Ink (near-black in light, near-white in dark) does the work, paper is the ground, and one Register Green marks the subject. The illustrations are two-colour riso prints drawn in code, with the green plate a hair out of register, and the interface borrows the same restraint: neutral surfaces, hairline borders, and green only where something matters right now.

The personality comes from small, tactile details rather than surface decoration. The current nav item is a pinned note tilted two degrees. The hire sign is a swinging neon "Open" sign. Pixel-font notes with hand-drawn green arrows point at things. Controls tap, pop, and (only when a visitor opts in) click. All of it rests under reduced motion. The previous tonal isometric machine look and the dimension-drawing style were rejected and stay out.

**Key Characteristics:**
- One ruled column (64rem) framed by vertical hairlines, with hatched bands between numbered sections.
- Two inks plus one green, in both themes, through tokens only.
- Flat surfaces; structure comes from 1px lines and grids, not shadows.
- Bricolage Grotesque headlines, Manrope text, Geist Pixel for notes, numbers, and labels inside the art.
- Playful, tactile micro-details on controls; illustrations print in once and then rest.

## Colors

A print shop palette: ink on paper, plus one spot green, with every colour defined in OKLCH and swapped per theme.

### Primary
- **Register Green** (register-green): The site's only accent. It fills the one subject of each illustration, the cursor glow, focus rings (light theme only; dark theme rings are Pencil Grey), the tap highlight, the current-nav tint (at 10% with a 35% ring), and the pin on the nav note. In dark theme the art plate and green text switch to **Register Green Night** (register-green-night).
- **Register Green Text** (register-green-text): The green when it must be read as text on paper, such as the hire sign label. It exists so green text clears AA; never set body-size text in plain Register Green.
- **Highlighter** (highlighter) on **Highlighter Ink** (highlighter-ink): The marker behind one key phrase in a paragraph (`TypographyMark`) and the text selection colour. Same hue as the brand, lifted to a highlighter.

### Neutral
- **Ink** (ink): Body text, headings, and the ink plate in light theme. In dark theme it becomes the page background.
- **Paper** (paper): The page and card ground in light theme, a white tinted almost imperceptibly toward the green hue.
- **Press Black** (press-black): Primary button fill in light theme and the card surface in dark theme (as **Night Card**).
- **Bench Grey** (bench-grey) / **Night Bench** (night-bench): Muted, secondary, and hover surfaces; badges and ghost hovers.
- **Pencil Grey** (pencil-grey) / **Night Pencil** (night-pencil): Secondary text, metadata, inactive nav items, captions.
- **Hairline** (hairline): Borders, the column frame, card-grid gaps, and the hatch lines (at 40%). In dark theme lines are white at 10% mixed into the background.
- **Night Ink** (night-ink): Text and the ink plate in dark theme.

### Functional
- **Neon Open** (neon-open): Only the hire sign's neon tube and its glow.
- **Alarm Red** (alarm-red): Destructive actions and invalid fields.

### Named Rules
**The One Spot Colour Rule.** Register Green is the only accent. Ink, paper, and greys do everything else. A third hue appears only where it is the content: chart series in the admin, the sun and moon in the theme toggle, the heart reaction, the traffic-light dots, and the swatch fan on `/branding`.

**The Green Is The Subject Rule.** In any figure, exactly one thing is solid green: what the page is about. In the interface, green marks the current place or the one phrase that matters, never decoration.

**The Two Themes Rule.** Every colour comes from a token and is checked in light and dark. No hard-coded hex in components or art.

## Typography

**Display Font:** Bricolage Grotesque (with ui-sans-serif, system-ui)
**Body Font:** Manrope (with ui-sans-serif, system-ui)
**Label/Mono Font:** Geist Pixel (with Geist Mono) for notes and art labels; Geist Mono for keyboard hints.

**Character:** Bricolage brings a slightly quirky, inky grotesque for headings, set heavy and tight. Manrope keeps long reading calm and open. Geist Pixel is the handwriting on the bench: margin notes, post numbers, initials, and code points.

### Hierarchy
- **Display** (800, clamp 2.25rem to 3.5rem, 1.1): Page titles and the name in the hero. One per page.
- **Headline** (700, clamp 1.75rem to 2.5rem, 1.1): Section headings.
- **Title** (600, clamp 1.375rem to 1.75rem, 1.1): Card and sub-section headings; h4 steps down to clamp 1.125rem to 1.375rem.
- **Lead** (400, clamp 1.0625rem to 1.25rem by container width, 1.625): The intro paragraph under a page title, often carrying one highlighter mark.
- **Body** (400, 1rem, 1.75): Paragraphs and post text, `text-pretty`, with 1.5rem between paragraphs.
- **Label** (500, 0.875rem): Buttons, nav, small metadata; muted labels use Pencil Grey at 0.875rem, captions 0.75rem.
- **Pixel** (400, 0.6875rem, `"ELSH" 25`): Doodle notes, section numbers ("No.01"), and any words inside illustrations.

### Named Rules
**The Typography Components Rule.** All text goes through the Typography components (`TypographyH1`–`H4`, `TypographyLead`, `TypographyMuted`, `TypographyMark`, and the rest). No ad-hoc font sizes on raw elements.

**The One Mark Rule.** At most one highlighter mark per paragraph, and on the home page only the hero lead and the Contact pitch carry one. It points at the phrase a skimmer should keep; used more often, it stops meaning anything.

**The Visible Heading Rule.** Every home section shows its H2. The lead under it says the point; it never stands in for the heading.

**The Words Stay Out Of The Art Rule.** Illustrations carry no captions or titles; a word appears inside a figure only when it is real content, set in the pixel font.

## Layout

The page is one centred column, 64rem wide, with a 1px hairline down each side that runs the full height. The header is fixed, 3.5rem tall, and shares the same framed column with a blurred paper backdrop outside it.

Inside the column, content is stacked as numbered sections. Each section is preceded by a 2rem hatched band (315° hairline hatch, 10px pitch, bordered top and bottom) that spans the full viewport width, and a section counter prints in the margin. Section padding is 3rem top and bottom by default, 3.5rem for the hero, 1.5rem for compact sections, and 2rem to 3rem for articles. The last section rounds its bottom corners (16px) where the column ends.

Horizontal padding is the gutter: 1.5rem on phones, 2rem from 40rem, 2.5rem from 64rem. Card grids break out to the column edges (`-mx-gutter`) and lay cells on a 1px gap over the hairline colour, so the grid lines are the background showing through. Grids are one column on phones and two or three from 48rem; cell padding steps 1rem, 1.5rem, 2rem with container width.

Illustrations sit in fixed aspect boxes (the hero bench at 960:230, the footer shelf at 960:200, page heroes at 4:3, home bands at 16:9) and stand directly on the page's dot grid.

## Elevation & Depth

The system is flat. Depth comes from line and layering: hairline frames, 1px grid gaps, hatched bands between sections, and a paper-coloured header that blurs what scrolls under it. Outline buttons and inputs carry the only routine shadow, a barely visible `shadow-xs`. Popovers, dialogs, and the command palette use their component defaults to lift off the page; nothing else casts a shadow.

The one soft light on the page is the cursor glow: a radial Register Green spotlight (14% in light, 16% in dark) that follows the pointer. The neon sign has its own small glow. Illustrations never use shadows, gradients, or grey tone; shading in the art is halftone dot screens.

### Named Rules
**The Lines Not Shadows Rule.** To separate two things, draw a hairline or open a 1px gap. Do not reach for a drop shadow.

**The Halftone Not Tone Rule.** In illustrations, shading is a dot screen in one of three densities. No grey fills, gradients, halos, or soft shadows.

## Shapes

Corners are softly rounded and derived from one 10px base radius: 6px for small controls and marks, 8px for buttons, inputs, and nav items, 10px for medium containers, 14px for panels and card-grid outer corners, and 16px where the page column ends. Pills (full radius) are reserved for badges, the hire sign, and the header's control group, which caps both ends of a button group.

Card grids only round their outermost corners; inner cells meet square on the hairline grid, so a grid reads as one cut board. Borders are always 1px hairlines.

Illustrations use one ink line weight (1.25px, round caps and joins, non-scaling) and choose their view by idea: elevation, plan, section, plan oblique, or exploded plan oblique, never a default 30° isometric. Figures stand on the dot grid with no base plates, feet, screws, or plinths.

## Components

Tactile and playful: shapes stay neutral and exact, and the delight lives in how controls respond.

### Buttons
- **Shape:** Gently rounded (8px); heights 24px (xs), 32px (sm), 36px (default), 40px (lg).
- **Primary:** Press Black fill with Night Ink text in light theme; in dark theme it inverts to a Hairline-light fill (oklch 0.92) with Press Black text. 500 weight, 16px horizontal padding.
- **Outline:** Paper fill, hairline border, `shadow-xs`; hover fills with Bench Grey.
- **Ghost / Muted / Link:** Ghost fills Bench Grey on hover; Muted shifts Pencil Grey text to Ink; Link underlines at a 4px offset.
- **Hover / Focus:** Colour transitions only. Focus shows a 3px ring at 50% in the ring token: Register Green in light theme, Pencil Grey in dark theme. Primary calls to action set `data-sound="tap"` so the opt-in sound plays.
- **Groups:** Related actions sit in a `ButtonGroup` with a hairline separator, such as Resume and Contact in the hero.
- **Touch:** under a coarse pointer every `Button` and `Toggle` carries an invisible hit area of at least 44×44 px (a centered `::after`), so the visible size never changes. Do not position a `Button` itself with `absolute`/`fixed`/`sticky`; wrap it instead, since the hit area makes it `relative` on touch.

### Chips (Badges)
- **Style:** Full pill, 12px medium text, 2px by 8px padding; default Press Black, secondary Bench Grey, outline with a hairline border.
- **Use:** Tags on projects and posts, counts, small status.

### Cards / Containers
- **Corner Style:** Square inside a card grid; 14px only on the grid's outer corners. Standalone cards use 14px with a hairline border.
- **Background:** Paper (Night background in dark theme); the grid gap shows Hairline.
- **Shadow Strategy:** None. See Elevation & Depth.
- **Border:** The 1px grid gap stands in for borders between cells.
- **Internal Padding:** 1rem, 1.5rem, or 2rem by container width; cells may carry a pixel-font index ("No.01") in the top-right corner.

### Inputs / Fields
- **Style:** 36px tall, 8px radius, hairline (Input) border, `shadow-xs`, transparent fill (white at 4.5% in dark theme), 12px horizontal padding, Pencil Grey placeholder.
- **Focus:** Border and a 3px ring at 50% in the ring token (Register Green in light theme, Pencil Grey in dark theme).
- **Error / Disabled:** Alarm Red border and ring at 20%; disabled at 50% opacity.
- **Forms:** Always built with the shadcn `Form`.

### Navigation
- **Header:** Fixed, 3.5rem, framed to the column. Logo left (scales to 96% on press); nav and a pill-capped control group (search with ⌘K hint, sound, theme) right.
- **Items:** Pencil Grey label, 8px by 12px, Bench Grey on hover.
- **Current item:** A pinned note. It tilts −2°, takes a 10% Register Green tint with a 35% green ring and Ink text, wears a small green pin above its corner, swings in on arrival, and straightens on hover.
- **Mobile:** Nav collapses; touch targets grow to 44px under coarse pointers.

### Highlighter Mark
The `TypographyMark` component lays Highlighter behind one phrase with a 6px radius and 0.25em side padding. It is the interface's version of the green plate.

### Hire Sign
A pill in Register Green at 8% with a 30% border and Register Green Text label. A small neon "Open" sign hangs on wires, sways once and flickers on load, and swings on hover. It reads "Available for hire" at rest; only while hovered or focused does the phrase rotate every 1.6s ("Open to full-time roles", "Accepting side quests", and so on), and never with reduced motion. It disappears entirely when hiring is switched off.

### Doodles and Nudges
Pixel-font notes with hand-drawn Register Green arrows that draw themselves in, pointing at real things (the photo, the latest post). Small flat critters walk along the hatched bands between sections. They are always decorative and `aria-hidden`.

### Quick Menu
A floating, draggable button fronted by the logo mascot. It opens a panel with context tools: reading progress and a jump to comments on posts, download on the resume, sign-in on the blog and guestbook, and sound settings. It remembers where it was dropped.

## Do's and Don'ts

### Do:
- **Do** use Register Green for one subject per figure and for the current place in the interface, nothing more.
- **Do** separate content with hairlines, 1px grid gaps, and hatched bands.
- **Do** pull every colour from the tokens and check light and dark before calling anything done.
- **Do** build figures from real data so they grow with posts, projects, and guestbook entries, and hold up at zero.
- **Do** let illustrations print in once (the green plate sliding into register) and then rest; stop all motion under `prefers-reduced-motion` or the visitor's Motion switch (`data-motion="reduce"` on `<html>`). Gate new motion with `motion-safe:` / `motion-reduce:` or `usePrefersReducedMotion`, which honor both.
- **Do** keep sounds off until the visitor turns them on, and wire new tap targets with `data-sound` only where a sound helps.
- **Do** hold WCAG 2.2 AA contrast; use Register Green Text, not Register Green, for readable green text.

### Don't:
- **Don't** add a third ink to illustrations, or grey tone ramps, gradients, halos, sparkles, noise, or grain.
- **Don't** bring back tonal isometric machines, base plates, feet, screws, ruler strips, label plates, or decorative springs and cables.
- **Don't** make dimension drawings, redlines, or spec-sheet art; that direction was rejected.
- **Don't** default to a 30° isometric camera; pick the view that fits the idea.
- **Don't** put captions, titles, or links inside illustrations.
- **Don't** add drop shadows to separate cards or sections.
- **Don't** replace the cursor set (branded blade arrows plus the green glow) with slab, doodle-pen, or ink-trail cursors.
- **Don't** put a "·" separator between parts of a label; reword so it needs none.
- **Don't** set text outside the Typography components or build forms outside the shadcn `Form`.
