-- M4: paylaşılan demo görüntülenme analitiği (mock yerine gerçek veri).
-- Applied to the live project via Supabase MCP on 2026-06-13; kept here for version control.
-- View kaydı yalnızca PUBLIC demolar için; okuma yalnızca demonun SAHİBİ (RLS).

create table if not exists public.demo_views (
  id bigint generated always as identity primary key,
  demo_id text not null,
  session text,
  viewed_at timestamptz not null default now()
);

comment on table public.demo_views is 'Paylaşılan demo görüntülenme olayları (analitik).';

alter table public.demo_views enable row level security;

create index if not exists demo_views_demo_idx on public.demo_views (demo_id, viewed_at desc);

drop policy if exists "demo_views_insert_public" on public.demo_views;
create policy "demo_views_insert_public" on public.demo_views
  for insert to anon, authenticated
  with check (exists (select 1 from public.demos d where d.id = demo_views.demo_id and d.is_public = true));

drop policy if exists "demo_views_select_owner" on public.demo_views;
create policy "demo_views_select_owner" on public.demo_views
  for select to authenticated
  using (exists (select 1 from public.demos d where d.id = demo_views.demo_id and d.owner_id = auth.uid()));
