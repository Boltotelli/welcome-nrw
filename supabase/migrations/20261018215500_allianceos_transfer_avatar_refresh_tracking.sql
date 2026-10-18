-- Avoid repeated external lookup for missing transfer-candidate portraits.
alter table public.aos_transfers add column if not exists avatar_checked_at timestamptz;
