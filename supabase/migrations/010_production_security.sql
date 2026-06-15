-- Production security: profile privacy, saved items, reactions, reports, RLS hardening

-- ─── Profile privacy prefs (move from localStorage) ───────────────────────────
alter table public.profiles add column if not exists show_phone boolean not null default false;
alter table public.profiles add column if not exists show_email boolean not null default false;
alter table public.profiles add column if not exists push_notifications boolean not null default true;
alter table public.profiles add column if not exists last_seen_at timestamptz;

-- ─── Profiles: remove public full-row read ────────────────────────────────────
drop policy if exists "Profiles are viewable by everyone" on public.profiles;

drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Admins read all profiles" on public.profiles;
create policy "Admins read all profiles"
  on public.profiles for select
  using (public.is_admin());

-- ─── Saved items ──────────────────────────────────────────────────────────────
create table if not exists public.saved_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  item_id text not null,
  item_type text not null check (item_type in ('post', 'event', 'job', 'business')),
  created_at timestamptz not null default now(),
  unique (user_id, item_id, item_type)
);

alter table public.saved_items enable row level security;

drop policy if exists "Users manage own saved items" on public.saved_items;
create policy "Users manage own saved items"
  on public.saved_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── Reactions (likes) ────────────────────────────────────────────────────────
create table if not exists public.reactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  item_id text not null,
  item_type text not null check (item_type in ('post', 'event', 'job', 'business')),
  reaction_type text not null default 'like',
  created_at timestamptz not null default now(),
  unique (user_id, item_id, item_type, reaction_type)
);

alter table public.reactions enable row level security;

drop policy if exists "Users manage own reactions" on public.reactions;
create policy "Users manage own reactions"
  on public.reactions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Anyone can read reaction counts" on public.reactions;
create policy "Anyone can read reaction counts"
  on public.reactions for select
  using (true);

-- ─── Content reports ──────────────────────────────────────────────────────────
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles (id) on delete set null,
  item_id text not null,
  item_type text not null check (item_type in ('post', 'event', 'job', 'business')),
  reason text not null,
  message text,
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'dismissed')),
  created_at timestamptz not null default now()
);

create index if not exists reports_status_idx on public.reports (status, created_at desc);

alter table public.reports enable row level security;

drop policy if exists "Authenticated users can report" on public.reports;
create policy "Authenticated users can report"
  on public.reports for insert
  with check (auth.uid() = reporter_id);

drop policy if exists "Users read own reports" on public.reports;
create policy "Users read own reports"
  on public.reports for select
  using (auth.uid() = reporter_id);

drop policy if exists "Admins manage reports" on public.reports;
create policy "Admins manage reports"
  on public.reports for all
  using (public.is_admin());

-- ─── event_rsvps (ensure table exists) ────────────────────────────────────────
create table if not exists public.event_rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (event_id, user_id)
);

alter table public.event_rsvps enable row level security;

drop policy if exists "RSVPs are viewable by everyone" on public.event_rsvps;
create policy "RSVPs are viewable by everyone"
  on public.event_rsvps for select using (true);

drop policy if exists "Users can RSVP to events" on public.event_rsvps;
create policy "Users can RSVP to events"
  on public.event_rsvps for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can cancel their RSVP" on public.event_rsvps;
create policy "Users can cancel their RSVP"
  on public.event_rsvps for delete
  using (auth.uid() = user_id);

-- ─── app_feedback: tighten read policies ──────────────────────────────────────
drop policy if exists "Anyone authenticated can submit feedback" on public.app_feedback;
drop policy if exists "Anyone can submit feedback" on public.app_feedback;
drop policy if exists "Users can read own feedback" on public.app_feedback;
drop policy if exists "Admins can read all feedback" on public.app_feedback;

create policy "Authenticated users submit feedback"
  on public.app_feedback for insert
  with check (auth.uid() is not null and (user_id is null or auth.uid() = user_id));

create policy "Admins read feedback"
  on public.app_feedback for select
  using (public.is_admin());

create policy "Users read own feedback"
  on public.app_feedback for select
  using (auth.uid() = user_id);

-- ─── Track last seen (called from client) ───────────────────────────────────
create or replace function public.touch_last_seen()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null then
    update public.profiles set last_seen_at = now() where id = auth.uid();
  end if;
end;
$$;

grant execute on function public.touch_last_seen() to authenticated;
