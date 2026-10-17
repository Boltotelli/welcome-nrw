-- Separate invited candidates from confirmed kingdom transfers.
alter table public.aos_transfers drop constraint if exists aos_transfers_status_check;
alter table public.aos_transfers add constraint aos_transfers_status_check
  check (status in ('interested','shortlisted','invited','confirmed','waitlist','completed','cancelled'));
