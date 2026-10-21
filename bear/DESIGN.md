---
name: NRW Bear Optimizer
description: A compact charcoal and gold workspace for readable Bear Trap planning.
colors:
  war-bg: "#151614"
  war-panel: "#20221f"
  war-raised: "#292c27"
  war-well: "#191b18"
  war-line: "#3d4138"
  war-control: "#62685a"
  war-text: "#f2f0e6"
  war-muted: "#b7bbae"
  war-gold: "#eac477"
  war-ink: "#262012"
  war-green: "#b1d9bf"
  war-warning: "#f5d5a4"
  war-danger: "#ffb8a8"
  infantry: "#a5c0c7"
  cavalry: "#b6ada0"
typography:
  display:
    fontFamily: "Nunito, system-ui, sans-serif"
    fontSize: "46px"
    fontWeight: 900
    lineHeight: 1.08
    letterSpacing: "-.035em"
  headline:
    fontFamily: "Nunito, system-ui, sans-serif"
    fontSize: "23px"
    lineHeight: 1.25
    letterSpacing: "-.025em"
  title:
    fontFamily: "Nunito, system-ui, sans-serif"
    fontSize: "17px"
    letterSpacing: "-.025em"
  body:
    fontFamily: "Nunito, system-ui, sans-serif"
    fontSize: "15px"
    lineHeight: 1.55
  muted:
    fontFamily: "Nunito, system-ui, sans-serif"
    fontSize: "14px"
    lineHeight: 1.6
  label:
    fontFamily: "Nunito, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 800
rounded:
  caution: "8px"
  control: "10px"
  card: "12px"
  panel: "16px"
spacing:
  compact: "8px"
  control-gap: "10px"
  roster-gap: "12px"
  row: "16px"
  panel-mobile: "18px"
  panel: "22px"
  columns: "24px"
components:
  button-primary:
    backgroundColor: "{colors.war-gold}"
    textColor: "{colors.war-ink}"
    rounded: "{rounded.control}"
    padding: "11px 14px"
  button-secondary:
    backgroundColor: "{colors.war-raised}"
    textColor: "{colors.war-text}"
    rounded: "{rounded.control}"
    padding: "11px 14px"
  input:
    backgroundColor: "{colors.war-well}"
    textColor: "{colors.war-text}"
    rounded: "{rounded.control}"
    padding: "10px 8px"
  language-active:
    backgroundColor: "{colors.war-gold}"
    textColor: "{colors.war-ink}"
    rounded: "{rounded.caution}"
    padding: "7px 10px"
  panel:
    backgroundColor: "{colors.war-panel}"
    textColor: "{colors.war-text}"
    rounded: "{rounded.panel}"
    padding: "22px"
  evidence-summary:
    textColor: "{colors.war-gold}"
    typography: "{typography.label}"
---

# Design System: NRW Bear Optimizer

## Overview

**Creative North Star: "The NRW War Room"**

A quiet tactical workspace puts the player's heroes, troop stock and model evidence within reach. Neutral charcoal surfaces, parchment text and restrained NRW gold retain the existing gaming identity without competing with the catalog portraits.

Nunito keeps dense controls approachable. Flat framed panels separate editing, recommendations and results; evidence expands in place so the player can inspect a recommendation while keeping the surrounding roster visible. This document describes the scoped Bear interface implemented by the V3 shell and its war room overrides.

**Key Characteristics:**
- Neutral charcoal surfaces with gold for action and selection.
- Compact, legible controls and existing Nunito typography.
- Flat framed panels and real catalog portraits.
- Read-only evidence beside each recommendation.

## Colors

The palette uses close neutral charcoal tones, warm readable text and a single gold action accent; the frontmatter owns the exact values.

### Primary
- **NRW Gold:** Primary actions, active language, selected heroes, model scores, evidence summaries and the starter result border.
- **Gold Ink:** Dark text on gold controls.

### Neutral
- **Room Charcoal:** Page background.
- **Panel Charcoal:** Main framed working surfaces.
- **Raised Charcoal:** Secondary controls and selected hero surfaces.
- **Inset Charcoal:** Inputs, roster cards, formation cards and evidence cautions.
- **Frame Neutral:** Quiet panel frames and row dividers.
- **Control Neutral:** Stronger control borders.
- **Parchment:** Headings, primary text and names.
- **Muted Parchment:** Supporting copy, labels and explanatory metadata.

Success, warning and error text use their dedicated semantic colors. Infantry and cavalry use the two muted troop colors; archers reuse gold. Text labels accompany troop colors.

**The Gold Has a Job Rule.** Use gold for a meaningful action, selected state or model result; keep surrounding surfaces neutral.

## Typography

**Display Font:** Nunito, with system-ui and sans-serif fallbacks.
**Body Font:** Nunito, with the same fallbacks.

The existing rounded family handles both strong names and dense evidence. Numbers use tabular alignment. Heading tracking is slightly tight; supporting paragraphs have more generous leading.

### Hierarchy
- **Display:** Landing headline, with the desktop token reduced to 36px at 820px and 30px at 480px.
- **Headline:** Main panel headings, reduced to 21px at 480px.
- **Title:** Supporting panel headings; formation headings use 16px.
- **Body:** Main interface copy.
- **Muted:** Supporting explanations and context.
- **Label:** Field labels and evidence summaries. Evidence paragraphs use 13px; compact metadata uses 12px.

Landing supporting copy is constrained to a readable width, including a 68ch introductory explanation. Long hero names and evidence effects wrap rather than clip.

## Layout

The existing content container is capped at 1240px. The landing frame is capped at 1000px. The page uses safe-area-aware horizontal and bottom padding. Panels use the frontmatter spacing scale; recommendation rows are separated by quiet rules rather than individual nested cards.

At 1100px and wider, the editing and recommendation columns use a 1.15fr / .85fr split with a minimum 420px recommendation column and a 24px gap. The intermediate desktop grid inherits the existing 1.35fr / .85fr split. At 820px and below, the columns stack and the recommendation/action column comes before the editable roster. The advanced starter equipment remains within that column.

At 480px and below, the roster has two equal columns, the language switcher takes its own row, comparison and provenance columns stack, and formation results use one column. The landing art shrinks rather than displacing the search field. Standard interactive controls target a minimum 44px height; compact language and help controls retain their implemented 36px size.

## Elevation & Depth

Main panels, primary and secondary controls, and the court switch are flat, with no decorative shadow. Depth comes from inset and raised charcoal tones and one-pixel frames. Retained PIN and help dialogs keep their existing modal shadows; this is not a universal ban on overlay elevation.

**The Flat Working Surface Rule.** Keep ordinary editing and recommendation surfaces flat; reserve overlay depth for dialogs.

## Shapes

Working panels have gently rounded corners. Smaller nested hero and formation cards use the card radius; buttons and fields use the control radius. Cautions and language buttons use the compact radius. Frames and dividers communicate grouping, while the active hero combines a gold border with a visible check mark. Portraits use their real silhouette with contained fitting in the redesigned roster and recommendations.

## Components

### Buttons

Gold primary buttons carry the opening and calculation actions. Secondary buttons use raised charcoal, a stronger neutral border and parchment text. Fine-pointer hover changes the border to gold. Pressing briefly scales a button to .98. Disabled buttons lower opacity to .48. Keyboard focus has a gold two-pixel outline with a three-pixel offset.

### Inputs / Fields

Inset charcoal fields have stronger neutral borders and gold caret/accent colors. Editable field inputs and selects use 16px text. The landing search uses 17px text. Placeholders remain fully opaque muted text. Preserve the existing numeric PIN and profile access behavior.

### Navigation

The compact four-language switcher supports DE, EN, FR and ES. Gold fill identifies the active language; secondary languages use muted text on charcoal. The existing small masthead and simple footer links provide navigation without adding a sidebar.

### Cards / Containers

Main panels frame related work. Hero cards use an inset background, a gold selected border and check mark, and stronger portrait opacity when selected. The starter formation spans the results grid and receives a gold frame and title. Other marches retain neutral frames.

### Recommendation Evidence

Each recommended starter has a native details/summary disclosure, styled as a compact gold question. Opening it reveals the advisor's existing model index, next eligible same-class candidate, offensive effects, stored inputs, star-derived assumptions and unresolved effects. The index uses a same-rally baseline of 100; it is not presented as actual game damage. The presentation reads the advisor's output without changing saved inputs, candidate order or calculations. Native keyboard operation remains available.

### Results and Motion

Results appear immediately while the complete existing formation or Bear action video accompanies the ready result. Playback does not gate computation. Keep original media and existing linked assets; there are no newly fabricated game assets. An unavailable video has the existing fallback. Reduced-motion users skip playback and receive no transitions or result entrance animation.

Controls use short color and border transitions with the existing war room easing. Result entrance combines a slight upward movement with opacity. Avoid adding continuous decorative motion to the working panels.

## Do's and Don'ts

### Do:
- **Do** use gold for actions, selection and meaningful model results.
- **Do** preserve the existing Nunito family, catalog portraits and original media.
- **Do** keep recommendations and actions above the editable roster on mobile.
- **Do** preserve native disclosure and visible keyboard focus.
- **Do** distinguish stored values, assumptions and unresolved model effects in all four locales.
- **Do** show ready results without waiting for video playback.

### Don't:
- **Don't** add decorative shadows to ordinary working panels.
- **Don't** invent hero imagery, asset provenance or confirmed game damage claims.
- **Don't** mutate profile values or recalculate rankings merely to open evidence.
- **Don't** add separate skill-level inputs to this workflow.
- **Don't** require animation to understand or access a result.
