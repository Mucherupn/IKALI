-- Phase 14 provider commission wallet + debt gating

do $$
begin
  if not exists (select 1 from pg_type where typname = 'provider_ledger_type') then
    create type public.provider_ledger_type as enum (
      'commission_due',
      'payment_received',
      'adjustment',
      'credit_applied',
      'penalty'
    );
  end if;
end $$;

create table if not exists public.provider_accounts (
  provider_id uuid primary key references public.providers(id) on delete cascade,
  commission_balance numeric(12,2) not null default 0,
  credit_balance numeric(12,2) not null default 0,
  jobs_allowed_before_payment integer not null default 2 check (jobs_allowed_before_payment >= 0),
  status text not null default 'good_standing',
  updated_at timestamptz not null default now()
);

create table if not exists public.provider_ledger (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  job_request_id uuid references public.job_requests(id) on delete set null,
  type public.provider_ledger_type not null,
  amount numeric(12,2) not null,
  balance_after numeric(12,2) not null,
  description text,
  created_at timestamptz not null default now()
);

create index if not exists provider_ledger_provider_id_created_at_idx
  on public.provider_ledger(provider_id, created_at desc);
create index if not exists provider_ledger_job_request_id_idx
  on public.provider_ledger(job_request_id);
create unique index if not exists provider_ledger_commission_due_job_uniq
  on public.provider_ledger(job_request_id, type)
  where type = 'commission_due';

alter table public.providers
  add column if not exists commission_override boolean not null default false;

create or replace function public.ensure_provider_account(p_provider_id uuid)
returns public.provider_accounts
language plpgsql
as $$
declare
  account_row public.provider_accounts;
begin
  insert into public.provider_accounts (provider_id)
  values (p_provider_id)
  on conflict (provider_id) do nothing;

  select * into account_row
  from public.provider_accounts
  where provider_id = p_provider_id;

  return account_row;
end;
$$;

create or replace function public.refresh_provider_account_state(p_provider_id uuid)
returns public.provider_accounts
language plpgsql
as $$
declare
  account_row public.provider_accounts;
  override_enabled boolean;
  unpaid_balance numeric(12,2);
begin
  account_row := public.ensure_provider_account(p_provider_id);

  select commission_override into override_enabled
  from public.providers
  where id = p_provider_id;

  unpaid_balance := greatest(account_row.commission_balance - account_row.credit_balance, 0);

  if override_enabled then
    update public.provider_accounts
    set status = 'override',
        updated_at = now()
    where provider_id = p_provider_id
    returning * into account_row;
    return account_row;
  end if;

  if unpaid_balance <= 0 then
    update public.provider_accounts
    set status = 'good_standing',
        jobs_allowed_before_payment = 2,
        updated_at = now()
    where provider_id = p_provider_id
    returning * into account_row;
  elsif account_row.jobs_allowed_before_payment <= 0 then
    update public.provider_accounts
    set status = 'restricted',
        updated_at = now()
    where provider_id = p_provider_id
    returning * into account_row;
  else
    update public.provider_accounts
    set status = 'owing',
        updated_at = now()
    where provider_id = p_provider_id
    returning * into account_row;
  end if;

  return account_row;
end;
$$;

create or replace function public.add_provider_ledger_entry(
  p_provider_id uuid,
  p_type public.provider_ledger_type,
  p_amount numeric,
  p_description text default null,
  p_job_request_id uuid default null
)
returns public.provider_ledger
language plpgsql
as $$
declare
  account_row public.provider_accounts;
  ledger_row public.provider_ledger;
  remaining numeric(12,2);
  credit_to_apply numeric(12,2);
  next_commission numeric(12,2);
  next_credit numeric(12,2);
  net_after numeric(12,2);
begin
  account_row := public.ensure_provider_account(p_provider_id);

  next_commission := account_row.commission_balance;
  next_credit := account_row.credit_balance;

  if p_type = 'commission_due' or p_type = 'penalty' then
    next_commission := next_commission + greatest(p_amount, 0);
  elsif p_type = 'payment_received' then
    remaining := greatest(p_amount, 0);
    if next_commission > 0 then
      credit_to_apply := least(next_commission, remaining);
      next_commission := next_commission - credit_to_apply;
      remaining := remaining - credit_to_apply;
    end if;
    if remaining > 0 then
      next_credit := next_credit + remaining;
    end if;
  elsif p_type = 'credit_applied' then
    remaining := greatest(p_amount, 0);
    credit_to_apply := least(next_credit, remaining);
    next_credit := next_credit - credit_to_apply;
    next_commission := greatest(next_commission - credit_to_apply, 0);
  elsif p_type = 'adjustment' then
    if p_amount >= 0 then
      next_commission := next_commission + p_amount;
    else
      remaining := abs(p_amount);
      if next_commission > 0 then
        credit_to_apply := least(next_commission, remaining);
        next_commission := next_commission - credit_to_apply;
        remaining := remaining - credit_to_apply;
      end if;
      if remaining > 0 then
        next_credit := next_credit + remaining;
      end if;
    end if;
  end if;

  update public.provider_accounts
  set commission_balance = round(next_commission, 2),
      credit_balance = round(next_credit, 2),
      updated_at = now()
  where provider_id = p_provider_id
  returning * into account_row;

  account_row := public.refresh_provider_account_state(p_provider_id);
  net_after := round(greatest(account_row.commission_balance - account_row.credit_balance, 0), 2);

  insert into public.provider_ledger (
    provider_id, job_request_id, type, amount, balance_after, description
  ) values (
    p_provider_id, p_job_request_id, p_type, round(p_amount, 2), net_after, p_description
  )
  returning * into ledger_row;

  return ledger_row;
end;
$$;

create or replace function public.apply_commission_on_job_completion()
returns trigger
language plpgsql
as $$
declare
  provider_uuid uuid;
  final_amount numeric(12,2);
  commission_amount numeric(12,2);
  previous_amount numeric(12,2);
  existing_ledger_id uuid;
begin
  select provider_id into provider_uuid
  from public.job_requests
  where id = new.job_request_id;

  if provider_uuid is null then
    return new;
  end if;

  final_amount := round(coalesce(new.final_amount_used, new.provider_reported_amount, 0), 2);
  if final_amount <= 0 then
    return new;
  end if;

  commission_amount := round(final_amount * 0.10, 2);

  select id, amount into existing_ledger_id, previous_amount
  from public.provider_ledger
  where job_request_id = new.job_request_id
    and type = 'commission_due'
  limit 1;

  if existing_ledger_id is null then
    perform public.add_provider_ledger_entry(
      provider_uuid,
      'commission_due',
      commission_amount,
      '10% commission due on completed job',
      new.job_request_id
    );
  elsif previous_amount <> commission_amount then
    perform public.add_provider_ledger_entry(
      provider_uuid,
      'adjustment',
      commission_amount - previous_amount,
      'Commission recalculation adjustment',
      new.job_request_id
    );

    update public.provider_ledger
    set amount = commission_amount
    where id = existing_ledger_id;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_job_completion_commission on public.job_completions;
create trigger trg_job_completion_commission
after insert or update of final_amount_used, provider_reported_amount
on public.job_completions
for each row
execute function public.apply_commission_on_job_completion();

create or replace function public.enforce_provider_debt_gate()
returns trigger
language plpgsql
as $$
declare
  account_row public.provider_accounts;
  provider_override boolean;
  unpaid_balance numeric(12,2);
  alternative_provider_exists boolean;
begin
  if new.provider_id is null then
    return new;
  end if;

  if new.status not in ('accepted', 'in_progress') then
    return new;
  end if;

  if tg_op = 'UPDATE'
     and old.provider_id = new.provider_id
     and old.status in ('accepted', 'in_progress')
     and new.status in ('accepted', 'in_progress') then
    return new;
  end if;

  select commission_override into provider_override
  from public.providers
  where id = new.provider_id;

  if provider_override then
    perform public.refresh_provider_account_state(new.provider_id);
    return new;
  end if;

  account_row := public.refresh_provider_account_state(new.provider_id);
  unpaid_balance := greatest(account_row.commission_balance - account_row.credit_balance, 0);

  if unpaid_balance <= 0 then
    return new;
  end if;

  if account_row.jobs_allowed_before_payment <= 0 then
    select exists (
      select 1
      from public.providers p
      join public.provider_services ps on ps.provider_id = p.id and ps.service_category_id = new.service_category_id
      left join public.provider_accounts pa on pa.provider_id = p.id
      where p.id <> new.provider_id
        and coalesce(p.is_available, true)
        and coalesce(pa.status, 'good_standing') <> 'restricted'
        and (
          lower(coalesce(p.service_area, '')) like '%' || lower(new.location) || '%'
          or lower(new.location) like '%' || lower(coalesce(p.location, '')) || '%'
        )
    ) into alternative_provider_exists;

    if alternative_provider_exists then
      raise exception 'Provider account is restricted until outstanding commission is paid';
    end if;

    return new;
  end if;

  update public.provider_accounts
  set jobs_allowed_before_payment = greatest(jobs_allowed_before_payment - 1, 0),
      updated_at = now()
  where provider_id = new.provider_id;

  perform public.refresh_provider_account_state(new.provider_id);

  return new;
end;
$$;

drop trigger if exists trg_provider_debt_gate on public.job_requests;
create trigger trg_provider_debt_gate
before insert or update of provider_id, status
on public.job_requests
for each row
execute function public.enforce_provider_debt_gate();

insert into public.provider_accounts (provider_id)
select p.id
from public.providers p
on conflict (provider_id) do nothing;
