-- Storage pour les images + colonnes image_url

-- Bucket public pour les médias communautaires
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

-- Lecture publique
create policy "Public read media"
  on storage.objects for select
  using (bucket_id = 'media');

-- Upload par utilisateurs authentifiés (dans leur dossier userId/)
create policy "Authenticated users upload to own folder"
  on storage.objects for insert
  with check (
    bucket_id = 'media'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users update own media"
  on storage.objects for update
  using (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users delete own media"
  on storage.objects for delete
  using (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Images pour businesses et events
alter table public.businesses add column if not exists image_url text;
alter table public.events add column if not exists image_url text;
