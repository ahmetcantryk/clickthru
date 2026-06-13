import { createSupabaseClient } from './supabase/client';

/**
 * Medya yükleme — base64 data URL'leri `demo-media` bucket'ına taşır, public URL döndürür.
 * Böylece demo JSON'u (jsonb) şişmez. Giriş yapmış kullanıcı yükler (RLS: authenticated upload).
 */
const BUCKET = 'demo-media';

export function isDataUrl(s: string | undefined): s is string {
  return !!s && s.startsWith('data:');
}

function extFromMime(mime: string): string {
  const map: Record<string, string> = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'video/webm': 'webm',
    'video/mp4': 'mp4',
  };
  return map[mime] ?? 'bin';
}

/** data: URL → Blob (atob ile; fetch('data:') ortam bağımlılığı olmadan). */
export function dataUrlToBlob(dataUrl: string): Blob {
  const comma = dataUrl.indexOf(',');
  const mime = /data:([^;]+)/.exec(dataUrl.slice(0, comma))?.[1] ?? 'application/octet-stream';
  const bin = atob(dataUrl.slice(comma + 1));
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

/** data URL'i Storage'a yükle, public URL döndür. */
export async function uploadDataUrl(pathNoExt: string, dataUrl: string): Promise<string> {
  const supabase = createSupabaseClient();
  const blob = dataUrlToBlob(dataUrl);
  const path = `${pathNoExt}.${extFromMime(blob.type)}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, { upsert: true, contentType: blob.type });
  if (error) throw new Error(error.message);
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
