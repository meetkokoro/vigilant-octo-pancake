-- ============================================================================
-- LinkRadar · Supabase schema
-- Run in Supabase Dashboard -> SQL Editor, or `supabase db push`.
--
-- Auth is handled entirely by Supabase (LinkedIn OIDC / Google / Apple OAuth,
-- plus phone + SMS OTP sign-up). Enable each provider under
-- Authentication -> Providers, and configure an SMS provider (Twilio,
-- MessageBird, Vonage, …) under Authentication -> Providers -> Phone.
--
-- Every table below is protected by Row Level Security so the browser can talk
-- to the database directly with the public anon key.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Enums
-- ----------------------------------------------------------------------------
do $$ begin
  create type public.gender as enum ('woman', 'man', 'non-binary', 'other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.swipe_direction as enum ('like', 'pass', 'super');
exception when duplicate_object then null; end $$;

-- ----------------------------------------------------------------------------
-- profiles
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id                   uuid primary key references auth.users (id) on delete cascade,
  full_name            text,
  avatar_url           text,
  headline             text,
  company              text,
  location             text,
  locality_name        text,
  bio                  text check (char_length(bio) <= 1000),
  interests            text[] not null default '{}',
  photos               text[] not null default '{}',
  dating_intent        text,
  birthdate            date,
  gender               public.gender,
  verified             boolean not null default false,
  connection_degree    smallint check (connection_degree between 1 and 3),
  common_connections   text[] not null default '{}',
  icebreaker           text,
  distance_km          numeric(6, 2) default 0,
  radar_angle          numeric(5, 2) default 0,
  radar_distance       numeric(3, 2) default 0.5,
  latitude             double precision,
  longitude            double precision,
  onboarding_completed boolean not null default false,
  last_active_at       timestamptz not null default now(),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  constraint profiles_age_18_plus check (
    birthdate is null or birthdate <= (current_date - interval '18 years')
  )
);

-- ----------------------------------------------------------------------------
-- user_preferences (discovery filters)
-- ----------------------------------------------------------------------------
create table if not exists public.user_preferences (
  user_id               uuid primary key references public.profiles (id) on delete cascade,
  min_age               smallint not null default 24 check (min_age >= 18),
  max_age               smallint not null default 45 check (max_age <= 120),
  max_distance_km       integer  not null default 25 check (max_distance_km between 1 and 500),
  interested_in         public.gender[] not null default '{woman,man,non-binary}',
  intents               text[] not null default '{}',
  max_connection_degree smallint not null default 3 check (max_connection_degree between 1 and 3),
  same_company_only     boolean not null default false,
  verified_only         boolean not null default false,
  incognito             boolean not null default false,
  updated_at            timestamptz not null default now(),
  constraint preferences_age_range check (min_age <= max_age)
);

-- ----------------------------------------------------------------------------
-- blocks (checked before anything else is visible)
-- ----------------------------------------------------------------------------
create table if not exists public.blocks (
  blocker_id uuid not null references public.profiles (id) on delete cascade,
  blocked_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  constraint blocks_no_self check (blocker_id <> blocked_id)
);

create index if not exists blocks_blocked_idx on public.blocks (blocked_id);

create or replace function public.is_blocked(a uuid, b uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.blocks
    where (blocker_id = a and blocked_id = b)
       or (blocker_id = b and blocked_id = a)
  );
$$;

-- ----------------------------------------------------------------------------
-- swipes
-- ----------------------------------------------------------------------------
create table if not exists public.swipes (
  id         uuid primary key default gen_random_uuid(),
  actor_id   uuid not null references public.profiles (id) on delete cascade,
  target_id  uuid not null references public.profiles (id) on delete cascade,
  direction  public.swipe_direction not null,
  created_at timestamptz not null default now(),
  unique (actor_id, target_id),
  constraint swipes_no_self check (actor_id <> target_id)
);

create index if not exists swipes_target_idx on public.swipes (target_id, direction);

-- ----------------------------------------------------------------------------
-- matches (user_a < user_b keeps the pair unique in one direction)
-- ----------------------------------------------------------------------------
create table if not exists public.matches (
  id         uuid primary key default gen_random_uuid(),
  user_a     uuid not null references public.profiles (id) on delete cascade,
  user_b     uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_a, user_b),
  constraint matches_ordered check (user_a < user_b)
);

create index if not exists matches_user_b_idx on public.matches (user_b);

-- ----------------------------------------------------------------------------
-- messages
-- ----------------------------------------------------------------------------
create table if not exists public.messages (
  id         uuid primary key default gen_random_uuid(),
  match_id   uuid not null references public.matches (id) on delete cascade,
  sender_id  uuid not null references public.profiles (id) on delete cascade,
  body       text not null check (char_length(body) between 1 and 2000),
  read_at    timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists messages_match_idx on public.messages (match_id, created_at desc);

-- ----------------------------------------------------------------------------
-- reports (moderation queue - only the reporter can read their own report)
-- ----------------------------------------------------------------------------
create table if not exists public.reports (
  id          uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  reported_id uuid not null references public.profiles (id) on delete cascade,
  reason      text not null,
  details     text check (char_length(details) <= 1000),
  created_at  timestamptz not null default now(),
  constraint reports_no_self check (reporter_id <> reported_id)
);

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.profiles         enable row level security;
alter table public.user_preferences enable row level security;
alter table public.blocks           enable row level security;
alter table public.swipes           enable row level security;
alter table public.matches          enable row level security;
alter table public.messages         enable row level security;
alter table public.reports          enable row level security;

-- profiles ------------------------------------------------------------------
drop policy if exists "profiles readable by signed-in users" on public.profiles;
create policy "profiles readable by signed-in users"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or not public.is_blocked(auth.uid(), id));

drop policy if exists "profiles insert own" on public.profiles;
create policy "profiles insert own"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists "profiles delete own" on public.profiles;
create policy "profiles delete own"
  on public.profiles for delete
  to authenticated
  using (id = auth.uid());

-- user_preferences ----------------------------------------------------------
drop policy if exists "preferences own row" on public.user_preferences;
create policy "preferences own row"
  on public.user_preferences for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- blocks --------------------------------------------------------------------
drop policy if exists "blocks own rows" on public.blocks;
create policy "blocks own rows"
  on public.blocks for all
  to authenticated
  using (blocker_id = auth.uid())
  with check (blocker_id = auth.uid());

-- swipes --------------------------------------------------------------------
drop policy if exists "swipes insert own" on public.swipes;
create policy "swipes insert own"
  on public.swipes for insert
  to authenticated
  with check (actor_id = auth.uid() and not public.is_blocked(auth.uid(), target_id));

drop policy if exists "swipes read own" on public.swipes;
create policy "swipes read own"
  on public.swipes for select
  to authenticated
  using (actor_id = auth.uid());

drop policy if exists "swipes delete own" on public.swipes;
create policy "swipes delete own"
  on public.swipes for delete
  to authenticated
  using (actor_id = auth.uid());

-- matches -------------------------------------------------------------------
-- Insert is intentionally omitted: only `record_swipe` may create a match.
drop policy if exists "matches read own" on public.matches;
create policy "matches read own"
  on public.matches for select
  to authenticated
  using (auth.uid() in (user_a, user_b));

drop policy if exists "matches delete own" on public.matches;
create policy "matches delete own"
  on public.matches for delete
  to authenticated
  using (auth.uid() in (user_a, user_b));

-- messages ------------------------------------------------------------------
drop policy if exists "messages read in own matches" on public.messages;
create policy "messages read in own matches"
  on public.messages for select
  to authenticated
  using (
    exists (
      select 1 from public.matches m
      where m.id = messages.match_id and auth.uid() in (m.user_a, m.user_b)
    )
  );

drop policy if exists "messages send in own matches" on public.messages;
create policy "messages send in own matches"
  on public.messages for insert
  to authenticated
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.matches m
      where m.id = match_id
        and auth.uid() in (m.user_a, m.user_b)
        and not public.is_blocked(m.user_a, m.user_b)
    )
  );

drop policy if exists "messages mark read" on public.messages;
create policy "messages mark read"
  on public.messages for update
  to authenticated
  using (
    sender_id <> auth.uid()
    and exists (
      select 1 from public.matches m
      where m.id = messages.match_id and auth.uid() in (m.user_a, m.user_b)
    )
  )
  with check (true);

-- reports -------------------------------------------------------------------
drop policy if exists "reports insert own" on public.reports;
create policy "reports insert own"
  on public.reports for insert
  to authenticated
  with check (reporter_id = auth.uid());

drop policy if exists "reports read own" on public.reports;
create policy "reports read own"
  on public.reports for select
  to authenticated
  using (reporter_id = auth.uid());

-- ============================================================================
-- Triggers & functions
-- ============================================================================

-- Seed a profile row the moment an OAuth user is created ---------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url, headline, verified)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      'New member'
    ),
    coalesce(
      new.raw_user_meta_data ->> 'avatar_url',
      new.raw_user_meta_data ->> 'picture'
    ),
    new.raw_user_meta_data ->> 'headline',
    coalesce(new.raw_app_meta_data ->> 'provider', '') = 'linkedin_oidc'
  )
  on conflict (id) do nothing;

  insert into public.user_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Record a swipe and create the match when it is mutual ----------------------
create or replace function public.record_swipe(
  target_id uuid,
  direction public.swipe_direction
)
returns table (is_match boolean, match_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  me         uuid := auth.uid();
  mutual     boolean := false;
  created_id uuid;
  low        uuid;
  high       uuid;
begin
  if me is null then
    raise exception 'not authenticated';
  end if;
  if me = target_id then
    raise exception 'cannot swipe on yourself';
  end if;
  if public.is_blocked(me, target_id) then
    raise exception 'user unavailable';
  end if;

  insert into public.swipes (actor_id, target_id, direction)
  values (me, target_id, direction)
  on conflict (actor_id, target_id) do update set direction = excluded.direction;

  if direction = 'pass' then
    return query select false, null::uuid;
    return;
  end if;

  select exists (
    select 1 from public.swipes s
    where s.actor_id = target_id
      and s.target_id = me
      and s.direction in ('like', 'super')
  ) into mutual;

  if not mutual then
    return query select false, null::uuid;
    return;
  end if;

  low  := least(me, target_id);
  high := greatest(me, target_id);

  insert into public.matches (user_a, user_b)
  values (low, high)
  on conflict (user_a, user_b) do update set user_a = excluded.user_a
  returning id into created_id;

  return query select true, created_id;
end;
$$;

-- Who liked me and has not been swiped on yet --------------------------------
create or replace function public.incoming_likes()
returns table (actor_id uuid, direction public.swipe_direction, created_at timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select s.actor_id, s.direction, s.created_at
  from public.swipes s
  where s.target_id = auth.uid()
    and s.direction in ('like', 'super')
    and not public.is_blocked(auth.uid(), s.actor_id)
    and not exists (
      select 1 from public.swipes mine
      where mine.actor_id = auth.uid() and mine.target_id = s.actor_id
    )
  order by s.created_at desc;
$$;

-- Discovery feed -------------------------------------------------------------
create or replace function public.discovery_feed(
  min_age               smallint default 18,
  max_age               smallint default 120,
  max_distance_km       integer  default 500,
  interested_in         public.gender[] default '{woman,man,non-binary,other}',
  intents               text[]   default '{}',
  max_connection_degree smallint default 3,
  same_company_only     boolean  default false,
  verified_only         boolean  default false
)
returns setof public.profiles
language sql
stable
security definer
set search_path = public
as $$
  select p.*
  from public.profiles p
  cross join lateral (select * from public.profiles me where me.id = auth.uid()) self
  where p.id <> auth.uid()
    and p.onboarding_completed
    and not public.is_blocked(auth.uid(), p.id)
    and not exists (
      select 1 from public.swipes s
      where s.actor_id = auth.uid() and s.target_id = p.id
    )
    and not exists (
      select 1 from public.user_preferences up
      where up.user_id = p.id and up.incognito
    )
    and (p.birthdate is null or extract(year from age(p.birthdate)) between min_age and max_age)
    and (p.gender is null or p.gender = any (interested_in))
    and coalesce(p.distance_km, 0) <= max_distance_km
    and coalesce(p.connection_degree, 3) <= max_connection_degree
    and (not same_company_only or p.company is not distinct from self.company)
    and (not verified_only or p.verified)
    and (cardinality(intents) = 0 or p.dating_intent = any (intents))
  order by p.connection_degree nulls last, p.distance_km nulls last, p.last_active_at desc
  limit 50;
$$;

-- Undo the most recent swipe -------------------------------------------------
create or replace function public.undo_last_swipe()
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.swipes
  where id = (
    select id from public.swipes
    where actor_id = auth.uid()
    order by created_at desc
    limit 1
  );
$$;

-- Block: removes the match, the swipes and hides both profiles ---------------
create or replace function public.block_user(target_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
begin
  if me is null or me = target_id then
    raise exception 'invalid block request';
  end if;

  insert into public.blocks (blocker_id, blocked_id)
  values (me, target_id)
  on conflict do nothing;

  delete from public.matches
  where (user_a = least(me, target_id) and user_b = greatest(me, target_id));

  delete from public.swipes
  where (actor_id = me and target_id = block_user.target_id)
     or (actor_id = block_user.target_id and swipes.target_id = me);
end;
$$;

-- Full account deletion (GDPR / app-store requirement) -----------------------
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
begin
  if me is null then
    raise exception 'not authenticated';
  end if;

  -- profiles cascades to preferences, swipes, matches, messages and blocks.
  delete from public.profiles where id = me;
  delete from auth.users where id = me;
end;
$$;

-- Keep last_active_at fresh --------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- ============================================================================
-- Realtime for chat
-- ============================================================================
do $$ begin
  alter publication supabase_realtime add table public.messages;
exception when duplicate_object then null; end $$;

do $$ begin
  alter publication supabase_realtime add table public.matches;
exception when duplicate_object then null; end $$;

-- ============================================================================
-- Storage bucket for profile photos
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('profile-photos', 'profile-photos', true)
on conflict (id) do nothing;

drop policy if exists "profile photos are public" on storage.objects;
create policy "profile photos are public"
  on storage.objects for select
  using (bucket_id = 'profile-photos');

drop policy if exists "users manage own profile photos" on storage.objects;
create policy "users manage own profile photos"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = auth.uid()::text);
