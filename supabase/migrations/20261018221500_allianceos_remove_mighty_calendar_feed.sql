-- Mighty kingdom event calendar requires a paid subscription.
-- Keep the NRW pilot free of dependencies on paid APIs.
-- This isolated feed was empty and is no longer read by AllianceOS.
drop table if exists public.aos_transfer_phase_feed;
