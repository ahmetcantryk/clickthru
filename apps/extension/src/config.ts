// clickthru uzantı yapılandırması.
// Publishable (anon) key istemci tarafında güvenle açığa çıkar; demo + medya yazımı RLS ile
// anon'a açık (Faz 1 MVP; medya yalnızca demo-media/captures/ altına).
export const SUPABASE_URL = 'https://hhtdagbepactmhwemect.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_JNMQY7DO_zKD9Kjsh3-z9A_hvohutoZ';

// Yakalanan demo bu adreste açılır. Üretimde dağıtım URL'iyle değiştir.
export const STUDIO_BASE_URL = 'http://localhost:3000';

export const MEDIA_BUCKET = 'demo-media';

/** data: URL → Blob (SW içinde fetch('data:…') güvenilmez; elle çöz). */
export function dataUrlToBlob(dataUrl: string): Blob {
  const comma = dataUrl.indexOf(',');
  const head = dataUrl.slice(0, comma);
  const mime = /data:([^;]+)/.exec(head)?.[1] ?? 'application/octet-stream';
  const bin = atob(dataUrl.slice(comma + 1));
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

/** Storage'a (demo-media) yükler; public URL döndürür. Hata → throw. */
export async function uploadToStorage(path: string, blob: Blob): Promise<string> {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${MEDIA_BUCKET}/${path}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'content-type': blob.type || 'application/octet-stream',
      'x-upsert': 'true',
    },
    body: blob,
  });
  if (!res.ok) throw new Error(`Storage yükleme hatası HTTP ${res.status}`);
  return `${SUPABASE_URL}/storage/v1/object/public/${MEDIA_BUCKET}/${path}`;
}
