create extension if not exists pgcrypto;

create or replace function public.set_app_feature_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.ugc_pois (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles (id) on delete cascade,
  name text not null,
  description text not null,
  lat double precision,
  lng double precision,
  image_url text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint ugc_pois_name_check
    check (char_length(trim(name)) > 0 and char_length(name) <= 120),
  constraint ugc_pois_description_check
    check (char_length(trim(description)) > 0 and char_length(description) <= 2000),
  constraint ugc_pois_image_url_check
    check (char_length(trim(image_url)) > 0),
  constraint ugc_pois_lat_check
    check (lat is null or (lat >= -90 and lat <= 90)),
  constraint ugc_pois_lng_check
    check (lng is null or (lng >= -180 and lng <= 180))
);

create index if not exists ugc_pois_user_id_created_at_idx
on public.ugc_pois (user_id, created_at desc);

drop trigger if exists set_ugc_pois_updated_at on public.ugc_pois;
create trigger set_ugc_pois_updated_at
before update on public.ugc_pois
for each row
execute function public.set_app_feature_updated_at();

alter table public.ugc_pois enable row level security;

drop policy if exists "users can read own and friend ugc" on public.ugc_pois;
create policy "users can read own and friend ugc"
on public.ugc_pois
for select
to authenticated
using (
  auth.uid() = user_id
  or exists (
    select 1
    from public.user_relationships relationships
    where relationships.status = 'accepted'
      and (
        (
          relationships.requester_user_id = auth.uid()
          and relationships.target_user_id = user_id
        )
        or (
          relationships.target_user_id = auth.uid()
          and relationships.requester_user_id = user_id
        )
      )
  )
);

drop policy if exists "users can insert own ugc" on public.ugc_pois;
create policy "users can insert own ugc"
on public.ugc_pois
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "users can update own ugc" on public.ugc_pois;
create policy "users can update own ugc"
on public.ugc_pois
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "users can delete own ugc" on public.ugc_pois;
create policy "users can delete own ugc"
on public.ugc_pois
for delete
to authenticated
using (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('ugc-images', 'ugc-images', true)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "public can read ugc images" on storage.objects;
create policy "public can read ugc images"
on storage.objects
for select
to public
using (bucket_id = 'ugc-images');

drop policy if exists "authenticated users can upload ugc images" on storage.objects;
create policy "authenticated users can upload ugc images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'ugc-images'
  and name like 'ugc/%'
);

drop policy if exists "owners can delete own ugc images" on storage.objects;
create policy "owners can delete own ugc images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'ugc-images'
  and owner = auth.uid()
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles (id) on delete cascade,
  conversation_name text not null default 'New conversation',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint conversations_name_check
    check (char_length(trim(conversation_name)) > 0 and char_length(conversation_name) <= 120)
);

create index if not exists conversations_user_id_updated_at_idx
on public.conversations (user_id, updated_at desc);

drop trigger if exists set_conversations_updated_at on public.conversations;
create trigger set_conversations_updated_at
before update on public.conversations
for each row
execute function public.set_app_feature_updated_at();

alter table public.conversations enable row level security;

drop policy if exists "users can read own conversations" on public.conversations;
create policy "users can read own conversations"
on public.conversations
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "users can insert own conversations" on public.conversations;
create policy "users can insert own conversations"
on public.conversations
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "users can update own conversations" on public.conversations;
create policy "users can update own conversations"
on public.conversations
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "users can delete own conversations" on public.conversations;
create policy "users can delete own conversations"
on public.conversations
for delete
to authenticated
using (auth.uid() = user_id);

create table if not exists public.chat_history (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  user_id uuid not null references public.user_profiles (id) on delete cascade,
  user_input text not null,
  ai_output text not null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint chat_history_user_input_check
    check (char_length(trim(user_input)) > 0 and char_length(user_input) <= 8000),
  constraint chat_history_ai_output_check
    check (char_length(trim(ai_output)) > 0 and char_length(ai_output) <= 12000)
);

create index if not exists chat_history_conversation_id_created_at_idx
on public.chat_history (conversation_id, created_at);

create index if not exists chat_history_user_id_created_at_idx
on public.chat_history (user_id, created_at desc);

create or replace function public.touch_conversation_from_chat_history()
returns trigger
language plpgsql
as $$
begin
  update public.conversations
  set updated_at = timezone('utc', now())
  where id = coalesce(new.conversation_id, old.conversation_id);

  return coalesce(new, old);
end;
$$;

drop trigger if exists touch_conversation_after_chat_history_insert on public.chat_history;
create trigger touch_conversation_after_chat_history_insert
after insert on public.chat_history
for each row
execute function public.touch_conversation_from_chat_history();

drop trigger if exists touch_conversation_after_chat_history_delete on public.chat_history;
create trigger touch_conversation_after_chat_history_delete
after delete on public.chat_history
for each row
execute function public.touch_conversation_from_chat_history();

alter table public.chat_history enable row level security;

drop policy if exists "users can read own chat history" on public.chat_history;
create policy "users can read own chat history"
on public.chat_history
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "users can insert own chat history" on public.chat_history;
create policy "users can insert own chat history"
on public.chat_history
for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.conversations conversations
    where conversations.id = conversation_id
      and conversations.user_id = auth.uid()
  )
);

drop policy if exists "users can delete own chat history" on public.chat_history;
create policy "users can delete own chat history"
on public.chat_history
for delete
to authenticated
using (auth.uid() = user_id);

do $$
declare
  demo_password text := 'DemoPass2026!';
  alice_id uuid := '11111111-1111-4111-8111-111111111111';
  ben_id uuid := '22222222-2222-4222-8222-222222222222';
  alice_email text := 'demo.alice@sucity.local';
  ben_email text := 'demo.ben@sucity.local';
  alice_security jsonb := jsonb_build_object(
    'favoriteColor', encode(digest('blue', 'sha256'), 'hex'),
    'birthday', encode(digest('2001-04-15', 'sha256'), 'hex'),
    'studentId', encode(digest('DEMO001', 'sha256'), 'hex')
  );
  ben_security jsonb := jsonb_build_object(
    'favoriteColor', encode(digest('green', 'sha256'), 'hex'),
    'birthday', encode(digest('2000-09-21', 'sha256'), 'hex'),
    'studentId', encode(digest('DEMO002', 'sha256'), 'hex')
  );
begin
  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  values
    (
      '00000000-0000-0000-0000-000000000000',
      alice_id,
      'authenticated',
      'authenticated',
      alice_email,
      crypt(demo_password, gen_salt('bf')),
      timezone('utc', now()),
      null,
      null,
      jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
      jsonb_build_object(
        'display_name', 'Demo Alice',
        'auth_provider', 'email',
        'security_answer_hashes', alice_security
      ),
      timezone('utc', now()),
      timezone('utc', now()),
      '',
      '',
      '',
      ''
    ),
    (
      '00000000-0000-0000-0000-000000000000',
      ben_id,
      'authenticated',
      'authenticated',
      ben_email,
      crypt(demo_password, gen_salt('bf')),
      timezone('utc', now()),
      null,
      null,
      jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
      jsonb_build_object(
        'display_name', 'Demo Ben',
        'auth_provider', 'email',
        'security_answer_hashes', ben_security
      ),
      timezone('utc', now()),
      timezone('utc', now()),
      '',
      '',
      '',
      ''
    )
  on conflict (id) do update
  set
    email = excluded.email,
    encrypted_password = excluded.encrypted_password,
    email_confirmed_at = excluded.email_confirmed_at,
    raw_app_meta_data = excluded.raw_app_meta_data,
    raw_user_meta_data = excluded.raw_user_meta_data,
    updated_at = timezone('utc', now());

  insert into auth.identities (
    id,
    user_id,
    provider_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  )
  values
    (
      alice_id::text,
      alice_id,
      alice_id::text,
      jsonb_build_object(
        'sub', alice_id::text,
        'email', alice_email,
        'email_verified', true,
        'phone_verified', false
      ),
      'email',
      null,
      timezone('utc', now()),
      timezone('utc', now())
    ),
    (
      ben_id::text,
      ben_id,
      ben_id::text,
      jsonb_build_object(
        'sub', ben_id::text,
        'email', ben_email,
        'email_verified', true,
        'phone_verified', false
      ),
      'email',
      null,
      timezone('utc', now()),
      timezone('utc', now())
    )
  on conflict do nothing;

  insert into public.user_profiles (
    id,
    username,
    friend_code,
    auth_email,
    display_name,
    security_answer_favorite_color,
    security_answer_birthday,
    security_answer_student_id,
    avatar_url,
    role,
    status
  )
  values
    (
      alice_id,
      'demo_alice_11111111',
      'DEMOALFA',
      alice_email,
      'Demo Alice',
      alice_security ->> 'favoriteColor',
      alice_security ->> 'birthday',
      alice_security ->> 'studentId',
      null,
      'user',
      'active'
    ),
    (
      ben_id,
      'demo_ben_22222222',
      'DEMOBETA',
      ben_email,
      'Demo Ben',
      ben_security ->> 'favoriteColor',
      ben_security ->> 'birthday',
      ben_security ->> 'studentId',
      null,
      'user',
      'active'
    )
  on conflict (id) do update
  set
    username = excluded.username,
    friend_code = excluded.friend_code,
    auth_email = excluded.auth_email,
    display_name = excluded.display_name,
    security_answer_favorite_color = excluded.security_answer_favorite_color,
    security_answer_birthday = excluded.security_answer_birthday,
    security_answer_student_id = excluded.security_answer_student_id,
    role = excluded.role,
    status = excluded.status;
end;
$$;

insert into public.user_relationships (
  id,
  requester_user_id,
  target_user_id,
  status,
  created_at,
  updated_at
)
values (
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
  'accepted',
  timezone('utc', now()) - interval '2 days',
  timezone('utc', now()) - interval '2 days'
)
on conflict (requester_user_id, target_user_id) do update
set
  status = excluded.status,
  updated_at = excluded.updated_at;

insert into public.location_share_permissions (
  id,
  owner_user_id,
  viewer_user_id,
  is_active,
  granted_at,
  revoked_at
)
values
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1',
    '11111111-1111-4111-8111-111111111111',
    '22222222-2222-4222-8222-222222222222',
    true,
    timezone('utc', now()) - interval '1 day',
    null
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2',
    '22222222-2222-4222-8222-222222222222',
    '11111111-1111-4111-8111-111111111111',
    true,
    timezone('utc', now()) - interval '1 day',
    null
  )
on conflict (owner_user_id, viewer_user_id) do update
set
  is_active = excluded.is_active,
  granted_at = excluded.granted_at,
  revoked_at = excluded.revoked_at;

insert into public.user_live_locations (
  user_id,
  latitude,
  longitude,
  accuracy_meters,
  is_online,
  updated_at
)
values
  (
    '11111111-1111-4111-8111-111111111111',
    31.3244,
    120.6296,
    18,
    true,
    timezone('utc', now())
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    31.3149,
    120.6196,
    22,
    true,
    timezone('utc', now())
  )
on conflict (user_id) do update
set
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  accuracy_meters = excluded.accuracy_meters,
  is_online = excluded.is_online,
  updated_at = excluded.updated_at;

insert into public.group_chats (
  id,
  creator_user_id,
  name,
  created_at,
  updated_at
)
values (
  '33333333-3333-4333-8333-333333333333',
  '11111111-1111-4111-8111-111111111111',
  'Demo Heritage Walk',
  timezone('utc', now()) - interval '18 hours',
  timezone('utc', now()) - interval '18 hours'
)
on conflict (id) do update
set
  creator_user_id = excluded.creator_user_id,
  name = excluded.name,
  updated_at = excluded.updated_at;

insert into public.group_chat_members (
  id,
  group_id,
  user_id,
  role,
  joined_at
)
values
  (
    '44444444-4444-4444-8444-444444444441',
    '33333333-3333-4333-8333-333333333333',
    '11111111-1111-4111-8111-111111111111',
    'owner',
    timezone('utc', now()) - interval '18 hours'
  ),
  (
    '44444444-4444-4444-8444-444444444442',
    '33333333-3333-4333-8333-333333333333',
    '22222222-2222-4222-8222-222222222222',
    'member',
    timezone('utc', now()) - interval '18 hours'
  )
on conflict (group_id, user_id) do update
set
  role = excluded.role,
  joined_at = excluded.joined_at;

insert into public.group_chat_messages (
  id,
  group_id,
  sender_user_id,
  content,
  created_at
)
values
  (
    '55555555-5555-4555-8555-555555555551',
    '33333333-3333-4333-8333-333333333333',
    '11111111-1111-4111-8111-111111111111',
    'Meet at Pingjiang Road first, then walk toward the gardens.',
    timezone('utc', now()) - interval '17 hours'
  ),
  (
    '55555555-5555-4555-8555-555555555552',
    '33333333-3333-4333-8333-333333333333',
    '22222222-2222-4222-8222-222222222222',
    'Good plan. I enabled location sharing so we can find each other.',
    timezone('utc', now()) - interval '16 hours'
  )
on conflict (id) do update
set
  content = excluded.content,
  created_at = excluded.created_at;

insert into public.ugc_pois (
  id,
  user_id,
  name,
  description,
  lat,
  lng,
  image_url,
  created_at,
  updated_at
)
values
  (
    '66666666-6666-4666-8666-666666666661',
    '11111111-1111-4111-8111-111111111111',
    'Pingjiang Road slow-walk note',
    'Demo Alice uploaded a community note about pausing near the canal bridges.',
    31.3149,
    120.6292,
    $ugc_image_1$data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%22640%22%20height%3D%22360%22%20viewBox%3D%220%200%20640%20360%22%3E%3Crect%20width%3D%22640%22%20height%3D%22360%22%20fill%3D%22%23eff7f0%22/%3E%3Cpath%20d%3D%22M0%20242%20C120%20216%20234%20256%20352%20230%20C450%20208%20530%20224%20640%20194%20L640%20360%20L0%20360Z%22%20fill%3D%22%2378a783%22/%3E%3Crect%20x%3D%22102%22%20y%3D%22126%22%20width%3D%22160%22%20height%3D%2284%22%20rx%3D%2210%22%20fill%3D%22%23bf7f5f%22/%3E%3Cpath%20d%3D%22M82%20134%20L182%2074%20L282%20134Z%22%20fill%3D%22%236b2f2a%22/%3E%3Ctext%20x%3D%22320%22%20y%3D%22178%22%20font-size%3D%2232%22%20font-family%3D%22Arial%22%20fill%3D%22%232f5849%22%20text-anchor%3D%22middle%22%3EPingjiang%20Demo%3C/text%3E%3C/svg%3E$ugc_image_1$,
    timezone('utc', now()) - interval '12 hours',
    timezone('utc', now()) - interval '12 hours'
  ),
  (
    '66666666-6666-4666-8666-666666666662',
    '22222222-2222-4222-8222-222222222222',
    'Garden framing detail',
    'Demo Ben uploaded a garden observation for friend-read UGC testing.',
    31.3244,
    120.6296,
    $ugc_image_2$data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%22640%22%20height%3D%22360%22%20viewBox%3D%220%200%20640%20360%22%3E%3Crect%20width%3D%22640%22%20height%3D%22360%22%20fill%3D%22%23f8f2e8%22/%3E%3Cellipse%20cx%3D%22320%22%20cy%3D%22244%22%20rx%3D%22230%22%20ry%3D%2272%22%20fill%3D%22%2389aeb0%22/%3E%3Cpath%20d%3D%22M148%20222%20C190%20138%20246%20110%20320%20122%20C398%20134%20450%20164%20492%20222%22%20fill%3D%22none%22%20stroke%3D%22%232f5849%22%20stroke-width%3D%2228%22/%3E%3Ccircle%20cx%3D%22320%22%20cy%3D%22148%22%20r%3D%2264%22%20fill%3D%22%23ffffff%22%20opacity%3D%220.85%22/%3E%3Ctext%20x%3D%22320%22%20y%3D%22305%22%20font-size%3D%2232%22%20font-family%3D%22Arial%22%20fill%3D%22%232d241a%22%20text-anchor%3D%22middle%22%3EGarden%20Demo%3C/text%3E%3C/svg%3E$ugc_image_2$,
    timezone('utc', now()) - interval '10 hours',
    timezone('utc', now()) - interval '10 hours'
  )
on conflict (id) do update
set
  name = excluded.name,
  description = excluded.description,
  lat = excluded.lat,
  lng = excluded.lng,
  image_url = excluded.image_url,
  updated_at = excluded.updated_at;

insert into public.conversations (
  id,
  user_id,
  conversation_name,
  created_at,
  updated_at
)
values
  (
    '77777777-7777-4777-8777-777777777771',
    '11111111-1111-4111-8111-111111111111',
    'Demo route guidance',
    timezone('utc', now()) - interval '8 hours',
    timezone('utc', now()) - interval '8 hours'
  ),
  (
    '77777777-7777-4777-8777-777777777772',
    '22222222-2222-4222-8222-222222222222',
    'Demo cultural Q&A',
    timezone('utc', now()) - interval '7 hours',
    timezone('utc', now()) - interval '7 hours'
  )
on conflict (id) do update
set
  conversation_name = excluded.conversation_name,
  updated_at = excluded.updated_at;

insert into public.chat_history (
  id,
  conversation_id,
  user_id,
  user_input,
  ai_output,
  created_at
)
values
  (
    '88888888-8888-4888-8888-888888888881',
    '77777777-7777-4777-8777-777777777771',
    '11111111-1111-4111-8111-111111111111',
    'How should we start a gentle Pingjiang Road walk?',
    'Start near the canal, pause at a bridge, then move slowly toward the garden route.',
    timezone('utc', now()) - interval '8 hours'
  ),
  (
    '88888888-8888-4888-8888-888888888882',
    '77777777-7777-4777-8777-777777777772',
    '22222222-2222-4222-8222-222222222222',
    'What should I notice in a Suzhou garden?',
    'Look for framed views, layered corridors, water reflections, and changes between compression and release.',
    timezone('utc', now()) - interval '7 hours'
  )
on conflict (id) do update
set
  user_input = excluded.user_input,
  ai_output = excluded.ai_output,
  created_at = excluded.created_at;
