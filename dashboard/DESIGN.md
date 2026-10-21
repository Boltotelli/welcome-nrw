---
name: NRW Player Dashboard 2.0
description: A warm, expressive daily Kingshot companion for NRW players.
colors:
  bg: "#10100f"
  surface: "#1c1c19"
  surface2: "#282822"
  ink: "#f8f5e9"
  muted: "#b9b7aa"
  line: "#3b3a32"
  gold: "#e0bd71"
  green: "#b4ce97"
  light-bg: "#f4f0e5"
  light-surface: "#fffdf6"
  light-surface2: "#eae5d7"
  light-ink: "#242820"
  light-muted: "#626455"
  light-line: "#d4cebc"
  light-gold: "#7d5919"
  light-green: "#426632"
typography:
  display:
    fontFamily: "NRW Interface, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(38px,4.7vw,66px)"
    fontWeight: 750
    lineHeight: 1.07
    letterSpacing: "-0.035em"
  display-emphasis:
    fontFamily: "Georgia, serif"
    fontWeight: 400
  section-title:
    fontSize: "25px"
    letterSpacing: "-0.025em"
  event-title:
    fontSize: "17px"
  mission:
    fontSize: "14px"
    lineHeight: 1.65
  guide-body:
    fontSize: "14px"
    lineHeight: 1.7
rounded:
  control: "8px"
  event: "12px"
  panel: "14px"
spacing:
  mobile-gutter: "18px"
  desktop-gutter: "32px"
  event-gap: "10px"
  desktop-columns: "36px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.bg}"
    rounded: "{rounded.control}"
    padding: "10px 14px"
  search-input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "10px 14px"
  event-card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.event}"
  daily-progress:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.panel}"
    padding: "23px 28px"
---

# Design System: NRW Player Dashboard 2.0

## Overview

**Creative North Star: "The Daily Alliance Companion"**

The player dashboard is a welcoming, expressive place to return to each day. Warm ink, ivory, NRW gold and a recognizable Kingshot character make it inviting; native task controls and an honest completion count keep the next action clear. The large greeting with italic serif emphasis is the deliberate expressive moment.

This document governs only `dashboard/`. It records the implemented player surface and its approved `BRIEF.md`; the root leadership `PRODUCT.md` and `DESIGN.md` remain separate references. It is an enhancement of the incumbent vanilla HTML/CSS/JS dashboard, retaining its event, calendar and profile sources, Bear optimizer, Discord entry and existing identity assets.

**Key Characteristics:**
- Warm contrast with gold tied to meaningful progress and status.
- A character-led greeting followed immediately by practical daily actions.
- Flat tonal surfaces, restrained corners and readable native controls.
- DE, EN and FR operation, with UTC dates and browser-local completion.

## Colors

The palette combines warm near-black and ivory with a single NRW gold accent; the ivory light theme preserves the same hierarchy.

### Primary
- **NRW Gold** (`gold`; `light-gold` in light mode) marks the greeting emphasis, task counts, timing and progress. The incumbent `brand` and `cyan` CSS variables alias this same accent; they do not introduce more hues.
- **Completion Green** (`green`; `light-green` in light mode) identifies the completed daily meter and current timing state.

### Neutral
- **Warm Ink Ground** (`bg`) is the dark page; **Ivory Ground** (`light-bg`) is the light page.
- **Panel** (`surface`) and **Inset** (`surface2`) separate information by tone rather than shadow; corresponding light tokens perform the same roles.
- **Reading Ink** (`ink`), **Quiet Copy** (`muted`) and **Divider** (`line`) provide the text and boundary hierarchy, with matching light variants.

**The Meaningful Gold Rule.** Keep gold attached to identity, progress, timing and useful status; do not turn every panel into a glowing highlight.

## Typography

**Display and Body Font:** Inter Variable, registered as `NRW Interface`, loaded from `../leitung/fonts/InterVariable.woff2` with `font-display: swap` and a system sans-serif fallback. The font supports weights 100–900.

**Display Emphasis:** Georgia italic, regular weight. It appears in the greeting rather than in task instructions. Body line-height is 1.5; paragraphs are capped at 75ch. Headings use balanced wrapping and tight tracking. Counters and UTC times use tabular numerals.

### Hierarchy
- **Display:** the frontmatter display role applies on desktop; the intermediate layout uses 48px. Mobile uses `clamp(35px,7.5vw,48px)`; compact mode uses 42px desktop and 32px mobile.
- **Section title:** daily-plan headings use the section-title role; the guide heading uses 28px, reducing to 25px on mobile.
- **Event title:** the event-title role reduces to 15px on mobile.
- **Mission:** the mission role reduces to 13px on mobile, preserving its generous line-height.
- **Guide body:** the guide-body role is retained in detail views, including wrapping of long source content.
- **Quiet labels:** timing and source labels use 10–12px and muted text. These support visible instructions rather than replacing them.

## Layout

The top bar is bounded at 1400px; main content and footer at 1300px. Main gutters use the desktop-gutter token, reducing to mobile-gutter below 760px. The desktop content grid pairs a flexible task column with a 290px roadmap and the desktop-columns gap. At 1100px, the roadmap becomes 245px and the gap 24px; at 760px, it stacks below the tasks.

The greeting occupies a 290px minimum desktop band. Yang sits between the text and UTC date block, with clipping constrained to the greeting. The portrait scales down through the intermediate and mobile layouts, where the date becomes inline beneath the greeting. It is decorative and has empty alternative text. Retain the NRW crest and the existing portrait URL `https://kingshotdata.com/uploads/2026/02/yang-full-image.webp`; no generated bitmap assets are introduced.

The guide library is three columns on desktop, two below 1100px and one below 760px. Search and filter also stack on mobile. The library remains accessible through the main navigation in both full and compact modes. On mobile the Server Laws link moves into player navigation. Full/Compact buttons expose their selection with `aria-pressed` and persist using `nrw_player_view_v2`. Compact mode emphasizes actionable work, opens tomorrow's area and provides an explicit control to reveal additional sections.

## Elevation & Depth

Surfaces are flat: the player theme sets `--shadow: none`, removes ambient effects and uses tonal changes and thin dividers. Priority recommendations are divided rows rather than another nested card grid. Native focus outlines remain visually prominent: 3px gold with a 4px offset. No elevation is required for emphasis.

## Shapes

Controls use the control radius, event cards and guide groups use the event radius, and daily/profile panels use the panel radius. The progress track is a slim 7px bar with fully rounded ends. Task checkboxes retain the browser's native appearance at 20px square, with gold accent; avoid replacing them with ornamental controls.

## Components

### Navigation and controls

Provide semantic anchor navigation, a keyboard-visible skip link to the daily plan, labeled search/filter/theme controls and visible focus states. Guide rows are real buttons. Opening a guide focuses its return button; returning restores focus to the originating guide. Native details/summary elements retain keyboard disclosure behavior. Theme and language controls remain in the top bar.

### Daily progress and event tasks

The daily panel uses a native progress element plus a visible completed/total count. Checking an eligible task updates the count, strikes through its text and announces progress through a live region. The full-plan celebration appears only when the eligible daily total is complete; an event with no remaining tasks says only that this event is complete.

Completion keys include event ID, UTC date and canonical instruction identity, scoped to the browser. Progress resets with the UTC day rather than the user's local midnight. If storage is unavailable, keep the controls usable for the visit and explain the limited persistence. Tasks for another day are not checkable. Confirmed timing controls eligibility; unknown leadership prose remains informational, and leadership overrides suppress automatic timing. Do not infer event windows or executable actions from prose.

Gold progress advances over 0.3s with ease-out. Reduced-motion mode disables transitions, animation and smooth scrolling. Completion feedback is the motion signature; there is no ambient motion layer.

### Guide library

Search matches existing event names and translations without accents; the filter distinguishes detailed guides from catalog entries. Results are deduplicated from the incumbent guide database. The detail view renders existing structured rules, limits, phases and source links. Label catalog-only records honestly and provide clear no-results and load-failure copy. Keep guidance in its existing single source; task metadata identifies actions and confirmed timing rather than creating competing instruction text.

### Alliance notice and fallback

The general notice uses an inset-tone panel and gold heading. Show published, unexpired text only. Attempt the selected language first, then DE → EN → FR; explicitly identify a language fallback. On notice failure show a retry action while leaving the daily plan usable. Partial event-data failure and guide failure have visible explanatory states. No new vendor APIs are introduced by this surface; the notice uses the existing leadership service.

### Retained player tools

Keep calendar calculations, profile behavior, Bear timing/optimizer, existing hero material and Discord entry integrated with the player theme. This document records no changes to their underlying data contracts or gameplay rules.

## Do's and Don'ts

### Do:
- Do preserve the crest, existing hero imagery and loaded Inter font.
- Do keep daily actions and guide access readable in both view modes and all three languages.
- Do use native checkbox, progress, button and disclosure semantics with visible keyboard focus.
- Do distinguish per-event completion from completion of the entire daily plan.
- Do keep guide content in its incumbent source and timing tied to confirmed UTC data.

### Don't:
- Don't apply this player contract to the separate leadership surface.
- Don't invent progress, timing windows or executable tasks from unknown leadership prose.
- Don't reintroduce ambient glows, shadow-heavy cards or decorative motion.
- Don't imply cross-device completion sync or successful live deployment from local checks.

Evidence supplied by the implementation workflow: `outputs/player-dashboard-2/after-1440.png`, `after-390.png`, `light-360.png`, `daily-desktop.png`, `daily-mobile.png` and `guides-mobile.png`. These are local review evidence, not proof of publication.
