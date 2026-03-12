create extension if not exists pgcrypto;

create or replace function public.generate_friend_code()
returns text
language plpgsql
as $$
declare
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i integer := 0;
begin
  for i in 1..8 loop
    result := result || substr(chars, 1 + floor(random() * length(chars))::integer, 1);
  end loop;

  return result;
end;
$$;

create table if not exists public.user_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  friend_code text not null unique default public.generate_friend_code(),
  auth_email text not null unique,
  display_name text not null,
  avatar_url text,
  role text not null default 'user',
  status text not null default 'active',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint user_profiles_role_check
    check (role in ('user', 'admin')),
  constraint user_profiles_status_check
    check (status in ('active', 'disabled'))
);

alter table public.user_profiles
add column if not exists friend_code text;

alter table public.user_profiles
alter column friend_code set default public.generate_friend_code();

update public.user_profiles
set friend_code = public.generate_friend_code()
where friend_code is null;

alter table public.user_profiles
alter column friend_code set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'user_profiles_friend_code_key'
  ) then
    alter table public.user_profiles
    add constraint user_profiles_friend_code_key unique (friend_code);
  end if;
end;
$$;

create or replace function public.set_user_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_user_profiles_updated_at on public.user_profiles;
create trigger set_user_profiles_updated_at
before update on public.user_profiles
for each row
execute function public.set_user_profiles_updated_at();

alter table public.user_profiles enable row level security;

drop policy if exists "authenticated users can read profiles" on public.user_profiles;
create policy "authenticated users can read profiles"
on public.user_profiles
for select
to authenticated
using (true);

drop policy if exists "users can insert own profile" on public.user_profiles;
create policy "users can insert own profile"
on public.user_profiles
for insert
to authenticated
with check (auth.uid() = id);

create table if not exists public.guest_sessions (
  id uuid primary key default gen_random_uuid(),
  guest_code text not null unique,
  device_label text,
  created_at timestamptz not null default timezone('utc', now()),
  expires_at timestamptz
);

create table if not exists public.user_relationships (
  id uuid primary key default gen_random_uuid(),
  requester_user_id uuid not null references public.user_profiles (id) on delete cascade,
  target_user_id uuid not null references public.user_profiles (id) on delete cascade,
  status text not null default 'pending',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint user_relationships_status_check
    check (status in ('pending', 'accepted', 'rejected', 'blocked')),
  constraint user_relationships_unique_pair
    unique (requester_user_id, target_user_id),
  constraint user_relationships_no_self
    check (requester_user_id <> target_user_id)
);

create or replace function public.set_user_relationships_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_user_relationships_updated_at on public.user_relationships;
create trigger set_user_relationships_updated_at
before update on public.user_relationships
for each row
execute function public.set_user_relationships_updated_at();

alter table public.guest_sessions enable row level security;
alter table public.user_relationships enable row level security;

drop policy if exists "related users can view relationships" on public.user_relationships;
create policy "related users can view relationships"
on public.user_relationships
for select
to authenticated
using (auth.uid() = requester_user_id or auth.uid() = target_user_id);

drop policy if exists "users can create relationship requests" on public.user_relationships;
create policy "users can create relationship requests"
on public.user_relationships
for insert
to authenticated
with check (auth.uid() = requester_user_id);

drop policy if exists "related users can update relationships" on public.user_relationships;
create policy "related users can update relationships"
on public.user_relationships
for update
to authenticated
using (auth.uid() = requester_user_id or auth.uid() = target_user_id)
with check (auth.uid() = requester_user_id or auth.uid() = target_user_id);

create table if not exists public.location_share_permissions (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references public.user_profiles (id) on delete cascade,
  viewer_user_id uuid not null references public.user_profiles (id) on delete cascade,
  is_active boolean not null default true,
  granted_at timestamptz not null default timezone('utc', now()),
  revoked_at timestamptz,
  constraint location_share_permissions_unique_pair
    unique (owner_user_id, viewer_user_id),
  constraint location_share_permissions_no_self
    check (owner_user_id <> viewer_user_id)
);

alter table public.location_share_permissions enable row level security;

drop policy if exists "related users can view location permissions" on public.location_share_permissions;
create policy "related users can view location permissions"
on public.location_share_permissions
for select
to authenticated
using (auth.uid() = owner_user_id or auth.uid() = viewer_user_id);

drop policy if exists "owners can create location permissions" on public.location_share_permissions;
create policy "owners can create location permissions"
on public.location_share_permissions
for insert
to authenticated
with check (auth.uid() = owner_user_id);

drop policy if exists "owners can update location permissions" on public.location_share_permissions;
create policy "owners can update location permissions"
on public.location_share_permissions
for update
to authenticated
using (auth.uid() = owner_user_id)
with check (auth.uid() = owner_user_id);

drop policy if exists "users can update own profile" on public.user_profiles;
create policy "users can update own profile"
on public.user_profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);
