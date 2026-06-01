'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { createSupabaseClient } from './supabase/client';

/**
 * Auth — Supabase (Google OAuth + e-posta magic link).
 * Gerçek kaynak Supabase oturumudur; ekranların senkron okuduğu eski
 * localStorage anahtarlarına **ayna** yazılır (clickthru-auth/-onboarded/-profile),
 * böylece ekranlar değişmeden çalışır. `syncSession()` aynayı tazeler.
 */
export interface SessionUser {
  name: string;
  email: string;
}

export interface OnboardingProfile {
  goals: string[];
  role?: string;
  source?: string;
  workspace?: string;
  brandColor?: string;
}

const SESSION_KEY = 'clickthru-auth';
const ONBOARD_KEY = 'clickthru-onboarded';
const PROFILE_KEY = 'clickthru-profile';

function callbackUrl(): string {
  return `${window.location.origin}/auth/callback`;
}

/* ---------- senkron okuyucular (ekranlar için, localStorage aynası) ---------- */
export function getSession(): SessionUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}

export function isOnboarded(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(ONBOARD_KEY) === '1';
  } catch {
    return false;
  }
}

export function getProfile(): OnboardingProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as OnboardingProfile) : null;
  } catch {
    return null;
  }
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/* ---------- Supabase ↔ ayna ---------- */
function mapUser(u: User): SessionUser {
  const meta = u.user_metadata ?? {};
  const name = meta.full_name || meta.name || meta.profileName || (u.email ? u.email.split('@')[0] : 'Kullanıcı');
  return { name, email: u.email ?? '' };
}

function profileFrom(u: User): OnboardingProfile {
  const m = u.user_metadata ?? {};
  return { goals: m.goals ?? [], role: m.role, source: m.source, workspace: m.workspace, brandColor: m.brandColor };
}

function writeMirror(user: SessionUser, onboarded: boolean, profile: OnboardingProfile | null) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    if (onboarded) localStorage.setItem(ONBOARD_KEY, '1');
    else localStorage.removeItem(ONBOARD_KEY);
    if (profile) localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // yoksay
  }
}

function clearMirror() {
  try {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(ONBOARD_KEY);
    localStorage.removeItem(PROFILE_KEY);
  } catch {
    // yoksay
  }
}

/** Supabase oturumunu çekip aynayı tazeler. Oturum yoksa aynayı temizler. */
export async function syncSession(): Promise<SessionUser | null> {
  const supabase = createSupabaseClient();
  const { data } = await supabase.auth.getSession();
  const u = data.session?.user;
  if (!u) {
    clearMirror();
    return null;
  }
  const su = mapUser(u);
  writeMirror(su, u.user_metadata?.onboarded === true, profileFrom(u));
  return su;
}

/* ---------- giriş / çıkış ---------- */
export async function signInWithGoogle(): Promise<{ error: string | null }> {
  const supabase = createSupabaseClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: callbackUrl() },
  });
  return { error: error?.message ?? null };
}

export async function signInWithEmail(email: string): Promise<{ error: string | null }> {
  const supabase = createSupabaseClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: callbackUrl(), shouldCreateUser: true },
  });
  return { error: error?.message ?? null };
}

export function signOut(): void {
  clearMirror();
  // arka planda Supabase oturumunu da kapat.
  createSupabaseClient().auth.signOut();
}

/* ---------- profil ---------- */
export function completeOnboarding(profile?: OnboardingProfile): void {
  // Ayna hemen (yönlendirme anında doğru), Supabase metadata arka planda.
  const cur = getSession();
  if (cur) writeMirror(cur, true, profile ?? getProfile());
  const supabase = createSupabaseClient();
  supabase.auth.updateUser({ data: { onboarded: true, ...(profile ?? {}) } });
}

export function updateSession(partial: Partial<SessionUser>): SessionUser | null {
  const cur = getSession();
  if (!cur) return null;
  const next = { ...cur, ...partial };
  writeMirror(next, isOnboarded(), getProfile());
  if (partial.name) createSupabaseClient().auth.updateUser({ data: { profileName: partial.name } });
  return next;
}

export function updateProfile(partial: Partial<OnboardingProfile>): void {
  const cur = getProfile() ?? { goals: [] };
  const next = { ...cur, ...partial };
  const session = getSession();
  if (session) writeMirror(session, isOnboarded(), next);
  createSupabaseClient().auth.updateUser({ data: { ...partial } });
}

/** Korumalı sayfa sarmalı: oturum yoksa /login, onboard gerekiyorsa /onboarding. */
export function AuthGate({ children, requireOnboarded = false }: { children: React.ReactNode; requireOnboarded?: boolean }) {
  const router = useRouter();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const u = await syncSession();
      if (!alive) return;
      if (!u) {
        router.replace('/login');
        return;
      }
      if (requireOnboarded && !isOnboarded()) {
        router.replace('/onboarding');
        return;
      }
      setOk(true);
    })();
    return () => {
      alive = false;
    };
  }, [router, requireOnboarded]);

  if (!ok) {
    return (
      <div className="flex h-screen items-center justify-center bg-canvas">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-hairline border-t-accent" />
      </div>
    );
  }
  return <>{children}</>;
}
