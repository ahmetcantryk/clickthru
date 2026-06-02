'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { EmailOtpType } from '@supabase/supabase-js';
import { createSupabaseClient } from '@/lib/supabase/client';
import { isOnboarded, syncSession } from '@/lib/auth';
import { useT } from '@/lib/i18n';

/** Magic link (token_hash) veya OAuth (code) dönüşünü işler, sonra yönlendirir. */
export function AuthCallback() {
  const router = useRouter();
  const { t } = useT();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const supabase = createSupabaseClient();
      const p = new URLSearchParams(window.location.search);
      const errDesc = p.get('error_description') || p.get('error');
      const tokenHash = p.get('token_hash');
      const type = p.get('type');
      const code = p.get('code');
      try {
        if (errDesc) throw new Error(errDesc);
        if (tokenHash && type) {
          const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: type as EmailOtpType });
          if (error) throw error;
        } else if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        }
        const u = await syncSession();
        if (!u) throw new Error(t.callback.noSession);
        router.replace(isOnboarded() ? '/workspaces' : '/onboarding');
      } catch (e) {
        setError(e instanceof Error ? e.message : t.callback.failed);
      }
    })();
  }, [router, t]);

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center"
      style={{ background: 'radial-gradient(120% 120% at 50% -10%, oklch(0.26 0.06 264), oklch(0.13 0.02 264) 60%)', color: '#fff', fontFamily: 'var(--font-hanken), system-ui, sans-serif' }}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: 'oklch(0.68 0.17 256)' }}>
        <svg width="18" height="18" viewBox="0 0 15 15" fill="none"><path d="M2 2.5L11.5 7.5L7 8.2L9.2 12L7.4 12.9L5.2 9.1L2 11.5z" fill="#fff" /></svg>
      </span>
      {error ? (
        <>
          <p className="text-[15px] font-semibold">{error}</p>
          <a href="/login" className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20">{t.callback.backToLogin}</a>
        </>
      ) : (
        <>
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          <p className="text-[14px] text-white/70">{t.callback.signingIn}</p>
        </>
      )}
    </main>
  );
}
