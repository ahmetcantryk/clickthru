import type { Demo, Step } from '@clickthru/schema';
import { safeValidateDemo } from '@clickthru/schema';
import { createSupabaseClient } from './supabase/client';
import { genId } from './id';

/** demos tablosu satırı (yalnızca okuduğumuz alanlar). */
interface DemoRow {
  data: unknown;
}

/** Workspaces listesinde gösterilen özet (tam demo değil). */
export interface DemoSummary {
  id: string;
  title: string;
  thumbnail?: string;
  type: Step['type'];
  steps: number;
  updatedAt?: string;
}

interface ListRow {
  id: string;
  title: string | null;
  data: unknown;
  ts?: string | null;
}

/** Boş bir demo (Sıfırdan başla) — editör boş durumla açılır. */
export function blankDemo(): Demo {
  return {
    id: genId('demo'),
    title: 'Adsız demo',
    defaultBackground: '#F5F4F2',
    wrapper: 'browser',
    steps: [],
  };
}

/**
 * Son demoları getirir (workspaces). Şema doğrulamasından geçenler özetlenir.
 * Hata/boş → boş dizi (UI örnek demolara düşer).
 */
export async function listDemos(): Promise<DemoSummary[]> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from('demos')
    .select('id,title,data,ts')
    .order('ts', { ascending: false })
    .limit(24);

  if (error || !data) return [];

  return (data as ListRow[])
    .map((row): DemoSummary | null => {
      const res = safeValidateDemo(row.data);
      if (!res.ok) return null;
      const d = res.demo;
      const first = d.steps[0];
      return {
        id: row.id,
        title: row.title ?? d.title,
        thumbnail: first?.type === 'screenshot' ? first.media : undefined,
        type: first?.type ?? 'screenshot',
        steps: d.steps.length,
        updatedAt: row.ts ?? undefined,
      };
    })
    .filter((d): d is DemoSummary => d !== null);
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Beklenmeyen hata';
}

/**
 * Demo'yu Supabase'e yazar (upsert — aynı id varsa günceller).
 * Sınırda doğrulama: geçersiz demo asla kaydedilmez (fail-fast).
 */
export async function saveDemo(demo: Demo): Promise<void> {
  const res = safeValidateDemo(demo);
  if (!res.ok) {
    throw new Error(`Geçersiz demo: ${res.errors[0] ?? 'bilinmeyen hata'}`);
  }

  const supabase = createSupabaseClient();
  const { error } = await supabase
    .from('demos')
    .upsert({ id: demo.id, title: demo.title, data: demo, is_public: true });

  if (error) throw new Error(`Demo kaydedilemedi: ${error.message}`);
}

/**
 * id'ye göre demo getirir; bulunamazsa null. Dönen JSON şemayla doğrulanır
 * (güvenilmeyen kaynak — kötü kayıt player'ı bozmasın).
 */
export async function getDemo(id: string): Promise<Demo | null> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from('demos')
    .select('data')
    .eq('id', id)
    .maybeSingle<DemoRow>();

  if (error) throw new Error(`Demo getirilemedi: ${error.message}`);
  if (!data) return null;

  const res = safeValidateDemo(data.data);
  return res.ok ? res.demo : null;
}

/** Hata mesajını UI'ye taşımak için yardımcı (saf — IO yok). */
export { getErrorMessage };
