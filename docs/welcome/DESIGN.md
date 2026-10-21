---
name: Welcome NRW
description: A paper invitation to an international Kingshot alliance
colors:
  bg: "#f3efe5"
  bg2: "#e9e2d4"
  surface: "#faf7ef"
  surface2: "#e9e2d4"
  ink: "#292b24"
  muted: "#5c6052"
  line: "#c9c6b8"
  brand: "#73541e"
  brand2: "#73541e"
  gold: "#d3b375"
  cyan: "#73541e"
  green: "#34664a"
  rose: "#993d35"
  dark-bg: "#171b18"
  dark-bg2: "#212721"
  dark-surface: "#222823"
  dark-surface2: "#2c332b"
  dark-ink: "#f3efe5"
  dark-muted: "#c0c3b6"
  dark-line: "#4c5548"
  dark-brand: "#dfc185"
  dark-green: "#a0d0a8"
  dark-rose: "#f2aaa0"
  forest: "#344032"
  forest-ink: "#fff8e7"
  parchment: "#e4cc94"
  parchment-ink: "#2b2d22"
typography:
  display:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(48px,5.8vw,84px)"
    fontWeight: 650
    lineHeight: 1.02
    letterSpacing: "-.04em"
  headline:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(34px,4.1vw,58px)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-.035em"
  title:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-.025em"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "16px"
    lineHeight: 1.6
rounded:
  square: "0"
  circular: "50%"
spacing:
  section: "100px"
  section-phone: "64px"
  path-gap: "10px"
  contact-gap: "32px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.bg}"
    rounded: "{rounded.square}"
    padding: "12px 20px"
  button-soft:
    backgroundColor: "{colors.surface2}"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
    padding: "12px 20px"
  member-path:
    backgroundColor: "{colors.forest}"
    textColor: "{colors.forest-ink}"
    rounded: "{rounded.square}"
    padding: "18px 22px"
  transfer-path:
    backgroundColor: "{colors.parchment}"
    textColor: "{colors.parchment-ink}"
    rounded: "{rounded.square}"
    padding: "18px 22px"
---

# Design System: Welcome NRW

## Overview

**Creative North Star: “The Alliance Invitation.”** A warm paper surface, confident type, and forest accents make an approachable place for people who play together. Broad sections and restrained decoration keep the choices and useful information clear.

This is a scan of the implemented public Welcome surface, not a global redesign contract. See BRIEF.md for recruitment strategy and data boundaries. The root leadership design documents remain intact.

Key characteristics: local Inter, square edges, flat tonal depth, two explicit entry paths, crownless game artwork, and readable light/dark themes.

## Colors

### Primary

Forest anchors the member path and contact section; warm brand color marks links, clocks, and focus. Parchment distinguishes the transfer path. These path colors stay explicit in both themes.

### Neutral

The unprefixed frontmatter colors mirror `welcome.css` light-theme custom properties. Dark-prefixed entries document the values assigned by `html[data-theme=dark]`; dark brand also supplies brand2, gold, and cyan. The existing cyan variable name is retained for compatibility, although its actual color is warm. Background, surface, muted, and line values switch together.

**The Source Rule.** `welcome.css` is the implementation authority. Keep these extracted tokens synchronized rather than creating a second runtime theme.

## Typography

Use the locally hosted Inter variable font (`leitung/fonts/InterVariable.woff2`, weights 100–900, swap display), followed by system sans-serif. The display heading balances across two lines and is limited to about ten characters per line. At the phone breakpoint it uses 52px; section headings use 36px with 1.12 line height and -.03em tracking. Body paragraphs are capped at 72ch; the invitation lead is narrower (43ch) and uses 18px on desktop, 16px on phones. Navigation, supporting labels, and source notes use 12–14px where implemented.

## Layout

The shared content container tops out at 1280px with 32px side gutters, reducing to 16px at 680px. The invitation starts as a 1.2fr/1fr grid with a 620px minimum height. At 930px its art column narrows; at 680px it becomes a vertical sequence with copy and paths before a 270px art region. Wide navigation links disappear at 930px while language/theme controls remain.

Sections use the frontmatter section spacing, with transfer-specific adjustments. Contacts use two columns before becoming one on phones. The live schedule uses three equal columns, then a single column at 680px. FAQ and transfer introduction use asymmetric columns, collapsing on phones. The implementation also has a 1100px density adjustment; exact breakpoints live in the sidecar. Existing base `styles.css` supplies structural rules overridden by `welcome.css`; this file does not describe every inherited legacy declaration.

## Elevation & Depth

The Welcome layer explicitly sets both shadow variables to none and removes card shadows from its principal surfaces. Solid paper tones, forest sections, whitespace, and thin rules establish depth. Avoid ambient glow and floating dashboard-card styling on this surface.

## Shapes

Paths, buttons, input fields, and principal content surfaces have square corners. The theme button remains circular. Retain the existing crest and game artwork silhouettes; Helga occupies the invitation art panel without a giant crown motif.

## Components

### Paths and buttons

Paths use stacked title/support text with clear member/transfer color assignments. Standard buttons have a 46px minimum height; the theme button is 44px on desktop and 40px on phones. Fine-pointer hover moves paths right by 4px and buttons up by 2px. Press scales paths/buttons to .98. Transitions last 160ms. Do not rely on motion to distinguish the choices.

### Motion and focus

Arrival runs once only when reduced motion is not requested: copy moves up from 16px over 600ms and Helga from 24px over 800ms, with partial opacity starts. Defaults remain visible without animation. The ease-out curve, hover media condition, and reduced-motion override are in the sidecar. Reduced motion removes all animation and transitions and keeps scrolling automatic.

The global keyboard outline is a 3px brand stroke with 5px offset; fields and language chip groups use 3px offset. The skip link appears on focus. Same-page navigation sets focus on its target without a reload. These are observed behaviors, not an accessibility certification.

### Fields, disclosures, and contacts

Inputs are at least 48px tall with 16px text. Language selections retain visible 18px checkboxes, associated labels, and group focus outlines. FAQ and server-account information use native details/summary. Contact cards show stored local portraits, visible IDs, copy actions, status feedback, and an NRW image-error fallback. Their visual treatment is a pale surface inside the forest section.

## Do's and Don'ts

- **Do** preserve readable states in German, English, and French and both themes.
- **Do** keep focus indication and reduced-motion overrides when extending components.
- **Do** use live public-schedule results for event clocks and explicit unavailable/empty states.
- **Don't** replace Helga with the former Lord or introduce a giant crown hero.
- **Don't** turn the Welcome invitation into the separate dashboard's visual system.
- **Don't** add invented social proof or describe cached contact portraits as live player data.
