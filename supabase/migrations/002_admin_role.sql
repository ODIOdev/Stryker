-- Add role column to profiles for admin access
alter table public.profiles
  add column if not exists role text not null default 'user'
  check (role in ('user', 'admin', 'master_admin'));

create index if not exists profiles_role_idx on public.profiles (role);

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
  on conflict (id) do update set
    email = excluded.email,
    display_name = coalesce(excluded.display_name, public.profiles.display_name),
    role = coalesce(nullif(excluded.role, 'user'), public.profiles.role),
    updated_at = now();
  return new;
end;
$$;
