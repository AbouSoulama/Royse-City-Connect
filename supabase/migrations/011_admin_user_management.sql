-- Admin user management + content delete policies

-- Invites: admin pre-assigns role before user signs up
create table if not exists public.user_invites (
  email text primary key,
  role public.user_role not null default 'member',
  name text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.user_invites enable row level security;

drop policy if exists "Admins manage invites" on public.user_invites;
create policy "Admins manage invites"
  on public.user_invites for all
  using (public.is_admin())
  with check (public.is_admin());

-- Apply invite role on profile creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  invite_role public.user_role;
  invite_name text;
  meta_role text;
begin
  select role, name into invite_role, invite_name
  from public.user_invites
  where lower(email) = lower(new.email)
  limit 1;

  meta_role := coalesce(new.raw_user_meta_data->>'role', 'member');
  if meta_role = 'admin' then
    meta_role := 'member';
  end if;

  insert into public.profiles (id, name, phone, city, role, avatar_url)
  values (
    new.id,
    coalesce(invite_name, new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'city', 'Royse City'),
    coalesce(invite_role, meta_role::public.user_role, 'member'),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture')
  )
  on conflict (id) do update set
    name = excluded.name,
    avatar_url = coalesce(excluded.avatar_url, profiles.avatar_url);

  delete from public.user_invites where lower(email) = lower(new.email);
  return new;
end;
$$;

-- Admin set role
create or replace function public.admin_set_user_role(target_id uuid, new_role public.user_role)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Not authorized';
  end if;
  if target_id = auth.uid() and new_role <> 'admin' then
    raise exception 'Cannot demote yourself';
  end if;
  update public.profiles set role = new_role where id = target_id;
end;
$$;

grant execute on function public.admin_set_user_role(uuid, public.user_role) to authenticated;

-- Admin delete profile (auth user remains in auth.users — delete via Supabase dashboard if needed)
create or replace function public.admin_delete_profile(target_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Not authorized';
  end if;
  if target_id = auth.uid() then
    raise exception 'Cannot delete yourself';
  end if;
  delete from public.profiles where id = target_id;
end;
$$;

grant execute on function public.admin_delete_profile(uuid) to authenticated;

-- Admin delete content
drop policy if exists "Admins delete posts" on public.posts;
create policy "Admins delete posts"
  on public.posts for delete
  using (public.is_admin());

drop policy if exists "Admins delete businesses" on public.businesses;
create policy "Admins delete businesses"
  on public.businesses for delete
  using (public.is_admin());

drop policy if exists "Admins delete events" on public.events;
create policy "Admins delete events"
  on public.events for delete
  using (public.is_admin());

drop policy if exists "Admins delete jobs" on public.jobs;
create policy "Admins delete jobs"
  on public.jobs for delete
  using (public.is_admin());

-- Admins can update any profile
drop policy if exists "Admins update all profiles" on public.profiles;
create policy "Admins update all profiles"
  on public.profiles for update
  using (public.is_admin());
