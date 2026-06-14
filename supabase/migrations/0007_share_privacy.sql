-- Paylaşım gizliliği: demolar URL'de yalnız TAHMİN EDİLEMEZ id ile erişilir + tablo listelenemez.
-- Applied to the live project via Supabase MCP on 2026-06-14; kept here for version control.
--
-- Sorun: demos SELECT politikası anon'a tüm public demoları döndürüyordu → anon API ile
-- enumerasyon (rastgele/sıralı id ile başkasının demosuna erişim) mümkündü.
-- Çözüm: public okuma yalnız SECURITY DEFINER `get_public_demo(id)` RPC'si ile (id'yi bilmek şart,
-- listeleme yok); demos SELECT artık yalnız SAHİP. view/lead insert kontrolleri de definer
-- fonksiyona taşındı (demos SELECT'e bağlı kalmadan is_public kontrolü).

-- public demo mu? (definer → demos RLS'inden bağımsız çalışır)
create or replace function public.is_demo_public(p_id text)
returns boolean language sql security definer set search_path = '' stable as $$
  select exists (select 1 from public.demos d where d.id = p_id and d.is_public = true);
$$;
grant execute on function public.is_demo_public(text) to anon, authenticated;

-- id'yi bilen herkes (login olmadan) public demoyu okur; LİSTELEME YOK (enumerasyon engellendi).
create or replace function public.get_public_demo(p_id text)
returns jsonb language sql security definer set search_path = '' stable as $$
  select d.data from public.demos d where d.id = p_id and d.is_public = true;
$$;
grant execute on function public.get_public_demo(text) to anon, authenticated;

-- demos SELECT artık yalnız SAHİP (anon listeleme/enumerasyon kapandı; public okuma RPC ile).
drop policy if exists "demos_select_public_or_owner" on public.demos;
drop policy if exists "demos_select_owner" on public.demos;
create policy "demos_select_owner" on public.demos
  for select to authenticated
  using (owner_id = (select auth.uid()));

-- view/lead insert kontrolleri definer fonksiyon üzerinden (demos SELECT'e bağlı değil).
drop policy if exists "demo_views_insert_public" on public.demo_views;
create policy "demo_views_insert_public" on public.demo_views
  for insert to anon, authenticated
  with check (public.is_demo_public(demo_id));

drop policy if exists "demo_leads_insert_public" on public.demo_leads;
create policy "demo_leads_insert_public" on public.demo_leads
  for insert to anon, authenticated
  with check (public.is_demo_public(demo_id));
