-- TradeStryker schema for Supabase PostgreSQL
-- Run via: npm run db:migrate

create extension if not exists "pgcrypto";

-- Profiles (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'admin', 'master_admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Generated setups from confluence scoring
create table if not exists public.setups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  ticker_symbol text not null,
  ticker_name text,
  logo_url text,
  timeframe text not null,
  score int not null default 0,
  max_score int not null default 0,
  grade text,
  rating_label text,
  rating_color text,
  quality_pct numeric(6,2),
  sync_pct numeric(6,2),
  confidence_pct numeric(6,2),
  active_count int default 0,
  complete_count int default 0,
  bias text check (bias in ('long', 'short', 'neutral')),
  entry_price numeric(18,8),
  factors_json jsonb,
  created_at timestamptz not null default now()
);

create index if not exists setups_user_created_idx on public.setups (user_id, created_at desc);
create index if not exists setups_symbol_idx on public.setups (ticker_symbol);

-- Trade journal entries with outcomes
create table if not exists public.trades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  setup_id uuid references public.setups(id) on delete set null,
  ticker_symbol text not null,
  ticker_name text,
  direction text not null check (direction in ('long', 'short')),
  entry_price numeric(18,8),
  exit_price numeric(18,8),
  quantity numeric(18,8) default 1,
  status text not null default 'open' check (status in ('open', 'closed', 'cancelled')),
  pnl numeric(18,2),
  pnl_percent numeric(10,4),
  notes text,
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists trades_user_status_idx on public.trades (user_id, status, created_at desc);

-- Optional OHLCV cache to reduce market API calls
create table if not exists public.market_bars (
  id bigserial primary key,
  symbol text not null,
  timeframe text not null,
  bar_time timestamptz not null,
  open numeric(18,8) not null,
  high numeric(18,8) not null,
  low numeric(18,8) not null,
  close numeric(18,8) not null,
  volume numeric(24,4),
  unique (symbol, timeframe, bar_time)
);

create index if not exists market_bars_lookup_idx on public.market_bars (symbol, timeframe, bar_time desc);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'user')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.setups enable row level security;
alter table public.trades enable row level security;
alter table public.market_bars enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

create or replace function public.is_master_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'master_admin'
  );
$$;

drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin" on public.profiles
  for select using (public.is_master_admin());

drop policy if exists "setups_select_admin" on public.setups;
create policy "setups_select_admin" on public.setups
  for select using (public.is_master_admin());

drop policy if exists "trades_select_admin" on public.trades;
create policy "trades_select_admin" on public.trades
  for select using (public.is_master_admin());

drop policy if exists "setups_select_own" on public.setups;
create policy "setups_select_own" on public.setups
  for select using (auth.uid() = user_id);

drop policy if exists "setups_insert_own" on public.setups;
create policy "setups_insert_own" on public.setups
  for insert with check (auth.uid() = user_id);

drop policy if exists "setups_delete_own" on public.setups;
create policy "setups_delete_own" on public.setups
  for delete using (auth.uid() = user_id);

drop policy if exists "trades_select_own" on public.trades;
create policy "trades_select_own" on public.trades
  for select using (auth.uid() = user_id);

drop policy if exists "trades_insert_own" on public.trades;
create policy "trades_insert_own" on public.trades
  for insert with check (auth.uid() = user_id);

drop policy if exists "trades_update_own" on public.trades;
create policy "trades_update_own" on public.trades
  for update using (auth.uid() = user_id);

drop policy if exists "trades_delete_own" on public.trades;
create policy "trades_delete_own" on public.trades
  for delete using (auth.uid() = user_id);

drop policy if exists "market_bars_read_all" on public.market_bars;
create policy "market_bars_read_all" on public.market_bars
  for select using (true);

drop policy if exists "market_bars_service_write" on public.market_bars;
create policy "market_bars_service_write" on public.market_bars
  for all using (auth.role() = 'service_role');
