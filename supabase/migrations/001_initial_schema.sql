-- Royse City Connect — Schéma initial
-- Exécuter dans Supabase : SQL Editor → New query → Run

-- Extensions
create extension if not exists "pgcrypto";

-- Enums
create type public.user_role as enum ('member', 'business', 'admin');
create type public.post_category as enum (
  'news', 'immigration', 'church', 'association', 'fundraiser', 'funeral', 'alert',
  'hospitality', 'realestate'
);
create type public.content_status as enum ('pending', 'approved', 'rejected');
create type public.job_type as enum ('Full-time', 'Part-time', 'Contract', 'Volunteer');

-- ─── Profiles (lié à auth.users) ───────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default 'Community Member',
  phone text not null default '',
  city text not null default 'Royse City',
  role public.user_role not null default 'member',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── Posts ─────────────────────────────────────────────────────────────────
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles (id) on delete set null,
  author_name text not null,
  category public.post_category not null,
  title text not null,
  body text not null,
  city text not null default 'Royse City',
  status public.content_status not null default 'pending',
  pinned boolean not null default false,
  important boolean not null default false,
  image_url text,
  reactions_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── Businesses ────────────────────────────────────────────────────────────
create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles (id) on delete set null,
  name text not null,
  category text not null,
  description text not null,
  owner_name text not null,
  phone text not null,
  whatsapp text not null default '',
  city text not null,
  address text,
  emoji text not null default '🏪',
  color text not null default 'from-navy to-navy-light',
  verified boolean not null default false,
  featured boolean not null default false,
  rating numeric(2,1) not null default 0,
  status public.content_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── Events ────────────────────────────────────────────────────────────────
create table public.events (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid references public.profiles (id) on delete set null,
  title text not null,
  description text not null,
  event_date date not null,
  event_time text not null,
  location text not null,
  organizer_name text not null,
  city text not null,
  emoji text not null default '📅',
  color text not null default 'from-navy to-navy-light',
  featured boolean not null default false,
  attendees_count int not null default 0,
  status public.content_status not null default 'approved',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── Jobs ──────────────────────────────────────────────────────────────────
create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  posted_by_id uuid references public.profiles (id) on delete set null,
  title text not null,
  description text not null,
  location text not null,
  contact text not null,
  expires_on date,
  posted_by_name text not null,
  job_type public.job_type not null default 'Full-time',
  status public.content_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── Notifications ─────────────────────────────────────────────────────────
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null,
  title text not null,
  body text not null,
  unread boolean not null default true,
  created_at timestamptz not null default now()
);

-- ─── Helpers ───────────────────────────────────────────────────────────────
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger posts_updated_at before update on public.posts
  for each row execute function public.set_updated_at();
create trigger businesses_updated_at before update on public.businesses
  for each row execute function public.set_updated_at();
create trigger events_updated_at before update on public.events
  for each row execute function public.set_updated_at();
create trigger jobs_updated_at before update on public.jobs
  for each row execute function public.set_updated_at();

-- Créer le profil à l'inscription (admin non auto-attribué)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role text := coalesce(new.raw_user_meta_data->>'role', 'member');
begin
  insert into public.profiles (id, name, phone, city, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'Community Member'),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'city', 'Royse City'),
    case when requested_role = 'business' then 'business'::public.user_role
         else 'member'::public.user_role
    end
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── RLS ───────────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.businesses enable row level security;
alter table public.events enable row level security;
alter table public.jobs enable row level security;
alter table public.notifications enable row level security;

-- Profiles
create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Admins can update any profile"
  on public.profiles for update using (public.is_admin());

-- Posts
create policy "Approved posts are public"
  on public.posts for select
  using (status = 'approved' or auth.uid() = author_id or public.is_admin());

create policy "Authenticated users can create posts"
  on public.posts for insert
  with check (auth.uid() = author_id);

create policy "Authors can update own pending posts"
  on public.posts for update
  using (auth.uid() = author_id and status = 'pending');

create policy "Admins can manage all posts"
  on public.posts for all
  using (public.is_admin());

-- Businesses
create policy "Approved businesses are public"
  on public.businesses for select
  using (status = 'approved' or auth.uid() = owner_id or public.is_admin());

create policy "Business owners can create listings"
  on public.businesses for insert
  with check (auth.uid() = owner_id);

create policy "Owners can update own pending businesses"
  on public.businesses for update
  using (auth.uid() = owner_id);

create policy "Admins can manage all businesses"
  on public.businesses for all
  using (public.is_admin());

-- Events
create policy "Events visible to public, organizers and admins"
  on public.events for select
  using (
    status = 'approved'
    or auth.uid() = organizer_id
    or public.is_admin()
  );

create policy "Authenticated users can create events"
  on public.events for insert
  with check (auth.uid() = organizer_id);

create policy "Organizers can update own pending events"
  on public.events for update
  using (auth.uid() = organizer_id and status = 'pending')
  with check (auth.uid() = organizer_id);

create policy "Admins can manage all events"
  on public.events for all
  using (public.is_admin());

-- Jobs
create policy "Approved jobs are public"
  on public.jobs for select
  using (status = 'approved' or auth.uid() = posted_by_id or public.is_admin());

create policy "Authenticated users can post jobs"
  on public.jobs for insert
  with check (auth.uid() = posted_by_id);

create policy "Admins can manage all jobs"
  on public.jobs for all
  using (public.is_admin());

-- Notifications
create policy "Users see own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Users can mark own notifications read"
  on public.notifications for update
  using (auth.uid() = user_id);

create policy "Admins can create notifications"
  on public.notifications for insert
  with check (public.is_admin());

create policy "Users can receive own notifications"
  on public.notifications for insert
  with check (auth.uid() = user_id or public.is_admin());

-- Indexes
create index posts_status_created_idx on public.posts (status, created_at desc);
create index posts_category_idx on public.posts (category);
create index businesses_city_category_idx on public.businesses (city, category);
create index events_date_idx on public.events (event_date);
create index jobs_status_idx on public.jobs (status);
