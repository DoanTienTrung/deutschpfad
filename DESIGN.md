---
name: DeutschPfad
description: A warm, disciplined study companion for Vietnamese learners on the path to German certification, built as a Leitner card box.
colors:
  pappe: "oklch(0.83 0.04 72)"
  karteikarte: "oklch(0.99 0.006 85)"
  karteikarte-innen: "oklch(0.965 0.01 80)"
  bleistift: "oklch(0.22 0.018 70)"
  bleistift-tief: "oklch(0.15 0.014 70)"
  radiert: "oklch(0.43 0.014 70)"
  hauch: "oklch(0.53 0.014 70)"
  linie: "oklch(0.88 0.028 245)"
  kante: "oklch(0.6 0.03 70)"
  kopfzeile: "oklch(0.7 0.11 25)"
  reiter: "oklch(0.75 0.15 70)"
  aufstieg: "oklch(0.49 0.13 188)"
  rotstift: "oklch(0.55 0.19 25)"
  tinte: "oklch(0.47 0.11 275)"
typography:
  display:
    fontFamily: "Fira Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 3vw, 2.75rem)"
    fontWeight: 600
    lineHeight: 1.1
  title:
    fontFamily: "Fira Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  hand:
    fontFamily: "Patrick Hand, cursive"
    fontSize: "1.0625rem"
    fontWeight: 400
rounded:
  karte: "3px"
  reiter: "8px"
  rund: "9999px"
components:
  button-primary:
    backgroundColor: "{colors.bleistift}"
    textColor: "{colors.karteikarte}"
    rounded: "{rounded.karte}"
  button-secondary:
    backgroundColor: "{colors.karteikarte}"
    textColor: "{colors.bleistift}"
    rounded: "{rounded.karte}"
  streak-tab:
    backgroundColor: "{colors.reiter}"
    textColor: "{colors.bleistift}"
    rounded: "{rounded.reiter}"
---

# Design System: DeutschPfad

## 1. Overview

**Creative North Star: "The Leitner Card Box"**

Spaced repetition was born as Sebastian Leitner's index-card box, and DeutschPfad is built as one. The page is the cardboard desk the box sits on; every panel is a German *Karteikarte* (ivory card, faint blue rules, a red header line); text is graphite pencil; the amber divider tab marks what the learner has earned. A correct answer moves a card up a compartment, a wrong one sends it back to compartment 1: nothing more dramatic than that. The interface stays calm and out of the way of the German, and softens the discipline of daily review with encouragement.

The dark scene is the same box at night: **black lacquer**. The desk is near-black, cards are lacquered one step lighter with a soft lamp reflection across their top edge, ivory text, and amber as the only warm light. Dark is a different scene, never "light mode inverted".

It still rejects both failure modes from before: the cold grey test portal, and Duolingo-style gamification. The mascot **Chậm** (see Components) stays rare and calm.

**Key characteristics**
- One token file is the single source of truth: `frontend/src/styles/tokens.css`. Token names come from the metaphor, never from colours.
- Cards sit on a darker desk so they lift without heavy shadows; nested cards lighten themselves automatically.
- Graphite carries actions; amber is spent only on earned moments; red pencil marks mistakes; blue ink is for notes.
- One import gate for UI: `import { Button, Card } from '@kit'`. A lint gate blocks anything that bypasses it.

## 2. Colors

All values live in `tokens.css` (`:root` for the day scene, `:root[data-theme="dark"]` for the night scene, same names). Tailwind classes are generated from them in `src/index.css` (`bg-karteikarte`, `text-radiert`, `border-kante`...). The default Tailwind palette is removed, so `bg-blue-500` produces no CSS.

| Role | Token | Notes |
|---|---|---|
| Desk (page background) | `pappe`, `pappe-dunkel` | Darker than cards so cards stand out. `pappe-dunkel` is the hard offset shadow of buttons. |
| Card / nested card | `karteikarte`, `karteikarte-innen` | Nested cards and sunken trays use `-innen`. |
| Text: main / secondary / faint | `bleistift`, `radiert`, `hauch` | All reach 4.5:1 on cards in both scenes. `hauch` only on cards. |
| Text on graphite | `bleistift-invers` | Primary button label. |
| Rules: light / strong / card edge | `linie`, `kante`, `kartenrand` | `kante` reaches 3:1 (input borders). `kartenrand` is crisp by day, sinks into shadow at night. |
| Card header line | `kopfzeile` | Decorative red rule under card titles, lighter than error red. |
| Emphasis (earned only) | `reiter`, `reiter-soft`, `reiter-tief`, `reiter-beschriftung` | Streaks, mastered topics, reached goals. Label text on amber is always dark. |
| Correct / wrong / info | `aufstieg`, `rotstift`, `tinte` + `-soft` | Solid text on its own `-soft` background reaches 4.5:1. |
| Noun gender | `reiter-der/die/das` + `-soft` | Blue / pink / green tabs, as German pupils colour their cards. |
| Mastery compartments | `fach-1` ... `fach-4` | Four real mastery stages, one teal family, light to dark (reversed at night). |
| Overlays | `schleier`, `foto-etikett`, `foto-etikett-schrift` | Dialog scrim; labels on top of photos and video. |

### Named Rules
**The One Warm Color Rule.** Amber (`reiter`) appears only where the learner has earned something. On static chrome it is wrong. Info is blue ink (`tinte`), never amber.

**The Metaphor Naming Rule.** No token is named after a colour (`--gray-100`, `--red-500`). Missing a value? Add a token, never a one-off value at the call site.

**Night is a different scene.** Dark mode is black lacquer under a desk lamp: near-neutral black desk, cards one step lighter with a top sheen (`--lampenlicht`), stacked-card edges hidden, amber kept vivid as the only warm light.

## 3. Typography

- **Display / titles:** Fira Sans (`font-display`), 600.
- **UI and reading:** Inter (`font-sans`), body 1rem / 1.6, prose capped near 70ch.
- **Handwritten notes:** Patrick Hand (`font-hand`), only for margin notes.
- Sizes only from the Tailwind scale `text-xs` ... `text-5xl`; weights only normal / medium / semibold / bold.
- Inputs are always 16px on phones so iOS Safari does not zoom.

**The No-Shout Rule.** Display size never exceeds `clamp(1.75rem, 3vw, 2.75rem)`.

## 4. Elevation, shape, texture

- **Shadows (3 roles):** `shadow-lift` (by day a second card peeking out behind, by night a soft drop plus a top highlight), `shadow-pop` (dialogs, menus, toasts), `shadow-offset` (hard offset under buttons; pressing a button flattens it).
- **Radius (3 steps):** `rounded-karte` 3px for cards, inputs, buttons; `rounded-reiter` 8px for tabs and chips; `rounded-rund` for dots and avatars.
- **Textures:** `textur-pappe` (cardboard fibres by day; lamp reflection plus fine grain at night), `textur-linien` (ruled lines on cards), `lampenlicht` (card sheen at night).
- **Page widths:** `max-w-seite` (64rem, hubs and lists), `max-w-lesen` (48rem, reading and exercises).
- **Layers:** `z-nav < z-panel < z-sheet < z-modal < z-popover < z-toast`.

**Nested cards lighten themselves.** A `Card` inside a `Card` automatically drops its shadow, switches to `karteikarte-innen` and a light rule (CSS rule on `[data-card] [data-card]`).

## 5. Components

Everything is in `frontend/src/components/kit` and imported only through `@kit`. The live catalogue is the dev-only route `/design` (every component, variant and state, light/dark switch, texture switch).

- **Basics:** Button (primary, secondary, ghost, danger; sm; icon; loading), IconButton (label required), ButtonLink, TextLink, Spinner.
- **Forms:** Field (label, hint, error wired to aria), Input (password toggle built in), SearchInput, Textarea, NativeSelect, Select, Checkbox, Radio, Switch, Slider, FileInput.
- **Layout and display:** PageHeader, SectionHeader, Card (default, sunken, highlight, dashed; optional title with header line), Tag, Badge, Stat, ProgressBar, Table, Divider, Avatar, Tooltip.
- **Feedback:** Note (info, ok, emph, bad), EmptyState, Skeleton family, Toast (`useToast`).
- **Clickable surfaces:** CardButton, RowButton, SettingRow, Disclosure, Chip, Fab.
- **Overlays:** Dialog, ConfirmDialog, BottomSheet, Drawer (native `<dialog>`), DropdownMenu, Popover.
- **Navigation:** Tabs (divider-tab shape), Segmented, Stepper, NavItem, Pagination, Breadcrumb.
- **DeutschPfad domain:** ReviewCard (flip card), GenderTag and Article, StreakTab, AnswerOption, AnswerFeedback ("card moves up / back to compartment 1"), QuestionNav, BlankInput (cloze gap), LeitnerBox (four compartments).

Every component: forwardRef where it wraps an element, `className` merged with `cn()`, one focus ring (`outline-fokus`), 44px touch targets on phones, complete disabled/loading/error states.

### Mascot: Chậm the Sloth
A sloth reframed as "unhurried and steady", the visual echo of spaced repetition. Drawn in the system's own language (flat shapes, graphite lines, one amber detail). Appears only in empty states, error pages and big streak milestones; never a floating helper, never nagging. Voice: "Từng bước một, không cần vội."

## 6. Guardrails

`npm run lint` runs ESLint and `tools/ui-gate.mjs` (also in CI). The gate blocks, with `file:line` and the reason: hex/rgb colours, arbitrary `bg-[`/`text-[`/`border-[`/`rounded-[`/`shadow-[` values, off-scale font weights, default Tailwind palette, deprecated token names, raw `<input>/<select>/<textarea>/<button>`, hand-made dialogs (`role="dialog"`, `fixed inset-0`), UI imports outside `@kit`, emoji used as icons. A whole file can be exempted only with `// ui-gate-ignore-file: <reason>` (used once: the Google logo keeps Google's brand colours).

Accessibility switches on the profile page: reduced motion (`data-motion="reduce"`, also follows the OS) and high contrast (`data-contrast="high"`: secondary text and all rules become as strong as main text).

### Renamed tokens (old name, now blocked by the gate)
| Old | New |
|---|---|
| canvas (page) / text-canvas | page uses `pappe` on body; `text-bleistift-invers` |
| surface / card | `karteikarte-innen` / `karteikarte` |
| ink / muted | `bleistift` / `radiert` (placeholder: `hauch`) |
| hairline | `linie` (dividers), `kante` (inputs), `kartenrand` (card edges) |
| primary / primary-deep | `bleistift` / `bleistift-tief` (focus: `fokus`) |
| accent / accent-deep | `reiter` / `reiter-tief` |
| danger(-bg) / success(-bg) | `rotstift(-soft)` / `aufstieg(-soft)` |
| der / die / das, m1-m4, bar-muted | `reiter-der/die/das`, `fach-1`...`fach-4`, `kante/45` |
| shadow-lifted / shadow-floating | `shadow-lift` / `shadow-pop` |
| rounded-sm/md/lg/xl, rounded-full | `rounded-karte`, `rounded-rund` |

## 7. Do's and Don'ts

**Do**
- Reach for a token or a kit component first; add a token when one is missing.
- Keep amber for earned moments only.
- Let correct/wrong read as a card moving between compartments, not as an alarm.
- Keep Chậm rare and calm.

**Don't**
- Don't introduce a second saturated brand colour (blue primaries were rejected twice).
- Don't use side-stripe borders, gradient text or glassmorphism as decoration.
- Don't use emoji as icons; use lucide-react.
- Don't hand-style a `<button>` or build a modal with `fixed inset-0`.
