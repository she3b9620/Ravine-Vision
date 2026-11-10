-- Community governance fixes.
--
-- 1. Community owners could not approve or reject membership requests: the only
--    UPDATE policy on community_memberships was scoped to the member's own row,
--    so an owner's update silently matched zero rows, and DELETE had no grant at
--    all. Owners now get explicit UPDATE/DELETE policies through the
--    security-definer owns_community helper.
-- 2. Entry-quiz answer keys were stored inside communities.entry_questions, a
--    publicly readable row, so any visitor could read the answers over the REST
--    API. Keys move to a private table that no client may read; validation and
--    saving happen through SECURITY DEFINER functions.
-- 3. Private communities were unreachable: the SELECT policy hid them from their
--    own owner. Owners can now read their communities and signed-in accounts can
--    discover discoverable-private ones.

-- --- 1. Owner membership management -----------------------------------------

drop policy if exists "Community owners manage membership requests" on public.community_memberships;
create policy "Community owners manage membership requests"
on public.community_memberships
for update to authenticated
using (app_private.owns_community(community_id))
with check (
  app_private.owns_community(community_id)
  and status in ('requested', 'invited', 'active', 'muted', 'suspended', 'left')
);

drop policy if exists "Community owners remove membership requests" on public.community_memberships;
create policy "Community owners remove membership requests"
on public.community_memberships
for delete to authenticated
using (app_private.owns_community(community_id) and status = 'requested');

grant update (status, joined_at) on public.community_memberships to authenticated;
grant delete on public.community_memberships to authenticated;

-- --- 2. Private entry-quiz answer keys --------------------------------------

create table if not exists public.community_entry_answer_keys (
  community_id uuid not null references public.communities(id) on delete cascade,
  question_id text not null,
  accepted_answers text[] not null default '{}',
  primary key (community_id, question_id)
);

alter table public.community_entry_answer_keys enable row level security;

-- No client may read or write keys directly. The policy exists so the table is
-- never "RLS with zero policies", but it grants nothing.
drop policy if exists "Entry answer keys are never client-readable" on public.community_entry_answer_keys;
create policy "Entry answer keys are never client-readable"
on public.community_entry_answer_keys
for select to authenticated
using (false);

revoke all on public.community_entry_answer_keys from public, anon, authenticated;

-- Owner-only: replace the public question list and its private answer keys.
create or replace function public.save_community_entry_quiz(
  p_community_id uuid,
  p_questions jsonb
)
returns void
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  if not app_private.owns_community(p_community_id) then
    raise exception 'not the community owner';
  end if;
  if p_questions is null or jsonb_typeof(p_questions) <> 'array' then
    raise exception 'questions must be a JSON array';
  end if;

  update public.communities
     set entry_questions = coalesce(
       (select jsonb_agg(jsonb_build_object(
                 'id', q->>'id',
                 'question', q->>'question',
                 'type', coalesce(q->>'type', 'text'),
                 'options', case when jsonb_typeof(q->'options') = 'array' then q->'options' else null end
               ))
        from jsonb_array_elements(p_questions) q),
       '[]'::jsonb)
   where id = p_community_id;

  delete from public.community_entry_answer_keys where community_id = p_community_id;

  insert into public.community_entry_answer_keys (community_id, question_id, accepted_answers)
  select p_community_id,
         q->>'id',
         case
           when jsonb_typeof(q->'correct_answer') = 'array'
             then array(select jsonb_array_elements_text(q->'correct_answer'))
           else array[q->>'correct_answer']
         end
  from jsonb_array_elements(p_questions) q
  where (q->>'id') is not null
    and (q->>'id') <> ''
    and (jsonb_typeof(q->'correct_answer') = 'array' or coalesce(q->>'correct_answer', '') <> '');
end;
$$;
revoke all on function public.save_community_entry_quiz(uuid, jsonb) from public, anon;
grant execute on function public.save_community_entry_quiz(uuid, jsonb) to authenticated;

-- Any signed-in account: true only when every stored key is answered correctly.
create or replace function public.validate_community_entry_quiz(
  p_community_id uuid,
  p_answers jsonb
)
returns boolean
language plpgsql
stable
security definer
set search_path = public, pg_catalog
as $$
declare
  v_key record;
  v_answer text;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  for v_key in
    select question_id, accepted_answers
    from public.community_entry_answer_keys
    where community_id = p_community_id
  loop
    v_answer := p_answers->>v_key.question_id;
    if v_answer is null then
      return false;
    end if;
    if not exists (
      select 1 from unnest(v_key.accepted_answers) answer
      where lower(btrim(answer)) = lower(btrim(v_answer))
    ) then
      return false;
    end if;
  end loop;
  return true;
end;
$$;
revoke all on function public.validate_community_entry_quiz(uuid, jsonb) from public, anon;
grant execute on function public.validate_community_entry_quiz(uuid, jsonb) to authenticated;

-- Move any legacy answers out of the public JSON, then strip them.
insert into public.community_entry_answer_keys (community_id, question_id, accepted_answers)
select community.id,
       question->>'id',
       case
         when jsonb_typeof(question->'correct_answer') = 'array'
           then array(select jsonb_array_elements_text(question->'correct_answer'))
         else array[question->>'correct_answer']
       end
from public.communities community
     cross join lateral jsonb_array_elements(coalesce(community.entry_questions, '[]'::jsonb)) question
where (question->>'id') is not null
  and (question->>'id') <> ''
  and (jsonb_typeof(question->'correct_answer') = 'array' or coalesce(question->>'correct_answer', '') <> '')
on conflict (community_id, question_id) do nothing;

update public.communities
   set entry_questions = coalesce(
     (select jsonb_agg(jsonb_build_object(
               'id', q->>'id',
               'question', q->>'question',
               'type', coalesce(q->>'type', 'text'),
               'options', case when jsonb_typeof(q->'options') = 'array' then q->'options' else null end
             ))
      from jsonb_array_elements(coalesce(entry_questions, '[]'::jsonb)) q),
     '[]'::jsonb)
where jsonb_typeof(entry_questions) = 'array';

-- --- 3. Visibility-aware community read policy ------------------------------

drop policy if exists "Members discover their communities" on public.communities;
create policy "Members discover their communities"
on public.communities
for select to authenticated
using (
  visibility in ('public', 'discoverable_private')
  or app_private.is_active_community_member(id)
  or app_private.owns_community(id)
);
