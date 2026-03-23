create table if not exists public.group_chats (
  id uuid primary key default gen_random_uuid(),
  creator_user_id uuid not null references public.user_profiles (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists group_chats_creator_user_id_idx
on public.group_chats (creator_user_id);

create or replace function public.set_group_chats_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_group_chats_updated_at on public.group_chats;
create trigger set_group_chats_updated_at
before update on public.group_chats
for each row
execute function public.set_group_chats_updated_at();

create table if not exists public.group_chat_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.group_chats (id) on delete cascade,
  user_id uuid not null references public.user_profiles (id) on delete cascade,
  role text not null default 'member',
  joined_at timestamptz not null default timezone('utc', now()),
  constraint group_chat_members_unique_pair unique (group_id, user_id),
  constraint group_chat_members_role_check check (role in ('owner', 'member'))
);

create index if not exists group_chat_members_group_id_idx
on public.group_chat_members (group_id);

create index if not exists group_chat_members_user_id_idx
on public.group_chat_members (user_id);

create table if not exists public.group_chat_messages (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.group_chats (id) on delete cascade,
  sender_user_id uuid not null references public.user_profiles (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint group_chat_messages_content_check check (char_length(trim(content)) > 0)
);

create index if not exists group_chat_messages_group_id_idx
on public.group_chat_messages (group_id, created_at);

alter table public.group_chats enable row level security;
alter table public.group_chat_members enable row level security;
alter table public.group_chat_messages enable row level security;

drop policy if exists "group members can read groups" on public.group_chats;
create policy "group members can read groups"
on public.group_chats
for select
to authenticated
using (
  exists (
    select 1
    from public.group_chat_members
    where group_chat_members.group_id = group_chats.id
      and group_chat_members.user_id = auth.uid()
  )
);

drop policy if exists "group members can read members" on public.group_chat_members;
create policy "group members can read members"
on public.group_chat_members
for select
to authenticated
using (
  auth.uid() = user_id
  or exists (
    select 1
    from public.group_chat_members as current_member
    where current_member.group_id = group_chat_members.group_id
      and current_member.user_id = auth.uid()
  )
);

drop policy if exists "group members can read messages" on public.group_chat_messages;
create policy "group members can read messages"
on public.group_chat_messages
for select
to authenticated
using (
  exists (
    select 1
    from public.group_chat_members
    where group_chat_members.group_id = group_chat_messages.group_id
      and group_chat_members.user_id = auth.uid()
  )
);

drop policy if exists "group members can send messages" on public.group_chat_messages;
create policy "group members can send messages"
on public.group_chat_messages
for insert
to authenticated
with check (
  auth.uid() = sender_user_id
  and exists (
    select 1
    from public.group_chat_members
    where group_chat_members.group_id = group_chat_messages.group_id
      and group_chat_members.user_id = auth.uid()
  )
);
