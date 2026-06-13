-- Prod sıkılaştırma — Supabase advisor bulguları (security + performance).
-- Applied to the live project via Supabase MCP on 2026-06-13; kept here for version control.
-- 1) set_updated_at: değişken search_path (güvenlik) → sabitle.
-- 2) RLS politikalarında auth.uid() satır-başına yeniden değerlendiriliyordu → (select auth.uid()) ile sar (performans).
-- 3) demo-media (public bucket) geniş SELECT listeleme politikası → kaldır (public URL servisi bundan etkilenmez).
-- NOT: "leaked password protection" Auth ayarıdır (SQL değil) — Dashboard'dan açılmalı.

-- 1) Fonksiyon search_path (now() pg_catalog'da; boş search_path güvenli).
alter function public.set_updated_at() set search_path = '';

-- 2) RLS init-plan: auth.uid() → (select auth.uid()) (mantık birebir korunur).
drop policy if exists "demos_select_public_or_owner" on public.demos;
create policy "demos_select_public_or_owner" on public.demos
  for select to public
  using ((is_public = true) or (owner_id = (select auth.uid())));

drop policy if exists "demos_insert_authenticated_own" on public.demos;
create policy "demos_insert_authenticated_own" on public.demos
  for insert to authenticated
  with check (owner_id = (select auth.uid()));

drop policy if exists "demos_update_owner_or_claim" on public.demos;
create policy "demos_update_owner_or_claim" on public.demos
  for update to authenticated
  using ((owner_id is null) or (owner_id = (select auth.uid())))
  with check (owner_id = (select auth.uid()));

drop policy if exists "demos_delete_owner" on public.demos;
create policy "demos_delete_owner" on public.demos
  for delete to authenticated
  using (owner_id = (select auth.uid()));

drop policy if exists "demo_views_select_owner" on public.demo_views;
create policy "demo_views_select_owner" on public.demo_views
  for select to authenticated
  using (exists (select 1 from public.demos d where d.id = demo_views.demo_id and d.owner_id = (select auth.uid())));

drop policy if exists "demo_leads_select_owner" on public.demo_leads;
create policy "demo_leads_select_owner" on public.demo_leads
  for select to authenticated
  using (exists (select 1 from public.demos d where d.id = demo_leads.demo_id and d.owner_id = (select auth.uid())));

-- 3) Public bucket geniş listeleme politikasını kaldır (URL ile erişim public bucket'ta zaten serbest).
drop policy if exists "demo-media public read" on storage.objects;
