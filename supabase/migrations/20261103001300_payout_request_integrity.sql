-- Payout requests are requests against already-available ledger funds only.
-- No provider transfer, earning eligibility, fee, threshold, or payout schedule is enabled.
-- Git-only migration; do not apply until an isolated Supabase project is approved.

revoke insert, update, delete on public.economic_ledger from authenticated, anon;
revoke insert, update, delete on public.payout_requests from authenticated, anon;

create or replace function public.request_creator_payout(
  p_amount_minor bigint,
  p_currency_code text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_account_id uuid := (select auth.uid());
  v_available bigint;
  v_reserved bigint;
  v_request_id uuid;
  v_currency text := upper(trim(p_currency_code));
begin
  if v_account_id is null then
    raise exception 'authentication_required' using errcode = '42501';
  end if;

  if p_amount_minor is null or p_amount_minor <= 0 then
    raise exception 'invalid_payout_amount' using errcode = '22023';
  end if;

  if v_currency !~ '^[A-Z]{3}$' then
    raise exception 'invalid_currency_code' using errcode = '22023';
  end if;

  -- Serialize payout requests per account to prevent concurrent over-reservation.
  perform pg_advisory_xact_lock(hashtextextended(v_account_id::text, 0));

  select coalesce(sum(
    case when direction = 'credit' then amount_minor else -amount_minor end
  ), 0)::bigint
  into v_available
  from public.economic_ledger
  where account_id = v_account_id
    and currency_code = v_currency
    and status = 'available';

  select coalesce(sum(amount_minor), 0)::bigint
  into v_reserved
  from public.payout_requests
  where payee_account_id = v_account_id
    and currency_code = v_currency
    and status in ('requested','under_review','processing');

  if p_amount_minor > greatest(v_available - v_reserved, 0) then
    raise exception 'insufficient_available_balance' using errcode = '22023';
  end if;

  insert into public.payout_requests(payee_account_id, amount_minor, currency_code, status)
  values (v_account_id, p_amount_minor, v_currency, 'requested')
  returning id into v_request_id;

  insert into public.audit_events(actor_account_id, action, subject_type, subject_id, metadata)
  values (
    v_account_id,
    'creator_payout_requested',
    'payout_request',
    v_request_id,
    jsonb_build_object('amount_minor', p_amount_minor, 'currency_code', v_currency)
  );

  return v_request_id;
end;
$$;

revoke all on function public.request_creator_payout(bigint,text) from public, anon;
grant execute on function public.request_creator_payout(bigint,text) to authenticated;
