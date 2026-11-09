-- Community privacy levels and entry requirements for public communities.
-- Visibility enum already exists: public, discoverable_private, invite_only.
-- Add entry_questions (JSON array of {id, question, type, options?}) so public
-- communities can require a short quiz before a join request is created.

alter table public.communities
add column if not exists entry_questions jsonb default '[]'::jsonb;

comment on column public.communities.entry_questions is
'Entry questions for public communities. Empty array means open request-only.';

-- Index for privacy-level lookups on the public communities page.
create index if not exists communities_visibility_idx
on public.communities(visibility) where visibility = 'public';
