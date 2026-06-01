/* studio-elements.jsx — the four canvas elements + three frame wrappers.
   All positioned/sized by parent; these render appearance + selection state. */

function SelHandles({ mids = true }) {
  return (
    <>
      <div className="sel-box" />
      {['tl', 'tr', 'bl', 'br'].map((p) => <div key={p} className={`sel-h ${p}`} />)}
      {mids && ['tm', 'bm', 'lm', 'rm'].map((p) => <div key={p} className={`sel-h ${p}`} />)}
    </>
  );
}

/* ---------- 1. HOTSPOT ---------- */
function Hotspot({ size = 30, color = 'oklch(0.66 0.18 256)', selected = false }) {
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: color, animation: 'ct-pulse 2s ease-out infinite' }} />
      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: color, animation: 'ct-pulse2 2s ease-out infinite .3s' }} />
      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: color, boxShadow: `0 0 0 ${size * 0.13}px color-mix(in oklch, ${color} 28%, transparent), 0 2px 8px rgba(0,0,0,.3)` }} />
      <div style={{ position: 'absolute', inset: '32%', borderRadius: '50%', background: 'rgba(255,255,255,.92)' }} />
      {selected && <SelHandles />}
    </div>
  );
}

/* ---------- 2. CALLOUT ---------- */
function Callout({
  title = 'Track every metric', body = 'Your live revenue, retention and churn — all on one canvas.',
  arrow = 'left', back = true, next = true, w = 280, radius = 16, border = true,
  bg, borderColor, dark = false, selected = false,
}) {
  const cardBg = bg || (dark ? 'oklch(0.22 0.01 264)' : '#ffffff');
  const fg = dark ? '#fff' : 'oklch(0.24 0.012 264)';
  const fg2 = dark ? 'rgba(255,255,255,.66)' : 'oklch(0.47 0.01 264)';
  const bc = borderColor || (dark ? 'rgba(255,255,255,.12)' : 'oklch(0.9 0.005 264)');
  const acc = 'oklch(0.6 0.19 256)';

  const tri = 11;
  const arrowStyle = {
    up:    { top: -tri, left: '50%', transform: 'translateX(-50%)', borderWidth: `0 ${tri}px ${tri}px ${tri}px`, borderColor: `transparent transparent ${cardBg} transparent` },
    down:  { bottom: -tri, left: '50%', transform: 'translateX(-50%)', borderWidth: `${tri}px ${tri}px 0 ${tri}px`, borderColor: `${cardBg} transparent transparent transparent` },
    left:  { left: -tri, top: '50%', transform: 'translateY(-50%)', borderWidth: `${tri}px ${tri}px ${tri}px 0`, borderColor: `transparent ${cardBg} transparent transparent` },
    right: { right: -tri, top: '50%', transform: 'translateY(-50%)', borderWidth: `${tri}px 0 ${tri}px ${tri}px`, borderColor: `transparent transparent transparent ${cardBg}` },
  };

  return (
    <div style={{ position: 'relative', width: w }}>
      <div style={{ position: 'relative', background: cardBg, borderRadius: radius, border: border ? `1px solid ${bc}` : 'none',
        boxShadow: dark ? '0 10px 30px rgba(0,0,0,.4)' : '0 10px 34px rgba(20,22,28,.16), 0 2px 6px rgba(20,22,28,.08)', padding: '16px 18px' }}>
        {arrow !== 'none' && (
          <div style={{ position: 'absolute', width: 0, height: 0, borderStyle: 'solid', filter: 'drop-shadow(0 0 0 transparent)', ...arrowStyle[arrow] }} />
        )}
        <div style={{ fontSize: 15.5, fontWeight: 700, color: fg, letterSpacing: '-0.01em', lineHeight: 1.25 }}>{title}</div>
        <div style={{ fontSize: 13, color: fg2, lineHeight: 1.5, marginTop: 6, textWrap: 'pretty' }}>{body}</div>
        {(back || next) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14 }}>
            {back && (
              <button style={{ fontFamily: 'inherit', fontSize: 12.5, fontWeight: 600, color: fg2, background: 'transparent', border: `1px solid ${bc}`, borderRadius: 8, padding: '7px 12px', cursor: 'pointer' }}>Back</button>
            )}
            <div style={{ flex: 1 }} />
            {next && (
              <button style={{ fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700, color: '#fff', background: acc, border: 'none', borderRadius: 8, padding: '7px 14px', cursor: 'pointer' }}>Next →</button>
            )}
          </div>
        )}
      </div>
      {selected && <SelHandles />}
    </div>
  );
}

/* ---------- 3. TEXT LABEL ---------- */
function TextLabel({ text = 'Start here', size = 'M', color = 'oklch(0.24 0.012 264)', box = false, boxBg = '#ffffff', radius = 8, selected = false }) {
  const fs = { S: 14, M: 19, L: 27 }[size] || 19;
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div style={{
        fontFamily: "'Hanken Grotesk', sans-serif", fontSize: fs, fontWeight: 700, color, letterSpacing: '-0.02em', lineHeight: 1.2, whiteSpace: 'nowrap',
        padding: box ? `${fs * 0.4}px ${fs * 0.65}px` : 0, background: box ? boxBg : 'transparent', borderRadius: box ? radius : 0,
        boxShadow: box ? '0 4px 16px rgba(20,22,28,.14)' : 'none',
      }}>{text}</div>
      {selected && <SelHandles mids={box} />}
    </div>
  );
}

/* ---------- 4. FOCUS REGION ---------- */
function FocusRegion({ w = 360, h = 240, ratio = '1.8×', selected = true, dim = true }) {
  return (
    <div style={{ position: 'relative', width: w, height: h }}>
      {/* dim everything outside via huge spread shadow */}
      {dim && <div style={{ position: 'absolute', inset: 0, borderRadius: 8, boxShadow: '0 0 0 9999px rgba(10,12,20,.46)' }} />}
      <div style={{ position: 'absolute', inset: 0, borderRadius: 8, border: '2px dashed oklch(0.72 0.16 256)', background: 'transparent' }} />
      {/* corner brackets */}
      {[['tl', 'left:-2px;top:-2px;border-right:none;border-bottom:none'], ['tr', 'right:-2px;top:-2px;border-left:none;border-bottom:none'],
        ['bl', 'left:-2px;bottom:-2px;border-right:none;border-top:none'], ['br', 'right:-2px;bottom:-2px;border-left:none;border-top:none']].map(([k, css]) => (
        <div key={k} style={Object.assign({ position: 'absolute', width: 18, height: 18, border: '3px solid oklch(0.72 0.16 256)', borderRadius: 3 },
          ...css.split(';').map((d) => { const [p, v] = d.split(':'); return { [p.replace(/-([a-z])/g, (_, c) => c.toUpperCase())]: v }; }))} />
      ))}
      {selected && ['tl', 'tr', 'bl', 'br', 'tm', 'bm', 'lm', 'rm'].map((p) => <div key={p} className={`sel-h ${p}`} style={{ borderColor: 'oklch(0.72 0.16 256)' }} />)}
      {/* ratio label */}
      <div style={{ position: 'absolute', top: -30, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 6,
        background: 'oklch(0.72 0.16 256)', color: '#fff', fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, fontWeight: 600, padding: '4px 9px', borderRadius: 6, whiteSpace: 'nowrap' }}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="5" cy="5" r="3.2" /><path d="M7.5 7.5L10.5 10.5" strokeLinecap="round" /></svg>
        Zoom {ratio}
      </div>
    </div>
  );
}

/* ---------- WRAPPERS ---------- */
function FrameWrapper({ variant = 'browser', children, url = 'app.halo.io/overview', radius = 12 }) {
  if (variant === 'none') {
    return <div style={{ borderRadius: radius, overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,.2)' }}>{children}</div>;
  }
  if (variant === 'dark') {
    return (
      <div style={{ background: 'oklch(0.18 0.008 264)', borderRadius: radius + 6, padding: 10, boxShadow: '0 24px 60px rgba(0,0,0,.4)' }}>
        <div style={{ borderRadius: radius, overflow: 'hidden' }}>{children}</div>
      </div>
    );
  }
  // browser
  return (
    <div style={{ background: '#ffffff', borderRadius: radius, overflow: 'hidden', boxShadow: '0 24px 60px rgba(20,22,28,.22), 0 2px 8px rgba(20,22,28,.1)', border: '1px solid oklch(0.88 0.005 264)' }}>
      <div style={{ height: 42, background: 'oklch(0.965 0.003 264)', borderBottom: '1px solid oklch(0.9 0.005 264)', display: 'flex', alignItems: 'center', padding: '0 14px', gap: 8 }}>
        <div style={{ display: 'flex', gap: 7 }}>
          {['#ff5f57', '#febc2e', '#28c840'].map((c) => <div key={c} style={{ width: 11, height: 11, borderRadius: '50%', background: c }} />)}
        </div>
        <div style={{ flex: 1, maxWidth: 360, margin: '0 auto', height: 26, borderRadius: 7, background: '#fff', border: '1px solid oklch(0.9 0.005 264)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: 'oklch(0.55 0.01 264)', fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="2.5" y="4.5" width="5" height="4" rx="1" /><path d="M3.5 4.5V3.5a1.5 1.5 0 013 0v1" /></svg>
          {url}
        </div>
        <div style={{ width: 44 }} />
      </div>
      <div>{children}</div>
    </div>
  );
}

Object.assign(window, { Hotspot, Callout, TextLabel, FocusRegion, FrameWrapper, SelHandles });
