'use client';

import * as React from 'react';
import { Scaled, FrameWrapper, Hotspot, Callout, useInView, useSteps, EASE, type ScreenVariant } from './bits';
import { useLang } from './i18n';

const SVG: Record<ScreenVariant, string> = {
  overview: '/samples/dashboard-1.svg',
  reports: '/samples/dashboard-2.svg',
  customers: '/samples/dashboard-3.svg',
  settings: '/samples/dashboard-4.svg',
};

/** 1280×720 ürün ekranını verilen genişliğe ölçekleyip yerleştirir (cover, üstten). */
function Screen({ variant = 'overview', w }: { variant?: ScreenVariant; w: number }) {
  const s = w / 1280;
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <div style={{ width: 1280, height: 720, transform: `scale(${s})`, transformOrigin: 'top left' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={SVG[variant]} alt="" draggable={false} style={{ display: 'block', width: 1280, height: 720 }} />
      </div>
    </div>
  );
}

/* ============ 1. CAPTURE ============ */
export function CaptureDemo() {
  const { t } = useLang();
  const [ref, inView] = useInView();
  const i = useSteps([620, 620, 620, 620, 620, 1100, 1000], inView, 5);
  const counting = i <= 4;
  const num = 5 - i;
  const recording = i >= 5;
  const flash = i === 6;
  return (
    <div ref={ref}>
      <Scaled w={560} h={315}>
        <div style={{ width: 560, height: 315, position: 'relative', borderRadius: 14, overflow: 'hidden', background: '#fff' }}>
          <Screen variant="overview" w={560} />
          <div style={{ position: 'absolute', inset: 10, border: `2px solid ${recording ? 'oklch(0.66 0.2 24)' : 'var(--accent)'}`, borderRadius: 10, pointerEvents: 'none', transition: 'border-color .3s' }} />
          <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(12,14,20,.86)', color: '#fff', fontSize: 11.5, fontWeight: 600, fontFamily: 'var(--mono)', padding: '6px 12px', borderRadius: 999 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: recording ? 'oklch(0.66 0.2 24)' : '#9aa0b0' }} />
            {recording ? t.demo.recording : t.demo.preparing}
          </div>
          {counting && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(244,245,248,.62)', backdropFilter: 'blur(1px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div key={num} className="ct-fadein" style={{ fontSize: 130, fontWeight: 300, color: '#1a1c24', letterSpacing: '-0.04em', lineHeight: 1 }}>{num}</div>
            </div>
          )}
          {recording && (
            <div style={{ position: 'absolute', left: i === 6 ? 320 : 270, top: i === 6 ? 120 : 170, transition: `left .5s ${EASE}, top .5s ${EASE}` }}>
              <svg width="24" height="24" viewBox="0 0 26 26" fill="none"><path d="M5 3l14 8-6 1.4 3 6.2-2.6 1.2-3-6.2L5 18z" fill="#fff" stroke="#1a1c24" strokeWidth="1.4" strokeLinejoin="round" /></svg>
            </div>
          )}
          {flash && <div className="ct-fadein" style={{ position: 'absolute', inset: 10, borderRadius: 10, background: 'rgba(255,255,255,.5)' }} />}
          {flash && (
            <div className="ct-fadein" style={{ position: 'absolute', right: 16, bottom: 16, display: 'flex', alignItems: 'center', gap: 8, background: 'var(--accent)', color: 'var(--on-accent)', fontSize: 13, fontWeight: 600, padding: '9px 13px', borderRadius: 10, boxShadow: '0 8px 24px color-mix(in oklch, var(--accent) 40%, transparent)' }}>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7.5l3 3 6-7" /></svg>
              {t.demo.stepAdded}
            </div>
          )}
          <div style={{ position: 'absolute', left: '50%', bottom: 14, transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(12,14,20,.86)', padding: '7px 8px 7px 13px', borderRadius: 999 }}>
            <span style={{ color: '#fff', fontSize: 12.5, fontWeight: 600 }}>{t.demo.stop}</span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'rgba(255,255,255,.6)', border: '1px solid rgba(255,255,255,.25)', borderRadius: 5, padding: '2px 6px' }}>Ctrl+Y</span>
          </div>
        </div>
      </Scaled>
    </div>
  );
}

/* ============ 2. CAMERA ============ */
const CAM = [
  { zoom: 1.0, cx: 640, cy: 360, variant: 'overview' as ScreenVariant, focus: true },
  { zoom: 1.7, cx: 1010, cy: 200, variant: 'overview' as ScreenVariant },
  { zoom: 1.55, cx: 660, cy: 500, variant: 'overview' as ScreenVariant },
  { zoom: 1.0, cx: 640, cy: 360, variant: 'reports' as ScreenVariant },
];
export function CameraDemo() {
  const [ref, inView] = useInView();
  const i = useSteps([1700, 1950, 1950, 1600], inView, 1);
  const f = CAM[i];
  const fx = f.cx / 1280;
  const fy = f.cy / 720;
  const cam = `translate(${(0.5 - fx * f.zoom) * 100}%, ${(0.5 - fy * f.zoom) * 100}%) scale(${f.zoom})`;
  return (
    <div ref={ref}>
      <Scaled w={560} h={315}>
        <div style={{ width: 560, height: 315, position: 'relative', borderRadius: 14, overflow: 'hidden', background: '#fff', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.06)' }}>
          <div style={{ position: 'absolute', inset: 0, transformOrigin: '0 0', transform: cam, transition: `transform 1.1s ${EASE}` }}>
            <div key={f.variant} className="ct-fadein" style={{ position: 'absolute', inset: 0 }}>
              <Screen variant={f.variant} w={560} />
            </div>
          </div>
          {f.focus && (
            <div className="ct-fadein" style={{ position: 'absolute', left: `${(1010 / 1280 - 0.5) * 100 + 50 - 27}%`, top: '12%', width: '54%', height: '20%' }}>
              <div style={{ position: 'absolute', inset: 0, border: '2px dashed oklch(0.72 0.16 256)', borderRadius: 7 }} />
              {(['tl', 'tr', 'bl', 'br'] as const).map((p) => {
                const pos = { tl: { left: -3, top: -3 }, tr: { right: -3, top: -3 }, bl: { left: -3, bottom: -3 }, br: { right: -3, bottom: -3 } }[p];
                return <div key={p} style={{ position: 'absolute', width: 11, height: 11, border: '3px solid oklch(0.72 0.16 256)', borderRadius: 3, ...pos }} />;
              })}
            </div>
          )}
          <div style={{ position: 'absolute', left: 12, bottom: 12, display: 'flex', alignItems: 'center', gap: 6, background: 'oklch(0.6 0.19 256)', color: '#fff', fontFamily: 'var(--mono)', fontSize: 11.5, fontWeight: 600, padding: '5px 10px', borderRadius: 7 }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="5" cy="5" r="3.2" /><path d="M7.5 7.5L10.5 10.5" strokeLinecap="round" /></svg>
            scale {f.zoom.toFixed(1)}×
          </div>
        </div>
      </Scaled>
    </div>
  );
}

/* ============ 3. STUDIO (context-aware editor) ============ */
export function StudioMiniDemo() {
  const { t } = useLang();
  const [ref, inView] = useInView(0.15);
  const i = useSteps([2200, 2200, 2200], inView, 0);
  const ctx = t.demo.inspectorCtx[i];
  return (
    <div ref={ref} className="ct-demoframe">
      <Scaled w={1000} h={600}>
        <div style={{ width: 1000, height: 600, background: 'var(--panel)', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font)' }}>
          {/* top bar */}
          <div style={{ height: 52, borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', padding: '0 18px', gap: 12 }}>
            <span style={{ width: 22, height: 22, borderRadius: 7, background: 'var(--accent)' }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Acme ürün turu</span>
            <span style={{ flex: 1 }} />
            <span style={{ height: 34, padding: '0 16px', borderRadius: 8, background: 'var(--accent)', color: 'var(--on-accent)', display: 'flex', alignItems: 'center', fontSize: 13, fontWeight: 600 }}>Paylaş</span>
          </div>
          <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
            {/* rail */}
            <div style={{ width: 168, borderRight: '1px solid var(--line)', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(['overview', 'reports', 'customers'] as ScreenVariant[]).map((v, k) => (
                <div key={v} style={{ position: 'relative', borderRadius: 10, border: `2px solid ${k === 1 ? 'var(--accent)' : 'var(--line)'}`, overflow: 'hidden', aspectRatio: '1280/720', background: 'var(--pit)' }}>
                  <Screen variant={v} w={140} />
                  <span style={{ position: 'absolute', left: 6, bottom: 6, width: 18, height: 18, borderRadius: 5, background: k === 1 ? 'var(--accent)' : 'rgba(10,12,20,.7)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '600 10px var(--mono)' }}>{k + 1}</span>
                </div>
              ))}
            </div>
            {/* canvas */}
            <div style={{ flex: 1, position: 'relative', background: 'var(--pit)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 26, minWidth: 0 }}>
              <div style={{ width: '100%', maxWidth: 520, position: 'relative' }}>
                <FrameWrapper variant="browser">
                  <div style={{ position: 'relative', aspectRatio: '1280/720', overflow: 'hidden', background: '#fff' }}>
                    <Screen variant="reports" w={520} />
                    <div key={ctx} className="ct-fadein" style={{ position: 'absolute', left: '50%', top: '58%', transform: 'translate(-50%,-50%)' }}>
                      {i === 1 ? <Hotspot size={22} /> : i === 2 ? (
                        <span style={{ background: 'var(--accent)', color: 'var(--on-accent)', fontSize: 13, fontWeight: 700, padding: '6px 12px', borderRadius: 9, boxShadow: '0 6px 18px rgba(0,0,0,.2)' }}>Buradan başla</span>
                      ) : <Callout title="Rapor oluştur" body="Tek tıkla yeni rapor." arrow="none" w={190} />}
                    </div>
                  </div>
                </FrameWrapper>
                {/* element add dock */}
                <div style={{ position: 'absolute', left: '50%', bottom: -14, transform: 'translateX(-50%)', display: 'flex', gap: 4, background: 'var(--elev, var(--panel))', border: '1px solid var(--line)', borderRadius: 14, padding: 6, boxShadow: 'var(--shadow)' }}>
                  {['🎯', '💬', '🔤', '🎬'].map((g, k) => (
                    <span key={k} style={{ width: 30, height: 30, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, background: k === ([2, 0, 0][i] ?? 0) ? 'var(--accent-soft)' : 'transparent' }}>{g}</span>
                  ))}
                </div>
              </div>
            </div>
            {/* inspector */}
            <div style={{ width: 210, borderLeft: '1px solid var(--line)', padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <span style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--accent-soft)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>{['💬', '🎯', '🔤'][i]}</span>
                <span key={ctx} className="ct-fadein" style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--text)' }}>{ctx}</span>
              </div>
              {[0, 1, 2].map((r) => (
                <div key={r} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ height: 8, width: r === 0 ? 60 : 44, borderRadius: 4, background: 'var(--line-2)' }} />
                  <span style={{ height: 34, borderRadius: 9, background: 'var(--panel-2)', border: '1px solid var(--line)' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Scaled>
    </div>
  );
}

/* ============ 4. MIXED MEDIA (progress) ============ */
const MM: { t: 'image' | 'video'; v: ScreenVariant }[] = [
  { t: 'image', v: 'overview' },
  { t: 'image', v: 'customers' },
  { t: 'video', v: 'reports' },
  { t: 'image', v: 'settings' },
];
export function ProgressDemo() {
  const { t } = useLang();
  const [ref, inView] = useInView();
  const i = useSteps([1100, 1100, 2600, 1100], inView, 2);
  const [vid, setVid] = React.useState(0);
  React.useEffect(() => {
    if (i !== 2 || !inView) {
      setVid(0);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (ts: number) => {
      const p = Math.min(1, (ts - start) / 2500);
      setVid(p);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [i, inView]);
  return (
    <div ref={ref}>
      <Scaled w={560} h={300}>
        <div style={{ width: 560, height: 300, borderRadius: 16, background: 'radial-gradient(120% 100% at 50% 0%, oklch(0.22 0.02 264), oklch(0.13 0.01 264))', padding: 26, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 22 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            {MM.map((s, k) => (
              <div key={k} style={{ flex: s.t === 'video' ? 1.7 : 1, height: 96, borderRadius: 9, overflow: 'hidden', border: `1.5px solid ${k === i ? 'var(--accent)' : 'rgba(255,255,255,.12)'}`, position: 'relative', opacity: k <= i ? 1 : 0.45, transition: 'opacity .3s, border-color .3s' }}>
                <Screen variant={s.v} w={s.t === 'video' ? 170 : 100} />
                {s.t === 'video' && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(12,14,20,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="11" height="11" viewBox="0 0 11 11" fill="#fff"><path d="M3 2v7l5-3.5z" /></svg>
                    </span>
                  </div>
                )}
                <span style={{ position: 'absolute', top: 5, left: 6, font: '600 9px var(--mono)', color: '#fff', background: s.t === 'video' ? 'oklch(0.6 0.19 256)' : 'rgba(12,14,20,.7)', padding: '2px 5px', borderRadius: 4 }}>{s.t === 'video' ? 'VIDEO' : 'IMG'}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 5 }}>
            {MM.map((s, k) => {
              const fill = k < i ? 1 : k === i ? (s.t === 'video' ? vid : 1) : 0;
              return (
                <div key={k} style={{ flex: s.t === 'video' ? 1.7 : 1, height: 5, borderRadius: 3, background: 'rgba(255,255,255,.18)', overflow: 'hidden', position: 'relative' }}>
                  <div style={{ position: 'absolute', inset: 0, width: `${fill * 100}%`, background: '#fff', borderRadius: 3, transition: s.t === 'video' ? 'none' : 'width .3s' }} />
                </div>
              );
            })}
          </div>
          <div style={{ font: '500 12px var(--mono)', color: 'rgba(255,255,255,.6)', textAlign: 'center' }}>
            {MM[i].t === 'video' ? t.demo.videoStep : t.demo.imageStep}
          </div>
        </div>
      </Scaled>
    </div>
  );
}

/* ============ 5. STAGE (wrappers) ============ */
const STAGE = [
  { wrap: 'browser' as const, bg: 'radial-gradient(120% 100% at 50% 0%, oklch(0.95 0.03 256), oklch(0.9 0.04 256))' },
  { wrap: 'dark' as const, bg: 'radial-gradient(120% 100% at 50% 0%, oklch(0.28 0.02 264), oklch(0.16 0.01 264))' },
  { wrap: 'none' as const, bg: 'radial-gradient(120% 100% at 50% 0%, oklch(0.94 0.05 295), oklch(0.9 0.05 320))' },
];
export function StageDemo() {
  const { t } = useLang();
  const [ref, inView] = useInView();
  const i = useSteps([2000, 2000, 2000], inView, 0);
  const f = STAGE[i];
  const sw = ['oklch(0.92 0.04 256)', 'oklch(0.2 0.01 264)', 'oklch(0.92 0.05 305)'];
  return (
    <div ref={ref}>
      <Scaled w={560} h={340}>
        <div style={{ width: 560, height: 340, borderRadius: 16, position: 'relative', overflow: 'hidden', background: f.bg, transition: 'background .6s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 420 }}>
            <div key={f.wrap} className="ct-fadein">
              <FrameWrapper variant={f.wrap}>
                <div style={{ position: 'relative', aspectRatio: '1280/720', overflow: 'hidden', background: '#fff' }}>
                  <Screen variant="overview" w={f.wrap === 'dark' ? 400 : 420} />
                </div>
              </FrameWrapper>
            </div>
          </div>
          <div style={{ position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 9, background: 'rgba(12,14,20,.5)', padding: 8, borderRadius: 999, backdropFilter: 'blur(6px)' }}>
            {sw.map((c, k) => (
              <span key={k} style={{ width: 22, height: 22, borderRadius: 7, background: c, border: '1px solid rgba(255,255,255,.3)', boxShadow: k === i ? '0 0 0 2px rgba(12,14,20,.5), 0 0 0 4px #fff' : 'none' }} />
            ))}
          </div>
          <div style={{ position: 'absolute', top: 12, left: 14, font: '600 11px var(--mono)', color: i === 1 ? 'rgba(255,255,255,.85)' : 'oklch(0.4 0.02 264)' }}>{t.demo.wrappers[i]}</div>
        </div>
      </Scaled>
    </div>
  );
}

/* ============ 6. SHARE ============ */
export function ShareDemo() {
  const { t } = useLang();
  const [ref, inView] = useInView();
  const i = useSteps([1200, 1100, 1800, 1800], inView, 3); // 0 btn,1 saving,2 modal,3 copied
  const copied = i === 3;
  return (
    <div ref={ref}>
      <Scaled w={560} h={380}>
        <div style={{ width: 560, height: 380, borderRadius: 16, position: 'relative', overflow: 'hidden', background: 'var(--pit)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {i <= 1 ? (
            <span style={{ height: 46, padding: '0 22px', borderRadius: 11, background: 'var(--accent)', color: 'var(--on-accent)', display: 'inline-flex', alignItems: 'center', gap: 9, fontSize: 15, fontWeight: 600, boxShadow: '0 10px 24px color-mix(in oklch, var(--accent) 30%, transparent)' }}>
              {i === 1 ? <><span className="ct-spin" /> {t.demo.saving}</> : <><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="4" r="2" /><circle cx="4" cy="8" r="2" /><circle cx="12" cy="12" r="2" /><path d="M5.7 7l4.6-2M5.7 9l4.6 2" /></svg> {t.demo.shareBtn}</>}
            </span>
          ) : (
            <div key="m" className="ct-fadein" style={{ width: 420, background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 18, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
              <div style={{ height: 120, background: 'radial-gradient(120% 120% at 50% 0%, color-mix(in oklch, var(--accent) 24%, transparent), transparent), var(--pit)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid var(--line)' }}>
                <div style={{ width: 200, borderRadius: 9, overflow: 'hidden', boxShadow: '0 14px 36px rgba(0,0,0,.3)', position: 'relative', aspectRatio: '1280/720', transform: 'translateY(12px)' }}>
                  <Screen variant="overview" w={200} />
                </div>
              </div>
              <div style={{ padding: '20px 22px 22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 6 }}>
                  <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--good-soft)', color: 'var(--good)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 7.5l3 3 6-7" /></svg>
                  </span>
                  <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>{t.demo.shareTitle}</span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5, marginBottom: 16 }}>{t.demo.shareBody}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ flex: 1, height: 42, borderRadius: 10, background: 'var(--panel-2)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', padding: '0 12px', fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-2)', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    <span style={{ color: 'var(--text-3)' }}>clickthru.app/play/</span><span style={{ color: 'var(--text)' }}>acme-9f2a</span>
                  </div>
                  <span style={{ height: 42, padding: '0 14px', borderRadius: 10, display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13.5, fontWeight: 600, flex: 'none', background: copied ? 'var(--good-soft)' : 'var(--accent)', color: copied ? 'var(--good)' : 'var(--on-accent)' }}>
                    {copied ? <><svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8.5l3 3 7-8" /></svg>{t.demo.copied}</> : <><svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="5" y="5" width="8" height="8" rx="2" /><path d="M11 5V3.5A1.5 1.5 0 009.5 2H4a2 2 0 00-2 2v5.5A1.5 1.5 0 003.5 11" /></svg>{t.demo.copy}</>}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Scaled>
    </div>
  );
}
