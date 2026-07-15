---
name: DeutschPfad
description: A warm, disciplined study companion for Vietnamese learners on the path to German certification.
colors:
  primary: "oklch(0.58 0.14 202)"
  primary-deep: "oklch(0.48 0.13 202)"
  accent: "oklch(0.75 0.15 70)"
  accent-deep: "oklch(0.62 0.16 68)"
  bg: "oklch(1.00 0.000 0)"
  surface: "oklch(0.97 0.006 202)"
  ink: "oklch(0.22 0.02 202)"
  muted: "oklch(0.55 0.01 202)"
  border: "oklch(0.88 0.01 202)"
  danger: "oklch(0.55 0.19 25)"
  danger-bg: "oklch(0.96 0.03 25)"
typography:
  display:
    fontFamily: "Outfit, ui-rounded, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 3vw, 2.75rem)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Outfit, ui-rounded, system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.005em"
  title:
    fontFamily: "Karla, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Karla, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Karla, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "0.01em"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
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

This explicitly rejects the cold, bureaucratic test-portal look (grey forms, harsh red errors, no personality) and the opposite failure mode — Duolingo-style mascot gamification that trivializes exam-stakes prep. The confident blue-teal primary reads as competence; the warm amber accent, used sparingly for streaks and milestones, is the one place the system allows itself to celebrate.

**Key Characteristics:**
- Clean white product surface — the brand's warmth lives in primary + accent, not in a tinted background.
- One confident primary color carrying navigation, primary actions, and links.
- Amber accent reserved for earned moments: streaks, completed reviews, level-ups.
- Rounded, tactile components — soft corners and a satisfying hover lift, never sharp or clinical.
- Generous line-height and body sizing: this is a text- and audio-heavy app, legibility is non-negotiable.

## 2. Colors

A restrained palette: one primary carries identity, one accent is spent deliberately on motivation moments, everything else is a quiet white-and-ink neutral scale.

### Primary
- **Study Blue** (oklch(0.58 0.14 202)): primary buttons, active nav state, links, focus rings, progress bars. Carries the brand on every screen.
- **Study Blue Deep** (oklch(0.48 0.13 202)): hover/active state for primary elements.

### Secondary
- **Ember Amber** (oklch(0.75 0.15 70)): streak counters, "reviewed today" badges, level-up moments, correct-answer flourish in flashcards. Never used for standard UI chrome — its rarity is what makes it feel earned.
- **Ember Amber Deep** (oklch(0.62 0.16 68)): hover/active state for amber elements, and the color for amber-on-light text pairings where a filled amber pill would read too shouty.

### Neutral
- **Paper White** (oklch(1.00 0.000 0)): app background. Pure, no hidden warmth — the warmth is carried by Study Blue and Ember Amber, not the canvas.
- **Whisper Surface** (oklch(0.97 0.006 202)): card and panel backgrounds, subtly pulled toward the primary hue.
- **Ink** (oklch(0.22 0.02 202)): body text and headings. Carries a whisper of the brand hue rather than pure black.
- **Quiet Ink** (oklch(0.55 0.01 202)): secondary/muted text — timestamps, helper copy, placeholder text.
- **Hairline** (oklch(0.88 0.01 202)): borders, dividers, input strokes.
- **Signal Red** (oklch(0.55 0.19 25)) / **Signal Red Bg** (oklch(0.96 0.03 25)): errors only — form validation, failed submissions. Never decorative.

### Named Rules
**The One Warm Color Rule.** Ember Amber appears only where the user has *earned* something (a streak, a completed review, a level milestone). If it shows up on a static piece of chrome, it's being used wrong.

**The Pure Canvas Rule.** Background stays pure white (oklch(1 0 0)) with zero chroma. Every visual signal of warmth comes from Study Blue and Ember Amber, never from tinting the canvas itself.

## 3. Typography

**Display Font:** Outfit (with ui-rounded, system-ui fallback)
**Body Font:** Karla (with system-ui fallback)

**Character:** Outfit's rounded geometric forms carry warmth into headlines and streak numbers without sacrificing structure; Karla underneath keeps dense study content — vocabulary lists, exam instructions, form fields — crisp, a little quirky, and legible at small sizes, with full Vietnamese and German diacritic support. The pairing gives contrast (geometric display vs. humanist body) rather than two similar sans-serifs competing, and avoids the Inter/Roboto/Geist default that most AI-generated UIs converge on.

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
- **Resting** (none): cards, list items, static content use tonal contrast (Whisper Surface on Paper White), not shadow.
- **Lifted** (`box-shadow: 0 2px 8px oklch(0.22 0.02 202 / 0.08)`): hover state on interactive cards and buttons — a soft, close lift, not a dramatic drop.
- **Floating** (`box-shadow: 0 12px 32px oklch(0.22 0.02 202 / 0.14)`): modals, dropdown menus, the popover for OAuth/account actions.

### Named Rules
**The Tonal-First Rule.** Reach for a Whisper Surface background before reaching for a shadow. Shadow is for things that temporarily float above the page, not for everyday cards.

## 5. Components

Tactile and encouraging: soft corners, a gentle lift on hover, focus states that feel like a nudge rather than an alarm.

### Buttons
- **Shape:** rounded-md (12px)
- **Primary:** Study Blue background, Paper White text, 12px/24px padding, font-weight 600. Used for the one primary action per screen (submit, start review, continue).
- **Hover / Focus:** background shifts to Study Blue Deep, 2px lift (`translateY(-1px)`) with the Lifted shadow, 160ms ease-out-quart transition. Focus-visible adds a 2px Study Blue ring offset 2px from the element.
- **Secondary:** Whisper Surface background, Ink text, same radius/padding — used for cancel, secondary navigation.
- **Ghost:** transparent background, Study Blue text, underline on hover — used for tertiary/inline actions ("Quên mật khẩu?").

### Chips
- **Topic chips** (Studium, Bewerbung, Gesundheit, Behörden): Whisper Surface background, Ink text, Hairline border, rounded-pill. Selected state fills with Study Blue at low opacity (12%) and Study Blue Deep text.
- **Streak / earned badges:** Ember Amber background, Ink text (not white — Amber at this lightness reads better with dark text per its L/chroma), rounded-pill, small flame/star icon inline.

### Cards / Containers
- **Corner Style:** rounded-lg (16px) for deck/flashcard cards, rounded-md (12px) for smaller list items.
- **Background:** Whisper Surface on Paper White page background.
- **Shadow Strategy:** flat at rest; Lifted shadow on hover for anything clickable (deck cards, dashboard tiles).
- **Border:** none at rest; a 1px Study Blue border appears only on the active/focused flashcard.
- **Internal Padding:** 24px (lg) for deck cards, 16px (md) for list rows.

### Inputs / Fields
- **Style:** Paper White background, 1px Hairline border, rounded-sm (8px), 10px/14px padding.
- **Focus:** border shifts to Study Blue, 2px Study Blue ring at 20% opacity outside the border (no harsh browser default outline).
- **Error / Disabled:** border and helper text shift to Signal Red on a Signal Red Bg helper banner beneath the field; disabled state drops to Quiet Ink text at 60% opacity with no hover affordance.

### Navigation
- Top nav on Paper White with a Hairline bottom border; active route uses Study Blue text with a 2px Study Blue underline. Mobile collapses to a bottom tab bar (Home/Streak, Decks, Exam, Profile) given the primary use context is short mobile sessions.

### Streak Indicator (signature component)
A small pill in the dashboard header: Ember Amber fill, Ink text, flame icon, current streak count in Label type. This is the one place in the whole system where the amber accent is allowed to be the loudest thing on screen — reinforcing "The One Warm Color Rule."

## 6. Do's and Don'ts

### Do:
- **Do** keep the page background pure white (oklch(1 0 0)) — warmth comes from Study Blue and Ember Amber, never from a tinted canvas.
- **Do** reserve Ember Amber for earned moments only: streaks, completed reviews, level milestones.
- **Do** use generous body line-height (1.6) and cap prose at ~70ch — this is a reading- and instruction-heavy app used on the go.
- **Do** give every interactive element a soft hover lift and a visible, non-alarming focus ring.

### Don't:
- **Don't** tint the background toward warm/cream "for coziness" — that's the cold-bureaucratic-portal's opposite failure and it isn't this brand's warmth strategy; warmth lives in the two brand colors.
- **Don't** use Ember Amber as decoration on static chrome (nav bars, default card borders) — if it's not marking something earned, it's misused.
- **Don't** default to a Duolingo-style mascot/gamification tone — this product is exam-stakes serious, softened by warmth, not trivialized by playfulness.
- **Don't** use border-left/border-right color stripes as an accent on cards or list items.
- **Don't** use gradient text or glassmorphism as decoration.
- **Don't** let display type exceed the `clamp(1.75rem, 3vw, 2.75rem)` ceiling — there is no landing-page hero here.
