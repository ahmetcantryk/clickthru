/* canvas-app.jsx — assembles every Studio screen as artboards on the
   design canvas. Loaded last; all components are on window. */

const STEPS = [
  { variant: 'overview', nav: 1, type: 'image', title: 'Welcome to Halo' },
  { variant: 'overview', nav: 1, type: 'image', title: 'Track every metric' },
  { variant: 'reports', nav: 1, type: 'image', title: 'Build a report' },
  { variant: 'reports', nav: 2, type: 'video', title: 'Create a segment' },
  { variant: 'share', nav: 4, type: 'image', title: 'Share workspace', skipped: true },
  { variant: 'share', nav: 4, type: 'image', title: 'Invite your team' },
];

// ---- standalone wrappers for fragments ----
function Root({ theme = 'dark', children, style }) {
  return <div className="studio" data-theme={theme} style={{ height: '100%', ...style }}>{children}</div>;
}

// canvas tile: pit + framed shot (+ optional elements / dock / guides)
function StageTile({ theme = 'dark', wrapper = 'browser', scale = 0.56, guides = false, dock = false, present, children }) {
  return (
    <Root theme={theme} style={{ position: 'relative' }}>
      <ShotStage wrapper={wrapper} scale={scale} guides={guides}>{children}</ShotStage>
      {dock && <AddDock present={present} />}
    </Root>
  );
}

function WrapperTile({ theme = 'dark', variant, scale = 0.31 }) {
  const chrome = variant === 'browser' ? 42 : variant === 'dark' ? 20 : 0;
  return (
    <Root theme={theme} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--pit)' }}>
      <div style={{ width: 1200 * scale, height: (760 + chrome) * scale }}>
        <div style={{ width: 1200, height: 760 + chrome, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
          <FrameWrapper variant={variant}><DemoScreen variant="overview" nav={1} /></FrameWrapper>
        </div>
      </div>
    </Root>
  );
}

// callout arrow directions board
function CalloutDirs({ theme = 'dark' }) {
  const dirs = [['up', 'Up'], ['down', 'Down'], ['left', 'Left'], ['right', 'Right'], ['none', 'None'], ['left', 'On dark']];
  return (
    <Root theme={theme} style={{ background: 'var(--pit)', padding: 34, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 30, alignContent: 'center' }}>
      {dirs.map(([d, label], i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <Callout title="Pick a metric" body="Choose what to chart." arrow={d} back={false} next={i !== 4} w={210} dark={label === 'On dark'} />
          <span style={{ font: '600 11px var(--mono)', color: 'var(--text-3)' }}>{label.toUpperCase()}</span>
        </div>
      ))}
    </Root>
  );
}

function App() {
  return (
    <DesignCanvas>
      {/* 1. MAIN STUDIO */}
      <DCSection id="studio" title="Studio" subtitle="Full editor — top actions · steps · canvas · context inspector">
        <DCArtboard id="studio-dark" label="Studio · Dark · callout selected" width={1440} height={900}>
          <StudioScreen theme="dark" context="callout" selected="callout" steps={STEPS} />
        </DCArtboard>
        <DCArtboard id="studio-light" label="Studio · Light" width={1440} height={900}>
          <StudioScreen theme="light" context="step" selected="text" steps={STEPS} />
        </DCArtboard>
        <DCArtboard id="studio-validated" label="Studio · validate result" width={1440} height={900}>
          <StudioScreen theme="dark" context="hotspot" selected="hotspot" topState="valid" steps={STEPS} />
        </DCArtboard>
      </DCSection>

      {/* 2. INSPECTOR — 6 contexts */}
      <DCSection id="inspector" title="Inspector — six contexts" subtitle="Whatever is selected, its settings appear · context-aware editing">
        <DCArtboard id="ins-demo" label="(a) Demo" width={360} height={560}><Root><InspectorPanel context="demo" /></Root></DCArtboard>
        <DCArtboard id="ins-step" label="(b) Step" width={360} height={620}><Root><InspectorPanel context="step" /></Root></DCArtboard>
        <DCArtboard id="ins-hotspot" label="(c) Hotspot" width={360} height={470}><Root><InspectorPanel context="hotspot" /></Root></DCArtboard>
        <DCArtboard id="ins-callout" label="(d) Callout" width={360} height={910}><Root><InspectorPanel context="callout" /></Root></DCArtboard>
        <DCArtboard id="ins-focus" label="(e) Focus" width={360} height={530}><Root><InspectorPanel context="focus" /></Root></DCArtboard>
        <DCArtboard id="ins-text" label="(f) Text label" width={360} height={620}><Root><InspectorPanel context="text" /></Root></DCArtboard>
        <DCArtboard id="ins-callout-lt" label="(d) Callout · Light" width={360} height={910}><Root theme="light"><InspectorPanel context="callout" /></Root></DCArtboard>
      </DCSection>

      {/* 3. STEP RAIL */}
      <DCSection id="rail" title="Step list" subtitle="Navigate · reorder · per-step action menu · empty state">
        <DCArtboard id="rail-full" label="Full · step 2 active" width={252} height={1280}><Root><StepRail steps={STEPS} active={1} /></Root></DCArtboard>
        <DCArtboard id="rail-menu" label="Action menu open" width={252} height={1280}><Root><StepRail steps={STEPS} active={1} menuOpen={1} insertAfter={2} /></Root></DCArtboard>
        <DCArtboard id="rail-empty" label="Empty state" width={252} height={560}><Root><StepRail steps={[]} empty /></Root></DCArtboard>
      </DCSection>

      {/* 4. CANVAS + ELEMENTS */}
      <DCSection id="canvas" title="Canvas — elements & frames" subtitle="Four element types · add dock · drag guides · three wrappers">
        <DCArtboard id="cv-all" label="All elements placed + add dock" width={820} height={620}>
          <StageTile dock present={{ hotspot: true, callout: true, focus: false }}><MainStepElements selected="callout" /></StageTile>
        </DCArtboard>
        <DCArtboard id="cv-focus" label="Focus region (camera)" width={820} height={620}>
          <StageTile>
            <div style={{ position: 'absolute', left: 236, top: 300 }}><FocusRegion w={560} h={300} ratio="1.8×" selected dim /></div>
          </StageTile>
        </DCArtboard>
        <DCArtboard id="cv-drag" label="Drag — alignment guides" width={820} height={620}>
          <StageTile guides>
            <div style={{ position: 'absolute', left: 742, top: 372 }}><Callout title="Track every metric" body="Live revenue, retention and churn." arrow="left" back next w={280} selected /></div>
          </StageTile>
        </DCArtboard>
        <DCArtboard id="cv-dock-free" label="Add dock · all available" width={520} height={150}>
          <Root style={{ background: 'var(--pit)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'relative' }}><AddDock present={{ hotspot: false, callout: false, focus: false }} /></div>
          </Root>
        </DCArtboard>
        <DCArtboard id="cv-dock-used" label="Add dock · singletons used" width={520} height={150}>
          <Root style={{ background: 'var(--pit)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'relative' }}><AddDock present={{ hotspot: true, callout: true, focus: true }} /></div>
          </Root>
        </DCArtboard>
        <DCArtboard id="cv-callouts" label="Callout · 5 pointers + dark" width={720} height={520}><CalloutDirs /></DCArtboard>
        <DCArtboard id="wrap-browser" label="Wrapper · Browser" width={460} height={330}><WrapperTile variant="browser" /></DCArtboard>
        <DCArtboard id="wrap-dark" label="Wrapper · Dark frame" width={460} height={330}><WrapperTile variant="dark" /></DCArtboard>
        <DCArtboard id="wrap-none" label="Wrapper · None" width={460} height={330}><WrapperTile variant="none" /></DCArtboard>
      </DCSection>

      {/* 5. PREVIEW & SHARE */}
      <DCSection id="play" title="Preview & share" subtitle="Real playback with progress · share screen with copy confirmation">
        <DCArtboard id="player" label="Player · step 3 / camera focused" width={1280} height={800}><Player steps={STEPS} /></DCArtboard>
        <DCArtboard id="share" label="Share · ready" width={620} height={460}><ShareScreen /></DCArtboard>
        <DCArtboard id="share-copied" label="Share · link copied" width={620} height={460}><ShareScreen copied /></DCArtboard>
      </DCSection>

      {/* 6. COMPONENT STATES */}
      <DCSection id="states" title="Component states" subtitle="Buttons · controls · feedback · step cards · element selection">
        <DCArtboard id="st-buttons" label="Buttons" width={612} height={320}><BoardButtons theme="dark" /></DCArtboard>
        <DCArtboard id="st-buttons-lt" label="Buttons · Light" width={612} height={320}><BoardButtons theme="light" /></DCArtboard>
        <DCArtboard id="st-controls" label="Controls" width={572} height={476}><BoardControls theme="dark" /></DCArtboard>
        <DCArtboard id="st-feedback" label="Top-action feedback" width={572} height={420}><BoardFeedback theme="dark" /></DCArtboard>
        <DCArtboard id="st-steps" label="Step card states" width={732} height={300}><BoardStepStates theme="dark" /></DCArtboard>
        <DCArtboard id="st-selection" label="Element selection" width={760} height={360}><BoardSelection theme="dark" /></DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
