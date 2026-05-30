import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase istemcisi (anon/publishable key) — hem tarayıcı hem sunucu bileşeninde kullanılır.
 * Faz 1'de auth yok; session kalıcılığına gerek yok (anon read/write).
 *
 * Env tanımlıysa onu kullanır; değilse committed publishable (anon) değerlerine düşer —
 * böylece Vercel deploy'u ek ayar olmadan çalışır. Publishable key client tarafında
 * güvenle açığa çıkar; güvenlik RLS ile sağlanır (Faz 1 MVP; gerçek auth + sıkı RLS → Faz 3).
 */
const FALLBACK_URL = 'https://hhtdagbepactmhwemect.supabase.co';
const FALLBACK_ANON_KEY = 'sb_publishable_JNMQY7DO_zKD9Kjsh3-z9A_hvohutoZ';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_ANON_KEY;

export function createSupabaseClient(): SupabaseClient {
  return createClient(url, anonKey, {
    auth: { persistSession: false },
  });
}
