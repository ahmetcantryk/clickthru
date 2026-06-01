/* studio-inspector.jsx — context-aware inspector, six contexts.
   Reusable controls + InspectorPanel({context}). */

const EL_COLORS = ['oklch(0.66 0.18 256)', 'oklch(0.6 0.2 295)', 'oklch(0.72 0.16 158)', 'oklch(0.78 0.15 70)', 'oklch(0.66 0.2 24)', 'oklch(0.5 0.02 264)'];
const BG_PRESETS = ['#ffffff', 'oklch(0.97 0.01 264)', 'oklch(0.95 0.03 256)', 'oklch(0.94 0.04 295)', 'linear-gradient(135deg,#eef2ff,#fce7f3)', 'oklch(0.2 0.01 264)'];

function SecTitle({ children, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
      <div className="t-eyebrow">{children}</div>
      <div style={{ flex: 1 }} />
      {right}
    </div>
  );
}
function Field({ label, children, hint }) {
  return (
    <div className="field" style={{ marginBottom: 16 }}>
      {label && <label>{label}</label>}
      {children}
      {hint && <div style={{ fontSize: 11.5, color: 'var(--text-3)', lineHeight: 1.4 }}>{hint}</div>}
    </div>
  );
}
function Seg({ options, value, accent }) {
  return (
    <div className="seg">
      {options.map((o) => (
        <button key={o.v} className={`${value === o.v ? 'is-on' : ''} ${accent ? 'accent' : ''}`}>
          {o.icon}{o.label}
        </button>
      ))}
    </div>
  );
}
function Swatches({ colors, value, custom = true }) {
  return (
    <div className="swatches">
      {colors.map((c, i) => (
        <div key={i} className={`swatch ${value === i ? 'is-on' : ''}`} style={{ background: c }} />
      ))}
      {custom && <div className="swatch custom" title="Custom color"><span /></div>}
    </div>
  );
}
function Toggle({ on }) { return <div className={`tg ${on ? 'is-on' : ''}`} />; }
function SliderRow({ pct, value }) {
  return (
    <div className="sld-row">
      <div className="sld" style={{ flex: 1 }}>
        <div className="track"><div className="fill" style={{ width: `${pct}%` }} /></div>
        <div className="knob" style={{ left: `${pct}%` }} />
      </div>
      <div className="val">{value}</div>
    </div>
  );
}
function ApplyAll({ label, applied }) {
  return (
    <div className={`applyall ${applied ? 'is-applied' : ''}`}>
      {applied
        ? <><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8.5l3 3 7-8" /></svg>Applied to all steps</>
        : <><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="7" height="7" rx="1.5" /><path d="M11 7h3v7H7v-3" /></svg>{label}</>}
    </div>
  );
}
function Remove({ label = 'Remove element' }) {
  return (
    <button className="removebtn">
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 4h10M5.5 4V2.5h4V4M4 4l.6 8.5h5.8L11 4" /></svg>
      {label}
    </button>
  );
}
function ElIcon({ type }) {
  const map = {
    demo: <path d="M2 4h12v8H2zM2 7h12" />,
    step: <path d="M2 8h12M2 4h12M2 12h12" />,
    hotspot: null, callout: null, focus: null, text: null,
  };
  return (
    <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-2)' }}>
      {type === 'hotspot' && <svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="3" fill="currentColor" /><circle cx="8" cy="8" r="6.2" fill="none" stroke="currentColor" strokeWidth="1.3" opacity=".5" /></svg>}
      {type === 'callout' && <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="2" y="2.5" width="12" height="8" rx="2" /><path d="M5 13l2-2.5" /></svg>}
      {type === 'focus' && <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 5V3h2M14 5V3h-2M2 11v2h2M14 11v2h-2" /><circle cx="8" cy="8" r="2" /></svg>}
      {type === 'text' && <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M4 4h8M8 4v8M6.5 12h3" /></svg>}
      {(type === 'demo' || type === 'step') && <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">{map[type]}</svg>}
    </div>
  );
}

function InspectorShell({ type, title, sub, children, footer }) {
  return (
    <div style={{ width: '100%', height: '100%', background: 'var(--panel)', borderLeft: '1px solid var(--line)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '14px 16px' }}>
        <ElIcon type={type} />
        <div style={{ lineHeight: 1.25 }}>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' }}>{title}</div>
          <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>{sub}</div>
        </div>
      </div>
      <div className="divline" />
      <div style={{ flex: 1, overflow: 'hidden', padding: '16px 16px 8px' }}>{children}</div>
      {footer && <><div className="divline" /><div style={{ padding: 14 }}>{footer}</div></>}
    </div>
  );
}

/* ---------- (a) DEMO ---------- */
function InsDemo() {
  const tiles = [
    { v: 'browser', label: 'Browser' }, { v: 'dark', label: 'Dark' }, { v: 'none', label: 'None' },
  ];
  return (
    <InspectorShell type="demo" title="Demo settings" sub="Nothing selected">
      <Field label="Demo title"><input className="inp" defaultValue="Halo product tour" /></Field>
      <div style={{ marginBottom: 18 }}>
        <SecTitle>Frame</SecTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {tiles.map((t) => (
            <div key={t.v} style={{ border: t.v === 'browser' ? '1.5px solid var(--accent)' : '1px solid var(--line)', borderRadius: 9, padding: 7, background: 'var(--panel-2)', cursor: 'pointer' }}>
              <div style={{ height: 44, borderRadius: 5, background: 'var(--panel-3)', overflow: 'hidden', position: 'relative' }}>
                {t.v === 'browser' && <div style={{ height: 9, background: 'var(--line-2)', display: 'flex', gap: 2, alignItems: 'center', paddingLeft: 3 }}>{[0, 1, 2].map((i) => <span key={i} style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--text-3)' }} />)}</div>}
                {t.v === 'dark' && <div style={{ position: 'absolute', inset: 4, borderRadius: 3, background: 'oklch(0.2 0.01 264)' }} />}
              </div>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: t.v === 'browser' ? 'var(--accent-2)' : 'var(--text-2)', textAlign: 'center', marginTop: 6 }}>{t.label}</div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <SecTitle>Background</SecTitle>
        <Swatches colors={BG_PRESETS} value={1} />
      </div>
    </InspectorShell>
  );
}

/* ---------- (b) STEP ---------- */
function InsStep() {
  const els = [['hotspot', 'Hotspot'], ['callout', 'Callout', 'Track every metric'], ['text', 'Text label', '“Start here”']];
  return (
    <InspectorShell type="step" title="Step 2" sub="Step settings">
      <div style={{ marginBottom: 18 }}>
        <SecTitle right={<button style={{ font: '600 11.5px var(--font)', color: 'var(--accent-2)', background: 'none', border: 'none', cursor: 'pointer' }}>Reset to inherit</button>}>Background</SecTitle>
        <div className="tg-row" style={{ marginBottom: 12 }}>
          <div><div className="lbl">Inherit from demo</div><div className="sub">Use the demo's background</div></div>
          <Toggle on={false} />
        </div>
        <Swatches colors={BG_PRESETS} value={3} />
        <div style={{ marginTop: 14 }}><ApplyAll label="Apply background to all steps" /></div>
      </div>
      <div className="divline" style={{ margin: '4px 0 16px' }} />
      <SecTitle>Elements on this step</SecTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {els.map(([t, name, val], i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '9px 10px', borderRadius: 9, background: 'var(--panel-2)', border: '1px solid var(--line)', cursor: 'pointer' }}>
            <ElIcon type={t} />
            <div style={{ lineHeight: 1.3, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{name}</div>
              {val && <div style={{ fontSize: 11.5, color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{val}</div>}
            </div>
            <div style={{ flex: 1 }} />
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--text-3)" strokeWidth="1.6" strokeLinecap="round"><path d="M5 3l4 4-4 4" /></svg>
          </div>
        ))}
      </div>
    </InspectorShell>
  );
}

/* ---------- (c) HOTSPOT ---------- */
function InsHotspot() {
  return (
    <InspectorShell type="hotspot" title="Hotspot" sub="Click target" footer={<Remove />}>
      <Field label="Size"><SliderRow pct={42} value="30 px" /></Field>
      <Field label="Color"><Swatches colors={EL_COLORS} value={0} /></Field>
      <div className="divline" style={{ margin: '4px 0 16px' }} />
      <Field label="Position" hint="Drag the hotspot on the canvas to reposition.">
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="inp t-mono" style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-2)' }}><span style={{ color: 'var(--text-3)' }}>X</span> 642</div>
          <div className="inp t-mono" style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-2)' }}><span style={{ color: 'var(--text-3)' }}>Y</span> 318</div>
        </div>
      </Field>
    </InspectorShell>
  );
}

/* ---------- (d) CALLOUT ---------- */
function InsCallout() {
  const ar = (d) => ({ up: 'M7 3v8M4 6l3-3 3 3', down: 'M7 11V3M4 8l3 3 3-3', left: 'M3 7h8M6 4L3 7l3 3', right: 'M11 7H3M8 4l3 3-3 3', none: 'M3.5 3.5l7 7M10.5 3.5l-7 7' }[d]);
  const arrows = ['up', 'down', 'left', 'right', 'none'].map((d) => ({
    v: d, icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d={ar(d)} /></svg>,
  }));
  return (
    <InspectorShell type="callout" title="Callout" sub="Explainer card" footer={<Remove />}>
      <Field label="Title"><input className="inp" defaultValue="Track every metric" /></Field>
      <Field label="Description"><textarea className="inp" defaultValue="Your live revenue, retention and churn — all on one canvas." /></Field>
      <Field label="Pointer direction"><Seg options={arrows} value="left" /></Field>
      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        <div className="tg-row" style={{ flex: 1 }}><span className="lbl">Back</span><Toggle on={true} /></div>
        <div className="tg-row" style={{ flex: 1 }}><span className="lbl">Next</span><Toggle on={true} /></div>
      </div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <div className="field" style={{ flex: 1 }}><label>Width</label><SliderRow pct={56} value="280" /></div>
      </div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <div className="field" style={{ flex: 1 }}><label>Height</label><SliderRow pct={30} value="auto" /></div>
        <div className="field" style={{ flex: 1 }}><label>Radius</label><SliderRow pct={48} value="16" /></div>
      </div>
      <div className="tg-row" style={{ marginBottom: 14 }}><span className="lbl">Border</span><Toggle on={true} /></div>
      <Field label="Background"><Swatches colors={['#ffffff', 'oklch(0.97 0.01 264)', 'oklch(0.22 0.01 264)', 'oklch(0.95 0.04 256)']} value={0} /></Field>
      <Field label="Border color"><Swatches colors={['oklch(0.9 0.005 264)', 'oklch(0.66 0.18 256)', 'oklch(0.8 0.01 264)']} value={0} /></Field>
      <ApplyAll label="Apply style to all callouts" />
    </InspectorShell>
  );
}

/* ---------- (e) FOCUS ---------- */
function InsFocus() {
  const modes = [{ v: 'smooth', label: 'Smooth' }, { v: 'fast', label: 'Fast' }, { v: 'slow', label: 'Slow' }];
  return (
    <InspectorShell type="focus" title="Focus" sub="Camera region" footer={<Remove label="Remove focus" />}>
      <Field label="Transition" hint="How the camera eases toward this region during playback."><Seg options={modes} value="smooth" accent /></Field>
      <div style={{ marginBottom: 16 }}><ApplyAll label="Apply transition to all steps" /></div>
      <div className="divline" style={{ margin: '4px 0 16px' }} />
      <div style={{ background: 'var(--panel-2)', border: '1px solid var(--line)', borderRadius: 11, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 46, height: 46, borderRadius: 10, background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-2)' }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="9.5" cy="9.5" r="5.5" /><path d="M13.8 13.8L19 19M7.5 9.5h4M9.5 7.5v4" /></svg>
        </div>
        <div>
          <div style={{ font: '700 22px var(--mono)', color: 'var(--text)', letterSpacing: '-0.02em' }}>1.8×</div>
          <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 2 }}>Zoom · computed from region size</div>
        </div>
      </div>
    </InspectorShell>
  );
}

/* ---------- (f) TEXT ---------- */
function InsText() {
  const sizes = [{ v: 'S', label: 'S' }, { v: 'M', label: 'M' }, { v: 'L', label: 'L' }];
  return (
    <InspectorShell type="text" title="Text label" sub="Free text" footer={<Remove />}>
      <Field label="Content"><input className="inp" defaultValue="Start here" /></Field>
      <Field label="Size"><Seg options={sizes} value="M" /></Field>
      <Field label="Color"><Swatches colors={EL_COLORS} value={5} /></Field>
      <div className="divline" style={{ margin: '4px 0 16px' }} />
      <div className="tg-row" style={{ marginBottom: 16 }}><div><div className="lbl">Box background</div><div className="sub">Draw a filled card behind text</div></div><Toggle on={true} /></div>
      <Field label="Box color"><Swatches colors={['#ffffff', 'oklch(0.22 0.01 264)', 'oklch(0.66 0.18 256)', 'oklch(0.78 0.15 70)']} value={0} /></Field>
      <Field label="Corner radius"><SliderRow pct={40} value="8" /></Field>
    </InspectorShell>
  );
}

const INSPECTORS = { demo: InsDemo, step: InsStep, hotspot: InsHotspot, callout: InsCallout, focus: InsFocus, text: InsText };
function InspectorPanel({ context = 'callout' }) { const C = INSPECTORS[context] || InsDemo; return <C />; }

Object.assign(window, { InspectorPanel, InsDemo, InsStep, InsHotspot, InsCallout, InsFocus, InsText, Seg, Swatches, Toggle, SliderRow, ApplyAll, Remove, Field });
