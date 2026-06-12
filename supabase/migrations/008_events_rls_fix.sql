-- Fix: organizers couldn't read their own pending events after insert (RETURNING / select fails)
-- Also allow self-notifications when submitting content

drop policy if exists "Approved events are public" on public.events;

create policy "Events visible to public, organizers and admins"
  on public.events for select
  using (
    status = 'approved'
    or auth.uid() = organizer_id
    or public.is_admin()
  );

drop policy if exists "Organizers can update own pending events" on public.events;

create policy "Organizers can update own pending events"
  on public.events for update
  using (auth.uid() = organizer_id and status = 'pending')
  with check (auth.uid() = organizer_id);

-- Notifications: allow app to notify the submitting user (not admin-only)
drop policy if exists "Users can receive own notifications" on public.notifications;

create policy "Users can receive own notifications"
  on public.notifications for insert
  with check (auth.uid() = user_id or public.is_admin());
