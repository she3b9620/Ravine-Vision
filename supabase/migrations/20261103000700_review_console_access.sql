-- Minimal role introspection for the authenticated review console.
create or replace function public.current_staff_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select s.role
  from app_private.staff_roles s
  where s.account_id = (select auth.uid())
  limit 1;
$$;
revoke all on function public.current_staff_role() from public, anon;
grant execute on function public.current_staff_role() to authenticated;
