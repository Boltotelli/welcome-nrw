# NRW temporary event loans (FDT, Castle Battle, KvK)
Effective 2026-10-20, GitHub Pages pilot.

A loan is separate from a permanent transfer, the NAP transfer log and in-game membership. Data includes game ID, host NWO/RDS, event, start/end (max 21 days), internal note, approved/returned/cancelled status, provenance and immutable creator. Only the authenticated AllianceOS owner may approve or close loans. Viewing requires members or transfers rights. Regular member accounts never gain new permissions from this record.

Players physically visiting the host alliance remain in NRW's home roster only as an explicitly marked loan overlay while a valid approved window is active. Game-source membership is never changed. On expiry, the loan stops preserving privileges, and the transfer view warns that return is overdue.

Existing R4/R5 NRW logins can be protected only by an owner's explicit protect flag. Requires preexisting staff identity, matching previous rank, non-manual lock, current physical host evidence from recent API snapshot (48h) and an unexpired loan. Never creates new accounts or permissions. The 10-minute leader sync protects qualifying existing accounts; it never overrides manual locks. It may reinstate rank_lost on a newly approved, verified protected loan. Two previously locked accounts were not automatically altered without approval.

The private database reconciler runs every 10 minutes. It first records an actual host observation; it can then mark a verified NRW return automatically when a newer NRW observation appears. It writes only aos_event_loans, not NAP or player data. A manual return button is also available.

Unverified past/current player association cannot be used to approve event loans: the API requires current NRW/home or host membership and, when already away, recent transfer provenance from NRW. Record creation is intentionally empty until the owner confirms who is on event loan.

QA: test GitHub Pages rollout, RLS/service-role grants, reconciler scheduled, JS module parser and backend deploy. An authenticated owner-browser test with a genuine authorized loan remains necessary.