---
name: AllianceOS — Einsatzbuch
description: Calm, precise leadership operations for NRW, kingdom 1044, on GitHub Pages.
colors:
  ground: "#0c0d0e"
  surface: "#171819"
  panel: "#222325"
  divider: "#343638"
  ink: "#f3f3f1"
  muted: "#b4b6b8"
  nrw-gold: "#d8ba73"
  positive: "#8dc8a7"
  negative: "#f19a9a"
  neutral-status: "#c7c9cc"
  control-stroke: "#484b4e"
  primary: "#eeefed"
  primary-ink: "#151617"
  selected: "#292b2d"
  positive-bg: "#1b3026"
  negative-bg: "#352426"
  gold-bg: "#302a1e"
  light-ground: "#f4f5f6"
  light-surface: "#ffffff"
  light-panel: "#eef0f1"
  light-divider: "#dce0e2"
  light-ink: "#1c1f21"
  light-muted: "#5c6267"
  light-nrw-gold: "#806017"
  light-positive: "#246647"
  light-negative: "#a1353e"
  light-neutral-status: "#50565b"
  light-control-stroke: "#9ba2a8"
  light-primary: "#222628"
  light-primary-ink: "#ffffff"
  light-selected: "#e3e6e8"
  light-positive-bg: "#e4f2e9"
  light-negative-bg: "#f9e9ea"
  light-gold-bg: "#f2ead8"
typography:
  headline:
    fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif'
    fontSize: "26px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.02em"
  title:
    fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif'
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.02em"
  body:
    fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif'
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0"
  label:
    fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif'
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.4
  note:
    fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif'
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.55
rounded:
  chip: "4px"
  control: "6px"
  card: "8px"
  navigation-dialog: "10px"
  modal: "12px"
spacing:
  tight: "8px"
  field: "12px"
  gap: "16px"
  card: "24px"
  desktop-gutter: "28px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-ink}"
    rounded: "{rounded.control}"
    padding: "8px 12px"
    height: "36px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "8px 12px"
    height: "36px"
  input:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "8px 10px"
    height: "36px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
    padding: "24px"
  chip-confirmed:
    backgroundColor: "{colors.positive-bg}"
    textColor: "{colors.positive}"
    rounded: "{rounded.chip}"
    padding: "3px 6px"
  navigation-active:
    backgroundColor: "{colors.selected}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "9px 12px"
---

# Design System: AllianceOS — Einsatzbuch

## Overview

**Creative North Star: "Einsatzbuch"**

Einsatzbuch is a calm operational register: readable names, visible response states and compact, dependable controls. The existing NRW crest, AllianceOS name and restrained NRW gold anchor the interface. Dense repeated work takes priority over promotional space, decorative effects or invented metrics.

This document applies exclusively to `https://boltotelli.github.io/welcome-nrw/leitung/`. Its authority is the implemented `leitung/pages-atelier.css` and `leitung/pages-atelier.js`, with the exact-host loader as the boundary. It does not authorize changes to other Pages routes or Vercel production. The world adapts the `true-black-flat` direction, seed `1309344843`: near-black tonal surfaces, inverted primary controls and restrained color. The pinned NRW gold replaces the dealt lime. The implemented labeled sidebar deliberately replaces the dealt no-sidebar shell because the product has eleven modules. The seed's literal palette, pill controls and 20px card radius are not the implementation tokens.

**Key Characteristics:**

- Tonal surfaces and restrained NRW gold.
- Labeled, grouped navigation for eleven modules.
- Compact, searchable operational lists and predictable forms.
- Equivalent dark and light themes; four preserved locales.
- Existing static HTML, CSS and vanilla ES modules; no new framework or animation system.

## Colors

Near-neutral charcoal and paper grounds support legible operational data; semantic status colors remain distinct from the gold identity accent. The frontmatter records exact implemented values for both themes, with `light-` entries replacing the corresponding unprefixed role.

### Primary

**NRW Gold** is reserved for identity, keyboard focus, caret, text selection and gold status/conflict treatments. **Inverted Primary** distinguishes the main action through lightness rather than a gold fill. Primary controls invert again in light mode.

### Neutral

**Ground**, **Surface** and **Panel** provide increasing tonal separation. **Ink** carries primary text, **Muted** carries secondary labels and notes, **Divider** separates rows, and the stronger **Control Stroke** identifies interactive boundaries. **Selected** gives navigation and date selections a neutral fill. The historical violet variable is neutral gray in both themes; it is not an additional brand hue.

### Named Rules

**The Restrained Gold Rule.** Use NRW gold as a precise cue, never as the routine fill for navigation or primary buttons.

**The Contrast Role Rule.** Preserve the theme-specific text, status and control pairs. Dividers are structural separators, not substitutes for the stronger control stroke. Test actual foreground/background combinations in each theme; do not infer universal accessibility conformance from the palette alone.

## Typography

**Display Font:** Inter, locally served variable WOFF2 with swap loading.

**Body Font:** Inter with system-ui, -apple-system, Segoe UI and sans-serif fallbacks. No separate display or monospace family is introduced.

**Character:** Plain, compact and quiet. Weights (400, 500, 600) establish hierarchy; tabular numerals align metrics and operational tables. Headings balance their lines.

### Hierarchy

- **Headline:** the frontmatter headline role; phone page titles become (22px) at the phone breakpoint.
- **Title:** the frontmatter title role for sections and card headings.
- **Body:** the frontmatter body role; operational rows and controls commonly use (13px).
- **Label:** the frontmatter label role; inactive desktop navigation uses (13px, 400), active labels (600).
- **Note:** the frontmatter note role; small metadata may use (11px). Explanatory page copy uses (13px), generally within (75ch); expanded module notes allow (90ch).
- **Metrics:** main strip values use (26px, 500, 1.3), phone values (24px); secondary values use (22px) or (24px).

## Layout

Desktop uses a (224px) sidebar and a flexible workspace. The sticky top bar is (58px) high. Main content has (28px 28px 60px) padding and a maximum width of (1600px); at viewport widths of at least (1600px), horizontal padding becomes (40px). At a (1440px) viewport, the working area is (1160px): two (572px) columns with a (16px) gap. Four metric cells share one container with internal rules. Cards use the frontmatter card spacing; nested cards become flat sections with top rules and (16px 0) padding.

- **At 1250px and below:** fast assignment forms become two equal columns with (12px) gaps; participation save controls move to a new row.
- **At 1100px and below:** the sidebar gives way to a native modal navigation dialog. Main padding becomes (24px 20px 48px); the top bar wraps with a minimum height of (64px), (20px) horizontal padding and (8px) vertical padding. Its smaller controls have a (40px) minimum height, and the menu trigger and module rows have a (44px) minimum height. The script moves the original navigation and Welcome link nodes into the dialog and restores them on expansion; it does not clone permission-bearing controls.
- **At 700px and below:** main padding becomes (22px 16px 40px), adding the bottom safe-area inset. Cards use (16px) padding, two-column content stacks, metric strips become two columns, and relevant controls reach (44px) minimum height. Inputs use (16px) text. The top bar uses (12px) horizontal padding. Assignment name fields and submit actions span the form; map, Discord and modal form layouts stack. Participation rows stack and retain two-column option controls. Password change remains reachable through the navigation dialog; the desktop password control and role label are hidden.
- **At 1200px and above:** participation counts use eight columns, (12px 0) outer padding and (6px 12px) cell padding; between phone and this threshold they use four columns.
- **Coarse pointers:** inputs use (16px) text and buttons/disclosures have a (44px) minimum height.

Tables retain a (700px) minimum width inside local overflow containers. Names wrap, filters wrap, and date chips scroll locally. Never shrink the full page to fit a dense table.

## Elevation & Depth

Cards and navigation have no shadows; tonal steps, row rules and selected fills communicate hierarchy. The application modal is the explicit exception: its structural shadow is `0 24px 80px #0006`. Modal and navigation-dialog backdrops use `#0009` without blur. The top bar has no backdrop blur.

No new animation or motion framework is part of this world. Fine-pointer hover uses immediate tonal changes, primary brightness (.92) and press brightness (.86). Reduced-motion preference removes animation, transitions and smooth scrolling from this scoped surface.

## Shapes

Small, restrained corners distinguish chips, controls, cards and dialogs using the frontmatter radius scale. Borders are normally (1px); flat cards omit an outer stroke, while controls retain a clear stroke. The navigation dialog is at most (420px) wide, constrained to the viewport minus (24px), with the same vertical clearance. Application modals use the modal radius on desktop and the card radius on phones, where they fit the viewport minus (16px).

## Components

### Buttons

Compact and dependable. Primary buttons use the inverted primary pair; ghost buttons use transparent fill, primary text and a control stroke. Both follow the documented control shape and spacing. Action links are underlined with a (4px) offset. All interactive focus-visible states use a (2px) gold outline with a (3px) offset. Disabled buttons retain full opacity, muted text and panel fill with a not-allowed cursor.

### Chips

Quiet status labels use (11px, 500), a (20px) minimum height and no border. Confirmed/active/published/connected use positive pairs; cancelled/left/outgoing use negative pairs; draft/interested use gold pairs. Neutral chips use panel and muted roles. Status meaning must remain available in text.

### Cards / Containers

Flat surface containers use the card shape and padding. Nested sections rely on dividers rather than nested raised boxes. Summary metrics share a container, use tabular figures and keep existing data semantics. No fixture or invented statistic belongs in a live card.

### Inputs / Fields

Ground fill, control stroke, control radius and (8px 10px) padding create a clear form boundary. Desktop minimum height is (36px). Placeholders use muted text at full opacity; carets use gold. Keep visible field labels, existing validation and permission states. Errors use the existing negative status treatment, without replacing application validation.

### Navigation

Eleven original module destinations remain labeled: overview, roster, performance, bear, fightclub, participation, transfers, laws, events, Discord and settings. Group headings use (12px) muted text; rows have a (38px) desktop minimum height and (18px) stroke icons. Active rows use the selected fill, ink and (600) weight with `aria-current="page"`. Compact navigation uses the native dialog, labeled trigger, Escape dismissal, keyboard containment and return focus. Permission-hidden destinations and overview shortcuts stay hidden according to application state.

### Operational Disclosures and Dialogs

Service information and planning notes use native disclosures around existing content. Their original text and nodes remain authoritative. Modals keep sticky headers and action footers, scroll containment and viewport constraints. The skip link becomes visible on focus and targets the workspace.

## Do's and Don'ts

### Role selection and finishing pass · 21 October 2026

The Bear module uses an authored bear-head outline instead of the generic house.
Every module header carries its matching 30px outline in restrained NRW gold, with
a quiet bottom rule. Surface edges use `--os-edge` (`#292c2f` dark, `#e2e5e7` light)
to distinguish working containers from the page without adding card shadows.

Starter and Joiner are two equal rally roles. They are represented as an accessible
radio group with two visible labels and one sliding selection segment; never expose
this as an on/off switch. The segment uses `--os-role-selected` (`#e3d2a9` dark,
`#e9dcc0` light) and `--os-role-ink` (`#292417` dark, `#382c12` light). Clicking,
dragging horizontally, arrow keys, Home/End and normal button activation select a role.
The underlying existing checkbox stays hidden solely to preserve the original save
contract. No extra save or automatic write is introduced.

Pointer selection uses a 160ms transform-only transition with
`cubic-bezier(.23,1,.32,1)`; dragging tracks the pointer directly. Keyboard input and
reduced-motion preferences switch instantly. No motion dependency is added.

The Bear participant roster opens by default to put the actual working list on the
page. A user's deliberate collapse persists across module rerenders. The original
details element and module listeners remain intact.

### Do:

- **Do** preserve the exact-host and `/leitung/` scope of this visual system.
- **Do** use both theme-specific palettes and check actual contrast in context.
- **Do** retain German, English, French and Spanish labels, translations and application formatting.
- **Do** move existing navigation nodes so event handlers, URLs and permission states remain authoritative.
- **Do** preserve every module, save, delete, copy, filter and navigation function.

### Don't:

- **Don't** apply this document to Vercel production, the Bear optimizer, Welcome or other Pages routes.
- **Don't** change authentication, Supabase, databases, Edge Functions, APIs or Vercel configuration as part of this visual system.
- **Don't** add gaming effects, gradient cards, neon glows, promotional hero slogans or invented metrics.
- **Don't** replace permission decisions with visual guesses or publish test fixtures as live data.
- **Don't** introduce a new animation framework or restore the seed's no-sidebar shell and literal tokens over this implementation.

## Optional visual studies and deployment areas

The Pages preview offers Clear, Bento and Neumorph through a labelled appearance selector. The choice persists locally and is independent of light/dark mode. Bento uses a slate canvas, separate summary tiles, rounded working surfaces and a larger primary player total. Neumorph uses paired light/dark shadows with explicit control borders, selected states and focus indicators. These requested studies override the prior flat-surface preference while preserving the existing NRW identity and content.

Swordland tactical North/South groups are derived from the vertical half of each map objective within the selected battle legion. Safe Zone is an explicit objective, separate from roster reserve. Map rows are scoped to event and date. Team leader configuration remains tied to the selected legion.

External-account lookup uses the existing MightPulse provider on deliberate click. It fills draft name/alliance fields without saving a relationship. Changing the ID clears unchanged provider-filled fields. Manual edits survive. The dedicated action requires the existing members permission; the transfer lookup retains its transfer permission.

The user explicitly authorized the two minimal shared API extensions on 2026-10-21. No schema, authentication, subscription or Vercel deployment changes accompany them.

## Automatic deployment groups

Neumorph is the default appearance for a browser without an explicit saved preference. Existing local appearance choices remain available.

The deployment planner works only within an existing Legion 1 or Legion 2. It never assigns players to another legion. The native preset dialog configures top-N GUERILLA, weakest remaining SECURE, the North/South headcount ratio, strong players per priority objective, preserved positions, unknown availability and one account per person. SL defaults to Bell Tower and Stables. Tri requires an explicit starting side and priority targets. No provider lookup is required to calculate a proposal.

The deterministic engine uses documented cached power. Missing power is excluded from redistribution. Existing retained positions take precedence over automatic target counts. Preview shows exclusions, actual counts, known-power coverage and copyable labels. Group-qualified map keys preserve North/South intent on Tri without a new database schema; virtual SECURE/GUERILLA destinations have no invented map coordinates.

Applying is explicit. A fresh roster and player snapshot must match the proposal, including active status and main/alt links. Stale data refreshes the local snapshot and requires a new proposal. Sequential writes update only map assignments through the existing permission-protected action. A partial error stops the run; successful assignments remain saved and retry handles only the remainder. No live alliance planning data is modified during QA.

## Production publication

On 2026-10-21 the user explicitly requested publication of this reviewed state to welcome-nrw.vercel.app/leitung. The presentation loader now permits the approved production hostname as well as the existing Pages hostname. Both installations use the same Neumorph default, module behavior and deployment-group planner. Existing base-path normalization supports /leitung and /leitung/ without the Pages prefix. This release changes no Supabase schema, authentication or provider settings.
