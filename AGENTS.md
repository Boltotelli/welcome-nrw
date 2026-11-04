# Welcome NRW implementation rules

- Every new or changed user-facing feature must ship in all supported languages: German (`de`), English (`en`), French (`fr`) and Spanish (`es`). This includes navigation, labels, placeholders, tooltips, accessibility labels, errors, confirmations, empty/loading states and generated chat output.
- Use the app's selected language. Switching languages must preserve unsaved inputs and active work. Translate interface copy and controlled catalog labels; never translate or overwrite player names, account IDs, saved user content, game tags or private-use game characters.
- Keep persisted identifiers independent of display translations. Existing outpost-type values and other API fields must remain compatible.
- Add key/placeholder parity checks and exercise all four languages in browser tests before publishing a new UI feature. Missing translations must not be hidden by a German fallback in those checks.
