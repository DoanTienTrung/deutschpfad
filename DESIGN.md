---
name: DeutschPfad
description: A warm, disciplined study companion for Vietnamese learners on the path to German certification.
colors:
  primary: "oklch(0.22 0.014 70)"
  primary-deep: "oklch(0.15 0.014 70)"
  accent: "oklch(0.75 0.15 70)"
  accent-deep: "oklch(0.62 0.16 68)"
  bg: "oklch(0.995 0.004 70)"
  surface: "oklch(0.97 0.012 70)"
  ink: "oklch(0.22 0.018 70)"
  muted: "oklch(0.55 0.014 70)"
  border: "oklch(0.88 0.014 70)"
  danger: "oklch(0.55 0.19 25)"
  danger-bg: "oklch(0.96 0.03 25)"
typography:
  display:
    fontFamily: "Fira Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 3vw, 2.75rem)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Fira Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.005em"
  title:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "0.01em"
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.bg}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.primary-deep}"
    rounded: "{rounded.md}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  input-field:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "10px 14px"
  streak-badge:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "4px 12px"
---

# Design System: DeutschPfad

## 1. Overview

**Creative North Star: "The Study Companion"**

DeutschPfad should feel like sitting at a good tutor's desk: warm lamp light, an open notebook, someone who keeps you moving without ever making you feel behind. The system exists to serve daily, often rushed study sessions — a commute, a lunch break, ten minutes before bed — so it stays out of the way of the actual German. Where the work is disciplined (SRS review, exam simulation, grading), the interface should soften that discipline with encouragement rather than add to its weight.

This explicitly rejects the cold, bureaucratic test-portal look (grey forms, harsh red errors, no personality) and the opposite failure mode — Duolingo-style mascot gamification that trivializes exam-stakes prep. A near-black Graphite primary stays quiet and out of the way — it reads as calm and confident rather than competing with content; the warm amber accent, used sparingly for streaks and milestones, is the one place the system allows itself to celebrate. This pairing (a neutral, almost-monochrome primary against a single warm accent) was chosen after two rounds of trying a blue primary (a teal-leaning hue, then a Prussian-Blue-leaning hue) both read as visually loud against the amber — a near-black primary sidesteps that clash entirely by not competing with amber's warmth at all.

**Key Characteristics:**
- Warm-tinted white product surface (all neutrals share the accent's hue at low chroma) — the brand's warmth lives in the accent color and this shared undertone, not a separate palette.
- One confident near-black primary carrying navigation, primary actions, and links — quiet by design, not a second competing color.
- Amber accent reserved for earned moments: streaks, completed reviews, level-ups.
- Rounded, tactile components — soft corners and a satisfying hover lift, never sharp or clinical.
- Generous line-height and body sizing: this is a text- and audio-heavy app, legibility is non-negotiable.

## 2. Colors

A restrained palette: one primary carries identity, one accent is spent deliberately on motivation moments, everything else is a quiet warm-neutral scale sharing the accent's own hue.

### Primary
- **Graphite** (oklch(0.22 0.014 70)): primary buttons, active nav state, links, focus rings, progress bars. Carries the brand on every screen. Near-black rather than a second brand color, so it never competes with Ember Amber for attention.
- **Graphite Deep** (oklch(0.15 0.014 70)): hover/active state for primary elements.

### Secondary
- **Ember Amber** (oklch(0.75 0.15 70)): streak counters, "reviewed today" badges, level-up moments, correct-answer flourish in flashcards. Never used for standard UI chrome — its rarity is what makes it feel earned.
- **Ember Amber Deep** (oklch(0.62 0.16 68)): hover/active state for amber elements, and the color for amber-on-light text pairings where a filled amber pill would read too shouty.

### Neutral
- **Paper** (oklch(0.995 0.004 70)): app background. Carries the faintest warmth from the accent's own hue rather than staying perfectly achromatic — enough to feel chosen, not enough to read as tinted/cream.
- **Whisper Surface** (oklch(0.97 0.012 70)): card and panel backgrounds, pulled toward the same warm hue as the background and accent.
- **Ink** (oklch(0.22 0.018 70)): body text and headings. Nearly the same value as Graphite (primary) — text and primary UI intentionally sit in the same quiet near-black register.
- **Quiet Ink** (oklch(0.55 0.014 70)): secondary/muted text — timestamps, helper copy, placeholder text.
- **Hairline** (oklch(0.88 0.014 70)): borders, dividers, input strokes.
- **Signal Red** (oklch(0.55 0.19 25)) / **Signal Red Bg** (oklch(0.96 0.03 25)): errors only — form validation, failed submissions. Never decorative.

### Named Rules
**The One Warm Color Rule.** Ember Amber appears only where the user has *earned* something (a streak, a completed review, a level milestone). If it shows up on a static piece of chrome, it's being used wrong.

**The Shared-Hue Neutral Rule.** Background, surface, and ink neutrals all carry the same low-chroma warm hue as Ember Amber, instead of staying perfectly achromatic — that shared undertone is what makes the whole palette read as one considered system rather than grey UI plus one accent color bolted on.

## 3. Typography

**Display Font:** Fira Sans (with ui-sans-serif, system-ui fallback)
**Body Font:** Inter (with system-ui fallback)

**Character:** Fira Sans's slightly condensed, structured forms carry headlines and streak numbers with quiet confidence; Inter underneath keeps dense study content — vocabulary lists, exam instructions, form fields — crisp and highly legible at small sizes, with full Vietnamese and German diacritic support.

### Hierarchy
- **Display** (600, `clamp(1.75rem, 3vw, 2.75rem)`, 1.1): dashboard greeting, page-level headers ("Chào mừng trở lại"), streak count hero number.
- **Headline** (600, 1.375rem, 1.25): section headers within a page (deck titles, exam section names).
- **Title** (600, 1.125rem, 1.4): card titles, flashcard front text, form section labels.
- **Body** (400, 1rem, 1.6, max 70ch): reading passages, exam instructions, form helper text. Line height stays generous — this app is read on the go.
- **Label** (500, 0.8125rem, 1.3, +0.01em): form field labels, tag/topic chips, timestamps.

### Named Rules
**The No-Shout Rule.** Display size never exceeds `clamp(1.75rem, 3vw, 2.75rem)` — this is a study tool, not a landing page; nothing needs hero-scale type.

## 4. Elevation

Flat by default, elevation used only to signal interactivity or temporary layering. Cards rest on the Whisper Surface tone rather than a shadow; shadows are reserved for elements that float above the page flow (dropdowns, modals, the flashcard mid-flip state).

### Shadow Vocabulary
- **Resting** (none): cards, list items, static content use tonal contrast (Whisper Surface on Paper), not shadow.
- **Lifted** (`box-shadow: 0 2px 8px oklch(0.22 0.018 70 / 0.08)`): hover state on interactive cards and buttons — a soft, close lift, not a dramatic drop.
- **Floating** (`box-shadow: 0 12px 32px oklch(0.22 0.018 70 / 0.14)`): modals, dropdown menus, the popover for OAuth/account actions.

### Named Rules
**The Tonal-First Rule.** Reach for a Whisper Surface background before reaching for a shadow. Shadow is for things that temporarily float above the page, not for everyday cards.

## 5. Components

Tactile and encouraging: soft corners, a gentle lift on hover, focus states that feel like a nudge rather than an alarm.

### Buttons
- **Shape:** rounded-md (8px)
- **Primary:** Graphite background, Paper text, 12px/24px padding, font-weight 600. Used for the one primary action per screen (submit, start review, continue).
- **Hover / Focus:** background shifts to Graphite Deep, 2px lift (`translateY(-1px)`) with the Lifted shadow, 160ms ease-out-quart transition. Focus-visible adds a 2px Graphite ring offset 2px from the element.
- **Secondary:** Whisper Surface background, Ink text, same radius/padding — used for cancel, secondary navigation.
- **Ghost:** transparent background, Graphite text, underline on hover — used for tertiary/inline actions ("Quên mật khẩu?").

### Chips
- **Topic chips** (Studium, Bewerbung, Gesundheit, Behörden): Whisper Surface background, Ink text, Hairline border, rounded-pill. Selected state fills with Graphite at low opacity (12%) and Graphite Deep text.
- **Streak / earned badges:** Ember Amber background, Ink text (not white — Amber at this lightness reads better with dark text per its L/chroma), rounded-pill, small flame/star icon inline.

### Cards / Containers
- **Corner Style:** rounded-lg (12px) for deck/flashcard cards, rounded-md (8px) for smaller list items.
- **Background:** Whisper Surface on Paper page background.
- **Shadow Strategy:** flat at rest; Lifted shadow on hover for anything clickable (deck cards, dashboard tiles).
- **Border:** none at rest; a 1px Graphite border appears only on the active/focused flashcard.
- **Internal Padding:** 24px (lg) for deck cards, 16px (md) for list rows.

### Inputs / Fields
- **Style:** Paper background, 1px Hairline border, rounded-sm (6px), 10px/14px padding.
- **Focus:** border shifts to Graphite, 2px Graphite ring at 20% opacity outside the border (no harsh browser default outline).
- **Error / Disabled:** border and helper text shift to Signal Red on a Signal Red Bg helper banner beneath the field; disabled state drops to Quiet Ink text at 60% opacity with no hover affordance.

### Navigation
- Top nav on Paper with a Hairline bottom border; active route uses Graphite/12% fill with Graphite Deep text. Mobile collapses the side nav into a drawer opened from a hamburger button, given the primary use context is short mobile sessions.

### Streak Indicator (signature component)
A small pill in the dashboard header: Ember Amber fill, Ink text, flame icon, current streak count in Label type. This is the one place in the whole system where the amber accent is allowed to be the loudest thing on screen — reinforcing "The One Warm Color Rule."

## 6. Do's and Don'ts

### Do:
- **Do** let the near-black Graphite primary stay quiet — it should never compete visually with Ember Amber.
- **Do** reserve Ember Amber for earned moments only: streaks, completed reviews, level milestones.
- **Do** use generous body line-height (1.6) and cap prose at ~70ch — this is a reading- and instruction-heavy app used on the go.
- **Do** give every interactive element a soft hover lift and a visible, non-alarming focus ring.

### Don't:
- **Don't** introduce a second saturated brand color (a blue primary was tried twice and rejected both times for clashing with amber) — the near-black + amber pairing is the deliberate, settled choice.
- **Don't** use Ember Amber as decoration on static chrome (nav bars, default card borders) — if it's not marking something earned, it's misused.
- **Don't** default to a Duolingo-style mascot/gamification tone — this product is exam-stakes serious, softened by warmth, not trivialized by playfulness.
- **Don't** use border-left/border-right color stripes as an accent on cards or list items.
- **Don't** use gradient text or glassmorphism as decoration.
- **Don't** let display type exceed the `clamp(1.75rem, 3vw, 2.75rem)` ceiling — there is no landing-page hero here.
