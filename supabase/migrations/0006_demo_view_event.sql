-- Engagement analitiği: görüntülenme olayına tip ekle ('view' | 'complete').
-- Applied to the live project via Supabase MCP on 2026-06-13; kept here for version control.
-- 'complete' = görüntüleyen turun son adımına ulaştı → tamamlanma oranı hesaplanır.
-- Mevcut satırlar default ile 'view' olur (geri uyumlu). RLS politikaları değişmez.

alter table public.demo_views
  add column if not exists event text not null default 'view';

comment on column public.demo_views.event is 'Olay tipi: view (oynatma açıldı) | complete (son adıma ulaşıldı).';
