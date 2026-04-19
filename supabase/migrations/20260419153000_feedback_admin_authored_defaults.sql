-- Feedback is now authored directly by admin in backoffice.
-- Remove mandatory moderation inputs from creation flow and make defaults public/reviewed.

alter table public.feedbacks
  alter column rating drop not null;

alter table public.feedbacks
  drop constraint if exists feedbacks_rating_check;

alter table public.feedbacks
  add constraint feedbacks_rating_check
  check (rating is null or rating between 1 and 5);

alter table public.feedbacks
  alter column status set default 'reviewed';

alter table public.feedbacks
  alter column is_public set default true;
