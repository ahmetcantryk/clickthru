'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { isOnboarded, signInWithEmail, signInWithGoogle, syncSession } from '@/lib/auth';
import { useT } from '@/lib/i18n';

const ACCENT = 'oklch(0.68 0.17 256)';

type FloatCard = { src: string; style: React.CSSProperties; w: number; rot: number; dur: number; delay: number; blur: number; op: number };

const CARDS: FloatCard[] = [
  { src: '/samples/dashboard-1.svg', style: { top: '11%', left: '5%' }, w: 310, rot: -6, dur: 9, delay: 0, blur: 1, op: 0.6 },
  { src: '/samples/dashboard-3.svg', style: { top: '9%', right: '6%' }, w: 330, rot: 5, dur: 10, delay: 0.4, blur: 0.5, op: 0.62 },
  { src: '/samples/dashboard-2.svg', style: { bottom: '8%', left: '9%' }, w: 270, rot: 4, dur: 12, delay: 0.7, blur: 2.5, op: 0.4 },
  { src: '/samples/dashboard-4.svg', style: { bottom: '10%', right: '8%' }, w: 290, rot: -4, dur: 11, delay: 1, blur: 3, op: 0.38 },
  { src: '/samples/dashboard-1.svg', style: { top: '40%', left: '-3%' }, w: 210, rot: 9, dur: 13, delay: 1.3, blur: 4, op: 0.26 },
  { src: '/samples/dashboard-2.svg', style: { top: '44%', right: '-3%' }, w: 220, rot: -8, dur: 12.5, delay: 1.6, blur: 4, op: 0.24 },
];

function BrowserCard({ src, w }: { src: string; w: number }) {
  return (
    <div style={{ width: w, borderRadius: 14, overflow: 'hidden', background: '#fff', border: '1px solid rgba(255,255,255,.14)', boxShadow: '0 30px 70px rgba(0,0,0,.5)' }}>
      <div style={{ height: 26, background: '#f4f5f8', display: 'flex', alignItems: 'center', gap: 5, padding: '0 10px' }}>
        {['#ff5f57', '#febc2e', '#28c840'].map((c) => <span key={c} style={{ width: 7, height: 7, borderRadius: '50%', background: c }} />)}
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" draggable={false} style={{ display: 'block', width: '100%', aspectRatio: '1280/720', objectFit: 'cover' }} />
    </div>
  );
}

function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.92c1.71-1.57 2.68-3.89 2.68-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 009 18z" />
      <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 010-3.44V4.95H.96a9 9 0 000 8.1l3.01-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 00.96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
    </svg>
  );
}

const Spinner = ({ dark }: { dark?: boolean }) => (
  <span style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${dark ? '#1a1c24' : 'rgba(255,255,255,.8)'}`, borderTopColor: 'transparent', animation: 'lx-spin .7s linear infinite' }} />
);

export function LoginScreen() {
  const router = useRouter();
  const { t } = useT();
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState<null | 'google' | 'email'>(null);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    syncSession().then((u) => {
      if (u) router.replace(isOnboarded() ? '/workspaces' : '/onboarding');
      else setShow(true);
    });
  }, [router]);

  async function google() {
    setError(null);
    setBusy('google');
    const { error } = await signInWithGoogle();
    if (error) {
      setError(t.login.googleErr);
      setBusy(null);
    }
    // başarılıysa Google'a yönlenir
  }

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setError(null);
    setBusy('email');
    const { error } = await signInWithEmail(email.trim());
    setBusy(null);
    if (error) setError(error);
    else setSent(true);
  }

  if (!show) return <div style={{ position: 'fixed', inset: 0, background: 'oklch(0.14 0.02 264)' }} />;

  return (
    <main
      style={{
        position: 'relative',
        minHeight: '100vh',
        overflow: 'hidden',
        fontFamily: 'var(--font-hanken), system-ui, sans-serif',
        background: 'radial-gradient(120% 120% at 50% -10%, oklch(0.26 0.06 264), oklch(0.13 0.02 264) 60%)',
        color: '#fff',
      }}
    >
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {CARDS.map((c, i) => (
          <motion.div
            key={i}
            style={{ position: 'absolute', ...c.style, opacity: c.op, filter: `blur(${c.blur}px)` }}
            initial={{ y: 0, rotate: c.rot }}
            animate={{ y: [0, -16, 0], rotate: [c.rot, c.rot + 1.5, c.rot] }}
            transition={{ duration: c.dur, delay: c.delay, repeat: Infinity, ease: 'easeInOut' }}
          >
            <BrowserCard src={c.src} w={c.w} />
          </motion.div>
        ))}
      </div>

      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(60% 55% at 50% 50%, transparent, oklch(0.13 0.02 264 / .82) 70%)' }} />
      <div style={{ position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, borderRadius: '50%', background: `radial-gradient(circle, ${ACCENT}, transparent 60%)`, opacity: 0.16, filter: 'blur(40px)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 28px', zIndex: 2 }}>
        <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, textDecoration: 'none', color: '#fff' }}>
          <span style={{ width: 27, height: 27, borderRadius: 8, background: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M2 2.5L11.5 7.5L7 8.2L9.2 12L7.4 12.9L5.2 9.1L2 11.5z" fill="#fff" /></svg>
          </span>
          <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.03em' }}>clickthru</span>
        </a>
        <a href="/" style={{ fontSize: 13.5, color: 'rgba(255,255,255,.7)', textDecoration: 'none' }}>{t.login.home}</a>
      </div>

      <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 160px)', padding: 24 }}>
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
          style={{ width: '100%', maxWidth: 432, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 24, padding: '38px 34px', backdropFilter: 'blur(20px)', boxShadow: '0 40px 100px rgba(0,0,0,.55)' }}
        >
          {sent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
                <span style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="M3.5 6.5l8.5 6 8.5-6" /></svg>
                </span>
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', margin: 0 }}>{t.login.sentTitle}</h1>
              <p style={{ fontSize: 14.5, lineHeight: 1.55, color: 'rgba(255,255,255,.72)', margin: '12px 0 22px' }}>
                {t.login.sentBody1}<span style={{ color: '#fff', fontWeight: 600 }}>{email}</span>{t.login.sentBody2}
              </p>
              <button type="button" onClick={() => { setSent(false); setEmail(''); }} style={ghostBtn}>{t.login.useAnother}</button>
            </div>
          ) : (
            <>
              <div style={{ font: '600 11.5px/1 var(--font-jetbrains), monospace', letterSpacing: '.16em', textTransform: 'uppercase', color: ACCENT, marginBottom: 16 }}>{t.login.eyebrow}</div>
              <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.08, margin: 0 }}>{t.login.title}</h1>
              <p style={{ fontSize: 15, lineHeight: 1.55, color: 'rgba(255,255,255,.72)', margin: '12px 0 26px' }}>{t.login.lead}</p>

              <button type="button" onClick={google} disabled={!!busy} style={whiteBtn(!!busy)}>
                {busy === 'google' ? <Spinner dark /> : <GoogleG />}
                {busy === 'google' ? t.login.redirecting : t.login.google}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0', color: 'rgba(255,255,255,.4)', fontSize: 12 }}>
                <span style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.12)' }} /> {t.login.or} <span style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.12)' }} />
              </div>

              <form onSubmit={sendLink} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.login.emailPh}
                  style={{ height: 48, borderRadius: 12, border: '1px solid rgba(255,255,255,.16)', background: 'rgba(255,255,255,.06)', color: '#fff', padding: '0 14px', fontSize: 14.5, fontFamily: 'inherit', outline: 'none' }}
                />
                <button type="submit" disabled={!!busy} style={accentBtn(!!busy)}>
                  {busy === 'email' ? <><Spinner /> {t.login.sending}</> : t.login.send}
                </button>
              </form>

              {error && <p style={{ marginTop: 14, fontSize: 12.5, color: 'oklch(0.78 0.14 24)', textAlign: 'center' }}>{error}</p>}

              <a href="/#showcase" style={{ ...ghostBtn, marginTop: 16, display: 'flex' }}>
                <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor"><path d="M4 3.2v9.6c0 .5.5.8.9.5l7-4.8a.6.6 0 000-1l-7-4.8a.6.6 0 00-.9.5z" /></svg>
                {t.login.watch}
              </a>
              <p style={{ fontSize: 11.5, lineHeight: 1.5, color: 'rgba(255,255,255,.45)', margin: '20px 0 0', textAlign: 'center' }}>
                {t.login.terms1}<span style={{ color: 'rgba(255,255,255,.7)' }}>{t.login.terms}</span>{t.login.termsAnd}<span style={{ color: 'rgba(255,255,255,.7)' }}>{t.login.privacy}</span>{t.login.terms2}
              </p>
            </>
          )}
        </motion.div>
      </div>

      <style>{`@keyframes lx-spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  );
}

const baseBtn: React.CSSProperties = {
  width: '100%', height: 50, borderRadius: 13, cursor: 'pointer', border: 'none', fontSize: 15, fontWeight: 600, fontFamily: 'inherit',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, textDecoration: 'none', transition: 'opacity .15s',
};
const whiteBtn = (busy: boolean): React.CSSProperties => ({ ...baseBtn, background: '#fff', color: '#1a1c24', boxShadow: '0 8px 24px rgba(0,0,0,.25)', opacity: busy ? 0.7 : 1 });
const accentBtn = (busy: boolean): React.CSSProperties => ({ ...baseBtn, height: 48, background: ACCENT, color: '#0b1020', opacity: busy ? 0.7 : 1 });
const ghostBtn: React.CSSProperties = { ...baseBtn, height: 46, background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,.16)' };
