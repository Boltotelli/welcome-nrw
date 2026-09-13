# Welcome NRW — Work Handoff

## Mission
Build and maintain the public Kingshot onboarding site for `[NRW]United` on Server 1044. The user wants a **zero-manual-step workflow after setup**: they should be able to ask ChatGPT for changes in natural language, and Work should update the GitHub source, let Vercel deploy automatically, verify production, and report the result.

## Hard safety boundary
- **Do not modify** the existing NAP/Event Tracker apps, repositories, deployments, database logic, or production behavior.
- Existing apps include `nap-event-tracker`, `nap-event-tracker-test`, `nap-event-tracker-admin`, `nap-event-tracker-sg` and related projects.
- Reuse the existing Supabase project **only** for the already-created Welcome language profile endpoint/data integration.
- Do not create a second Supabase project.
- Do not expose service-role or other secrets.

## Source of truth
GitHub repository: `Boltotelli/welcome-nrw`
Target production domain: `https://welcome-nrw.vercel.app`
Target hosting: Vercel static site connected directly to the GitHub repository.

Once setup is complete, all future changes must follow:
`User request -> edit GitHub source -> commit/push -> Vercel auto-deploy -> verify production -> report result`

Do not reintroduce Vercel Drop loaders, Base64/GZIP chunk loaders, iframes, deployment-specific asset hosts, or Supabase website-serving hacks.

## Current source package
The current source files in this handoff are intended to be committed as plain static files:
- `index.html`
- `styles.css`
- `app.js`
- `laws.html`
- `laws.css`
- `laws.js`
- `assets/nrw-banner.svg`
- `vercel.json`

Framework: none. Static HTML/CSS/JS only.

## Required product behavior
- Default language: English for first-time visitors.
- Supported UI languages: DE / EN / FR.
- Persist language with `localStorage` key `nrw_page_lang`.
- Support dark/light mode and persist theme using `nrw_theme`.
- Public site should feel like a friendly Kingshot community page, not an admin dashboard.
- The public Welcome page must never mention “NAP Event Tracker”.

## Discord
Official invite: `https://discord.gg/yxKza24dUv`
Never use the obsolete invite `https://discord.gg/2nXQW8MPQv`.

## Event terminology and times
Use these exact public names/rules:
- Swordland English name: **Swordland Showdown**
- **Tri-Alliance** everywhere. Never `TriForce` and never `Tri-Alliance Clash` in visible text.
- Swordland: 14:00 UTC and 19:00 UTC. No weekday labels.
- Tri-Alliance: 14:00 UTC and 19:00 UTC.
- Bear Trap 1: 17:00 UTC.
- Bear Trap 2: 18:30 UTC.
- Do not add Castle Battle to the Welcome page.
- Alliance Brawl uses an alternate alliance for smaller/secondary accounts and easier matchmaking/reward chances; players return to NRW afterward.
- Never use the old alternate-alliance name `EzA`.
- DE: `Alternativallianz`
- EN: `alternate alliance`
- FR: `alliance alternative`

Event-times note:
- DE: `Zeiten für Schwertland und Tri-Alliance werden per Ingame-Abstimmung festgelegt; Bärenfallen-Zeiten können bei Bedarf angepasst werden.`
- EN: `Swordland and Tri-Alliance times are decided by an in-game poll; Bear Trap times can be adjusted when needed.`
- FR: natural equivalent.

## NRW community copy principles
NRW is F2P-friendly, relaxed/social, organized for important events, and suitable for casual after-work players. Core messages:
- Team > ego.
- KvK comes first.
- Save outside KvK and contribute strongly in KvK Prep unless leadership says otherwise.
- Server 1044 is generally peaceful.
- Mention the 3× spending rule, but do not advertise the tracker tool.

## Language profile
Players can save spoken languages.
Fixed choices: DE, EN, TR, ES, FR plus Other free text.
Multi-select hint:
- DE: `Mehrfachauswahl möglich – wähle einfach alle Sprachen aus, die du sprichst.`
- EN: `Multiple selections are possible — simply choose every language you speak.`
- FR: `Plusieurs choix sont possibles — sélectionne simplement toutes les langues que tu parles.`

Profile localStorage key: `nrw_member_profile_v1`
Payload schemaVersion: 2
Integration hook: `window.NRW_MEMBER_PROFILE_PAYLOAD`

Current explanatory text:
- DE: `Unsere R4/R5 nutzen eine App, in der die NRW-Mitglieder verwaltet werden. Deine Sprachangabe hilft uns dabei, dich bei wichtigen Informationen in einer passenden Sprache zu erreichen.`
- EN: `Our R4/R5 use an app that lists NRW members. Adding your languages here helps us reach you in a language you understand when important information needs to be shared.`
- FR: `Nos R4/R5 utilisent une application qui répertorie les membres de NRW. Indiquer tes langues ici nous aide à te transmettre les informations importantes dans une langue que tu comprends.`

Do not add any sentence implying this will only be linked to a member profile “later”.

## Supabase — use only for Welcome language profile
Existing Supabase project ref: `bdzlgirowutasrsycjfj`
API base: `https://bdzlgirowutasrsycjfj.supabase.co`

Existing Edge Function:
`https://bdzlgirowutasrsycjfj.supabase.co/functions/v1/nrw-welcome-language`

Function behavior already in production:
- POST / OPTIONS
- public CORS
- validates player name + digits-only player ID
- allowed fixed language values: `de,en,tr,es,fr`
- `other:` value is limited to 40 chars
- server-side service-role lookup matches active NRW player by `game_id` and case-insensitive name
- updates only `players.languages`
- invalid player returns 404 `player_not_found`

Existing table columns relevant to this feature:
`players(id uuid, alliance_code text, name text, active boolean, created_at timestamptz, game_id text, languages ARRAY)`

Do not change existing NAP tracker behavior or broader player-table logic unless the user explicitly asks for a Welcome-specific database change and the impact is isolated and reviewed.

## Server Laws page
Dedicated `laws.html`, languages DE/EN/FR, search/categories/expandable law cards.
Dark mode and language switching must work.
Law 14 must start **collapsed**.
Law 13A badge must remain on one row (`LAW 13A`).
Laws 14 and 14A should be highlighted in the spending category.

Public laws summary/facts:
1. No internal NAP attacks/scouting except by agreement/approved event.
2. Personal conduct sanctions.
3. No poaching within NAP.
4. KE rules.
5. Server-wide protection.
6. Academy rule.
7. Additional protected alliances.
8. Sanctuary/Fort control.
9. Sanctuary selection normalized formula: `Score / ((AlliancePower^0.7) × (Members^0.3))`
10. Automatic abstention after 48h.
11. Fair use of Outposts.
12. Inactivity >14 days; announced absence max 21 days.
13. Dispute evidence/recusal/review within 36h/simple majority/implement within 48h.
13A. King/Queen tie-break.
14. Strictly **>3.00×**; exactly 3.00× is NOT a violation; KvK Prep excluded; progressive sanctions.
14A. Strongest Governor Rotation.

Law 14A English body:
`To reduce overall spending during Strongest Governor (SG), NAP alliances rotate nominations of players who are permitted to compete and rank in SG. Nominated players are exempt from the 3× spending limit for that SG, while still demonstrating sensible spending. All other players remain subject to Law #14. The goal is to concentrate spending among nominated players, while allowing the rest of the kingdom to save resources for kingdom-vs-kingdom events.`

DE title: `Strongest-Governor-Rotation`
EN title: `Strongest Governor Rotation`
FR title: `Rotation du Strongest Governor`

Note: Law 4 may still mention Castle Battle as part of the factual KE law. The “no Castle Battle” restriction only applies to the Welcome page event presentation.

## Welcome page structure
Current intended sections:
1. Navbar with NRW banner
2. Hero
3. Start cards: Discord, KvK focus, absence
4. “NRW in 60 seconds”
5. NRW & Server concise cards
6. Event times
7. Event guide
8. Language profile
9. Discord invitation
10. Server Laws callout
11. Credits/footer

## Required hello copy
DE:
`Hey zusammen, ich bin neu bei NRW 👋 Freue mich auf die Zeit mit euch! Wenn ich bei Events oder Abläufen etwas übersehe, sagt mir einfach kurz Bescheid 😊`

EN:
`Hey everyone, I'm new to NRW 👋 Looking forward to playing with you! If I miss anything about events or our routines, just let me know 😊`

FR:
`Salut tout le monde, je viens d’arriver chez NRW 👋 Hâte de jouer avec vous ! Si je rate quelque chose concernant un événement ou nos habitudes, dites-le-moi simplement 😊`

## Artwork URLs
Bear Trap:
`https://got-global-wiki.s3.us-west-1.amazonaws.com/wp-content/uploads/2026/01/jump_icon_40088.png`

Tri-Alliance:
`https://kingshotguides.com/wp-content/uploads/2025/10/tri-alliance-clash-icon.webp`

Swordland:
`https://kingshotguides.com/wp-content/uploads/2025/05/Swordland-Showdown-1.webp`

KvK — always use this specific icon:
`https://kingshotdata.com/uploads/2025/05/kingdom-of-power-event-icon.webp`

Strongest Governor:
`https://got-global-wiki.s3.us-west-1.amazonaws.com/wp-content/uploads/2026/04/%E8%87%B3%E9%AB%98%E9%A2%86%E4%B8%BBactivity_icon_2304001_outlined-hd.png`

Character art:
- Lord: `https://www.centurygames.com/wp-content/uploads/2025/04/lordchar.png`
- Helga: `https://www.centurygames.com/wp-content/uploads/2025/04/helgachar.png`
- Chenko: `https://www.centurygames.com/wp-content/uploads/2025/04/chenkochar.png`
- Amadeus: `https://www.centurygames.com/wp-content/uploads/2025/04/amadeuschar.png`
- Saul: `https://www.centurygames.com/wp-content/uploads/2025/04/saulchar.png`
- Laws hero Hilde: `https://www.kingshotguide.com/heroes/generations/generation-2-heroes/hilde-kingshot-full.webp`

The Laws hero should not show the NRW banner/crest; navbar may still show the small NRW banner.

## Credits
Footer should identify the site as an unofficial community project and credit Century Games for game/character art. Event art may credit Kingshot Data / Kingshot Guides and the Bear/SG source as appropriate.

## Setup task for Work
1. Inspect this source package locally before changing anything.
2. Commit the plain static source to `Boltotelli/welcome-nrw` on `main`.
3. Connect/import `Boltotelli/welcome-nrw` into Vercel as a static project named `welcome-nrw`.
4. Ensure production alias/domain is `https://welcome-nrw.vercel.app`.
5. Do not use framework build steps unless absolutely necessary; prefer zero-build static hosting.
6. Verify `/` and `/laws.html` return rendered HTML with correct `Content-Type`, not source text or a loading shell.
7. Verify on the rendered production site:
   - language switch works
   - dark/light theme works
   - Law 14 starts collapsed
   - Discord link is correct
   - no visible `TriForce`
   - no visible `Tri-Alliance Clash`
   - no Welcome-page Castle Battle card
   - language profile POST calls the existing `nrw-welcome-language` Edge Function
8. Report exactly what was verified. Do not claim browser rendering if only HTTP status was checked.

## Future change policy
After setup, never ask the user to manually upload files, visit Vercel, or edit GitHub for routine site changes. Use Work/browser/connectors to complete the change end-to-end.

For every future production change:
- inspect current repository state first
- make the smallest relevant edit
- commit with a concise message
- wait for Vercel production deployment
- verify affected production behavior
- report success only after verification
- if deployment fails, keep the last known-good production version intact and diagnose before retrying

## Setup status
- GitHub source and Vercel production project are connected.
- Production alias: `https://welcome-nrw.vercel.app`
