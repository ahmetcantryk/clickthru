import type { Demo, Step } from '@clickthru/schema';
import { safeValidateDemo } from '@clickthru/schema';
import { createSupabaseClient } from './supabase/client';
import { genDemoId } from './id';
import { isDataUrl, uploadDataUrl } from './storage';

/**
 * Adımlardaki base64 (data:) medyayı Storage'a yükleyip URL'le değiştirir (jsonb şişmesin).
 * Yükleme başarısızsa data URL korunur (kayıt yine de çalışır — graceful).
 */
async function persistInlineMedia(demo: Demo): Promise<Demo> {
  let changed = false;
  const steps = await Promise.all(
    demo.steps.map(async (s): Promise<Step> => {
      const patch: Partial<Step> = {};
      if (isDataUrl(s.media)) {
        try {
          patch.media = await uploadDataUrl(`u/${demo.id}/${s.id}`, s.media);
          changed = true;
        } catch {
          // data URL ile devam
        }
      }
      if (isDataUrl(s.poster)) {
        try {
          patch.poster = await uploadDataUrl(`u/${demo.id}/${s.id}_p`, s.poster);
          changed = true;
        } catch {
          // yoksay
        }
      }
      return Object.keys(patch).length ? { ...s, ...patch } : s;
    }),
  );
  return changed ? { ...demo, steps } : demo;
}

/** Workspaces listesinde gösterilen özet (tam demo değil). */
export interface DemoSummary {
  id: string;
  title: string;
  thumbnail?: string;
  type: Step['type'];
  steps: number;
  updatedAt?: string;
  /** Örnek (seed) demo mu — sahip değil, silinemez/yeniden adlandırılamaz. */
  sample?: boolean;
}

interface ListRow {
  id: string;
  title: string | null;
  data: unknown;
  updated_at?: string | null;
}

/** Aktif oturumdaki kullanıcı id'si (yoksa null). */
async function currentUserId(): Promise<string | null> {
  const supabase = createSupabaseClient();
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id ?? null;
}

/** Boş bir demo (Sıfırdan başla) — editör boş durumla açılır. */
export function blankDemo(): Demo {
  return {
    id: genDemoId(),
    title: 'Adsız demo',
    defaultBackground: '#F5F4F2',
    wrapper: 'browser',
    steps: [],
  };
}

/**
 * Giriş yapmış kullanıcının demolarını getirir (workspaces).
 * RLS zaten public+owner döndürür; burada **yalnızca sahibinkini** filtreleriz.
 * Oturum yoksa boş dizi (UI örnek demolara düşer).
 */
export async function listDemos(): Promise<DemoSummary[]> {
  const supabase = createSupabaseClient();
  const uid = await currentUserId();
  if (!uid) return [];

  const { data, error } = await supabase
    .from('demos')
    .select('id,title,data,updated_at')
    .eq('owner_id', uid)
    .order('updated_at', { ascending: false })
    .limit(48);

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
        updatedAt: row.updated_at ?? undefined,
      };
    })
    .filter((d): d is DemoSummary => d !== null);
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Beklenmeyen hata';
}

/**
 * Demo'yu Supabase'e yazar (upsert). `owner_id` aktif kullanıcıya set edilir —
 * yeni demo sahiplenir, uzantının oluşturduğu sahipsiz demo da ilk kayıtta sahiplenir.
 * Sınırda doğrulama: geçersiz demo asla kaydedilmez (fail-fast).
 */
export async function saveDemo(demo: Demo): Promise<void> {
  const res = safeValidateDemo(demo);
  if (!res.ok) {
    throw new Error(`Geçersiz demo: ${res.errors[0] ?? 'bilinmeyen hata'}`);
  }

  const supabase = createSupabaseClient();
  const uid = await currentUserId();
  // base64 medyayı Storage'a taşı (jsonb şişmesin) — sonra kaydet.
  const persisted = await persistInlineMedia(demo);
  const row: Record<string, unknown> = { id: persisted.id, title: persisted.title, data: persisted, is_public: true };
  if (uid) row.owner_id = uid; // sahiplenme (claim); RLS check owner_id = auth.uid()

  const { error } = await supabase.from('demos').upsert(row);
  if (error) throw new Error(`Demo kaydedilemedi: ${error.message}`);
}

/** Demoyu sil (RLS: yalnızca sahip). */
export async function deleteDemo(id: string): Promise<void> {
  const supabase = createSupabaseClient();
  const { error } = await supabase.from('demos').delete().eq('id', id);
  if (error) throw new Error(`Demo silinemedi: ${error.message}`);
}

/** Demoyu yeniden adlandır (RLS: yalnızca sahip). */
export async function renameDemo(id: string, title: string): Promise<void> {
  const clean = title.trim();
  if (!clean) throw new Error('Başlık boş olamaz');
  const supabase = createSupabaseClient();
  const { error } = await supabase.from('demos').update({ title: clean }).eq('id', id);
  if (error) throw new Error(`Demo yeniden adlandırılamadı: ${error.message}`);
}

/**
 * id'ye göre PUBLIC demo getirir; bulunamazsa null. Dönen JSON şemayla doğrulanır
 * (güvenilmeyen kaynak — kötü kayıt player'ı bozmasın).
 *
 * Gizlilik: SECURITY DEFINER `get_public_demo(id)` RPC'si üzerinden okur — yalnızca
 * **id'yi bilen** erişir, demolar tablosu listelenemez (enumerasyon engellendi).
 * Bu yüzden paylaşım id'leri tahmin edilemez olmalı (bkz. genDemoId).
 */
export async function getDemo(id: string): Promise<Demo | null> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase.rpc('get_public_demo', { p_id: id });

  if (error) throw new Error(`Demo getirilemedi: ${error.message}`);
  if (!data) return null;

  const res = safeValidateDemo(data);
  return res.ok ? res.demo : null;
}

/** Hata mesajını UI'ye taşımak için yardımcı (saf — IO yok). */
export { getErrorMessage };
