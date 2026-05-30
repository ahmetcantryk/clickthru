import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase istemcisi (anon/publishable key) — hem tarayıcı hem sunucu bileşeninde kullanılır.
 * Faz 1'de auth yok; session kalıcılığına gerek yok (anon read/write).
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function createSupabaseClient(): SupabaseClient {
  if (!url || !anonKey) {
    throw new Error(
      'Supabase ortam değişkenleri eksik: NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_ANON_KEY tanımlayın (.env.local).',
    );
  }
  return createClient(url, anonKey, {
    auth: { persistSession: false },
  });
}
