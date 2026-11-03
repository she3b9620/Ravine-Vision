-- RAVINE Vision: initial relational foundation.
-- This migration is committed to Git only. It has NOT been applied to any hosted project.
-- Monetization amounts, fees, eligibility, and payout rules remain deliberately undefined.

create extension if not exists pgcrypto with schema extensions;

create type public.account_tier as enum ('viewer', 'creator', 'verified', 'select');
create type public.work_kind as enum (
  'short', 'video', 'podcast', 'documentary', 'short_film', 'feature_film',
  'series', 'photography', 'visual_art', 'music', 'writing', 'book',
  'research', 'lecture', 'conversation', 'archive', 'other'
);
create type public.work_status as enum ('draft', 'in_review', 'published', 'unlisted', 'rejected', 'archived');
create type public.community_visibility as enum ('public', 'discoverable_private', 'invite_only');
create type public.membership_status as enum ('requested', 'invited', 'active', 'muted', 'suspended', 'left');
create type public.rights_declaration as enum ('creator_asserted', 'licensed', 'public_domain', 'commissioned', 'permission_pending', 'unknown');
create type public.case_status as enum ('submitted', 'triaged', 'reviewing', 'actioned', 'dismissed', 'appealed');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  handle text unique,
  display_name text not null default '',
  bio text,
  avatar_asset_id uuid,
  preferred_locale text not null default 'ar' check (preferred_locale in ('ar','en')),
  account_tier public.account_tier not null default 'viewer',
  discoverable boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_handle_format check (handle is null or handle ~ '^[a-zA-Z0-9_]{3,30}$')
);

create table public.creator_identities (
  id uuid primary key default gen_random_uuid(),
  owner_account_id uuid not null references public.profiles(id) on delete cascade,
  display_name text not null,
  handle text,
  biography text,
  discipline_tags text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft','submitted','active','restricted','closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_account_id, handle)
);

create table public.works (
  id uuid primary key default gen_random_uuid(),
  creator_identity_id uuid not null references public.creator_identities(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete restrict,
  title text not null,
  synopsis text,
  kind public.work_kind not null,
  status public.work_status not null default 'draft',
  language_code text not null default 'ar',
  visibility text not null default 'public' check (visibility in ('public','unlisted','private')),
  thumbnail_asset_id uuid,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  owner_account_id uuid not null references public.profiles(id) on delete cascade,
  provider text,
  provider_asset_id text,
  asset_kind text not null check (asset_kind in ('video','audio','image','document')),
  state text not null default 'initiated' check (state in ('initiated','uploading','uploaded','processing','ready','failed','quarantined','deleted')),
  mime_type text,
  byte_size bigint check (byte_size is null or byte_size >= 0),
  checksum text,
  duration_seconds numeric(12,3) check (duration_seconds is null or duration_seconds >= 0),
  width integer,
  height integer,
  created_at timestamptz not null default now(),
  unique(provider, provider_asset_id)
);

alter table public.profiles
  add constraint profiles_avatar_asset_fk foreign key (avatar_asset_id) references public.media_assets(id) on delete set null;
alter table public.works
  add constraint works_thumbnail_asset_fk foreign key (thumbnail_asset_id) references public.media_assets(id) on delete set null;

create table public.work_media (
  work_id uuid not null references public.works(id) on delete cascade,
  asset_id uuid not null references public.media_assets(id) on delete restrict,
  role text not null check (role in ('primary','trailer','teaser','poster','subtitle','supplementary')),
  sort_order integer not null default 0,
  primary key(work_id, asset_id, role)
);

create table public.rights_declarations (
  id uuid primary key default gen_random_uuid(),
  work_id uuid not null references public.works(id) on delete cascade,
  claimant_account_id uuid not null references public.profiles(id) on delete restrict,
  declaration public.rights_declaration not null,
  attribution_text text,
  license_reference text,
  evidence_references text[] not null default '{}',
  review_status text not null default 'unreviewed' check (review_status in ('unreviewed','under_review','accepted','disputed','rejected')),
  created_at timestamptz not null default now()
);

create table public.communities (
  id uuid primary key default gen_random_uuid(),
  owner_creator_identity_id uuid references public.creator_identities(id) on delete set null,
  name text not null,
  description text,
  visibility public.community_visibility not null default 'public',
  guidelines text,
  created_at timestamptz not null default now()
);

create table public.community_memberships (
  community_id uuid not null references public.communities(id) on delete cascade,
  account_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','moderator','member')),
  status public.membership_status not null default 'requested',
  joined_at timestamptz,
  primary key(community_id, account_id)
);

create table public.follows (
  follower_account_id uuid not null references public.profiles(id) on delete cascade,
  followed_creator_identity_id uuid not null references public.creator_identities(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(follower_account_id, followed_creator_identity_id)
);

create table public.work_reactions (
  work_id uuid not null references public.works(id) on delete cascade,
  account_id uuid not null references public.profiles(id) on delete cascade,
  reaction text not null check (reaction in ('appreciate','thoughtful','inspiring')),
  created_at timestamptz not null default now(),
  primary key(work_id, account_id)
);

create table public.work_comments (
  id uuid primary key default gen_random_uuid(),
  work_id uuid not null references public.works(id) on delete cascade,
  account_id uuid not null references public.profiles(id) on delete cascade,
  parent_comment_id uuid references public.work_comments(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 10000),
  visibility text not null default 'visible' check (visibility in ('visible','hidden','removed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.safety_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_account_id uuid not null references public.profiles(id) on delete restrict,
  target_type text not null check (target_type in ('account','creator_identity','work','comment','community','message','live_session')),
  target_id uuid not null,
  category text not null check (category in ('harassment','threat','privacy','impersonation','copyright','spam','fraud','misinformation_context','other')),
  explanation text,
  evidence_references text[] not null default '{}',
  status public.case_status not null default 'submitted',
  created_at timestamptz not null default now()
);

create table public.economic_ledger (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.profiles(id) on delete restrict,
  creator_identity_id uuid references public.creator_identities(id) on delete set null,
  source_reference text not null,
  entry_type text not null check (entry_type in ('earning','platform_fee','refund','chargeback','adjustment','payout','reversal')),
  amount_minor bigint not null check (amount_minor >= 0),
  currency_code char(3) not null,
  direction text not null check (direction in ('credit','debit')),
  status text not null default 'pending' check (status in ('pending','available','held','reversed')),
  idempotency_key text not null unique,
  created_at timestamptz not null default now()
);

create table public.payout_requests (
  id uuid primary key default gen_random_uuid(),
  payee_account_id uuid not null references public.profiles(id) on delete restrict,
  amount_minor bigint not null check (amount_minor > 0),
  currency_code char(3) not null,
  status text not null default 'requested' check (status in ('requested','under_review','processing','paid','failed','cancelled')),
  provider_reference text,
  created_at timestamptz not null default now()
);

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_account_id uuid references public.profiles(id) on delete set null,
  action text not null,
  subject_type text not null,
  subject_id uuid,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index works_discovery_idx on public.works(status, visibility, published_at desc) where status = 'published';
create index works_creator_idx on public.works(creator_identity_id, created_at desc);
create index creator_owner_idx on public.creator_identities(owner_account_id);
create index comments_work_idx on public.work_comments(work_id, created_at);
create index community_members_account_idx on public.community_memberships(account_id, status);
create index ledger_account_idx on public.economic_ledger(account_id, created_at desc);
create index reports_queue_idx on public.safety_reports(status, created_at);

-- RLS is enabled on every exposed public table. Policies intentionally start restrictive.
alter table public.profiles enable row level security;
alter table public.creator_identities enable row level security;
alter table public.works enable row level security;
alter table public.media_assets enable row level security;
alter table public.work_media enable row level security;
alter table public.rights_declarations enable row level security;
alter table public.communities enable row level security;
alter table public.community_memberships enable row level security;
alter table public.follows enable row level security;
alter table public.work_reactions enable row level security;
alter table public.work_comments enable row level security;
alter table public.safety_reports enable row level security;
alter table public.economic_ledger enable row level security;
alter table public.payout_requests enable row level security;
alter table public.audit_events enable row level security;

create policy "Profiles are visible when discoverable" on public.profiles
for select to anon, authenticated using (discoverable or id = (select auth.uid()));
create policy "Accounts create their own profile" on public.profiles
for insert to authenticated with check (id = (select auth.uid()) and account_tier = 'viewer');
create policy "Accounts update their own profile" on public.profiles
for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "Active creator identities are discoverable" on public.creator_identities
for select to anon, authenticated using (status = 'active' or owner_account_id = (select auth.uid()));
create policy "Owners create creator identities" on public.creator_identities
for insert to authenticated with check (owner_account_id = (select auth.uid()));
create policy "Owners update creator identities" on public.creator_identities
for update to authenticated using (owner_account_id = (select auth.uid())) with check (owner_account_id = (select auth.uid()));

create policy "Published public works are discoverable" on public.works
for select to anon, authenticated using ((status = 'published' and visibility = 'public') or created_by = (select auth.uid()));
create policy "Owners create works" on public.works
for insert to authenticated with check (created_by = (select auth.uid()) and status = 'draft' and exists (select 1 from public.creator_identities c where c.id = creator_identity_id and c.owner_account_id = (select auth.uid())));
create policy "Owners update works" on public.works
for update to authenticated using (created_by = (select auth.uid())) with check (created_by = (select auth.uid()));

create policy "Owners access their media metadata" on public.media_assets
for select to authenticated using (owner_account_id = (select auth.uid()));
create policy "Owners register media metadata" on public.media_assets
for insert to authenticated with check (owner_account_id = (select auth.uid()));
create policy "Owners update media metadata" on public.media_assets
for update to authenticated using (owner_account_id = (select auth.uid())) with check (owner_account_id = (select auth.uid()));

create policy "Work media follows work visibility" on public.work_media
for select to anon, authenticated using (exists (select 1 from public.works w where w.id = work_id and ((w.status = 'published' and w.visibility = 'public') or w.created_by = (select auth.uid()))));
create policy "Work owners manage media links" on public.work_media
for all to authenticated using (exists (select 1 from public.works w where w.id = work_id and w.created_by = (select auth.uid()))) with check (exists (select 1 from public.works w where w.id = work_id and w.created_by = (select auth.uid())));

create policy "Rights declarations visible to claimant or work owner" on public.rights_declarations
for select to authenticated using (claimant_account_id = (select auth.uid()) or exists (select 1 from public.works w where w.id = work_id and w.created_by = (select auth.uid())));
create policy "Claimants submit rights declarations" on public.rights_declarations
for insert to authenticated with check (claimant_account_id = (select auth.uid()));

create policy "Public communities are discoverable" on public.communities
for select to anon, authenticated using (visibility = 'public' or exists (select 1 from public.community_memberships m where m.community_id = id and m.account_id = (select auth.uid()) and m.status = 'active'));
create policy "Community owners create communities" on public.communities
for insert to authenticated with check (owner_creator_identity_id is null or exists (select 1 from public.creator_identities c where c.id = owner_creator_identity_id and c.owner_account_id = (select auth.uid())));
create policy "Community owners update communities" on public.communities
for update to authenticated using (exists (select 1 from public.creator_identities c where c.id = owner_creator_identity_id and c.owner_account_id = (select auth.uid()))) with check (exists (select 1 from public.creator_identities c where c.id = owner_creator_identity_id and c.owner_account_id = (select auth.uid())));

create policy "Members see their own membership" on public.community_memberships
for select to authenticated using (account_id = (select auth.uid()) or exists (select 1 from public.communities c join public.creator_identities ci on ci.id = c.owner_creator_identity_id where c.id = community_id and ci.owner_account_id = (select auth.uid())));
create policy "Accounts request membership" on public.community_memberships
for insert to authenticated with check (account_id = (select auth.uid()) and role = 'member');
create policy "Accounts leave membership" on public.community_memberships
for update to authenticated using (account_id = (select auth.uid())) with check (account_id = (select auth.uid()) and role = 'member');

create policy "Follows are publicly readable" on public.follows
for select to anon, authenticated using (true);
create policy "Accounts follow creators" on public.follows
for insert to authenticated with check (follower_account_id = (select auth.uid()));
create policy "Accounts unfollow creators" on public.follows
for delete to authenticated using (follower_account_id = (select auth.uid()));

create policy "Reactions visible on public works" on public.work_reactions
for select to anon, authenticated using (exists (select 1 from public.works w where w.id = work_id and w.status = 'published' and w.visibility = 'public'));
create policy "Accounts manage own reactions" on public.work_reactions
for all to authenticated using (account_id = (select auth.uid())) with check (account_id = (select auth.uid()));

create policy "Visible comments on public works" on public.work_comments
for select to anon, authenticated using ((visibility = 'visible' and exists (select 1 from public.works w where w.id = work_id and w.status = 'published' and w.visibility = 'public')) or account_id = (select auth.uid()));
create policy "Accounts comment as themselves" on public.work_comments
for insert to authenticated with check (account_id = (select auth.uid()) and exists (select 1 from public.works w where w.id = work_id and w.status = 'published' and w.visibility = 'public'));
create policy "Accounts edit own comments" on public.work_comments
for update to authenticated using (account_id = (select auth.uid())) with check (account_id = (select auth.uid()));

create policy "Reporters view their reports" on public.safety_reports
for select to authenticated using (reporter_account_id = (select auth.uid()));
create policy "Authenticated accounts submit reports" on public.safety_reports
for insert to authenticated with check (reporter_account_id = (select auth.uid()));

create policy "Accounts view own ledger" on public.economic_ledger
for select to authenticated using (account_id = (select auth.uid()));
create policy "Accounts view own payout requests" on public.payout_requests
for select to authenticated using (payee_account_id = (select auth.uid()));
create policy "Accounts request own payouts" on public.payout_requests
for insert to authenticated with check (payee_account_id = (select auth.uid()));

create policy "Accounts view own audit events" on public.audit_events
for select to authenticated using (actor_account_id = (select auth.uid()));

-- Explicit Data API grants: new Supabase projects no longer auto-expose public tables.
-- Column grants prevent clients from changing account tier, review state, media processing state,
-- ledger entries, payout outcomes, or moderation decisions.
grant select on public.profiles, public.creator_identities, public.works, public.work_media, public.communities, public.follows, public.work_reactions, public.work_comments to anon, authenticated;
grant insert on public.profiles to authenticated;
grant update (handle, display_name, bio, avatar_asset_id, preferred_locale, discoverable, updated_at) on public.profiles to authenticated;
grant insert on public.creator_identities to authenticated;
grant update (display_name, handle, biography, discipline_tags, updated_at) on public.creator_identities to authenticated;
grant insert on public.works to authenticated;
grant update (title, synopsis, kind, language_code, visibility, thumbnail_asset_id, updated_at) on public.works to authenticated;
grant select, insert on public.media_assets to authenticated;
grant insert, update, delete on public.work_media, public.follows, public.work_reactions to authenticated;
grant select, insert on public.rights_declarations, public.safety_reports to authenticated;
grant select on public.media_assets, public.rights_declarations, public.community_memberships, public.economic_ledger, public.payout_requests, public.audit_events to authenticated;
grant insert, update on public.communities, public.community_memberships to authenticated;
grant insert on public.work_comments to authenticated;
grant update (body, updated_at) on public.work_comments to authenticated;
