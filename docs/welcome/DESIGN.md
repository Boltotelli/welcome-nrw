---
name: Welcome NRW
description: Cinematic Kingshot welcome and shared scroll journey
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
  story-bg: "#14171d"
  standard-gold: "#d8b777"
  standard-seam: "#6c5c3c"
  story-muted: "#c6c5c2"
  contact-bg: "#191d24"
  contact-surface: "#242a33"
  contact-muted: "#c9cbd0"
typography:
  display:
    fontFamily: "Cinzel, serif"
    fontSize: "clamp(70px,7.1vw,96px)"
    fontWeight: 550
    lineHeight: 1.06
    letterSpacing: "-.025em"
  headline:
    fontFamily: "Cinzel, serif"
    fontSize: "clamp(30px,3.6vw,46px)"
    fontWeight: 550
    lineHeight: 1.2
    letterSpacing: "-.025em"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "16px"
    lineHeight: 1.6
  story-line:
    fontFamily: "Cinzel, serif"
    fontSize: "clamp(32px,3.5vw,49px)"
    lineHeight: 1.25
    letterSpacing: "-.025em"
rounded:
  square: "0"
  path: "7px"
  control: "5px"
  compact: "6px"
  surface: "8px"
  panorama: "12px"
  panorama-phone: "8px"
  contact: "12px"
  circular: "50%"
spacing:
  section: "88px"
  section-phone: "55px"
  path-gap: "12px"
  contact-gap: "30px"
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
    backgroundColor: "{colors.contact-surface}"
    textColor: "{colors.scene-ink}"
    rounded: "{rounded.contact}"
    padding: "30px"
  alliance-panorama:
    rounded: "{rounded.panorama}"
    height: "430px"
  bear-panorama:
    rounded: "{rounded.panorama}"
    height: "440px"
  contact-copy:
    backgroundColor: "{colors.scene-gold}"
    textColor: "{colors.scene-action-ink}"
    rounded: "{rounded.compact}"
    padding: "10px 14px"
---

# Design System: Welcome NRW

## Overview

**Creative North Star: “One Alliance, One Journey.”** The existing gold-lit citadel and official crownless Helga introduce a continuous Kingshot Welcome. A real NRW standard and three localized lines create the authored scroll moment; factual information remains directly available beneath it. Cinzel, warm gold, Inter body copy, and neutral content surfaces keep the game atmosphere readable.

This is a source scan of public Welcome only. Root leadership documents and Dashboard identity remain separate. BRIEF.md carries audience/content strategy, provenance, data/deployment limits, review evidence, and source fingerprints. The final welcome-story.css layer supersedes hidden-view layout rules while retaining the cinematic hero and shared theme-variable contract.

## Colors

### Primary

Scene gold supplies hero choices, the United wordmark, and the concluding banner line. Standard gold traces the real NRW crest outline; a muted gold seam gives it structure. Warm semantic brand color remains for links, clocks, and field focus.

### Neutral

Frontmatter retains actual light variables, dark overrides, and explicit scene/story/contact colors. Dark brand supplies brand2, gold, cyan, and green; those legacy names do not establish green/cyan accents. Hero, banner, contacts, and landing footer remain dark in either theme; primary informational sections use the selected neutral theme. Footer support text remains at full opacity.

**The Cascade Rule.** Current markup and final story/cinematic declarations govern the rendered page; retained audience-state and old invitation rules are not the active layout contract.

## Typography

Self-hosted Cinzel Variable supplies the NRW./United. wordmark, story lines, section headings, and contact names. Inter remains the local body/control font. Cinzel's SIL OFL is bundled beside the font. Display retains its cinematic clamp and responsive 78px/68px/52px/48px steps; United uses .81em on phones. Scene lead and CTA typography retain the established cinematic sizing.

Story lines use the frontmatter role, becoming 34px at 1000px and 31px on phones. Section headings use the headline role, becoming 31px on phones; FAQ headings use 36px desktop and 30px phone. General section copy uses 1.75 line height, with guide and onboarding paragraphs commonly 15px. Story caption uses 15px/1.8 desktop and 14px phone. Do not hide factual body copy behind entrance animation.

## Layout

The base container remains 1280px maximum with 32px side gutters, reducing to 16px at 680px. Story sections narrow to 1120px; the banner composition tops out at 1080px with a 1fr/1.4fr grid and 100px gap. The standard is 260×330px desktop and 125×158px on phones. At 680px the composition stacks and centers its copy. General section rhythm follows frontmatter; at 1000px sections use 65px vertical padding. Hero keeps the cinematic composition, with story-specific minimum heights 740px desktop, 700px compact, 650px phone.

One continuous page contains banner, transfer fit, server facts, live times, guides, Dashboard, onboarding, language profile, Discord, contacts, and FAQ. Header anchors remain visible at all widths and the hero choices scroll to sections. No selected audience hides primary content. FAQ questions and historical warning remain details; major information wrappers do not. The optional configured public-feed block remains conditional.

Times use a 1fr/1.1fr heading/schedule layout with 70px gap, collapsing on phones. The Bear panorama spans both desktop columns beneath that first row. Its final crop is 440px high, center top; on phones it is 220px high, 62% center. The alliance camp panorama leads server facts at 430px height, centered; phones use 245px height at 52% center. Panorama corners follow the frontmatter desktop/phone radii. The two panorama captions are removed at the user’s request; file provenance and footer credits remain. Server facts and guides use two columns before stacking; onboarding uses three columns before stacking. Contact cards use two columns before stacking, with portraits stepping from 100px to 76px at 1000px and 70px on phones. Existing profile labels, IDs, status nodes, and listeners remain.

## Elevation & Depth

The hero retains cinematic shading, foreground drop shadow, and CTA shadows. Standard crest uses a restrained drop shadow. Story contact surfaces explicitly remove card shadows; neutral section changes, whitespace, and thin rules carry the longer page. Exact active shadows are in the sidecar. Do not infer a global all-flat rule from semantic shadow variables remaining none.

## Shapes

Hero choices retain their cinematic path radius and custom inline SVG icons. Contact cards now use the contact radius, with gold compact copy buttons and unbordered portraits. The standard uses an authored pennant-shaped SVG outline around the real NRW crest. Guide decoration uses local Helga and an authored crossed-swords SVG instead of broken external media. No giant crown or former Lord motif returns.

## Components

### Shared banner scroll scene

The three real localized lines are Many languages / One banner / Stronger together. Native scroll progress illuminates them sequentially and traces the gold standard outline. The effect reverses with scroll. Line opacity ranges from .52 to 1 and vertical offset from 12px to zero; crest moves from 16px/-4deg toward rest. The SVG trace uses normalized path length, dash array 1, and offset 1 minus progress. Only scene elements change; ordinary body text stays readable.

Progress is clamped from viewport/scene geometry, with travel equal to .7 viewport height plus .55 scene height and a .85 viewport start. Updates request one animation frame per scroll/resize while the scene intersects; there is no continuous ticker or scroll hijack. Separate section headings receive a once-only 600ms masked/12px entrance using the established ease-out curve. No-JS defaults show content.

### Navigation, keyboard, and reduced motion

Hero/header links use direct same-document hash navigation, history, target focus, and opening of any FAQ/warning ancestors. They settle target headings immediately. The skip link targets the banner and stays off-screen until keyboard focus. The former native audience-stage transition is disabled by story view-transition names and is not invoked by current navigation.

Keyboard scrolling/activation sets a settled mode for the story, finishing running heading entrances and leaving subsequent headings direct. Reduced motion shows all lines, completes the outline, resets crest transforms, and avoids heading entrances. Visibility changes finish running effects. Language changes finish currently visible headings. Preserve existing global focus, input labels, visible checkbox controls, clipboard feedback, and reduced-motion hero safeguards; this is not a complete accessibility certification.

### Retained cinematic hero

The first-landing intro retains six bounded transform/opacity arrivals: backdrop 1050ms, title 800ms after 60ms, copy 650ms after 120ms, foreground 950ms after 120ms, choices 600ms after 180/240ms. Actions remain usable; noninteractive wrappers own entry transforms and anchors own hover/press. Fine-pointer hover lifts 3px, arrow advances 4px, press scales .985. No ambient infinite loop.

Conditional fine-hover pointer depth remains subordinate: spring mass 1, stiffness 100, damping 10; backdrop at most 6px/4px, foreground 12px/8px plus 1.5deg, text stationary. It stops settled, hidden, blurred, keyboard-driven, outside the hero intersection, reduced-motion, or pointer capability change. Touch input is rejected. Preserve direct navigation and reduced-motion settling rather than restoring audience transitions.

### Scenic illustrations and event emblems

Two new original AI images carry the world between practical sections: alliance-camp in server facts and bear-rally in event times. Both lazy-load with intrinsic 1672×941 dimensions. Their former captions are removed; exact prompts/provenance remain adjacent JSON and embedded Exif. These are not game screenshots. No new animation is attached to these images.

Guide event containers are 96px with 88px local emblems; phones use 80px containers and 76px emblems. The crossed-swords SVG is 76px, 66px on phones; smaller server/onboarding emblems use 60px images. Existing artwork and official UI assets are not modified. Legions use two readable clock lines; on phones their secondary-event groups form two columns.

### Assets and data

The existing citadel remains explicitly AI fantasy illustration with exact-prompt provenance; it is not a game screenshot. Official local Helga and cached real Jey/Demaze portraits retain sources.json provenance. Cinzel OFL remains bundled. This revision adds the two documented original AI panoramas; no external player-provider imagery is fetched. Broken external decorative media are replaced by local Helga and authored crossed swords.

Bear clocks retain one public-schedule authority and no stale fallback; Discord public-config remains the invite authority. Swordland/Tri-Alliance display persisted L1/L2 fields from the same public-schedule authority. The user-requested seed is L1 14:00 and L2 19:00 UTC for both events; these are editable configuration, not hardcoded frontend fallbacks. Group assignments remain in-game. BRIEF.md records the explicitly authorized paired-column migration, existing-ACL editor/API extension, backward compatibility, and unchanged authentication. Contact/profile and external-provider boundaries remain unchanged.

## Do's and Don'ts

- **Do** show all primary information on the continuous page and retain the cinematic hero.
- **Do** keep scroll behavior reversible, no-JS content visible, and keyboard/reduced-motion reading settled.
- **Do** preserve real data, provenance, OFL, labels, focus, locale/theme support, and deployment boundaries.
- **Don't** restore hidden audience streams or major information disclosures.
- **Don't** hijack scrolling, add fake rewards or proof, or animate factual body text out of readability.
- **Don't** restore broken decorative media, obsolete polling-time or early/late claims, green surfaces, or a giant crown hero.

The three desktop onboarding headings share an explicit 64px icon row, including the card without an icon; phones use the natural stacked layout.
