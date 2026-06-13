import type { DemoVariable } from '@clickthru/schema';

/**
 * Kişiselleştirme (Faz 3 satış) — callout/metin içindeki `{{key}}` token'larını çözer.
 * Öncelik: kişiye özel link override'ı → değişken `default`'u → (tanımsızsa) token olduğu gibi.
 * Saf fonksiyonlar (IO yok) — hem sunucu (play page) hem istemci (embed) kullanır.
 */

const TOKEN = /\{\{\s*([a-zA-Z][a-zA-Z0-9_]*)\s*\}\}/g;

/** Değişken anahtarı → default değer haritası (hızlı arama). */
function defaultsOf(variables: DemoVariable[] | undefined): Map<string, string> {
  const m = new Map<string, string>();
  for (const v of variables ?? []) m.set(v.key, v.default ?? '');
  return m;
}

/**
 * `{{key}}` token'larını çözer. Bilinmeyen (tanımsız) token olduğu gibi bırakılır
 * ki yazar yazım hatasını fark etsin.
 */
export function resolveVars(
  text: string | undefined,
  variables?: DemoVariable[],
  overrides?: Record<string, string>,
): string {
  if (!text) return text ?? '';
  if (!text.includes('{{')) return text;
  const defs = defaultsOf(variables);
  return text.replace(TOKEN, (full, key: string) => {
    const ov = overrides?.[key];
    if (ov != null && ov !== '') return ov;
    if (defs.has(key)) return defs.get(key) ?? '';
    return full;
  });
}

/** `?key=...` parametrelerini destekleyen kaynak (sunucu objesi veya URLSearchParams). */
export type ParamSource = Record<string, string | string[] | undefined> | URLSearchParams;

function readParam(params: ParamSource, key: string): string | undefined {
  if (params instanceof URLSearchParams) return params.get(key) ?? undefined;
  const v = params[key];
  return Array.isArray(v) ? v[0] : v;
}

/**
 * URL parametrelerinden yalnız **tanımlı** değişken anahtarları için override haritası kurar.
 * (Rastgele query paramları override'a sızmaz.)
 */
export function overridesFromParams(
  params: ParamSource,
  variables?: DemoVariable[],
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const v of variables ?? []) {
    const val = readParam(params, v.key);
    if (val != null && val !== '') out[v.key] = val;
  }
  return out;
}

/** Kişiye özel paylaşım linki kuyruğu (`?ad=Jane&şirket=Globex`). Boş değerler atlanır. */
export function personalizedQuery(values: Record<string, string>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(values)) {
    if (v && v.trim()) sp.set(k, v.trim());
  }
  const s = sp.toString();
  return s ? `?${s}` : '';
}
