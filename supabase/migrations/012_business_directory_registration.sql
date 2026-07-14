-- 012_business_directory_registration.sql
-- Self-serve business directory registration (wizard)
-- Extends public.businesses + storage for Rich listings.

-- ─── Extend content_status with draft ───────────────────────────────────────
-- ─── Extend content_status with draft ───────────────────────────────────────
ALTER TYPE public.content_status ADD VALUE IF NOT EXISTS 'draft';

-- ─── Extra columns on businesses ───────────────────────────────────────────
alter table public.businesses
  add column if not exists products_services text,
  add column if not exists unique_selling_point text,
  add column if not exists year_founded integer,
  add column if not exists employee_count text,
  add column if not exists owner_title text,
  add column if not exists owner_email text,
  add column if not exists preferred_contact text,
  add column if not exists website text,
  add column if not exists postal_code text,
  add column if not exists latitude numeric(10, 7),
  add column if not exists longitude numeric(10, 7),
  add column if not exists service_areas text[] not null default '{}',
  add column if not exists hours jsonb not null default '{}'::jsonb,
  add column if not exists social jsonb not null default '{}'::jsonb,
  add column if not exists photos jsonb not null default '{}'::jsonb,
  add column if not exists ideal_clients text,
  add column if not exists top_services text[] not null default '{}',
  add column if not exists price_range text,
  add column if not exists commercial_options text[] not null default '{}',
  add column if not exists languages text[] not null default '{}',
  add column if not exists payment_methods text[] not null default '{}',
  add column if not exists wheelchair_accessible boolean not null default false,
  add column if not exists family_owned boolean not null default false,
  add column if not exists woman_owned boolean not null default false,
  add column if not exists veteran_owned boolean not null default false,
  add column if not exists minority_owned boolean not null default false,
  add column if not exists licensed boolean not null default false,
  add column if not exists insured boolean not null default false,
  add column if not exists emergency_service boolean not null default false,
  add column if not exists seasonal_services boolean not null default false,
  add column if not exists keywords text,
  add column if not exists ai_tags text,
  add column if not exists ideal_for text[] not null default '{}',
  add column if not exists promo_channels text[] not null default '{}',
  add column if not exists want_ad_offers boolean not null default false,
  add column if not exists photo_usage_allowed boolean not null default false,
  add column if not exists partnership_comments text,
  add column if not exists registration_step integer not null default 1,
  add column if not exists draft_token text unique;

comment on column public.businesses.status is 'draft | pending | approved | rejected — pending requires admin approval before public listing';
comment on column public.businesses.draft_token is 'Anonymous draft resume token (uuid) stored in localStorage';

-- Prefer logo/facade as primary image when present
create or replace function public.sync_business_primary_image()
returns trigger
language plpgsql
as $$
begin
  if new.photos is not null then
    new.image_url := coalesce(
      nullif(new.photos->>'logo', ''),
      nullif(new.photos->>'facade', ''),
      nullif(new.photos->>'interior', ''),
      new.image_url
    );
  end if;
  return new;
end;
$$;

drop trigger if exists businesses_sync_primary_image on public.businesses;
create trigger businesses_sync_primary_image
  before insert or update of photos on public.businesses
  for each row execute function public.sync_business_primary_image();

-- ─── RLS: allow self-serve registration (anon + authenticated) ─────────────
drop policy if exists "Users can create businesses" on public.businesses;
drop policy if exists "Anyone can register a business draft or pending" on public.businesses;

create policy "Anyone can register a business draft or pending"
  on public.businesses for insert
  with check (status in ('draft', 'pending'));

drop policy if exists "Owners can update own pending businesses" on public.businesses;
drop policy if exists "Owners or draft holders can update unfinished listings" on public.businesses;

create policy "Owners or draft holders can update unfinished listings"
  on public.businesses for update
  using (
    status in ('draft', 'pending')
    and (
      (owner_id is not null and auth.uid() = owner_id)
      or (draft_token is not null) -- token verified in app layer for anon updates via RPC ideally
    )
  )
  with check (status in ('draft', 'pending', 'rejected'));

-- Secure draft resume via RPC (avoids exposing all drafts)
create or replace function public.get_business_draft(p_token text)
returns setof public.businesses
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_token is null or length(trim(p_token)) < 16 then
    return;
  end if;
  return query
    select * from public.businesses
    where draft_token = p_token
      and status in ('draft', 'pending')
    limit 1;
end;
$$;

revoke all on function public.get_business_draft(text) from public;
grant execute on function public.get_business_draft(text) to anon, authenticated;

create or replace function public.upsert_business_registration(payload jsonb)
returns public.businesses
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid := nullif(payload->>'id', '')::uuid;
  v_token text := coalesce(nullif(payload->>'draft_token', ''), gen_random_uuid()::text);
  v_row public.businesses;
  v_status public.content_status := coalesce(nullif(payload->>'status', ''), 'draft')::public.content_status;
begin
  if v_status not in ('draft', 'pending') then
    raise exception 'Invalid status for self-serve registration';
  end if;

  if v_id is not null then
    update public.businesses b set
      name = coalesce(payload->>'name', b.name),
      category = coalesce(payload->>'category', b.category),
      description = coalesce(payload->>'description', b.description),
      products_services = payload->>'products_services',
      unique_selling_point = payload->>'unique_selling_point',
      year_founded = nullif(payload->>'year_founded', '')::integer,
      employee_count = payload->>'employee_count',
      owner_name = coalesce(payload->>'owner_name', b.owner_name),
      owner_title = payload->>'owner_title',
      phone = coalesce(payload->>'phone', b.phone),
      owner_email = payload->>'owner_email',
      whatsapp = coalesce(payload->>'whatsapp', b.whatsapp),
      website = payload->>'website',
      preferred_contact = payload->>'preferred_contact',
      address = payload->>'address',
      city = coalesce(payload->>'city', b.city),
      postal_code = payload->>'postal_code',
      latitude = nullif(payload->>'latitude', '')::numeric,
      longitude = nullif(payload->>'longitude', '')::numeric,
      service_areas = coalesce(
        (select array_agg(x) from jsonb_array_elements_text(coalesce(payload->'service_areas', '[]'::jsonb)) t(x)),
        b.service_areas
      ),
      hours = coalesce(payload->'hours', b.hours),
      social = coalesce(payload->'social', b.social),
      photos = coalesce(payload->'photos', b.photos),
      ideal_clients = payload->>'ideal_clients',
      top_services = coalesce(
        (select array_agg(x) from jsonb_array_elements_text(coalesce(payload->'top_services', '[]'::jsonb)) t(x)),
        b.top_services
      ),
      price_range = payload->>'price_range',
      commercial_options = coalesce(
        (select array_agg(x) from jsonb_array_elements_text(coalesce(payload->'commercial_options', '[]'::jsonb)) t(x)),
        b.commercial_options
      ),
      languages = coalesce(
        (select array_agg(x) from jsonb_array_elements_text(coalesce(payload->'languages', '[]'::jsonb)) t(x)),
        b.languages
      ),
      payment_methods = coalesce(
        (select array_agg(x) from jsonb_array_elements_text(coalesce(payload->'payment_methods', '[]'::jsonb)) t(x)),
        b.payment_methods
      ),
      wheelchair_accessible = coalesce((payload->>'wheelchair_accessible')::boolean, b.wheelchair_accessible),
      family_owned = coalesce((payload->>'family_owned')::boolean, b.family_owned),
      woman_owned = coalesce((payload->>'woman_owned')::boolean, b.woman_owned),
      veteran_owned = coalesce((payload->>'veteran_owned')::boolean, b.veteran_owned),
      minority_owned = coalesce((payload->>'minority_owned')::boolean, b.minority_owned),
      licensed = coalesce((payload->>'licensed')::boolean, b.licensed),
      insured = coalesce((payload->>'insured')::boolean, b.insured),
      emergency_service = coalesce((payload->>'emergency_service')::boolean, b.emergency_service),
      seasonal_services = coalesce((payload->>'seasonal_services')::boolean, b.seasonal_services),
      keywords = payload->>'keywords',
      ai_tags = payload->>'ai_tags',
      ideal_for = coalesce(
        (select array_agg(x) from jsonb_array_elements_text(coalesce(payload->'ideal_for', '[]'::jsonb)) t(x)),
        b.ideal_for
      ),
      promo_channels = coalesce(
        (select array_agg(x) from jsonb_array_elements_text(coalesce(payload->'promo_channels', '[]'::jsonb)) t(x)),
        b.promo_channels
      ),
      want_ad_offers = coalesce((payload->>'want_ad_offers')::boolean, b.want_ad_offers),
      photo_usage_allowed = coalesce((payload->>'photo_usage_allowed')::boolean, b.photo_usage_allowed),
      partnership_comments = payload->>'partnership_comments',
      registration_step = coalesce(nullif(payload->>'registration_step', '')::integer, b.registration_step),
      status = v_status,
      owner_id = coalesce(nullif(payload->>'owner_id', '')::uuid, b.owner_id),
      emoji = coalesce(payload->>'emoji', b.emoji),
      color = coalesce(payload->>'color', b.color),
      updated_at = now()
    where b.id = v_id
      and b.draft_token = v_token
      and b.status in ('draft', 'pending')
    returning * into v_row;

    if v_row.id is null then
      raise exception 'Draft not found or token mismatch';
    end if;
    return v_row;
  end if;

  insert into public.businesses (
    owner_id, name, category, description, products_services, unique_selling_point,
    year_founded, employee_count, owner_name, owner_title, phone, owner_email,
    whatsapp, website, preferred_contact, address, city, postal_code, latitude, longitude,
    service_areas, hours, social, photos, ideal_clients, top_services, price_range,
    commercial_options, languages, payment_methods, wheelchair_accessible, family_owned,
    woman_owned, veteran_owned, minority_owned, licensed, insured, emergency_service,
    seasonal_services, keywords, ai_tags, ideal_for, promo_channels, want_ad_offers,
    photo_usage_allowed, partnership_comments, registration_step, status, draft_token,
    emoji, color, verified, featured
  ) values (
    nullif(payload->>'owner_id', '')::uuid,
    coalesce(nullif(payload->>'name', ''), 'Untitled business'),
    coalesce(nullif(payload->>'category', ''), 'Other'),
    coalesce(payload->>'description', ''),
    payload->>'products_services',
    payload->>'unique_selling_point',
    nullif(payload->>'year_founded', '')::integer,
    payload->>'employee_count',
    coalesce(nullif(payload->>'owner_name', ''), 'Owner'),
    payload->>'owner_title',
    coalesce(nullif(payload->>'phone', ''), ''),
    payload->>'owner_email',
    coalesce(payload->>'whatsapp', ''),
    payload->>'website',
    payload->>'preferred_contact',
    payload->>'address',
    coalesce(nullif(payload->>'city', ''), 'Royse City'),
    payload->>'postal_code',
    nullif(payload->>'latitude', '')::numeric,
    nullif(payload->>'longitude', '')::numeric,
    coalesce((select array_agg(x) from jsonb_array_elements_text(coalesce(payload->'service_areas', '[]'::jsonb)) t(x)), '{}'),
    coalesce(payload->'hours', '{}'::jsonb),
    coalesce(payload->'social', '{}'::jsonb),
    coalesce(payload->'photos', '{}'::jsonb),
    payload->>'ideal_clients',
    coalesce((select array_agg(x) from jsonb_array_elements_text(coalesce(payload->'top_services', '[]'::jsonb)) t(x)), '{}'),
    payload->>'price_range',
    coalesce((select array_agg(x) from jsonb_array_elements_text(coalesce(payload->'commercial_options', '[]'::jsonb)) t(x)), '{}'),
    coalesce((select array_agg(x) from jsonb_array_elements_text(coalesce(payload->'languages', '[]'::jsonb)) t(x)), '{}'),
    coalesce((select array_agg(x) from jsonb_array_elements_text(coalesce(payload->'payment_methods', '[]'::jsonb)) t(x)), '{}'),
    coalesce((payload->>'wheelchair_accessible')::boolean, false),
    coalesce((payload->>'family_owned')::boolean, false),
    coalesce((payload->>'woman_owned')::boolean, false),
    coalesce((payload->>'veteran_owned')::boolean, false),
    coalesce((payload->>'minority_owned')::boolean, false),
    coalesce((payload->>'licensed')::boolean, false),
    coalesce((payload->>'insured')::boolean, false),
    coalesce((payload->>'emergency_service')::boolean, false),
    coalesce((payload->>'seasonal_services')::boolean, false),
    payload->>'keywords',
    payload->>'ai_tags',
    coalesce((select array_agg(x) from jsonb_array_elements_text(coalesce(payload->'ideal_for', '[]'::jsonb)) t(x)), '{}'),
    coalesce((select array_agg(x) from jsonb_array_elements_text(coalesce(payload->'promo_channels', '[]'::jsonb)) t(x)), '{}'),
    coalesce((payload->>'want_ad_offers')::boolean, false),
    coalesce((payload->>'photo_usage_allowed')::boolean, false),
    payload->>'partnership_comments',
    coalesce(nullif(payload->>'registration_step', '')::integer, 1),
    v_status,
    v_token,
    coalesce(payload->>'emoji', '🏪'),
    coalesce(payload->>'color', 'from-navy to-navy-light'),
    false,
    false
  )
  returning * into v_row;

  return v_row;
end;
$$;

revoke all on function public.upsert_business_registration(jsonb) from public;
grant execute on function public.upsert_business_registration(jsonb) to anon, authenticated;

-- ─── Storage bucket ────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'business-media',
  'business-media',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

drop policy if exists "Public read business-media" on storage.objects;
create policy "Public read business-media"
  on storage.objects for select
  using (bucket_id = 'business-media');

drop policy if exists "Anyone can upload business registration media" on storage.objects;
create policy "Anyone can upload business registration media"
  on storage.objects for insert
  with check (
    bucket_id = 'business-media'
    and (storage.foldername(name))[1] = 'registrations'
  );

drop policy if exists "Anyone can update own registration media path" on storage.objects;
create policy "Anyone can update own registration media path"
  on storage.objects for update
  using (
    bucket_id = 'business-media'
    and (storage.foldername(name))[1] = 'registrations'
  );

create index if not exists businesses_status_created_idx
  on public.businesses (status, created_at desc);

create index if not exists businesses_draft_token_idx
  on public.businesses (draft_token)
  where draft_token is not null;
