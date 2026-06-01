/* landing-anim.jsx — shared motion helpers + the LIVE auto-playing player.
   Reuses DemoScreen / Callout / Hotspot from the Studio system.
   The player drives a real camera transform (zoom + pan) with the same
   cubic-bezier(.22,.61,.36,1) easing used in the product. */

const EASE = 'cubic-bezier(.22,.61,.36,1)';
const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- scroll reveal ---------- */
function Reveal({ children, className = '', tag = 'div', delay = 0, style, ...rest }) {
  const ref = React.useRef(null);
  const [seen, setSeen] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });
    io.observe(el); return () => io.disconnect();
  }, []);
  const Tag = tag;
  return (
    <Tag ref={ref} className={`reveal ${delay ? 'd' + delay : ''} ${seen ? 'in' : ''} ${className}`} style={style} {...rest}>
      {children}
    </Tag>
  );
}

/* ---------- fit a fixed-size block into its container width ---------- */
function Scaled({ w, h, max = 1, children }) {
  const ref = React.useRef(null);
  const [scale, setScale] = React.useState(0.4);
  React.useLayoutEffect(() => {
    const el = ref.current; if (!el) return;
    const fit = () => setScale(Math.min(max, el.clientWidth / w));
    fit();
    const ro = new ResizeObserver(fit); ro.observe(el);
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

/* =================================================================
   LIVE PLAYER
   ================================================================= */
const PL_W = 1000, PL_H = 716;          // theatre internal size
const FR_X = 40, FR_Y = 44, FR_W = 920; // browser frame
const CHROME = 34;
const CLIP_W = FR_W, CLIP_H = Math.round(FR_W * 760 / 1200); // 583
const CLIP_X = FR_X, CLIP_Y = FR_Y + CHROME;
const BASE = CLIP_W / 1200;

function project(step, sx, sy) {
  const eff = BASE * step.zoom;
  const tx = CLIP_W / 2 - eff * step.cx;
  const ty = CLIP_H / 2 - eff * step.cy;
  return [eff * sx + tx, eff * sy + ty, eff, tx, ty];
}

function calloutPlacement(side, px, py) {
  switch (side) {
    case 'below': return { arrow: 'up', style: { left: px, top: py + 12, transform: 'translateX(-50%)' } };
    case 'above': return { arrow: 'down', style: { left: px, top: py - 12, transform: 'translate(-50%,-100%)' } };
    case 'right': return { arrow: 'left', style: { left: px + 16, top: py, transform: 'translateY(-50%)' } };
    case 'left':  return { arrow: 'right', style: { left: px - 16, top: py, transform: 'translate(-100%,-50%)' } };
    default:      return { arrow: 'none', style: { left: px, top: py, transform: 'translate(-50%,-50%)' } };
  }
}

function LiveProgress({ steps, idx, prog }) {
  return (
    <div style={{ display: 'flex', gap: 5, flex: 1, alignItems: 'center' }}>
      {steps.map((s, i) => {
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

function LivePlayer({ steps, auto = true, startPlaying }) {
  const [idx, setIdx] = React.useState(0);
  const [prog, setProg] = React.useState(0);
  const [playing, setPlaying] = React.useState(startPlaying != null ? startPlaying : (auto && !reducedMotion));
  const progRef = React.useRef(0);
  progRef.current = prog;
  const step = steps[idx];

  React.useEffect(() => {
    if (!playing) return;
    let raf;
    let start = performance.now() - progRef.current * step.dur;
    const tick = (t) => {
      const p = (t - start) / step.dur;
      if (p >= 1) { setProg(0); setIdx((i) => (i + 1) % steps.length); }
      else { setProg(p); raf = requestAnimationFrame(tick); }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, idx]); // eslint-disable-line

  const go = (n) => { setProg(0); setIdx((n + steps.length) % steps.length); };

  const [, , eff, tx, ty] = project(step, 0, 0);
  const camTransform = `translate(${tx}px,${ty}px) scale(${eff})`;
  const glide = reducedMotion ? 'none' : `transform .9s ${EASE}, left .9s ${EASE}, top .9s ${EASE}`;

  // overlays
  const overlays = [];
  if (step.callout) {
    const [px, py] = project(step, step.callout.anchor[0], step.callout.anchor[1]);
    const pl = calloutPlacement(step.callout.side, px, py);
    overlays.push(
      <div key="co" style={{ position: 'absolute', zIndex: 5, transition: glide, ...pl.style }}>
        <Callout title={step.callout.title} body={step.callout.body} arrow={pl.arrow} back={false} next={false} w={252} />
      </div>
    );
  }
  if (step.hotspot) {
    const [px, py] = project(step, step.hotspot[0], step.hotspot[1]);
    overlays.push(
      <div key="hs" style={{ position: 'absolute', left: px, top: py, transform: 'translate(-50%,-50%)', zIndex: 4, transition: glide }}>
        <Hotspot size={26} />
      </div>
    );
  }

  return (
    <div className="ct-stage" style={{ aspectRatio: `${PL_W} / ${PL_H}` }}>
      <div style={{ position: 'absolute', inset: 0 }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: PL_W, height: PL_H, transform: 'scale(var(--pscale,1))', transformOrigin: 'top left' }} className="ct-plinner">
          {/* tag */}
          <div className="ct-stage__tag"><span className="ct-livepulse" />{auto ? 'otomatik oynatılıyor — sen de böyle paylaşırsın' : 'interaktif önizleme — sen gez'}</div>

          {/* browser frame */}
          <div style={{ position: 'absolute', left: FR_X, top: FR_Y, width: FR_W, borderRadius: 12, overflow: 'hidden', boxShadow: '0 30px 70px rgba(0,0,0,.5)', border: '1px solid rgba(255,255,255,.08)', background: '#fff' }}>
            {/* chrome */}
            <div style={{ height: CHROME, background: '#f4f5f8', borderBottom: '1px solid #e7e9ef', display: 'flex', alignItems: 'center', padding: '0 13px', gap: 7 }}>
              {['#ff5f57', '#febc2e', '#28c840'].map((c) => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
              <div style={{ flex: 1, maxWidth: 300, margin: '0 auto', height: 22, borderRadius: 6, background: '#fff', border: '1px solid #e7e9ef', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#9499ab', fontSize: 11, fontFamily: 'var(--mono)' }}>
                app.halo.io/{step.variant === 'reports' ? 'reports' : step.variant === 'share' ? 'share' : 'overview'}
              </div>
              <div style={{ width: 30 }} />
            </div>
            {/* clip + camera */}
            <div style={{ width: CLIP_W, height: CLIP_H, overflow: 'hidden', position: 'relative', background: '#fff' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: 1200, height: 760, transform: camTransform, transformOrigin: 'top left', transition: glide }}>
                <div key={step.variant} className="ct-fadein" style={{ width: 1200, height: 760 }}>
                  <DemoScreen variant={step.variant} nav={step.nav} />
                </div>
              </div>
              {overlays}
            </div>
          </div>

          {/* control dock */}
          <div style={{ position: 'absolute', left: '50%', bottom: 14, transform: 'translateX(-50%)', width: 760, maxWidth: FR_W - 40, background: 'rgba(16,18,26,.74)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 15, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 16px 44px rgba(0,0,0,.5)', zIndex: 9 }}>
            <button onClick={() => go(idx - 1)} title="Önceki" style={dockBtn}>
              <svg width="14" height="14" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 3l-4 4.5 4 4.5" /></svg>
            </button>
            <button onClick={() => setPlaying((p) => !p)} title={playing ? 'Duraklat' : 'Oynat'} style={{ ...dockBtn, background: 'var(--accent)' }}>
              {playing
                ? <svg width="13" height="13" viewBox="0 0 13 13" fill="#fff"><rect x="2.5" y="2" width="3" height="9" rx="1" /><rect x="7.5" y="2" width="3" height="9" rx="1" /></svg>
                : <svg width="13" height="13" viewBox="0 0 13 13" fill="#fff"><path d="M3 2.2v8.6c0 .5.5.7.9.5l6.4-4.3a.6.6 0 000-1L3.9 1.7c-.4-.2-.9 0-.9.5z" /></svg>}
            </button>
            <LiveProgress steps={steps} idx={idx} prog={prog} />
            <span style={{ font: '600 12px var(--mono)', color: 'rgba(255,255,255,.72)', flex: 'none' }}>{idx + 1} / {steps.length}</span>
            <button onClick={() => go(idx + 1)} title="Sonraki" style={dockBtn}>
              <svg width="14" height="14" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M5.5 3l4 4.5-4 4.5" /></svg>
            </button>
          </div>
        </div>
      </div>
      <PlayerScaler />
    </div>
  );
}

const dockBtn = { width: 32, height: 32, borderRadius: 9, border: 'none', background: 'rgba(255,255,255,.1)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' };

/* keeps the fixed PL_W layer scaled to whatever the stage renders at */
function PlayerScaler() {
  React.useLayoutEffect(() => {
    const els = document.querySelectorAll('.ct-plinner');
    const update = () => els.forEach((inner) => {
      const stage = inner.closest('.ct-stage'); if (!stage) return;
      inner.style.setProperty('--pscale', stage.clientWidth / PL_W);
    });
    update();
    const ro = new ResizeObserver(update);
    document.querySelectorAll('.ct-stage').forEach((s) => ro.observe(s));
    window.addEventListener('resize', update);
    return () => { ro.disconnect(); window.removeEventListener('resize', update); };
  });
  return null;
}

/* ---------- curated demo content ---------- */
const HERO_STEPS = [
  { variant: 'overview', nav: 1, zoom: 1.0, cx: 600, cy: 360, type: 'image', dur: 3000,
    callout: { title: 'Acme Analytics turu', body: 'Ürününü kaydet — her tıklaman bir adıma dönüşür.', anchor: [600, 360], side: 'center' } },
  { variant: 'overview', nav: 1, zoom: 1.62, cx: 700, cy: 150, type: 'image', dur: 3200,
    callout: { title: 'KPI’ları bir bakışta', body: 'Gelir, retention ve churn — hepsi en üstte.', anchor: [470, 152], side: 'below' } },
  { variant: 'overview', nav: 1, zoom: 1.55, cx: 700, cy: 360, type: 'image', dur: 3600,
    callout: { title: 'Trendleri canlı izle', body: '7 / 30 / 90 günü tek tıkla değiştir.', anchor: [470, 332], side: 'right' },
    hotspot: [1086, 330] },
  { variant: 'overview', nav: 1, zoom: 1.5, cx: 700, cy: 600, type: 'image', dur: 3400,
    callout: { title: 'Her hesabın sağlığı', body: 'Gelir ve sağlık skoruna göre sıralı liste.', anchor: [470, 600], side: 'right' } },
  { variant: 'reports', nav: 1, zoom: 1.3, cx: 640, cy: 330, type: 'video', dur: 4200,
    callout: { title: 'Rapor oluştur', body: 'Bir video adımı — kendi süresince oynar.', anchor: [640, 330], side: 'center' } },
  { variant: 'share', nav: 4, zoom: 1.12, cx: 540, cy: 300, type: 'image', dur: 3200,
    callout: { title: 'Ekibinle paylaş', body: 'Tek link, kurulum yok — anında tıklanabilir tur.', anchor: [300, 250], side: 'right' } },
];

const SHOWCASE_STEPS = [
  { variant: 'overview', nav: 1, zoom: 1.0, cx: 600, cy: 360, type: 'image', dur: 3200,
    callout: { title: 'Halo ürün turuna hoş geldin', body: 'İleri / geri gez, zoom’u hisset. Tıpkı izleyicinin göreceği gibi.', anchor: [600, 360], side: 'center' } },
  { variant: 'overview', nav: 1, zoom: 1.7, cx: 360, cy: 152, type: 'image', dur: 3200,
    callout: { title: 'Aylık gelir', body: 'En önemli metrik, en başta.', anchor: [360, 230], side: 'below' } },
  { variant: 'overview', nav: 1, zoom: 1.55, cx: 700, cy: 360, type: 'image', dur: 3600,
    callout: { title: 'Gelir trendi', body: 'Kamera grafiğe yumuşakça yaklaşır.', anchor: [470, 332], side: 'right' },
    hotspot: [1086, 330] },
  { variant: 'overview', nav: 1, zoom: 1.5, cx: 700, cy: 600, type: 'image', dur: 3400,
    callout: { title: 'Hesap tablosu', body: 'Aynı ekranda kamera aşağı kayar — pan.', anchor: [470, 600], side: 'right' } },
  { variant: 'reports', nav: 1, zoom: 1.28, cx: 640, cy: 320, type: 'video', dur: 4400,
    callout: { title: 'Rapor oluştur (video)', body: 'Ekran değişince crossfade; video kendi süresince dolar.', anchor: [640, 320], side: 'center' } },
  { variant: 'reports', nav: 2, zoom: 1.5, cx: 360, cy: 360, type: 'image', dur: 3200,
    callout: { title: 'Segment ekle', body: 'Sol menüden yeni bir segmente geç.', anchor: [110, 360], side: 'right' } },
  { variant: 'share', nav: 4, zoom: 1.1, cx: 540, cy: 300, type: 'image', dur: 3200,
    callout: { title: 'Çalışma alanını paylaş', body: 'Ekibini davet et, herkes aynı turu görsün.', anchor: [300, 250], side: 'right' } },
  { variant: 'share', nav: 4, zoom: 1.0, cx: 600, cy: 360, type: 'image', dur: 3000,
    callout: { title: 'Tur tamam', body: 'Sen de 60 saniyede böyle bir demo oluşturabilirsin.', anchor: [600, 360], side: 'center' } },
];

Object.assign(window, { Reveal, Scaled, LivePlayer, HERO_STEPS, SHOWCASE_STEPS, EASE, reducedMotion });
