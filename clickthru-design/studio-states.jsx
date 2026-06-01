/* studio-states.jsx — component state boards (buttons, controls, feedback,
   step cards, element selection). Each renders a self-contained themed root. */

function Board({ theme = 'dark', title, sub, children, w = 'auto', pad = 26 }) {
  return (
    <div className="studio" data-theme={theme} style={{ padding: pad, width: w }}>
      <div className="t-eyebrow" style={{ marginBottom: 5 }}>{title}</div>
      {sub && <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginBottom: 20 }}>{sub}</div>}
      {children}
    </div>
  );
}
function Cell({ label, children, w }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: w }}>
      <div style={{ font: '600 10.5px/1 var(--mono)', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-3)' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', minHeight: 38 }}>{children}</div>
    </div>
  );
}

function BoardButtons({ theme }) {
  return (
    <Board theme={theme} title="Buttons" sub="Primary · ghost · quiet — across interaction states" w={560}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22, rowGap: 26 }}>
        <Cell label="Default"><button className="btn btn--primary">Share</button></Cell>
        <Cell label="Hover"><button className="btn btn--primary" style={{ background: 'var(--accent-2)' }}>Share</button></Cell>
        <Cell label="Pressed"><button className="btn btn--primary is-active">Share</button></Cell>
        <Cell label="Loading"><button className="btn btn--primary"><span className="spin" /> Saving…</button></Cell>
        <Cell label="Disabled"><button className="btn btn--primary is-disabled">Share</button></Cell>
        <Cell label="Ghost"><button className="btn btn--ghost">Preview</button></Cell>
        <Cell label="Ghost hover"><button className="btn btn--ghost" style={{ background: 'var(--panel-3)', borderColor: 'var(--line-2)' }}>Preview</button></Cell>
        <Cell label="Quiet"><button className="btn btn--quiet">Validate</button></Cell>
        <Cell label="Icon"><button className="btn btn--ghost btn--icon"><svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M7.5 3v9M3 7.5h9" /></svg></button></Cell>
      </div>
    </Board>
  );
}

function BoardControls({ theme }) {
  return (
    <Board theme={theme} title="Controls" sub="Inputs, toggles, segmented, slider, swatches" w={520}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <Cell label="Input" w={230}><input className="inp" defaultValue="Halo product tour" /></Cell>
          <Cell label="Input · focus" w={230}><div className="inp is-focus" style={{ color: 'var(--text)' }}>Halo product tour</div></Cell>
        </div>
        <div style={{ display: 'flex', gap: 40 }}>
          <Cell label="Toggle off"><Toggle on={false} /></Cell>
          <Cell label="Toggle on"><Toggle on={true} /></Cell>
          <Cell label="Stepper" w={120}><div className="stepper"><button>−</button><div className="v">280</div><button>+</button></div></Cell>
        </div>
        <Cell label="Segmented"><div style={{ width: 220 }}><Seg options={[{ v: 's', label: 'Smooth' }, { v: 'f', label: 'Fast' }, { v: 'l', label: 'Slow' }]} value="s" accent /></div></Cell>
        <Cell label="Slider"><div style={{ width: 280 }}><SliderRow pct={42} value="30 px" /></div></Cell>
        <Cell label="Swatches"><Swatches colors={['oklch(0.66 0.18 256)', 'oklch(0.6 0.2 295)', 'oklch(0.72 0.16 158)', 'oklch(0.78 0.15 70)', 'oklch(0.66 0.2 24)']} value={0} /></Cell>
      </div>
    </Board>
  );
}

function BoardFeedback({ theme }) {
  return (
    <Board theme={theme} title="Top actions — feedback" sub="Idle, result, loading & confirmations" w={520}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        <Cell label="Validate · success">
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 12px', borderRadius: 8, background: 'var(--good-soft)', color: 'var(--good)', fontSize: 12.5, fontWeight: 600 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 7.5l3 3 6-7" /></svg>All 6 steps valid
          </div>
        </Cell>
        <Cell label="Validate · error">
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 12px', borderRadius: 8, background: 'var(--bad-soft)', color: 'var(--bad)', fontSize: 12.5, fontWeight: 600 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M7 3.5v4M7 10h.01" /></svg>Step 4 — callout has no text
          </div>
        </Cell>
        <div style={{ display: 'flex', gap: 16 }}>
          <Cell label="Share · idle"><button className="btn btn--primary"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="4" r="2" /><circle cx="4" cy="8" r="2" /><circle cx="12" cy="12" r="2" /><path d="M5.7 7l4.6-2M5.7 9l4.6 2" /></svg>Share</button></Cell>
          <Cell label="Share · saving"><button className="btn btn--primary is-active"><span className="spin" /> Saving…</button></Cell>
          <Cell label="Link copied"><div className="btn" style={{ background: 'var(--good-soft)', color: 'var(--good)' }}><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8.5l3 3 7-8" /></svg>Copied</div></Cell>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <Cell label="Apply-to-all" w={210}><ApplyAll label="Apply to all steps" /></Cell>
          <Cell label="Applied ✓" w={210}><ApplyAll applied /></Cell>
        </div>
      </div>
    </Board>
  );
}

function BoardStepStates({ theme }) {
  const card = (s, label) => (
    <div style={{ width: 150 }}>
      <div style={{ position: 'relative', borderRadius: 12, padding: 7, background: s.active ? 'var(--accent-soft)' : 'transparent', border: s.active ? '1px solid var(--accent-line)' : '1px solid var(--line)' }}>
        <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--line)', opacity: s.skipped ? 0.5 : 1 }}>
          <MiniShot variant={s.variant} nav={s.nav} w={134} />
          <div style={{ position: 'absolute', top: 5, left: 5, width: 18, height: 18, borderRadius: 5, background: s.active ? 'var(--accent)' : 'rgba(10,12,20,.72)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '600 10px/1 var(--mono)' }}>{s.n}</div>
          {s.skipped && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ background: 'rgba(10,12,20,.78)', color: '#fff', fontSize: 9.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', padding: '3px 7px', borderRadius: 5 }}>Skipped</span></div>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 3px 1px' }}>
          {s.type === 'video' ? <span className="chip video" style={{ padding: '2px 5px' }}><svg width="9" height="9" viewBox="0 0 10 10" fill="currentColor"><path d="M2 1.5v7l6-3.5z" /></svg>Vid</span> : <span className="chip" style={{ padding: '2px 5px' }}>Img</span>}
          <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-2)' }}>{label}</span>
        </div>
      </div>
    </div>
  );
  return (
    <Board theme={theme} title="Step card states" sub="Normal · active · skipped · video" w={680}>
      <div style={{ display: 'flex', gap: 18 }}>
        {card({ n: 1, variant: 'overview', nav: 1, type: 'image' }, 'Normal')}
        {card({ n: 2, variant: 'reports', nav: 1, type: 'image', active: true }, 'Active')}
        {card({ n: 3, variant: 'share', nav: 4, type: 'image', skipped: true }, 'Skipped')}
        {card({ n: 4, variant: 'overview', nav: 2, type: 'video' }, 'Video')}
      </div>
    </Board>
  );
}

function BoardSelection({ theme }) {
  return (
    <Board theme={theme} title="Element states" sub="Idle vs selected — drawn on a neutral surface" w={760} pad={0}>
      <div style={{ background: 'var(--pit)', borderRadius: 0, padding: '46px 30px', display: 'flex', flexWrap: 'wrap', gap: 54, alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
          <Hotspot size={30} />
          <span style={{ font: '600 11px var(--mono)', color: 'var(--text-3)' }}>HOTSPOT</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
          <Hotspot size={30} selected />
          <span style={{ font: '600 11px var(--mono)', color: 'var(--accent-2)' }}>SELECTED</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
          <TextLabel text="Start here" size="M" box boxBg="#fff" selected />
          <span style={{ font: '600 11px var(--mono)', color: 'var(--text-3)' }}>TEXT</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
          <Callout title="Track every metric" body="Live revenue, retention and churn." arrow="none" back={false} next w={236} selected />
          <span style={{ font: '600 11px var(--mono)', color: 'var(--accent-2)' }}>CALLOUT · SELECTED</span>
        </div>
      </div>
    </Board>
  );
}

Object.assign(window, { BoardButtons, BoardControls, BoardFeedback, BoardStepStates, BoardSelection });
