/* studio-chrome.jsx — top action bar + step rail */

function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
      <div style={{ width: 27, height: 27, borderRadius: 8, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M2 2.5L11.5 7.5L7 8.2L9.2 12L7.4 12.9L5.2 9.1L2 11.5z" fill="var(--on-accent)" /></svg>
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text)' }}>clickthru</div>
    </div>
  );
}

// state: 'idle' | 'valid' | 'error' | 'sharing'
function TopBar({ title = 'Halo product tour', state = 'idle' }) {
  return (
    <div style={{ height: 56, flex: 'none', background: 'var(--panel)', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 14, position: 'relative', zIndex: 5 }}>
      <Logo />
      <div style={{ width: 1, height: 22, background: 'var(--line)' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 8, border: '1px solid transparent', color: 'var(--text)' }}>
        <span style={{ fontSize: 14, fontWeight: 600 }}>{title}</span>
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="var(--text-3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 2.2l2.3 2.3-6 6-2.8.5.5-2.8z" /></svg>
      </div>

      <div style={{ flex: 1 }} />

      {/* validate result feedback */}
      {state === 'valid' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 11px', borderRadius: 8, background: 'var(--good-soft)', color: 'var(--good)', fontSize: 12.5, fontWeight: 600 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 7.5l3 3 6-7" /></svg>
          All 6 steps valid
        </div>
      )}
      {state === 'error' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 11px', borderRadius: 8, background: 'var(--bad-soft)', color: 'var(--bad)', fontSize: 12.5, fontWeight: 600 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M7 3.5v4M7 10h.01" /></svg>
          Step 4 — callout has no text
        </div>
      )}

      <button className="btn btn--quiet">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2.5v6M8 8.5l2.8 2.8M8 8.5L5.2 11.3" /><circle cx="8" cy="8" r="6.2" /></svg>
        Validate
      </button>
      <button className="btn btn--ghost">
        <svg viewBox="0 0 16 16" fill="none"><path d="M4 3.2v9.6c0 .5.5.8.9.5l7-4.8a.6.6 0 000-1l-7-4.8a.6.6 0 00-.9.5z" fill="currentColor" /></svg>
        Preview
      </button>
      <button className={`btn btn--primary ${state === 'sharing' ? 'is-active' : ''}`}>
        {state === 'sharing'
          ? <><span className="spin" /> Saving…</>
          : <><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="4" r="2" /><circle cx="4" cy="8" r="2" /><circle cx="12" cy="12" r="2" /><path d="M5.7 7l4.6-2M5.7 9l4.6 2" /></svg> Share</>}
      </button>
    </div>
  );
}

/* ----- step rail ----- */
function MiniShot({ variant = 'overview', nav = 1, w = 196 }) {
  const scale = w / 1200, h = 760 * scale;
  return (
    <div style={{ width: w, height: h, overflow: 'hidden', position: 'relative' }}>
      <div style={{ width: 1200, height: 760, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        <DemoScreen variant={variant} nav={nav} />
      </div>
    </div>
  );
}

const VideoMark = () => (
  <span className="chip video"><svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><path d="M2 1.5v7l6-3.5z" /></svg>Video</span>
);
const ImgMark = () => (
  <span className="chip"><svg width="10" height="10" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="1" y="1.5" width="9" height="8" rx="1.5" /><circle cx="3.6" cy="4.2" r="1" fill="currentColor" stroke="none" /><path d="M1.5 8l2.5-2.2L6 7.4l1.8-1.6 1.7 1.5" /></svg>Image</span>
);

function StepMenu() {
  const items = [
    ['Rename', 'M8.5 2.2l2.3 2.3-6 6-2.8.5.5-2.8z'],
    ['Duplicate', 'rect'],
    ['Download image', 'M7 2v7m0 0l2.5-2.5M7 9L4.5 6.5M2.5 11h9'],
    ['Skip in playback', 'skip'],
  ];
  return (
    <div style={{ position: 'absolute', top: 38, right: 8, width: 196, background: 'var(--elev)', border: '1px solid var(--line)', borderRadius: 11, boxShadow: 'var(--shadow)', padding: 6, zIndex: 30 }}>
      {items.map(([label]) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 7, fontSize: 13, fontWeight: 500, color: 'var(--text)', cursor: 'pointer', background: label === 'Skip in playback' ? 'var(--panel-2)' : 'transparent' }}>
          <span style={{ width: 14, height: 14, borderRadius: 3, background: 'var(--panel-3)', display: 'inline-block' }} />
          {label}
        </div>
      ))}
      <div className="divline" style={{ margin: '6px 2px' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 7, fontSize: 13, fontWeight: 600, color: 'var(--bad)', cursor: 'pointer' }}>
        <span style={{ width: 14, height: 14, borderRadius: 3, background: 'var(--bad-soft)', display: 'inline-block' }} />
        Delete step
      </div>
    </div>
  );
}

function InsertBetween({ shown = false }) {
  return (
    <div style={{ height: shown ? 20 : 12, display: 'flex', alignItems: 'center', position: 'relative' }}>
      <div style={{ flex: 1, height: 2, borderRadius: 2, background: shown ? 'var(--accent)' : 'transparent' }} />
      {shown && (
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', width: 22, height: 22, borderRadius: '50%', background: 'var(--accent)', color: 'var(--on-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, boxShadow: 'var(--shadow-sm)' }}>+</div>
      )}
    </div>
  );
}

// steps: [{variant, nav, type:'image'|'video', title, skipped}], active idx, menuOpen idx, insertAfter idx
function StepRail({ steps, active = 1, menuOpen = -1, insertAfter = -1, width = 252, empty = false }) {
  return (
    <div style={{ width, flex: 'none', background: 'var(--panel)', borderRight: '1px solid var(--line)', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px 12px', gap: 8 }}>
        <div className="t-eyebrow">Steps</div>
        {!empty && <div className="chip" style={{ padding: '2px 6px' }}>{steps.length}</div>}
        <div style={{ flex: 1 }} />
        <button className="btn btn--quiet btn--icon btn--sm" title="Reorder"><svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M3 4h8M3 7h8M3 10h8" /></svg></button>
      </div>
      <div className="divline" />

      {empty ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 28px', gap: 14 }}>
          <div style={{ width: 60, height: 60, borderRadius: 16, background: 'var(--panel-2)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke="var(--text-3)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="20" height="16" rx="2.5" /><circle cx="9" cy="11" r="2" /><path d="M3 17l5-4 4 3 4-4 7 6" /></svg>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>No steps yet</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 4, lineHeight: 1.5 }}>Upload a screenshot or video clip to create your first step.</div>
          </div>
          <button className="btn btn--primary btn--sm"><span style={{ fontSize: 15 }}>+</span> Add first step</button>
        </div>
      ) : (
        <>
          <div style={{ flex: 1, overflow: 'hidden', padding: '12px 16px 8px', display: 'flex', flexDirection: 'column' }}>
            {steps.map((s, i) => (
              <React.Fragment key={i}>
                <div style={{ position: 'relative', borderRadius: 12, padding: 7, background: i === active ? 'var(--accent-soft)' : 'transparent', border: i === active ? '1px solid var(--accent-line)' : '1px solid transparent', cursor: 'pointer' }}>
                  <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--line)', opacity: s.skipped ? 0.5 : 1 }}>
                    <MiniShot variant={s.variant} nav={s.nav} w={width - 46} />
                    <div style={{ position: 'absolute', top: 6, left: 6, width: 20, height: 20, borderRadius: 6, background: i === active ? 'var(--accent)' : 'rgba(10,12,20,.72)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '600 11px/1 var(--mono)' }}>{i + 1}</div>
                    {s.skipped && (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ background: 'rgba(10,12,20,.78)', color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', padding: '4px 8px', borderRadius: 6 }}>Skipped</span>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 4px 2px' }}>
                    {s.type === 'video' ? <VideoMark /> : <ImgMark />}
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: i === active ? 'var(--text)' : 'var(--text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</span>
                    <div style={{ flex: 1 }} />
                    <button className="btn btn--quiet btn--icon" style={{ width: 24, height: 24, opacity: i === menuOpen ? 1 : 0.6 }}><svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><circle cx="7" cy="3" r="1.3" /><circle cx="7" cy="7" r="1.3" /><circle cx="7" cy="11" r="1.3" /></svg></button>
                  </div>
                  {i === menuOpen && <StepMenu />}
                </div>
                {i < steps.length - 1 && <InsertBetween shown={i === insertAfter} />}
              </React.Fragment>
            ))}
          </div>
          <div className="divline" />
          <div style={{ padding: 14 }}>
            <button className="btn btn--ghost" style={{ width: '100%', justifyContent: 'center', borderStyle: 'dashed' }}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M8 3v10M3 8h10" /></svg>
              Add step
            </button>
          </div>
        </>
      )}
    </div>
  );
}

Object.assign(window, { TopBar, StepRail, MiniShot, Logo });
