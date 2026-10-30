---
license: CC-BY-NC-ND-4.0
---

# Sound

The site has optional UI sounds, built on [soundcn](https://www.soundcn.xyz/) (a shadcn registry of short CC0 effects, mostly from [Kenney](https://kenney.nl)). They are off for everyone until they turn them on. Nothing plays, loads, or creates an audio context before that.

## Principles

These come from the sources at the bottom. The short version:

1. **Opt-in, never default.** Browsers already block audio that starts without a gesture ([MDN](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay)), and the guides agree that sound should be something people choose.
2. **Sound never carries information alone.** Every cue has a visual twin (a toast, an animation, a state change). The site works the same with sound off.
3. **Silence is a design choice.** Material treats frequent interactions as a poor fit for sound. Hover, scroll, typing, and decorative motion stay silent here.
4. **Frequent means short and quiet.** Taps are tens of milliseconds. The few longer cues are rare moments.
5. **Respect the person's preference.** It is remembered, synced across tabs, and a mute is a mute: turning sound off plays the "off" cue once, then nothing.
6. **Pair, don't repeat.** A cue has a cooldown so two code paths firing the same sound can't double it, and there is a cap on overlapping voices.

## How a visitor turns it on

- The speaker button in the header (desktop), the **Sound** row in the mobile menu, the **Sound** card in the quick menu (with a volume slider), or **Turn sound on** in the command palette.
- Turning it on is the gesture that unlocks audio, and it confirms itself with a short switch sound.
- On later visits the preference is restored, but the audio context is only created on the first click or key press.

## How it works

```
packages/sounds/src/sound-types.ts         soundcn: SoundAsset type
packages/sounds/src/sound-engine.ts        soundcn: Web Audio context, decode cache, playSound
packages/sounds/src/sounds/*.ts                soundcn: one file per sound (base64 mp3 + metadata)
packages/sounds/src/sounds/palette.ts          the only file that maps a cue to an asset, with gain and cooldown
packages/sounds/src/sound-cues.ts          cue names, as a type and a runtime list (no audio data)
packages/sounds/src/sound-preferences.ts   enabled + volume store, localStorage, cross-tab sync
packages/sounds/src/sound-player.ts        playCue, unlock, enable/disable, limiter, lazy palette load
packages/sounds/src/use-sound-preferences.ts
apps/web/src/components/shared/sound-effects.tsx    mounted once in the root layout
apps/web/src/components/shared/sound-controls.tsx   header button, switch, hub card
```

Choices worth knowing:

- **Lazy by construction.** `palette.ts` is only reached through a dynamic `import()` after the visitor opts in. In the production build all 24 sounds are one 75 KB chunk (about 45 KB gzipped) that no page references up front.
- **One audio context, created on a gesture.** `unlockAudio()` runs from the first pointer or key event while enabled, and from the toggle itself. Until then `playCue` does nothing, so there are no autoplay warnings and no sounds queued up behind a pending `resume()`.
- **Two ways to play a cue.** Call `playCue("tap")` from a handler, or add `data-sound="tap"` to an element. The attribute is read by one delegated listener, so server components can opt in without becoming client components.
- **Perceptual volume.** The slider value is squared before it reaches the gain node, then multiplied by the cue's own gain.
- **Hidden tabs are silent.**
- The soundcn `useSound` hook is not used. It decodes its sound in every component that mounts and has no site-wide gate, which is the wrong shape for a whole site.

## The palette

The site is drawn as a desk: pins, notes, passes, a signpost, a 404 that boasts. The sounds follow that. Soft clicks and ticks for controls, paper and card sounds for reading and posting, a pin drop when a page arrives. Rising pitch means on, open, or good; falling means off, closing, or removing. Negative feedback on a reaction is a soft thud, not a buzzer, because someone honestly rating a post as "Not for me" shouldn't be told off.

Gains are in `packages/sounds/src/sounds/palette.ts` (0 to 1, before the master volume). Frequent cues are around 0.5, confirmations around 0.7, and the guestbook note landing is the loudest at 0.9.

## Sound map

| Where | Action | Cue | soundcn asset | Why |
| --- | --- | --- | --- | --- |
| Everywhere | Navigation links, logo, footer, hero and contact buttons, share links, signpost planks | `tap` | `click-004` (22 ms) | The quietest, shortest cue; the baseline "I pressed something" |
| Everywhere | Route changes | `pin` | `impact-generic-light-001` | Arrives 380 ms after the route settles, echoing the pin that drops on the active tab |
| Header | Sound on / off | `toggleOn` / `toggleOff` | `switch-on` / `switch-off` | Confirms the choice; the off cue plays before going quiet |
| Header, command palette | Theme to light / dark / system | `toggleOn` / `toggleOff` / `select` | `switch-on` / `switch-off` / `select-007` | Lights on and off |
| Command palette, quick menu, mobile menu | Open / close | `open` / `close` | `open-001` / `close-001` | A matched pair, both under 150 ms |
| Quick menu | Release after dragging | `drop` | `drop-002` | The mascot button being put down |
| Resume, quick menu, command palette | Download | `download` | `drop-004` | Something lands in your folder |
| Resume viewer | Next or previous page | `flip` | `book-flip-3` | A page turn |
| Blogs | Open a post card | `read` | `book-open` | Opening a book |
| Blogs | Toggle or remove a tag filter | `select` | `select-007` | Choosing among options |
| Blogs | Pagination | `flip` | `book-flip-3` | A page turn |
| Post | Previous / next post | `flip` | `book-flip-3` | A page turn |
| Post | Copy link | `copy` | `pluck-002` | A small, bright confirmation |
| Post | Back to top | `top` | `maximize-007` | A quick upward sweep |
| Post | "Not for me" | `moodTerrible` | `impact-soft-medium-001` | A soft thud, deliberately not punishing |
| Post | "Meh" | `moodBad` | `drop-003` | Light and flat |
| Post | "Liked it" | `moodGood` | `select-004` | A clear, friendly blip |
| Post | "Loved it" | `moodAmazing` | `pep-sound-3` | The only bouncy cue, for the happiest answer |
| Post, guestbook | Clearing a reaction, removing a like | `unlike` | `back-001` | A small step back |
| Post, guestbook | Liking a comment or entry | `like` | `pluck-001` | A short pluck |
| Post, guestbook | Sending a comment, reply, or guestbook note | `post` | `card-place-2` | A note landing on the board; the loudest cue, for the moment that matters most |
| Post, guestbook | Confirming a delete | `remove` | `minimize-003` | Something shrinking away |
| Composer | Sending an empty message | `error` | `error-008` | Short and soft |
| Toasts | Success / error and warning / info | `success` / `error` / `info` | `confirmation-003` / `error-008` / `question-003` | One place (`typedToast`) covers every toast that goes through it |
| Quick menu | Volume slider released | `tap` | `click-004` | Lets people hear the level they chose |

## Considered and left out

- **Hover.** Frequent, accidental, and meaningless on touch. Every guide treats it as silent by default.
- **Scrolling, typing, reading progress.** Constant or passive. A "you finished the post" chime would also fire without a gesture, so it would be blocked on some devices anyway.
- **Hero animation, the bouncing background logos, the mouse glow, the loader.** Decorative motion stays silent.
- **Admin.** A tool, not a place for personality.
- **The soundcn Warcraft collection and voice packs.** The repository says the Warcraft sounds belong to Blizzard and are for non-commercial reference use, even though the registry metadata labels them CC0. They don't belong on a site that is also a hiring page.

Ideas that would fit later, if wanted: a `jingles-nes-01` sting when a bouncing logo hits a corner or on the 404 page, `notification-pop` when a new guestbook entry appears, a `glitch-002` on the error boundary, and a `maximize`/`minimize` pair for expanding long guestbook messages.

## Adding or swapping a sound

Browse and audition at [soundcn.xyz](https://www.soundcn.xyz/). Then:

```bash
pnpm exec shadcn add @soundcn/click-003
mv apps/web/src/lib/click-003.ts packages/sounds/src/sounds/
```

The CLI puts every sound in `apps/web/src/lib/`; move it into `packages/sounds/src/sounds/`. The `@soundcn` registry is already in `components.json`. Then:

1. Import it in `packages/sounds/src/sounds/palette.ts` and point a cue at it, or add a name to `cueNames` in `packages/sounds/src/sound-cues.ts` and give it an entry (the `Record<CueName, Cue>` type makes a missing entry a compile error).
2. Use it with `playCue("name")` or `data-sound="name"`.
3. Update the sound map above.

To re-skin the whole site, only `palette.ts` changes.

Check the sound's license before using it. Everything currently installed is CC0 by Kenney.

## Tests

`packages/sounds/tests/sound-preferences.test.ts` covers the opt-in default, persistence, corrupt storage, volume clamping, and cross-tab sync. `packages/sounds/tests/sound-player.test.ts` covers silence before opt-in and before a gesture, the gain maths, cooldown, hidden tabs, enabling and disabling, and warming the palette.

## Sources

- [MDN: Autoplay guide for media and Web Audio APIs](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay)
- [Material Design: About sound](https://m2.material.io/design/sound/about-sound.html) and [Applying sound to UI](https://m2.material.io/design/sound/applying-sound-to-ui.html)
- [Apple HIG: Playing audio](https://developers.apple.com/design/human-interface-guidelines/patterns/playing-audio/)
- [UI Sound Design: The Complete Guide to Interface Sound Effects](https://uisfx.com/ui-sound-design)
- [userinterface.wiki: Sounds on the web](https://mintlify.wiki/raphaelsalaja/userinterface-wiki/audio/sounds-on-the-web)
- [soundcn](https://github.com/kapishdima/soundcn) and the [registry](https://soundcn.xyz/r/registry.json)
