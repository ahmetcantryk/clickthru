import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase istemcisi.
 * - Tarayıcı: TEK singleton, oturum kalıcı (auth). Google OAuth + e-posta magic link.
 * - Sunucu: durumsuz anon istemci (SSR okuma).
 *
 * Env yoksa committed publishable (anon) değerlerine düşer. Publishable key
 * client'ta güvenle açığa çıkar; güvenlik RLS ile sağlanır.
 */
const FALLBACK_URL = 'https://hhtdagbepactmhwemect.supabase.co';
const FALLBACK_ANON_KEY = 'sb_publishable_JNMQY7DO_zKD9Kjsh3-z9A_hvohutoZ';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_ANON_KEY;

let browserClient: SupabaseClient | null = null;

export function createSupabaseClient(): SupabaseClient {
  // Sunucu: her çağrıda durumsuz (oturum yok).
  if (typeof window === 'undefined') {
    return createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  }
  // Tarayıcı: oturum kalıcı tek istemci.
  if (!browserClient) {
    browserClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        // callback'i kendimiz işliyoruz (verifyOtp / exchangeCodeForSession).
        detectSessionInUrl: false,
        flowType: 'pkce',
      },
    });
  }
  return browserClient;
}
