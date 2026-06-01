/* demo-content.jsx — fictional product "Halo Analytics" used as the
   screenshot being annotated inside the Studio canvas. Always light,
   self-contained, violet accent so it reads as a captured product shot
   distinct from clickthru's blue chrome. */

const HALO = {
  bg: '#f7f8fb', panel: '#ffffff', ink: '#1a1c24', ink2: '#5b6072',
  ink3: '#9499ab', line: '#e9ebf1', line2: '#dfe2ea',
  acc: 'oklch(0.55 0.21 295)', accSoft: 'oklch(0.55 0.21 295 / 0.12)',
  good: '#2f9e6f', goodSoft: 'rgba(47,158,111,.12)',
  font: "'Hanken Grotesk', system-ui, sans-serif",
  mono: "'JetBrains Mono', monospace",
};

// striped placeholder fill
function striped(c1) {
  return `repeating-linear-gradient(135deg, ${c1} 0 2px, transparent 2px 9px)`;
}

function HaloChart({ h = 150 }) {
  const pts = [22, 30, 26, 44, 38, 56, 50, 70, 62, 82, 76, 96];
  const max = 100, w = 560;
  const step = w / (pts.length - 1);
  const line = pts.map((p, i) => `${i * step},${h - (p / max) * h}`).join(' ');
  const area = `0,${h} ${line} ${w},${h}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height: h, display: 'block' }}>
      <defs>
        <linearGradient id="halog" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={HALO.acc} stopOpacity="0.22" />
          <stop offset="1" stopColor={HALO.acc} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((g) => (
        <line key={g} x1="0" y1={h * g} x2={w} y2={h * g} stroke={HALO.line} strokeWidth="1" />
      ))}
      <polygon points={area} fill="url(#halog)" />
      <polyline points={line} fill="none" stroke={HALO.acc} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={w} cy={h - (pts[pts.length - 1] / max) * h} r="4.5" fill={HALO.acc} stroke="#fff" strokeWidth="2" />
    </svg>
  );
}

function HaloStat({ label, value, delta, up = true }) {
  return (
    <div style={{ flex: 1, background: HALO.panel, border: `1px solid ${HALO.line}`, borderRadius: 14, padding: '16px 18px' }}>
      <div style={{ fontSize: 12.5, color: HALO.ink2, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 700, color: HALO.ink, marginTop: 8, letterSpacing: '-0.02em', fontFamily: HALO.font }}>{value}</div>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 8, fontSize: 12, fontWeight: 600,
        color: up ? HALO.good : '#d6604d', background: up ? HALO.goodSoft : 'rgba(214,96,77,.1)', padding: '3px 7px', borderRadius: 6 }}>
        <span>{up ? '▲' : '▼'}</span>{delta}
      </div>
    </div>
  );
}

// variant: 'overview' | 'reports' | 'share'
function DemoScreen({ variant = 'overview', nav = 1 }) {
  const navItems = ['Home', 'Reports', 'Segments', 'Funnels', 'Integrations'];
  const rows = [
    ['Acme Corp', 'Enterprise', '$48,200', '94%'],
    ['Northwind', 'Growth', '$22,540', '88%'],
    ['Loom Labs', 'Growth', '$19,300', '76%'],
    ['Vela Studio', 'Starter', '$8,120', '63%'],
    ['Brightside', 'Starter', '$6,450', '51%'],
  ];
  return (
    <div className="stage-shot" style={{ width: 1200, height: 760, background: HALO.bg, fontFamily: HALO.font, color: HALO.ink, display: 'flex', overflow: 'hidden' }}>
      {/* sidebar */}
      <div style={{ width: 218, background: HALO.panel, borderRight: `1px solid ${HALO.line}`, padding: '20px 14px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '4px 8px 18px' }}>
          <div style={{ width: 26, height: 26, borderRadius: 8, background: HALO.acc, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 15 }}>H</div>
          <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em' }}>Halo</div>
        </div>
        {navItems.map((n, i) => (
          <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 9,
            background: i === nav ? HALO.accSoft : 'transparent', color: i === nav ? HALO.acc : HALO.ink2, fontWeight: i === nav ? 600 : 500, fontSize: 13.5 }}>
            <div style={{ width: 15, height: 15, borderRadius: 4, background: i === nav ? HALO.acc : HALO.line2 }} />
            {n}
          </div>
        ))}
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 9, padding: '8px', borderTop: `1px solid ${HALO.line}` }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: striped(HALO.line2), border: `1px solid ${HALO.line2}` }} />
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600 }}>Mira Okafor</div>
            <div style={{ fontSize: 11, color: HALO.ink3 }}>Owner</div>
          </div>
        </div>
      </div>

      {/* main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* topbar */}
        <div style={{ height: 60, borderBottom: `1px solid ${HALO.line}`, background: HALO.panel, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>
            {variant === 'reports' ? 'Reports' : variant === 'share' ? 'Share workspace' : 'Overview'}
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ width: 220, height: 36, borderRadius: 9, background: HALO.bg, border: `1px solid ${HALO.line2}`, display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8, color: HALO.ink3, fontSize: 13 }}>
            <div style={{ width: 13, height: 13, borderRadius: '50%', border: `2px solid ${HALO.ink3}` }} />Search…
          </div>
          <div style={{ height: 36, padding: '0 15px', borderRadius: 9, background: HALO.acc, color: '#fff', fontWeight: 600, fontSize: 13.5, display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ fontSize: 17, marginTop: -2 }}>+</span> New report
          </div>
        </div>

        {/* body */}
        <div style={{ flex: 1, padding: 24, overflow: 'hidden' }}>
          {variant === 'share' ? (
            <div style={{ maxWidth: 560 }}>
              <div style={{ fontSize: 14, color: HALO.ink2, marginBottom: 18 }}>Invite teammates to collaborate on dashboards and reports.</div>
              {['arjun@halo.io', 'dana@halo.io', 'wei@halo.io'].map((e, i) => (
                <div key={e} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: HALO.panel, border: `1px solid ${HALO.line}`, borderRadius: 12, marginBottom: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: striped(HALO.line2), border: `1px solid ${HALO.line2}` }} />
                  <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 14 }}>{e}</div><div style={{ fontSize: 12, color: HALO.ink3 }}>{['Can edit', 'Can view', 'Can edit'][i]}</div></div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: HALO.acc }}>Pending</div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', gap: 14, marginBottom: 18 }}>
                <HaloStat label="Monthly revenue" value="$104.6k" delta="12.4%" up />
                <HaloStat label="Active accounts" value="1,284" delta="3.1%" up />
                <HaloStat label="Net retention" value="118%" delta="0.8%" up />
                <HaloStat label="Churn" value="1.9%" delta="0.3%" up={false} />
              </div>
              <div style={{ background: HALO.panel, border: `1px solid ${HALO.line}`, borderRadius: 14, padding: 18, marginBottom: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>Revenue trend</div>
                  <div style={{ flex: 1 }} />
                  <div style={{ display: 'flex', gap: 6 }}>{['7d', '30d', '90d'].map((p, i) => (
                    <div key={p} style={{ fontSize: 12, fontWeight: 600, padding: '5px 10px', borderRadius: 7, background: i === 1 ? HALO.accSoft : 'transparent', color: i === 1 ? HALO.acc : HALO.ink3 }}>{p}</div>
                  ))}</div>
                </div>
                <HaloChart h={150} />
              </div>
              <div style={{ background: HALO.panel, border: `1px solid ${HALO.line}`, borderRadius: 14, overflow: 'hidden' }}>
                <div style={{ display: 'flex', padding: '11px 18px', borderBottom: `1px solid ${HALO.line}`, fontSize: 11.5, fontWeight: 700, color: HALO.ink3, textTransform: 'uppercase', letterSpacing: '.04em' }}>
                  <div style={{ flex: 2 }}>Account</div><div style={{ flex: 1 }}>Plan</div><div style={{ flex: 1, textAlign: 'right' }}>MRR</div><div style={{ flex: 1, textAlign: 'right' }}>Health</div>
                </div>
                {rows.map((r) => (
                  <div key={r[0]} style={{ display: 'flex', padding: '12px 18px', borderBottom: `1px solid ${HALO.line}`, fontSize: 13.5, alignItems: 'center' }}>
                    <div style={{ flex: 2, fontWeight: 600 }}>{r[0]}</div>
                    <div style={{ flex: 1, color: HALO.ink2 }}>{r[1]}</div>
                    <div style={{ flex: 1, textAlign: 'right', fontFamily: HALO.mono, fontWeight: 500 }}>{r[2]}</div>
                    <div style={{ flex: 1, textAlign: 'right', color: HALO.good, fontWeight: 600 }}>{r[3]}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { DemoScreen, HALO });
