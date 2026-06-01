'use client';

import * as React from 'react';
import { EASE, prefersReduced, Callout, DashScreen, FrameWrapper, Hotspot, type ScreenVariant } from './bits';

type Side = 'below' | 'above' | 'left' | 'right' | 'center';

export type GeoStep = {
  variant: ScreenVariant;
  zoom: number;
  cx: number; // 1280×720 uzayında kamera merkezi
  cy: number;
  type: 'image' | 'video';
  dur: number;
  callout?: { ax: number; ay: number; side: Side };
  hotspot?: [number, number];
};

const SW = 1280;
const SH = 720;

// Geometri (dile bağımsız) — başlık/açıklama i18n'den gelir.
export const HERO_GEO: GeoStep[] = [
  { variant: 'overview', zoom: 1.0, cx: 640, cy: 360, type: 'image', dur: 3000, callout: { ax: 640, ay: 360, side: 'center' } },
  { variant: 'overview', zoom: 1.7, cx: 1010, cy: 200, type: 'image', dur: 3200, callout: { ax: 1024, ay: 158, side: 'left' }, hotspot: [1024, 158] },
  { variant: 'overview', zoom: 1.5, cx: 660, cy: 510, type: 'image', dur: 3400, callout: { ax: 470, ay: 470, side: 'right' } },
  { variant: 'customers', zoom: 1.45, cx: 640, cy: 340, type: 'image', dur: 3200, callout: { ax: 640, ay: 300, side: 'below' } },
  { variant: 'reports', zoom: 1.5, cx: 392, cy: 360, type: 'image', dur: 3400, callout: { ax: 392, ay: 360, side: 'right' }, hotspot: [392, 360] },
  { variant: 'overview', zoom: 1.0, cx: 640, cy: 360, type: 'image', dur: 3000, callout: { ax: 640, ay: 360, side: 'center' } },
];

export const SHOWCASE_GEO: GeoStep[] = [
  { variant: 'overview', zoom: 1.0, cx: 640, cy: 360, type: 'image', dur: 3200, callout: { ax: 640, ay: 360, side: 'center' } },
  { variant: 'overview', zoom: 1.7, cx: 1010, cy: 200, type: 'image', dur: 3200, callout: { ax: 1024, ay: 158, side: 'left' }, hotspot: [1024, 158] },
  { variant: 'overview', zoom: 1.5, cx: 660, cy: 510, type: 'image', dur: 3400, callout: { ax: 470, ay: 470, side: 'right' } },
  { variant: 'customers', zoom: 1.45, cx: 640, cy: 340, type: 'image', dur: 3200, callout: { ax: 640, ay: 300, side: 'below' }, hotspot: [640, 324] },
  { variant: 'reports', zoom: 1.3, cx: 640, cy: 360, type: 'video', dur: 4400, callout: { ax: 640, ay: 360, side: 'center' } },
  { variant: 'reports', zoom: 1.5, cx: 392, cy: 360, type: 'image', dur: 3400, callout: { ax: 392, ay: 360, side: 'right' }, hotspot: [392, 360] },
  { variant: 'settings', zoom: 1.0, cx: 640, cy: 360, type: 'image', dur: 3000, callout: { ax: 640, ay: 360, side: 'center' } },
];

function placement(side: Side): { arrow: 'up' | 'down' | 'left' | 'right' | 'none'; transform: string } {
  switch (side) {
    case 'below': return { arrow: 'up', transform: 'translate(-50%, 12px)' };
    case 'above': return { arrow: 'down', transform: 'translate(-50%, calc(-100% - 12px))' };
    case 'right': return { arrow: 'left', transform: 'translate(16px, -50%)' };
    case 'left': return { arrow: 'right', transform: 'translate(calc(-100% - 16px), -50%)' };
    default: return { arrow: 'none', transform: 'translate(-50%, -50%)' };
  }
}

function LiveProgress({ geo, idx, prog }: { geo: GeoStep[]; idx: number; prog: number }) {
  return (
    <div style={{ display: 'flex', gap: 5, flex: 1, alignItems: 'center' }}>
      {geo.map((s, i) => {
        const fill = i < idx ? 1 : i === idx ? prog : 0;
        return (
          <div key={i} style={{ flex: s.type === 'video' ? 1.7 : 1, height: 4, borderRadius: 3, background: 'rgba(255,255,255,.2)', overflow: 'hidden', position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, width: `${fill * 100}%`, background: '#fff', borderRadius: 3 }} />
          </div>
        );
      })}
    </div>
  );
}

export function LivePlayer({
  geo,
  copy,
  auto = true,
  startPlaying,
  tag,
}: {
  geo: GeoStep[];
  copy: { title: string; body?: string }[];
  auto?: boolean;
  startPlaying?: boolean;
  tag: string;
}) {
  const [idx, setIdx] = React.useState(0);
  const [prog, setProg] = React.useState(0);
  const [playing, setPlaying] = React.useState(startPlaying != null ? startPlaying : auto && !prefersReduced());
  const progRef = React.useRef(0);
  progRef.current = prog;
  const step = geo[idx];

  React.useEffect(() => {
    if (!playing) return;
    let raf = 0;
    const start = performance.now() - progRef.current * step.dur;
    const tick = (t: number) => {
      const p = (t - start) / step.dur;
      if (p >= 1) {
        setProg(0);
        setIdx((i) => (i + 1) % geo.length);
      } else {
        setProg(p);
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, idx]); // eslint-disable-line react-hooks/exhaustive-deps

  const go = (n: number) => {
    setProg(0);
    setIdx((n + geo.length) % geo.length);
  };

  const fx = step.cx / SW;
  const fy = step.cy / SH;
  const z = step.zoom;
  const camTransform = `translate(${(0.5 - fx * z) * 100}%, ${(0.5 - fy * z) * 100}%) scale(${z})`;
  const glide = prefersReduced() ? 'none' : `transform .9s ${EASE}`;
  const overlayGlide = prefersReduced() ? 'none' : `left .9s ${EASE}, top .9s ${EASE}`;
  const co = step.callout;
  const cstr = copy[idx] ?? { title: '' };
  const pl = co ? placement(co.side) : null;

  const proj = (x: number, y: number) => ({
    left: `${(0.5 + (x / SW - fx) * z) * 100}%`,
    top: `${(0.5 + (y / SH - fy) * z) * 100}%`,
  });

  return (
    <div className="ct-stage" style={{ padding: 'clamp(18px,3.5%,36px)', paddingBottom: 'clamp(74px,11%,92px)' }}>
      <div className="ct-stage__tag">
        <span className="ct-livepulse" />
        {tag}
      </div>

      <FrameWrapper variant="browser">
        <div style={{ position: 'relative', aspectRatio: `${SW} / ${SH}`, overflow: 'hidden', background: '#fff' }}>
          <div style={{ position: 'absolute', inset: 0, transformOrigin: '0 0', transform: camTransform, transition: glide }}>
            <div key={step.variant} className="ct-fadein" style={{ width: '100%', height: '100%' }}>
              <img
                // eslint-disable-next-line @next/next/no-img-element
                src={`/samples/dashboard-${{ overview: 1, reports: 2, customers: 3, settings: 4 }[step.variant]}.svg`}
                alt=""
                draggable={false}
                style={{ display: 'block', width: '100%', height: '100%' }}
              />
            </div>
          </div>

          {co && (
            <div style={{ position: 'absolute', zIndex: 5, transition: overlayGlide, transform: pl!.transform, ...proj(co.ax, co.ay) }}>
              <Callout title={cstr.title} body={cstr.body} arrow={pl!.arrow} w={248} />
            </div>
          )}
          {step.hotspot && (
            <div style={{ position: 'absolute', zIndex: 4, transform: 'translate(-50%,-50%)', transition: overlayGlide, ...proj(step.hotspot[0], step.hotspot[1]) }}>
              <Hotspot size={24} />
            </div>
          )}
          {step.type === 'video' && (
            <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 6, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(12,14,20,.7)', color: '#fff', fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 600, padding: '5px 9px', borderRadius: 7 }}>
              <svg width="9" height="9" viewBox="0 0 10 10" fill="#fff"><path d="M2 1.5v7l6-3.5z" /></svg>
              VIDEO
            </div>
          )}
        </div>
      </FrameWrapper>

      <div className="ct-dock">
        <button className="ct-dockbtn" aria-label="Önceki" onClick={() => go(idx - 1)}>
          <svg width="14" height="14" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 3l-4 4.5 4 4.5" /></svg>
        </button>
        <button className="ct-dockbtn ct-dockbtn--accent" aria-label={playing ? 'Duraklat' : 'Oynat'} onClick={() => setPlaying((p) => !p)}>
          {playing ? (
            <svg width="13" height="13" viewBox="0 0 13 13" fill="#fff"><rect x="2.5" y="2" width="3" height="9" rx="1" /><rect x="7.5" y="2" width="3" height="9" rx="1" /></svg>
          ) : (
            <svg width="13" height="13" viewBox="0 0 13 13" fill="#fff"><path d="M3 2.2v8.6c0 .5.5.7.9.5l6.4-4.3a.6.6 0 000-1L3.9 1.7c-.4-.2-.9 0-.9.5z" /></svg>
          )}
        </button>
        <LiveProgress geo={geo} idx={idx} prog={prog} />
        <span style={{ font: '600 12px var(--mono)', color: 'rgba(255,255,255,.72)', flex: 'none' }}>
          {idx + 1} / {geo.length}
        </span>
        <button className="ct-dockbtn" aria-label="Sonraki" onClick={() => go(idx + 1)}>
          <svg width="14" height="14" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M5.5 3l4 4.5-4 4.5" /></svg>
        </button>
      </div>
    </div>
  );
}
