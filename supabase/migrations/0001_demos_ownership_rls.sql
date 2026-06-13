-- M1: demo ownership + real RLS (replaces permissive MVP policies).
-- Applied to the live project via Supabase MCP on 2026-06-13; kept here for version control.
-- owner_id = sahip; auth.uid() default. Extension (anon) sahipsiz oluşturur,
-- giriş yapmış kullanıcı ilk kaydında sahiplenir (claim). Public okuma korunur.

alter table public.demos
  add column if not exists owner_id uuid references auth.users(id) on delete set null default auth.uid();

-- updated_at'i her güncellemede tazele (listDemos updated_at'e göre sıralar)
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists demos_set_updated_at on public.demos;
create trigger demos_set_updated_at before update on public.demos
  for each row execute function public.set_updated_at();

-- eski izinli (MVP) politikaları kaldır
drop policy if exists "anyone can create demos (MVP, no auth)" on public.demos;
drop policy if exists "anyone can update demos (MVP, no auth)" on public.demos;
drop policy if exists "public demos are readable by anyone" on public.demos;

-- SELECT: public demolar herkese; sahip kendi (private) demolarını görür
create policy "demos_select_public_or_owner" on public.demos
  for select using (is_public = true or owner_id = auth.uid());

-- INSERT (giriş yapmış): kendi adına
create policy "demos_insert_authenticated_own" on public.demos
  for insert to authenticated with check (owner_id = auth.uid());

-- INSERT (anon, uzantı capture — geçiş): yalnızca sahipsiz
create policy "demos_insert_anon_unclaimed" on public.demos
  for insert to anon with check (owner_id is null);

-- UPDATE (giriş yapmış): sahipsizi sahiplen veya kendi demonu güncelle; sonuç kendi olmalı
create policy "demos_update_owner_or_claim" on public.demos
  for update to authenticated
  using (owner_id is null or owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- DELETE (giriş yapmış): yalnızca kendi demon
create policy "demos_delete_owner" on public.demos
  for delete to authenticated using (owner_id = auth.uid());

create index if not exists demos_owner_idx on public.demos (owner_id, updated_at desc);
