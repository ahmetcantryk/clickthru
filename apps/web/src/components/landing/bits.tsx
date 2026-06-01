'use client';

import * as React from 'react';
import { motion } from 'framer-motion';

export const EASE = 'cubic-bezier(.22,.61,.36,1)';

export function prefersReduced(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* ---------- scroll reveal ---------- */
export function Reveal({
  children,
  className = '',
  tag = 'div',
  delay = 0,
  style,
  ...rest
}: {
  children: React.ReactNode;
  className?: string;
  tag?: 'div' | 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'li';
  delay?: 0 | 1 | 2 | 3 | 4;
  style?: React.CSSProperties;
} & React.HTMLAttributes<HTMLElement>) {
  const ref = React.useRef<HTMLElement>(null);
  const [seen, setSeen] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && (setSeen(true), io.disconnect())),
      { threshold: 0.12, rootMargin: '0px 0px -7% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const Tag = tag as React.ElementType;
  return (
    <Tag ref={ref} className={`reveal ${delay ? 'd' + delay : ''} ${seen ? 'in' : ''} ${className}`} style={style} {...rest}>
      {children}
    </Tag>
  );
}

/* ---------- in-view + step machine ---------- */
export function useInView(threshold = 0.2): [React.RefObject<HTMLDivElement | null>, boolean] {
  const ref = React.useRef<HTMLDivElement>(null);
  const [v, setV] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setV(e.isIntersecting), { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, v];
}

export function useSteps(durs: number[], inView = true, rest = 0): number {
  const [i, setI] = React.useState(0);
  React.useEffect(() => {
    if (!inView || prefersReduced()) return;
    const id = setTimeout(() => setI((p) => (p + 1) % durs.length), durs[i]);
    return () => clearTimeout(id);
  }, [i, inView]); // eslint-disable-line react-hooks/exhaustive-deps
  return prefersReduced() ? rest : i;
}

/* ---------- fit a fixed-size block into its container width ---------- */
export function Scaled({ w, h, max = 1, children }: { w: number; h: number; max?: number; children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = React.useState(0.4);
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => setScale(Math.min(max, el.clientWidth / w));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [w, max]);
  return (
    <div ref={ref} style={{ width: '100%', height: h * scale, position: 'relative' }}>
      <div style={{ width: w, height: h, transform: `scale(${scale})`, transformOrigin: 'top left', position: 'absolute', top: 0, left: 0 }}>
        {children}
      </div>
    </div>
  );
}

/* ---------- logo + toggles ---------- */
export function Logo() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
      <span style={{ width: 27, height: 27, borderRadius: 8, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
          <path d="M2 2.5L11.5 7.5L7 8.2L9.2 12L7.4 12.9L5.2 9.1L2 11.5z" fill="var(--on-accent)" />
        </svg>
      </span>
      <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text)' }}>clickthru</span>
    </span>
  );
}

export function ThemeToggle({ theme, setTheme }: { theme: 'light' | 'dark'; setTheme: (t: 'light' | 'dark') => void }) {
  const dark = theme === 'dark';
  return (
    <button className="ct-iconbtn" aria-label={dark ? 'Açık tema' : 'Koyu tema'} onClick={() => setTheme(dark ? 'light' : 'dark')}>
      {dark ? (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="9" cy="9" r="3.4" /><path d="M9 1.5v2M9 14.5v2M1.5 9h2M14.5 9h2M3.6 3.6l1.4 1.4M13 13l1.4 1.4M14.4 3.6L13 5M5 13l-1.4 1.4" /></svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M15 10.5A6 6 0 017.5 3a6 6 0 103 13.2 6 6 0 004.5-5.7z" /></svg>
      )}
    </button>
  );
}

export function LangToggle({ lang, setLang }: { lang: 'tr' | 'en'; setLang: (l: 'tr' | 'en') => void }) {
  return (
    <button className="ct-iconbtn" aria-label="Dil / Language" onClick={() => setLang(lang === 'tr' ? 'en' : 'tr')}>
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6.4" /><path d="M1.6 8h12.8M8 1.6c1.7 1.7 2.6 4 2.6 6.4S9.7 12.7 8 14.4C6.3 12.7 5.4 10.4 5.4 8S6.3 3.3 8 1.6z" /></svg>
      {lang === 'tr' ? 'TR' : 'EN'}
    </button>
  );
}

/* ---------- demo building blocks ---------- */
const SCREEN: Record<string, string> = {
  overview: '/samples/dashboard-1.svg',
  reports: '/samples/dashboard-2.svg',
  customers: '/samples/dashboard-3.svg',
  settings: '/samples/dashboard-4.svg',
};
export type ScreenVariant = keyof typeof SCREEN;

/** 1280×720 ürün ekranı (yeni acme dashboard SVG'leri). */
export function DashScreen({ variant = 'overview' }: { variant?: ScreenVariant }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={SCREEN[variant] ?? SCREEN.overview} alt="" draggable={false} style={{ display: 'block', width: 1280, height: 720 }} />
  );
}

/** Nabız atan hotspot (framer-motion). */
export function Hotspot({ size = 26, color = 'var(--accent)' }: { size?: number; color?: string }) {
  const ring = size * 1.9;
  return (
    <span style={{ position: 'relative', display: 'inline-flex', width: ring, height: ring, alignItems: 'center', justifyContent: 'center' }}>
      {[0, 0.5].map((d) => (
        <motion.span
          key={d}
          style={{ position: 'absolute', width: size, height: size, borderRadius: '50%', border: `2px solid ${color}` }}
          initial={{ scale: 0.7, opacity: 0.7 }}
          animate={{ scale: 2.3, opacity: 0 }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut', delay: d }}
        />
      ))}
      <span style={{ width: size * 0.55, height: size * 0.55, borderRadius: '50%', background: color, boxShadow: `0 2px 8px rgba(0,0,0,.3)` }} />
    </span>
  );
}

/** Düz açıklama kartı + üçgen nub (player demolarında nav dock'ta). */
export function Callout({ title, body, arrow = 'none', w = 252 }: { title: string; body?: string; arrow?: 'up' | 'down' | 'left' | 'right' | 'none'; w?: number }) {
  const tri = 9;
  const cardBg = '#ffffff';
  const nub: Record<string, React.CSSProperties> = {
    up: { top: -tri, left: '50%', transform: 'translateX(-50%)', borderWidth: `0 ${tri}px ${tri}px ${tri}px`, borderColor: `transparent transparent ${cardBg} transparent` },
    down: { bottom: -tri, left: '50%', transform: 'translateX(-50%)', borderWidth: `${tri}px ${tri}px 0 ${tri}px`, borderColor: `${cardBg} transparent transparent transparent` },
    left: { left: -tri, top: '50%', transform: 'translateY(-50%)', borderWidth: `${tri}px ${tri}px ${tri}px 0`, borderColor: `transparent ${cardBg} transparent transparent` },
    right: { right: -tri, top: '50%', transform: 'translateY(-50%)', borderWidth: `${tri}px 0 ${tri}px ${tri}px`, borderColor: `transparent transparent transparent ${cardBg}` },
    none: { display: 'none' },
  };
  return (
    <div style={{ position: 'relative', width: w, background: cardBg, borderRadius: 16, border: '1px solid rgba(15,18,40,.08)', boxShadow: '0 18px 44px -12px rgba(20,22,60,.28), 0 2px 6px rgba(20,22,60,.1)', padding: '15px 17px' }}>
      <div style={{ position: 'absolute', width: 0, height: 0, borderStyle: 'solid', ...nub[arrow] }} />
      <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1c24', letterSpacing: '-0.01em', lineHeight: 1.25 }}>{title}</div>
      {body && <div style={{ fontSize: 12.5, color: '#5b6072', lineHeight: 1.5, marginTop: 5 }}>{body}</div>}
    </div>
  );
}

/** Browser / dark / none çerçeve (StageDemo + framed görseller). Daima açık ürün görünümü. */
export function FrameWrapper({ variant = 'browser', children }: { variant?: 'browser' | 'dark' | 'none'; children: React.ReactNode }) {
  if (variant === 'none') return <div style={{ borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,.2)' }}>{children}</div>;
  if (variant === 'dark') {
    return (
      <div style={{ background: '#18181f', borderRadius: 18, padding: 10, boxShadow: '0 24px 60px rgba(0,0,0,.4)' }}>
        <div style={{ borderRadius: 12, overflow: 'hidden' }}>{children}</div>
      </div>
    );
  }
  return (
    <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 24px 60px rgba(20,22,28,.22), 0 2px 8px rgba(20,22,28,.1)', border: '1px solid #e8e9ef' }}>
      <div style={{ height: 38, background: '#f4f5f8', borderBottom: '1px solid #e7e9ef', display: 'flex', alignItems: 'center', padding: '0 13px', gap: 7 }}>
        {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
          <span key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
        ))}
        <div style={{ flex: 1, maxWidth: 300, margin: '0 auto', height: 22, borderRadius: 6, background: '#fff', border: '1px solid #e7e9ef', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9499ab', fontSize: 11, fontFamily: 'var(--mono)' }}>
          app.acme.io
        </div>
        <div style={{ width: 30 }} />
      </div>
      <div>{children}</div>
    </div>
  );
}
