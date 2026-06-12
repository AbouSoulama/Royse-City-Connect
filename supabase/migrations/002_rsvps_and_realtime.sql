-- RSVPs + compteur participants + realtime notifications

create table public.event_rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (event_id, user_id)
);

alter table public.event_rsvps enable row level security;

create policy "RSVPs are viewable by everyone"
  on public.event_rsvps for select using (true);

create policy "Users can RSVP to events"
  on public.event_rsvps for insert
  with check (auth.uid() = user_id);

create policy "Users can cancel their RSVP"
  on public.event_rsvps for delete
  using (auth.uid() = user_id);

create or replace function public.update_event_attendees_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if TG_OP = 'INSERT' then
    update public.events set attendees_count = attendees_count + 1 where id = NEW.event_id;
  elsif TG_OP = 'DELETE' then
    update public.events set attendees_count = greatest(attendees_count - 1, 0) where id = OLD.event_id;
  end if;
  return coalesce(NEW, OLD);
end;
$$;

create trigger on_rsvp_change
  after insert or delete on public.event_rsvps
  for each row execute function public.update_event_attendees_count();

-- Notifications : les utilisateurs peuvent recevoir leurs propres notifs (soumission, etc.)
create policy "Users can create own notifications"
  on public.notifications for insert
  with check (auth.uid() = user_id);

-- Realtime pour notifications
alter publication supabase_realtime add table public.notifications;
