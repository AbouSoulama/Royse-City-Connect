-- User feedback / app reviews
create table public.app_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  user_name text not null default 'Anonymous',
  rating int not null check (rating between 1 and 5),
  category text not null default 'general'
    check (category in ('general', 'bug', 'feature', 'design', 'other')),
  message text not null,
  created_at timestamptz not null default now()
);

create index app_feedback_created_at_idx on public.app_feedback (created_at desc);

alter table public.app_feedback enable row level security;

create policy "Anyone authenticated can submit feedback"
  on public.app_feedback for insert
  with check (auth.uid() is not null);

create policy "Users can read own feedback"
  on public.app_feedback for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Admins can read all feedback"
  on public.app_feedback for select
  using (public.is_admin());
