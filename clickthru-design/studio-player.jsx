/* studio-player.jsx — preview player (real playback feel) + share screen */

function PlayerProgress({ steps, current = 2, sub = 0.45 }) {
  return (
    <div style={{ display: 'flex', gap: 5, flex: 1 }}>
      {steps.map((s, i) => {
        const fill = i < current ? 1 : i === current ? sub : 0;
        return (
          <div key={i} style={{ flex: s.type === 'video' ? 1.6 : 1, height: 4, borderRadius: 3, background: 'rgba(255,255,255,.22)', overflow: 'hidden', position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, width: `${fill * 100}%`, background: '#fff', borderRadius: 3 }} />
            {s.type === 'video' && i === current && (
              <div style={{ position: 'absolute', right: 4, top: -18, font: '600 9px var(--mono)', color: 'rgba(255,255,255,.7)' }}>0:04 / 0:09</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Player({ steps }) {
  return (
    <div style={{ width: '100%', height: '100%', background: 'radial-gradient(120% 90% at 50% 0%, oklch(0.2 0.02 264), oklch(0.11 0.01 264))', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', fontFamily: "'Hanken Grotesk', sans-serif" }}>
      {/* close */}
      <button className="btn" style={{ position: 'absolute', top: 20, right: 20, color: 'rgba(255,255,255,.8)', background: 'rgba(255,255,255,.08)', width: 38, height: 38, padding: 0, justifyContent: 'center', zIndex: 6 }}>
        <svg width="16" height="16" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 4l8 8M12 4l-8 8" /></svg>
      </button>
      <div style={{ position: 'absolute', top: 24, left: 24, display: 'flex', alignItems: 'center', gap: 9, color: '#fff', zIndex: 6 }}>
        <div style={{ width: 22, height: 22, borderRadius: 7, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="12" height="12" viewBox="0 0 15 15" fill="none"><path d="M2 2.5L11.5 7.5L7 8.2L9.2 12L7.4 12.9L5.2 9.1L2 11.5z" fill="#fff" /></svg></div>
        <span style={{ fontSize: 13.5, fontWeight: 600, opacity: .85 }}>Halo product tour</span>
      </div>

      {/* staged shot with camera focus (zoomed) + live callout */}
      <div style={{ position: 'relative', width: 940, transform: 'translateY(-8px)' }}>
        <div style={{ borderRadius: 14, overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,.55)', border: '1px solid rgba(255,255,255,.08)', position: 'relative' }}>
          {/* zoom: scale shot toward upper-mid */}
          <div style={{ width: 940, height: 595, overflow: 'hidden', position: 'relative', background: '#fff' }}>
            <div style={{ width: 1200, height: 760, transform: 'scale(1.04) translate(-120px,-70px)', transformOrigin: 'top left' }}>
              <DemoScreen variant="overview" nav={1} />
            </div>
          </div>
          {/* callout pointing at the chart */}
          <div style={{ position: 'absolute', left: 470, top: 250 }}>
            <Callout title="Watch trends in real time" body="Switch ranges to see how revenue moves across the last 7, 30 or 90 days." arrow="left" back next w={260} />
          </div>
          {/* hotspot */}
          <div style={{ position: 'absolute', left: 360, top: 132 }}><Hotspot size={28} /></div>
        </div>
      </div>

      {/* control dock */}
      <div style={{ position: 'absolute', bottom: 26, left: '50%', transform: 'translateX(-50%)', width: 760, background: 'rgba(18,20,28,.72)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 16, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 16px 50px rgba(0,0,0,.5)' }}>
        <button style={{ width: 34, height: 34, borderRadius: 9, border: 'none', background: 'rgba(255,255,255,.1)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 3l-4 4.5 4 4.5" /></svg>
        </button>
        <PlayerProgress steps={steps} current={2} sub={0.45} />
        <span style={{ font: '600 12px var(--mono)', color: 'rgba(255,255,255,.7)' }}>3 / {steps.length}</span>
        <button style={{ width: 34, height: 34, borderRadius: 9, border: 'none', background: 'var(--accent)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5.5 3l4 4.5-4 4.5" /></svg>
        </button>
      </div>
    </div>
  );
}

/* ---------- SHARE ---------- */
function ShareScreen({ copied = false }) {
  return (
    <div style={{ width: '100%', height: '100%', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Hanken Grotesk', sans-serif", position: 'relative' }}>
      {/* subtle dimmed editor behind */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(8,10,16,.32)', backdropFilter: 'blur(2px)' }} />
      <div style={{ position: 'relative', width: 460, background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 20, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
        {/* preview band */}
        <div style={{ height: 150, background: 'radial-gradient(120% 120% at 50% 0%, oklch(0.55 0.16 256 / .28), transparent), var(--pit)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid var(--line)' }}>
          <div style={{ width: 220, borderRadius: 9, overflow: 'hidden', boxShadow: '0 14px 36px rgba(0,0,0,.4)', border: '1px solid rgba(255,255,255,.1)', transform: 'translateY(14px)' }}>
            <MiniShot variant="overview" nav={1} w={220} />
          </div>
        </div>
        <div style={{ padding: '26px 26px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--good-soft)', color: 'var(--good)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 7.5l3 3 6-7" /></svg>
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>Your demo is ready</div>
          </div>
          <div style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.5, marginBottom: 20 }}>Anyone with the link can play the interactive tour. No sign-in required.</div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            <div className="inp t-mono" style={{ display: 'flex', alignItems: 'center', color: 'var(--text-2)', overflow: 'hidden', whiteSpace: 'nowrap', fontSize: 12.5 }}>
              <span style={{ color: 'var(--text-3)' }}>clickthru.app/d/</span><span style={{ color: 'var(--text)' }}>halo-tour-9f2a</span>
            </div>
            <button className={`btn ${copied ? '' : 'btn--primary'}`} style={copied ? { background: 'var(--good-soft)', color: 'var(--good)', flex: 'none' } : { flex: 'none' }}>
              {copied
                ? <><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8.5l3 3 7-8" /></svg>Copied</>
                : <><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="5" y="5" width="8" height="8" rx="2" /><path d="M11 5V3.5A1.5 1.5 0 009.5 2H4a2 2 0 00-2 2v5.5A1.5 1.5 0 003.5 11" /></svg>Copy</>}
            </button>
          </div>
          <button className="btn btn--ghost" style={{ width: '100%', justifyContent: 'center' }}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3h4v4M13 3L7 9M11 9.5V12a1.5 1.5 0 01-1.5 1.5h-6A1.5 1.5 0 012 12V6a1.5 1.5 0 011.5-1.5H6" /></svg>
            Open in new tab
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Player, PlayerProgress, ShareScreen });
