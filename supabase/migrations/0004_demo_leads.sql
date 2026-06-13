-- M6: lead yakalama (Faz 3 satış/CRM). Paylaşılan demo'da görüntüleyenden e-posta toplar.
-- Applied to the live project via Supabase MCP on 2026-06-13; kept here for version control.
-- Insert yalnız PUBLIC demolar için (görüntüleyen lead bırakır); okuma yalnız demonun SAHİBİ (RLS).

create table if not exists public.demo_leads (
  id bigint generated always as identity primary key,
  demo_id text not null,
  email text not null,
  name text,
  company text,
  created_at timestamptz not null default now()
);

comment on table public.demo_leads is 'Paylaşılan demo lead yakalama gönderimleri (satış/CRM).';

alter table public.demo_leads enable row level security;

create index if not exists demo_leads_demo_idx on public.demo_leads (demo_id, created_at desc);

drop policy if exists "demo_leads_insert_public" on public.demo_leads;
create policy "demo_leads_insert_public" on public.demo_leads
  for insert to anon, authenticated
  with check (exists (select 1 from public.demos d where d.id = demo_leads.demo_id and d.is_public = true));

drop policy if exists "demo_leads_select_owner" on public.demo_leads;
create policy "demo_leads_select_owner" on public.demo_leads
  for select to authenticated
  using (exists (select 1 from public.demos d where d.id = demo_leads.demo_id and d.owner_id = auth.uid()));
