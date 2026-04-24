-- Phase 9 booking workflow compatibility notes
-- Goal: keep existing job_requests rows valid while introducing booking language.

-- Optional: set new default for fresh requests.
alter table public.job_requests
alter column status set default 'requested';

-- Optional: normalize existing legacy statuses into booking-friendly values.
-- Run only if your admin panel no longer depends on legacy values.
-- update public.job_requests set status = 'requested' where status in ('pending', 'new');
-- update public.job_requests set status = 'accepted' where status = 'contacted';
-- update public.job_requests set status = 'in_progress' where status = 'assigned';

-- Optional: add an integrity check after data normalization.
-- alter table public.job_requests
--   add constraint job_requests_status_booking_check
--   check (status in ('requested', 'accepted', 'in_progress', 'completed', 'cancelled'));
