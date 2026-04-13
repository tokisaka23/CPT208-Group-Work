create table if not exists public.user_live_locations (
  user_id uuid primary key references public.user_profiles (id) on delete cascade,
  latitude double precision not null,
  longitude double precision not null,
  accuracy_meters double precision,
  is_online boolean not null default true,
  updated_at timestamptz not null default timezone('utc', now()),
  constraint user_live_locations_latitude_check
    check (latitude >= -90 and latitude <= 90),
  constraint user_live_locations_longitude_check
    check (longitude >= -180 and longitude <= 180),
  constraint user_live_locations_accuracy_check
    check (accuracy_meters is null or accuracy_meters >= 0)
);

alter table public.user_live_locations enable row level security;

drop policy if exists "users can view shared live locations" on public.user_live_locations;
create policy "users can view shared live locations"
on public.user_live_locations
for select
to authenticated
using (
  auth.uid() = user_id
  or exists (
    select 1
    from public.location_share_permissions permissions
    where permissions.owner_user_id = user_live_locations.user_id
      and permissions.viewer_user_id = auth.uid()
      and permissions.is_active = true
  )
);

drop policy if exists "users can insert own live locations" on public.user_live_locations;
create policy "users can insert own live locations"
on public.user_live_locations
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "users can update own live locations" on public.user_live_locations;
create policy "users can update own live locations"
on public.user_live_locations
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
