/* landing-mini.jsx — small looping demos for "how it works" + feature
   modules. Reuses real Studio components (StudioScreen, ShareScreen,
   FrameWrapper, DemoScreen, MiniShot, FocusRegion, Callout, Hotspot). */

function useInView(threshold = 0.2) {
  const ref = React.useRef(null);
  const [v, setV] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => setV(e.isIntersecting), { threshold });
    io.observe(el); return () => io.disconnect();
  }, []);
  return [ref, v];
}

// variable-duration looping step machine. reduced motion → rest frame.
function useSteps(durs, inView = true, rest = 0) {
  const [i, setI] = React.useState(0);
  React.useEffect(() => {
    if (!inView || reducedMotion) return;
    const id = setTimeout(() => setI((p) => (p + 1) % durs.length), durs[i]);
    return () => clearTimeout(id);
  }, [i, inView]);
  return reducedMotion ? rest : i;
}

function camStyle(clipW, clipH, zoom, cx, cy) {
  const base = clipW / 1200, eff = base * zoom;
  const tx = clipW / 2 - eff * cx, ty = clipH / 2 - eff * cy;
  return { transform: `translate(${tx}px,${ty}px) scale(${eff})`, transformOrigin: 'top left' };
}

/* ============================================================
   1. CAPTURE — extension countdown overlay (How-it-works 01 + Module A)
   ============================================================ */
function CaptureDemo() {
  const [ref, inView] = useInView();
  // phases: 0-4 countdown 5..1, 5 recording+cursor, 6 click flash + badge
  const i = useSteps([620, 620, 620, 620, 620, 1100, 1000], inView, 5);
  const counting = i <= 4;
  const num = 5 - i;
  const flash = i === 6;
  const recording = i >= 5;
  return (
    <div ref={ref}>
      <Scaled w={560} h={350}>
        <div style={{ width: 560, height: 350, position: 'relative', borderRadius: 14, overflow: 'hidden', background: '#fff' }}>
          {/* page being captured */}
          <div style={{ position: 'absolute', inset: 0 }}>
            <div style={{ width: 1200, height: 760, transform: `scale(${560 / 1200})`, transformOrigin: 'top left' }}><DemoScreen variant="overview" nav={1} /></div>
          </div>
          {/* recording-area frame */}
          <div style={{ position: 'absolute', inset: 10, border: `2px solid ${recording ? 'oklch(0.66 0.2 24)' : 'rgba(33,66,231,.5)'}`, borderRadius: 10, pointerEvents: 'none', transition: 'border-color .3s' }} />
          {/* REC pill */}
          <div style={{ position: 'absolute', top: 18, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(12,14,20,.86)', color: '#fff', fontSize: 11.5, fontWeight: 600, fontFamily: 'var(--mono)', padding: '6px 12px', borderRadius: 999 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: recording ? 'oklch(0.66 0.2 24)' : '#9aa0b0' }} />
            {recording ? 'Recording area' : 'Hazırlanıyor'}
          </div>
          {/* dim + countdown */}
          {counting && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(244,245,248,.62)', backdropFilter: 'blur(1px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div key={num} className="ct-fadein" style={{ fontSize: 150, fontWeight: 300, color: '#1a1c24', fontFamily: 'var(--font)', letterSpacing: '-0.04em', lineHeight: 1 }}>{num}</div>
            </div>
          )}
          {/* cursor + click flash */}
          {recording && (
            <div style={{ position: 'absolute', left: i === 6 ? 360 : 300, top: i === 6 ? 150 : 200, transition: 'left .5s cubic-bezier(.22,.61,.36,1), top .5s cubic-bezier(.22,.61,.36,1)' }}>
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><path d="M5 3l14 8-6 1.4 3 6.2-2.6 1.2-3-6.2L5 18z" fill="#fff" stroke="#1a1c24" strokeWidth="1.4" strokeLinejoin="round" /></svg>
            </div>
          )}
          {flash && <div className="ct-fadein" style={{ position: 'absolute', inset: 10, borderRadius: 10, background: 'rgba(255,255,255,.55)' }} />}
          {/* step-added badge */}
          {flash && (
            <div className="ct-fadein" style={{ position: 'absolute', right: 16, bottom: 16, display: 'flex', alignItems: 'center', gap: 8, background: 'var(--accent)', color: '#fff', fontSize: 13, fontWeight: 600, padding: '9px 13px', borderRadius: 10, boxShadow: '0 8px 24px rgba(33,66,231,.4)' }}>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7.5l3 3 6-7" /></svg>
              Adım eklendi
            </div>
          )}
          {/* stop control */}
          <div style={{ position: 'absolute', left: '50%', bottom: 16, transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(12,14,20,.86)', padding: '7px 8px 7px 13px', borderRadius: 999 }}>
            <span style={{ color: '#fff', fontSize: 12.5, fontWeight: 600 }}>Kaydı durdur</span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'rgba(255,255,255,.6)', border: '1px solid rgba(255,255,255,.25)', borderRadius: 5, padding: '2px 6px' }}>Ctrl+Y</span>
          </div>
        </div>
      </Scaled>
    </div>
  );
}

/* ============================================================
   2. CAMERA — focus rect → zoom → pan → crossfade (Module B)
   ============================================================ */
const CAM_FRAMES = [
  { zoom: 1.0, cx: 600, cy: 380, variant: 'overview', focus: true },
  { zoom: 1.7, cx: 700, cy: 150, variant: 'overview' },
  { zoom: 1.58, cx: 700, cy: 360, variant: 'overview' },
  { zoom: 1.0, cx: 600, cy: 380, variant: 'reports' },
];
function CameraDemo() {
  const [ref, inView] = useInView();
  const i = useSteps([1600, 1950, 1950, 1500], inView, 1);
  const f = CAM_FRAMES[i];
  const CW = 560, CH = Math.round(560 * 760 / 1200);
  return (
    <div ref={ref}>
      <Scaled w={560} h={CH}>
        <div style={{ width: CW, height: CH, position: 'relative', borderRadius: 14, overflow: 'hidden', background: '#fff', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.06)' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: 1200, height: 760, transition: `transform 1.1s ${EASE}`, ...camStyle(CW, CH, f.zoom, f.cx, f.cy) }}>
            <div key={f.variant} className="ct-fadein" style={{ width: 1200, height: 760 }}><DemoScreen variant={f.variant} nav={1} /></div>
          </div>
          {/* focus region appears at frame 0 */}
          {f.focus && (
            <div className="ct-fadein" style={{ position: 'absolute', left: CW * (242 / 1200), top: CH * (84 / 760), width: CW * (700 / 1200), height: CH * (140 / 760) }}>
              <div style={{ position: 'absolute', inset: 0, border: '2px dashed oklch(0.72 0.16 256)', borderRadius: 7 }} />
              {['tl', 'tr', 'bl', 'br'].map((p) => {
                const pos = { tl: { left: -3, top: -3 }, tr: { right: -3, top: -3 }, bl: { left: -3, bottom: -3 }, br: { right: -3, bottom: -3 } }[p];
                return <div key={p} style={{ position: 'absolute', width: 12, height: 12, border: '3px solid oklch(0.72 0.16 256)', borderRadius: 3, ...pos }} />;
              })}
            </div>
          )}
          {/* zoom counter */}
          <div style={{ position: 'absolute', left: 12, bottom: 12, display: 'flex', alignItems: 'center', gap: 6, background: 'oklch(0.6 0.19 256)', color: '#fff', fontFamily: 'var(--mono)', fontSize: 11.5, fontWeight: 600, padding: '5px 10px', borderRadius: 7 }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="5" cy="5" r="3.2" /><path d="M7.5 7.5L10.5 10.5" strokeLinecap="round" /></svg>
            scale {f.zoom.toFixed(1)}×
          </div>
        </div>
      </Scaled>
    </div>
  );
}

/* ============================================================
   3. STUDIO — context-aware editor loop (How-it-works 02 + Module C)
   ============================================================ */
const STUDIO_DEMO_STEPS = [
  { variant: 'overview', nav: 1, type: 'image', title: 'Track every metric' },
  { variant: 'reports', nav: 1, type: 'image', title: 'Build a report' },
  { variant: 'reports', nav: 2, type: 'video', title: 'Create a segment' },
  { variant: 'share', nav: 4, type: 'image', title: 'Invite your team' },
];
const STUDIO_CYCLE = [
  { sel: 'callout', present: { hotspot: true, callout: true, focus: false } },
  { sel: 'hotspot', present: { hotspot: true, callout: true, focus: false } },
  { sel: 'text', present: { hotspot: true, callout: true, focus: false } },
];
function StudioMiniDemo({ theme = 'dark' }) {
  const [ref, inView] = useInView(0.15);
  const i = useSteps([2200, 2200, 2200], inView, 0);
  const c = STUDIO_CYCLE[i];
  return (
    <div ref={ref} className="ct-demoframe">
      <Scaled w={1440} h={900}>
        <div style={{ width: 1440, height: 900 }}>
          <StudioScreen theme={theme} context={c.sel} selected={c.sel} present={c.present} steps={STUDIO_DEMO_STEPS} />
        </div>
      </Scaled>
    </div>
  );
}

/* ============================================================
   4. MIXED MEDIA — progress bar behaviour (Module D)
   ============================================================ */
const MM_SEGS = [{ t: 'image' }, { t: 'image' }, { t: 'video' }, { t: 'image' }];
function ProgressDemo() {
  const [ref, inView] = useInView();
  // each phase = which segment is current; video phase lingers (fills by time)
  const i = useSteps([1100, 1100, 2600, 1100], inView, 2);
  const [vidProg, setVidProg] = React.useState(0);
  React.useEffect(() => {
    if (i !== 2 || !inView || reducedMotion) { setVidProg(0); return; }
    let raf, start = performance.now();
    const tick = (t) => { const p = Math.min(1, (t - start) / 2500); setVidProg(p); if (p < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, [i, inView]);
  return (
    <div ref={ref}>
      <Scaled w={560} h={300}>
        <div style={{ width: 560, height: 300, borderRadius: 16, background: 'radial-gradient(120% 100% at 50% 0%, oklch(0.22 0.02 264), oklch(0.13 0.01 264))', padding: 26, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 22 }}>
          {/* thumbnails row */}
          <div style={{ display: 'flex', gap: 10 }}>
            {MM_SEGS.map((s, k) => (
              <div key={k} style={{ flex: s.t === 'video' ? 1.7 : 1, height: 96, borderRadius: 9, overflow: 'hidden', border: `1.5px solid ${k === i ? 'var(--accent)' : 'rgba(255,255,255,.12)'}`, position: 'relative', opacity: k <= i ? 1 : 0.45, transition: 'opacity .3s, border-color .3s' }}>
                <div style={{ width: 1200, height: 760, transform: `scale(${(s.t === 'video' ? 150 : 90) / 1200})`, transformOrigin: 'top left' }}>
                  <DemoScreen variant={['overview', 'overview', 'reports', 'share'][k]} nav={[1, 1, 2, 4][k]} />
                </div>
                {s.t === 'video' && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(12,14,20,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="11" height="11" viewBox="0 0 11 11" fill="#fff"><path d="M3 2v7l5-3.5z" /></svg>
                    </div>
                  </div>
                )}
                <span style={{ position: 'absolute', top: 5, left: 6, font: '600 9px var(--mono)', color: '#fff', background: s.t === 'video' ? 'oklch(0.6 0.19 256)' : 'rgba(12,14,20,.7)', padding: '2px 5px', borderRadius: 4 }}>{s.t === 'video' ? 'VIDEO' : 'IMG'}</span>
              </div>
            ))}
          </div>
          {/* progress bar */}
          <div style={{ display: 'flex', gap: 5 }}>
            {MM_SEGS.map((s, k) => {
              const fill = k < i ? 1 : k === i ? (s.t === 'video' ? vidProg : 1) : 0;
              return (
                <div key={k} style={{ flex: s.t === 'video' ? 1.7 : 1, height: 5, borderRadius: 3, background: 'rgba(255,255,255,.18)', overflow: 'hidden', position: 'relative' }}>
                  <div style={{ position: 'absolute', inset: 0, width: `${fill * 100}%`, background: '#fff', borderRadius: 3, transition: s.t === 'video' ? 'none' : 'width .3s' }} />
                </div>
              );
            })}
          </div>
          <div style={{ font: '500 12px var(--mono)', color: 'rgba(255,255,255,.6)', textAlign: 'center' }}>
            {MM_SEGS[i].t === 'video' ? 'video adımı · süreyle dolar' : 'screenshot adımı · tıkla-ilerle'}
          </div>
        </div>
      </Scaled>
    </div>
  );
}

/* ============================================================
   5. STAGE — wrapper morph + background scenes (Module E)
   ============================================================ */
const STAGE_FRAMES = [
  { wrap: 'browser', bg: 'radial-gradient(120% 100% at 50% 0%, oklch(0.95 0.03 256), oklch(0.9 0.04 256))' },
  { wrap: 'dark', bg: 'radial-gradient(120% 100% at 50% 0%, oklch(0.28 0.02 264), oklch(0.16 0.01 264))' },
  { wrap: 'none', bg: 'radial-gradient(120% 100% at 50% 0%, oklch(0.94 0.05 295), oklch(0.9 0.05 320))' },
];
function StageDemo() {
  const [ref, inView] = useInView();
  const i = useSteps([2000, 2000, 2000], inView, 0);
  const f = STAGE_FRAMES[i];
  const swatches = ['oklch(0.92 0.04 256)', 'oklch(0.2 0.01 264)', 'oklch(0.92 0.05 305)'];
  return (
    <div ref={ref}>
      <Scaled w={560} h={360}>
        <div style={{ width: 560, height: 360, borderRadius: 16, position: 'relative', overflow: 'hidden', background: f.bg, transition: 'background .6s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 1200, transform: `scale(${440 / 1200})`, transformOrigin: 'center' }}>
            <div key={f.wrap} className="ct-fadein"><FrameWrapper variant={f.wrap}><DemoScreen variant="overview" nav={1} /></FrameWrapper></div>
          </div>
          {/* swatch dock */}
          <div style={{ position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 9, background: 'rgba(12,14,20,.5)', padding: 8, borderRadius: 999, backdropFilter: 'blur(6px)' }}>
            {swatches.map((c, k) => (
              <div key={k} style={{ width: 22, height: 22, borderRadius: 7, background: c, border: '1px solid rgba(255,255,255,.3)', boxShadow: k === i ? '0 0 0 2px rgba(12,14,20,.5), 0 0 0 4px #fff' : 'none' }} />
            ))}
          </div>
          <div style={{ position: 'absolute', top: 12, left: 14, font: '600 11px var(--mono)', color: f.wrap === 'dark' || i === 1 ? 'rgba(255,255,255,.85)' : 'oklch(0.4 0.02 264)' }}>
            {['Browser çerçeve', 'Koyu çerçeve', 'Çerçevesiz'][i]}
          </div>
        </div>
      </Scaled>
    </div>
  );
}

/* ============================================================
   6. SHARE — share button → saving → link modal → copied (Module F + HIW 03)
   ============================================================ */
function ShareDemo() {
  const [ref, inView] = useInView();
  const i = useSteps([1200, 1100, 1800, 1800], inView, 3); // 0 btn,1 saving,2 modal,3 copied
  return (
    <div ref={ref}>
      <Scaled w={560} h={400}>
        <div style={{ width: 560, height: 400, borderRadius: 16, position: 'relative', overflow: 'hidden', background: 'var(--pit)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {i <= 1 ? (
            <button className="btn btn--primary" style={{ height: 44, fontSize: 15, padding: '0 22px', pointerEvents: 'none' }}>
              {i === 1
                ? <><span className="spin" /> Kaydediliyor…</>
                : <><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="4" r="2" /><circle cx="4" cy="8" r="2" /><circle cx="12" cy="12" r="2" /><path d="M5.7 7l4.6-2M5.7 9l4.6 2" /></svg> Paylaş</>}
            </button>
          ) : (
            <div key="modal" className="ct-fadein" style={{ width: 460, transform: 'scale(.86)' }}>
              <ShareScreenTR copied={i === 3} />
            </div>
          )}
        </div>
      </Scaled>
    </div>
  );
}

/* Turkish copy variant of the share modal (mirrors studio-player ShareScreen) */
function ShareScreenTR({ copied = false }) {
  return (
    <div style={{ width: 460, background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 20, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
      <div style={{ height: 140, background: 'radial-gradient(120% 120% at 50% 0%, oklch(0.55 0.16 256 / .28), transparent), var(--pit)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid var(--line)' }}>
        <div style={{ width: 220, borderRadius: 9, overflow: 'hidden', boxShadow: '0 14px 36px rgba(0,0,0,.4)', border: '1px solid rgba(255,255,255,.1)', transform: 'translateY(12px)' }}>
          <MiniShot variant="overview" nav={1} w={220} />
        </div>
      </div>
      <div style={{ padding: '24px 26px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--good-soft)', color: 'var(--good)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 7.5l3 3 6-7" /></svg>
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>Demon hazır</div>
        </div>
        <div style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.5, marginBottom: 18 }}>Linke sahip herkes interaktif turu oynatabilir. Giriş gerekmez.</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="inp t-mono" style={{ display: 'flex', alignItems: 'center', color: 'var(--text-2)', overflow: 'hidden', whiteSpace: 'nowrap', fontSize: 12.5 }}>
            <span style={{ color: 'var(--text-3)' }}>clickthru.app/play/</span><span style={{ color: 'var(--text)' }}>acme-9f2a</span>
          </div>
          <button className={`btn ${copied ? '' : 'btn--primary'}`} style={copied ? { background: 'var(--good-soft)', color: 'var(--good)', flex: 'none' } : { flex: 'none' }}>
            {copied
              ? <><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8.5l3 3 7-8" /></svg>Kopyalandı</>
              : <><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="5" y="5" width="8" height="8" rx="2" /><path d="M11 5V3.5A1.5 1.5 0 009.5 2H4a2 2 0 00-2 2v5.5A1.5 1.5 0 003.5 11" /></svg>Kopyala</>}
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { useInView, useSteps, CaptureDemo, CameraDemo, StudioMiniDemo, ProgressDemo, StageDemo, ShareDemo, ShareScreenTR });
