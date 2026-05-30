import type { Demo } from '@clickthru/schema';
import { safeValidateDemo } from '@clickthru/schema';
import { createSupabaseClient } from './supabase/client';

/** demos tablosu satırı (yalnızca okuduğumuz alanlar). */
interface DemoRow {
  data: unknown;
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
