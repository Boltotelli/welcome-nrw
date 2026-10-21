---
name: Welcome NRW
description: Cinematic citadel, Cinzel, and gold Kingshot welcome
colors:
  bg: "#f4f3ef"
  bg2: "#e7e6e2"
  surface: "#ffffff"
  surface2: "#e7e6e2"
  ink: "#232323"
  muted: "#606060"
  line: "#cdcdca"
  brand: "#73541e"
  brand2: "#73541e"
  gold: "#d3b375"
  cyan: "#73541e"
  green: "#73541e"
  rose: "#993d35"
  dark-bg: "#121212"
  dark-bg2: "#181818"
  dark-surface: "#1c1c1c"
  dark-surface2: "#252525"
  dark-ink: "#f4f3ef"
  dark-muted: "#c0c0bd"
  dark-line: "#484848"
  dark-brand: "#dfc185"
  dark-rose: "#f2aaa0"
  action-ink: "#24211b"
  scene-bg: "#10141b"
  scene-ink: "#f5f1e8"
  scene-gold: "#dfbd79"
  scene-action-ink: "#292419"
  scene-action-line: "#e9ce99"
  scene-transfer: "#141a24db"
  scene-transfer-line: "#95805b"
  scene-footer: "#101114"
  scene-footer-ink: "#bcbdbb"
typography:
  display:
    fontFamily: "Cinzel, serif"
    fontSize: "clamp(70px,7.1vw,96px)"
    fontWeight: 550
    lineHeight: 1.06
    letterSpacing: "-.025em"
  headline:
    fontFamily: "Cinzel, serif"
    fontSize: "clamp(32px,3.6vw,46px)"
    fontWeight: 550
    lineHeight: 1.25
    letterSpacing: "-.02em"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "16px"
    lineHeight: 1.6
  disclosure:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 500
rounded:
  square: "0"
  path: "7px"
  control: "5px"
  compact: "6px"
  surface: "8px"
  circular: "50%"
spacing:
  section: "36px"
  section-phone: "28px"
  path-gap: "12px"
  contact-gap: "24px"
components:
  member-path:
    backgroundColor: "{colors.scene-gold}"
    textColor: "{colors.scene-action-ink}"
    rounded: "{rounded.path}"
    padding: "19px 22px"
  transfer-path:
    backgroundColor: "{colors.scene-transfer}"
    textColor: "{colors.scene-ink}"
    rounded: "{rounded.path}"
    padding: "19px 22px"
  dashboard-action:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.action-ink}"
    rounded: "{rounded.compact}"
    padding: "15px 22px"
  contact-card:
    backgroundColor: "color-mix(in srgb,var(--surface) 93%,transparent)"
    textColor: "{colors.ink}"
    rounded: "{rounded.surface}"
    padding: "24px"
  contact-copy:
    backgroundColor: "{colors.surface2}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "10px 14px"
---

# Design System: Welcome NRW

## Overview

**Creative North Star: “The Gold-Lit Citadel.”** A midnight-blue and charcoal fantasy kingdom gives Welcome an authored game scene. Warm gold, Cinzel display type, and official crownless Helga form the foreground; Inter and two immediately usable choices keep the scene practical. Selected member and transfer views retain a subtle illustrated masthead while preserving progressive disclosure.

This record governs only public Welcome. BRIEF.md carries audience strategy, data and deployment boundaries, provenance, review limits, and current source fingerprints. Root leadership documents and Dashboard identity remain untouched. The cinematic stylesheet follows welcome.css; its overrides supersede the preceding focused world without replacing its shared variable contract.

## Colors

### Primary

Scene gold identifies the member path and United wordmark. The outlined transfer choice uses a translucent midnight surface and warm border. These explicit scene colors stay dark in either theme; selected views use the existing semantic theme variables.

### Neutral

Frontmatter retains the real light-theme variable values and dark-prefixed overrides. Dark brand supplies brand2, gold, cyan, and green; the legacy cyan/green names resolve to gold, not those hues. Scene/footer tokens describe the cinematic layer's explicit colors. Landing footer text stays at full opacity over its dark background. Do not restore forest surfaces or claim the landing follows light mode.

**The Cascade Rule.** Current index.html and the final welcome-cinematic.css declarations determine what renders. Earlier invitation and focused hero declarations are retained implementation history, not the active visual contract.

## Typography

Cinzel Variable is self-hosted (400–900, swap display) with serif fallback. It supplies the NRW./United. wordmark, brand, audience titles, contact headings, and names. Inter remains locally hosted for body, utility navigation, and controls. Both font assets remain local; Cinzel’s bundled SIL OFL and provenance record accompany the font.

The display role uses frontmatter values; United is gold, not italic. At 1100px it becomes 78px, at 800px 68px, at 680px 52px, and at 375px 48px. On phones United is .81em with -.02em tracking. Audience headings use 30px/1.3 on phones. Hero lead uses 17px/1.7, 38ch maximum, decreasing to 16px at 800px, 15px/1.65 on phones, and 14px below 375px. Choice titles use 15px desktop, 14px compact, 13px at the narrowest breakpoint; captions use 12px. Do not reintroduce equal-volume headings throughout details.

## Layout

The shared container remains 1280px maximum with 32px side gutters, reduced to 16px at 680px. The desktop scene is a 1fr/1fr composition, with a quiet left text region and Helga on the right. Hero minimum height is min(820px,100svh minus 78px), becoming 820px at 1500px and above. The foreground is absolutely positioned, generally 58% wide and 94% high; responsive rules adjust crop/position. On phones artwork sits above the readable lead and choices, with a 630px hero minimum, reduced to 620px at 375px. Keep both choices immediately usable.

Landing hides both audience streams. Member leads with Dashboard and utilities, transfer with fit and actual contacts. Selected views show their own content and the singleton schedule; times open on member entry and close on transfer entry. Other groups start closed. Persistent audience/home navigation, hash ancestor opening, focus transfer, history, original IDs, and listeners remain unchanged. Detail containers top out at 960px; contacts become one column on phones and schedule entries stay compact rows.

## Elevation & Depth

The semantic shadow variables remain none, but the cinematic layer adds explicit scene depth: foreground drop shadow, CTA shadows, subtle contact shadows, and a softened illustrated masthead. Exact shadows live in the sidecar. Gradient shading preserves text legibility over the citadel, and the foreground fades at its bottom edge. Do not describe this version as entirely flat or add unrelated ambient glow.

## Shapes

Scene choices use the path radius; contact cards and portraits use the surface radius. Existing Dashboard action, copied-ID controls, field corners, and circular theme button retain their focused-view shapes. Inline SVG shield/check and transfer-arrow icons distinguish the paths; do not replace them with emoji or a giant crown motif.

## Components

### Scene and assets

kingdom-dusk.webp is an AI fantasy illustration, not a game screenshot; its adjacent provenance JSON stores the prompt and format-only optimization record. The original generation is preserved. Helga is the existing official transparent character, replacing the former Lord; existing local contact images remain cached projections with sources.json provenance. Cinzel-Variable.ttf is accompanied by Cinzel-OFL.txt. Keep visible AI scene credit and existing official/fan context.

### Choices and focus

Choices have icon/title/caption/arrow grid anatomy. Fine-pointer hover lifts them 3px, advances the arrow 4px, and sweeps a highlight; press scales to .985, including hover-plus-active. The member hover warms its fill and the transfer hover changes its fill/border. Wrapper entrances use backwards fill and never own the interactive anchor transform. The choice focus ring is 3px scene gold with 5px offset. Existing general focus uses semantic brand with 5px offset; fields/chips use 3px. The skip link follows the visible state. These are implemented provisions, not a complete accessibility certification.

### Intro and transitions

The first eligible landing runs six transform/opacity arrivals: backdrop 1050ms, title 800ms after 60ms, copy 650ms after 120ms, foreground 950ms after 120ms, first choice 600ms after 180ms, second choice 600ms after 240ms. Defaults remain visible and actions usable. The intro runs once, with no continuous ambient loop.

Audience changes alone use a staged native view transition: old stage exits over 80ms, new stage starts at opacity zero after an 80ms delay and enters over 180ms. Root and navigation stay still; transition overlay ignores pointers. A new transition interrupts the preceding one. Unsupported native transitions use a 220ms main-element opacity/transform fallback. Same-view anchors, keyboard activation, and reduced-motion navigation update directly. History/hash navigation retains focus and disclosure behavior.

### Pointer depth and reduced motion

Fine hover-capable pointers drive a bounded spring (mass 1, stiffness 100, damping 10). Normalized input is clamped; backdrop displacement is at most 6px/4px and foreground 12px/8px plus 1.5deg rotation. Text never moves. requestAnimationFrame stops when settled; reset cancels it on hidden document, blur, keydown, view exit, intersection loss, reduced-motion change, or pointer-capability change. Touch input is rejected. This is conditional on actual pointer capability rather than a viewport-width test.

Reduced motion removes scene arrivals, transform transitions, and native stage animations, resets depth, and bypasses animated navigation. The cinematic override permits only short 120ms background/color changes for controls. No physical-device smoothness or frame-budget certification is implied.

### Data-bearing views

Contact IDs, copy feedback, local-image fallback, labeled language fields, visible checkboxes, native details, and singleton schedule retain existing semantics. public-schedule remains the sole Bear-clock authority; Discord public-config remains the invite authority. No external player refresh, backend/schema/auth changes, or invented proof claims belong to this visual system.

## Do's and Don'ts

- **Do** preserve the cinematic scene and immediately usable audience choices without adding a content stream to landing.
- **Do** maintain DE/EN/FR, selected-view themes, focus, reduced motion, and state/history behavior.
- **Do** retain AI/provenance/OFL records and separate the illustration from official game imagery claims.
- **Don't** restore green surfaces, the former Lord, a giant crown/1044 hero, or extra overlay slogans.
- **Don't** animate text with pointer depth, add infinite ambient loops, or bind CTA entry and hover to the same transform owner.
- **Don't** modify Dashboard/leadership design, authoritative data sources, or deployment scope through this document.
