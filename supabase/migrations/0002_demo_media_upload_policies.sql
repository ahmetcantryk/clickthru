-- demo-media Storage upload izinleri (medya artık base64 yerine bucket'a yüklenir).
-- Applied to the live project via Supabase MCP on 2026-06-13; kept here for version control.
-- anon (uzantı capture): yalnızca captures/ klasörüne; authenticated: bucket geneline.

drop policy if exists "demo-media anon upload to captures" on storage.objects;
create policy "demo-media anon upload to captures"
  on storage.objects for insert to anon
  with check (bucket_id = 'demo-media' and (storage.foldername(name))[1] = 'captures');

drop policy if exists "demo-media authenticated upload" on storage.objects;
create policy "demo-media authenticated upload"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'demo-media');

drop policy if exists "demo-media authenticated update" on storage.objects;
create policy "demo-media authenticated update"
  on storage.objects for update to authenticated
  using (bucket_id = 'demo-media' and owner = auth.uid())
  with check (bucket_id = 'demo-media');
