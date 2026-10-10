# Optional per-Governor GitHub profile snapshots (public)

The new ID loader reads `./profiles/<numeric-governor-id>.json` (same path under `bear/profiles/` in this branch) and falls back to the player's existing browser-local `nrw_bear_profile_v1_<id>` if the file does not exist. **No game API requests are made by the ID form.**

**There are currently NO committed player snapshots in this folder.** The existing stats entered through the web browser are stored locally and are **NOT automatically synced to GitHub**. Do not upload player data to a public repo without the user's explicit approval and a suitable privacy/access plan.

Expected approved file format:

```json
{
  "governor_id": "000000000",
  "name": "Game nickname",
  "values": { "troopsI": 1000, "troopsC": 1000, "troopsA": 1000, "cap": 120000,
    "iAtk": 100, "iLet": 100, "cAtk": 100, "cLet": 100, "aAtk": 100, "aLet": 100 },
  "v2": { "troopTiers": [{"tier": 10,"tg": 6},{"tier": 10,"tg": 5},{"tier": 10,"tg": 6}],
    "ownHeroes": ["Zoe", "Petra", "Yang"], "manualHeroes": {}, "scannedOwnedHeroes": [] }
}
```

The values above are **schema illustrations**, NOT any real player's values. Starter hero details, screenshot provenance, widgets, Pet skill ranks and Valora talent may be included only when intentionally published. Avoid exporting names or unrelated private information from the NAP app/Supabase. The loader validates the ID inside the file matches the requested ID; it never uses live MightPulse. This is a GitHub Pages preview only.
