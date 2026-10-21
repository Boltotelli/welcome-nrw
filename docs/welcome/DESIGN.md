---
name: Welcome NRW
description: Focused charcoal and gold Kingshot welcome
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
typography:
  display:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(56px,6.4vw,90px)"
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: "-.04em"
  headline:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(32px,4vw,48px)"
    lineHeight: 1.15
    letterSpacing: "-.03em"
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
    backgroundColor: "{colors.gold}"
    textColor: "{colors.action-ink}"
    rounded: "{rounded.surface}"
    padding: "18px 22px"
  transfer-path:
    backgroundColor: "{colors.surface2}"
    textColor: "{colors.ink}"
    rounded: "{rounded.surface}"
    padding: "18px 22px"
  dashboard-action:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.action-ink}"
    rounded: "{rounded.compact}"
    padding: "15px 22px"
  contact-card:
    backgroundColor: "{colors.surface}"
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

**Creative North Star: “Dark & Gold Kingshot.”** Neutral charcoal opens space for the existing crownless Helga artwork and one clear Welcome message. NRW gold identifies the primary choice; quiet neutral surfaces carry supporting information. The optional light theme uses neutral whites and grays rather than the superseded paper/forest palette.

This scanned record governs the public Welcome surface only. BRIEF.md owns audience strategy, data truth, evidence, and source fingerprints. Historical root leadership documents and the separate Dashboard remain outside its boundary.

Key characteristics: dark by default, large game artwork, focused audience views, local Inter, restrained rounded controls, flat tonal depth, and progressive disclosure.

## Colors

### Primary

NRW gold marks the member choice and Dashboard action; warm brand color marks clocks, links, focus, and active navigation. The transfer path uses a neutral surface and border. The frontmatter records light custom-property values; dark-prefixed entries record the dark override. Dark brand also supplies brand2, gold, cyan, and green. The legacy cyan/green variable names now resolve to gold-toned values, not those hues.

### Neutral

Charcoal background and neutral tonal surfaces define the selected dark world. Light mode switches the background, surface, ink, muted, and line roles together. Do not add green tint to backgrounds, text, or borders.

**The Source Rule.** Final rules in welcome.css override earlier retained declarations. Document the active cascade and current markup, not the obsolete invitation grid or forest cards.

## Typography

Use locally hosted Inter variable (`leitung/fonts/InterVariable.woff2`, weights 100–900, swap display), then system sans-serif. The landing display balances on two lines, capped at about ten characters per line. At 930px it uses 62px; at 680px it uses 48px. The concise hero lead uses 18px/1.65 with 35ch measure, becoming 16px/1.6 and 34ch on phones.

Selected-view titles use the headline role and become 31px with -.025em tracking on phones. Contact section headings are 24px; contact names are 27px desktop and 24px at smaller widths. Disclosures deliberately lower heading volume: content headings are generally 25px/1.2 and summaries 17px, dropping to 16px on phones. Body uses the frontmatter base; disclosure paragraphs commonly use 15px. The scale describes existing roles, not a fixed mathematical ratio.

## Layout

The container is 1280px maximum, with 32px side gutters, reduced to 16px at 680px. Desktop landing uses an open 1fr/1.1fr grid, 30px gap, and 650px minimum hero height; its artwork is 112% wide within an overflow-clipped area. At 930px columns become equal, hero minimum height is 560px, and artwork grows to 130%. At 680px copy and choices precede a 260px artwork region with a 330px-tall image.

Landing excludes both audience streams. Member and transfer views show their own content plus the one shared schedule; the audience switch and home link remain present. Member times open by default on entry; transfer times close. Other detail groups start closed. Detail containers top out at 960px. Contacts use two columns, changing to one on phones. Schedule entries are compact full-width rows, with icon/title/clock columns and local-time support beneath; they are no longer three large cards.

Sections use the frontmatter spacing rather than the former 100px/64px rhythm. Contact portraits step from 92px to 76px at 930px and 74px on phones. Existing base styles and retained welcome declarations remain in the cascade, so preserve the final focused overrides when editing.

## Elevation & Depth

Both shadow variables remain none. Use tonal surfaces, neutral rules, whitespace, and scale to convey depth. The artwork supplies atmosphere; no added glow, floating-card shadow system, or extra hero overlay is established.

## Shapes

Landing paths and contact cards have modest surface corners. Phone paths, portraits, Dashboard action, and rule callouts use compact corners. Contact copy buttons use the control radius. The theme button remains circular; legacy input/profile controls remain square where implemented. Do not impose the former all-square rule on the focused revision.

## Components

### Audience paths and switch

The gold member path and outlined neutral transfer path share stacked title/support text. Desktop padding is in frontmatter; phones use 16px 18px, 14px titles, 12px support, and compact corners. Fine-pointer hover lifts paths by 2px; press scales paths/buttons to .98. Switch links use aria-current and brand color for the selected audience, with a persistent return-home link. Hash navigation reveals audience and disclosure ancestors before focus; back/forward restores state.

### Disclosures and schedule

Native details/summary groups use horizontal rules and plus/minus indicators, with 64px summary minimum height (58px on phones). Keyboard focus remains visible. One schedule node serves both audiences. No duplicated schedule, form IDs, authoritative configuration, or listener bindings are permitted.

### Contacts and fields

Contact cards use themed surfaces, local portraits, visible IDs, and copy status. Copy controls have at least 44px height. Inputs retain 48px minimum height and 16px text; language controls keep visible 18px checkboxes with associated labels. Image failures reveal an NRW fallback. These reflect implemented behavior rather than a complete accessibility certification.

### Motion and focus

Only the current hero artwork receives a 700ms arrival using the existing portrait keyframe: opacity .7 and translateY(24px) to visible rest. No active copy-arrival element remains in the new markup. Defaults remain visible. Interaction transitions use 160ms; hover movement is gated to fine pointers. Reduced motion removes all animation and transitions and keeps automatic scrolling.

Keyboard outlines use a 3px brand stroke and 5px offset; fields and language-chip groups use 3px offset. The skip link appears on focus and dynamically targets the visible landing/member/transfer state. Navigation sets target focus after revealing hidden content. See the sidecar for exact curve/media rules.

## Do's and Don'ts

- **Do** keep a short landing and show only the chosen audience stream.
- **Do** preserve DE/EN/FR, both themes, reduced motion, and visible focus.
- **Do** retain crownless Helga, stored-contact provenance, live public-schedule authority, and Discord public-config authority.
- **Don't** restore forest surfaces, the giant 1044 backdrop, overlay slogans, giant crown hero, or the former Lord artwork.
- **Don't** add invented social proof or imply cached portraits are live player data.
- **Don't** overwrite leadership/Dashboard design or share Welcome’s isolated theme preference with other routes.

