# NAP Repository Split — Migration Record

Status: preparation only. No production routing or database changes have been made.

## Current sources (2026-10-02)

### Production
- GitHub repository: Boltotelli/welcome-nrw
- Branch deployed by Vercel: main
- Source directory: nap-event-tracker/
- Vercel project: nap-event-tracker
- Production domain: https://nap-event-tracker.vercel.app
- Supabase project: Kingshot 1044 NAP (bdzlgirowutasrsycjfj)

Current production source snapshot on main:
- index.html: 3bf3b008d204566167f851ee0284c74c14f45678
- live-adapter.js: 40af267c55673946b3b2f10ff49999f3b2e11f77
- live-translations-v2.js: 97c0724ed06c45c6eabcfbdba3e4d9492ad21c47
- native-screen-import.css: 231c84d75721e04b9413a69a87f4274ebb7b0a39
- native-screen-import.js: bec15133ce5ec705249ca348cedce0a90432a546
- vercel.json: 20041cad5c1ea981690903878b9eb1edfd3fbad0

### Vercel test
- GitHub repository: Boltotelli/welcome-nrw
- Branch currently deployed by Vercel: main
- Source directory: nap-event-tracker-test/
- Vercel project: nap-event-tracker-test
- Domain: https://nap-event-tracker-test.vercel.app

### GitHub Pages development/test
- Workflow file: .github/workflows/nap2-pages.yml on main
- Workflow explicitly checks out: fix/nap2-navigation-mobile
- Published source directory: nap-event-tracker-test/
- This branch is newer than main and contains additional OCR/video compatibility files.

Current development snapshot on fix/nap2-navigation-mobile:
- index.html: e587f71b1e411ce0af5220d1d273371e18a86344
- live-adapter.js: 749058e4fcda0771d86a81fea80682769d54a4e4
- live-translations-v2.js: 97c0724ed06c45c6eabcfbdba3e4d9492ad21c47
- native-screen-import.css: 1fe20ec5103f2533490a2558817dcaa8e230577f
- native-screen-import.js: 548d41cf5d390e6a99f7e5d51e5d10f3a76faf6a
- v2.css: a4f43a475803cb004ce9ab335ef1da92fcec8855
- v2.js: 907f18e9bfab4103959dd907371c8a4e8d81f037
- vercel.json: 4d9fa2b29b23530bd334803f4c4c292d120252b4
- video-avc-compat-v23.js: 9e0957b6caa73f44cc4fc77d8b41091e5ff6cc8c
- video-compat-v24.js: 226d26c6115fd41fc56657b2ab2ff06a96fa942e
- video-compat-v25.js: 8bb2a8229d766d7e87c63f9a82f531149d06ce7b
- video-normalizer-worker-v24.js: b5e3d3382b1a324ebafb8ae8f117d4ce67d5fa8b
- video-normalizer-worker-v25.js: fb72092d7f65e59fa6382652ec84535fee2c6a2f

## Confirmed coupling problem

Both Vercel projects nap-event-tracker and nap-event-tracker-test currently redeploy from commits to welcome-nrw/main. This means unrelated Welcome Page / Player Dashboard commits can trigger NAP deployments.

GitHub Pages meanwhile publishes a different branch, fix/nap2-navigation-mobile. Therefore there are currently three independently moving NAP states:
1. Production folder on main
2. Test folder on main
3. Test folder on fix/nap2-navigation-mobile

## Target structure

New repository: Boltotelli/nap-event-tracker

Branches:
- main: production source only
- develop: current development/test source only
- feature/*: temporary work branches

Deployment mapping:
- Vercel nap-event-tracker -> new repo main
- Vercel nap-event-tracker-test -> new repo develop
- GitHub Pages -> new repo develop

Backend:
- keep existing Supabase project unchanged
- no production data migration
- no table/schema move during repository split

## Migration safety rules

1. Do not delete any NAP source from welcome-nrw until both new deployments are verified.
2. Do not alter Supabase schema/data as part of the repository split.
3. Preserve existing Vercel project names and production URLs.
4. Preserve the exact production source snapshot when creating new main.
5. Preserve the exact current GitHub Pages development snapshot when creating new develop.
6. Verify rendered production and test pages before disconnecting the old repository.
7. Keep old source and branches as rollback material until after stable operation.
8. Only then remove NAP folders/workflow/branches from welcome-nrw.

## Next execution step

Create the empty GitHub repository Boltotelli/nap-event-tracker, then import:
- main from welcome-nrw/main:nap-event-tracker/
- develop from welcome-nrw/fix/nap2-navigation-mobile:nap-event-tracker-test/

After byte/file comparison, reconnect the two existing Vercel projects to the new repository.