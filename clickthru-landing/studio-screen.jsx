/* studio-screen.jsx — full Studio composition: stage (canvas) + add dock,
   and StudioScreen assembling top bar + rail + stage + inspector. */

// natural framed-shot size (browser wrapper adds ~42px chrome)
const SHOT_W = 1200, SHOT_CH = 42;

function ShotStage({ scale = 0.62, wrapper = 'browser', children, guides = false, bg = 'var(--pit)' }) {
  const chrome = wrapper === 'browser' ? SHOT_CH : wrapper === 'dark' ? 20 : 0;
  const natH = 760 + chrome;
  return (
    <div style={{ width: '100%', height: '100%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      {/* faint grid in the pit */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, color-mix(in oklch, var(--text-3) 22%, transparent) 1px, transparent 1px)', backgroundSize: '26px 26px', opacity: .25, pointerEvents: 'none' }} />
      <div style={{ width: SHOT_W * scale, height: natH * scale, position: 'relative' }}>
        <div style={{ width: SHOT_W, height: natH, transform: `scale(${scale})`, transformOrigin: 'top left', position: 'absolute', top: 0, left: 0 }}>
          <FrameWrapper variant={wrapper}><DemoScreen variant="overview" nav={1} /></FrameWrapper>
          {guides && <>
            <div style={{ position: 'absolute', left: 760, top: -40, bottom: -40, width: 1, background: 'oklch(0.7 0.2 350)', boxShadow: '0 0 0 .5px oklch(0.7 0.2 350)' }} />
            <div style={{ position: 'absolute', left: 250, top: 360, width: 510, height: 1, background: 'oklch(0.7 0.2 350)' }} />
            <div style={{ position: 'absolute', left: 495, top: 338, transform: 'translateX(-50%)', background: 'oklch(0.7 0.2 350)', color: '#fff', font: '600 13px var(--mono)', padding: '2px 7px', borderRadius: 5 }}>128</div>
          </>}
          {children}
        </div>
      </div>
    </div>
  );
}

// floating element-adding dock. present: which singletons already exist.
function AddDock({ present = { hotspot: true, callout: true, focus: false } }) {
  const tools = [
    { k: 'hotspot', label: 'Hotspot', icon: <><circle cx="9" cy="9" r="2.6" fill="currentColor" /><circle cx="9" cy="9" r="6" fill="none" stroke="currentColor" strokeWidth="1.4" opacity=".5" /></> },
    { k: 'callout', label: 'Callout', icon: <g fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2.5" y="3" width="13" height="8.5" rx="2.2" /><path d="M6 14.5l2-3" strokeLinecap="round" /></g> },
    { k: 'text', label: 'Text', icon: <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M4.5 4.5h9M9 4.5v9M7 13.5h4" /></g> },
    { k: 'focus', label: 'Focus', icon: <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M3 6V4a1 1 0 011-1h2M15 6V4a1 1 0 00-1-1h-2M3 12v2a1 1 0 001 1h2M15 12v2a1 1 0 01-1 1h-2" /><circle cx="9" cy="9" r="2.2" /></g> },
  ];
  return (
    <div style={{ position: 'absolute', bottom: 22, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 4, background: 'var(--elev)', border: '1px solid var(--line)', borderRadius: 16, padding: 7, boxShadow: 'var(--shadow)', zIndex: 8 }}>
      {tools.map((t) => {
        const disabled = (t.k === 'hotspot' || t.k === 'callout' || t.k === 'focus') && present[t.k];
        return (
          <div key={t.k} title={disabled ? `${t.label} already added` : `Add ${t.label.toLowerCase()}`}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '8px 12px 6px', borderRadius: 11, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.34 : 1, background: 'transparent' }}>
            <svg width="18" height="18" viewBox="0 0 18 18">{t.icon}</svg>
            <span style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-2)' }}>{t.label}</span>
          </div>
        );
      })}
      <div style={{ width: 1, height: 36, background: 'var(--line)', margin: '0 4px' }} />
      <div title="Delete this step" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '8px 12px 6px', borderRadius: 11, cursor: 'pointer', color: 'var(--bad)' }}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5h12M7 5V3h4v2M5 5l.8 10h6.4L13 5" /></svg>
        <span style={{ fontSize: 10.5, fontWeight: 600 }}>Delete</span>
      </div>
    </div>
  );
}

// elements placed for the main populated step (callout selected)
function MainStepElements({ selected = 'callout' }) {
  return (
    <>
      <div style={{ position: 'absolute', left: 1064, top: 76 }}><Hotspot size={30} selected={selected === 'hotspot'} /></div>
      <div style={{ position: 'absolute', left: 252, top: 250 }}><TextLabel text="Start with your KPIs" size="M" box boxBg="#ffffff" selected={selected === 'text'} /></div>
      <div style={{ position: 'absolute', left: 742, top: 372 }}>
        <Callout title="Track every metric" body="Live revenue, retention and churn — all on one canvas." arrow="left" back next w={280} selected={selected === 'callout'} />
      </div>
    </>
  );
}

function StudioScreen({ theme = 'dark', context = 'callout', selected = 'callout', present = { hotspot: true, callout: true, focus: false }, topState = 'idle', steps }) {
  return (
    <div className="studio" data-theme={theme} style={{ display: 'flex', flexDirection: 'column' }}>
      <TopBar title="Halo product tour" state={topState} />
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <StepRail steps={steps} active={1} />
        <div style={{ flex: 1, position: 'relative', minWidth: 0 }}>
          <ShotStage scale={0.62} wrapper="browser">
            <MainStepElements selected={selected} />
          </ShotStage>
          <AddDock present={present} />
        </div>
        <div style={{ width: 340, flex: 'none' }}><InspectorPanel context={context} /></div>
      </div>
    </div>
  );
}

Object.assign(window, { StudioScreen, ShotStage, AddDock, MainStepElements });
