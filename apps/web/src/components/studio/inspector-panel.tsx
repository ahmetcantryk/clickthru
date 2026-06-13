'use client';

import {
  ChevronLeft,
  Crosshair,
  Frame,
  LayoutTemplate,
  Maximize2,
  MessageSquare,
  MousePointerClick,
  MoveHorizontal,
  MoveVertical,
  PanelRightClose,
  Plus,
  Square,
  Trash2,
  Type,
} from 'lucide-react';
import { cn } from '@clickthru/ui';
import type { FocusEase, TextOverlaySize, Wrapper } from '@clickthru/schema';
import { useEditorStore, type Selection } from '@/store/editor-store';
import { useT, type Copy } from '@/lib/i18n';
import { ColorSwatches, PointerPicker, Segmented } from './controls';
import { ApplyAllButton, Field, NumberField, ReadonlyPos, RemoveButton, TextArea, TextInput, Toggle } from './fields';

const SIZE_OPTIONS: { value: TextOverlaySize; label: string }[] = [
  { value: 'sm', label: 'S' },
  { value: 'md', label: 'M' },
  { value: 'lg', label: 'L' },
];

const BACKGROUNDS = [
  '#FFFFFF',
  '#F2F6FF',
  '#EEF2FF',
  '#0B0B12',
  'linear-gradient(135deg,#2142E7,#6D5BF5)',
  'linear-gradient(135deg,#22D3EE,#2142E7)',
  'linear-gradient(135deg,#F472B6,#A78BFA)',
  'linear-gradient(160deg,#0B0B12,#1E293B)',
  'linear-gradient(135deg,#FDE68A,#FCA5A5)',
];

const WRAPPERS: Wrapper[] = ['browser', 'dark', 'none'];
function wrapperLabel(value: Wrapper, t: Copy): string {
  return value === 'browser' ? t.studio.wrapperBrowser : value === 'dark' ? t.studio.wrapperDark : t.studio.wrapperNone;
}

// Inspector başlık bilgisi (ikon + başlık + alt başlık) — seçime göre.
function shellMeta(kind: Selection['kind'], stepIndex: number, t: Copy): { icon: React.ReactNode; title: string; sub: string } {
  switch (kind) {
    case 'demo':
      return { icon: <LayoutTemplate className="h-4 w-4" />, title: t.studio.design, sub: t.studio.subDemo };
    case 'step':
      return { icon: <Frame className="h-4 w-4" />, title: t.studio.stepN(stepIndex + 1), sub: t.studio.subStep };
    case 'hotspot':
      return { icon: <MousePointerClick className="h-4 w-4" />, title: t.studio.hotspot, sub: t.studio.subHotspot };
    case 'callout':
      return { icon: <MessageSquare className="h-4 w-4" />, title: t.studio.callout, sub: t.studio.subCallout };
    case 'focus':
      return { icon: <Crosshair className="h-4 w-4" />, title: t.studio.focus, sub: t.studio.subFocus };
    case 'overlay':
      return { icon: <Type className="h-4 w-4" />, title: t.studio.text, sub: t.studio.subText };
  }
}

export function InspectorPanel({ open, onCollapse }: { open: boolean; onCollapse: () => void }) {
  const { t } = useT();
  const selection = useEditorStore((s) => s.selection);
  const stepIndex = useEditorStore((s) => s.stepIndex);
  const step = useEditorStore((s) => s.demo.steps[s.stepIndex]);
  const select = useEditorStore((s) => s.select);
  const meta = shellMeta(selection.kind, stepIndex, t);
  const isElement = ['hotspot', 'callout', 'focus', 'overlay'].includes(selection.kind);

  return (
    <aside
      className={cn(
        'panel-slide flex h-full flex-none flex-col overflow-hidden bg-surface',
        open ? 'w-[336px] border-l border-hairline' : 'w-0',
      )}
    >
      <div className="flex h-full w-[336px] flex-none flex-col">
        <div className="flex items-center gap-2.5 px-4 py-3">
          {isElement && (
            <button
              type="button"
              onClick={() => select({ kind: 'step' })}
              aria-label={t.studio.backToStep}
              className="flex h-6 w-6 items-center justify-center rounded-md text-ink-faint hover:bg-surface-subtle hover:text-ink"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          <span className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-accent-muted text-accent-strong">
            {meta.icon}
          </span>
          <div className="min-w-0 leading-tight">
            <div className="truncate text-[14.5px] font-bold text-ink">{meta.title}</div>
            <div className="text-[11.5px] text-ink-faint">{meta.sub}</div>
          </div>
          <div className="flex-1" />
          {selection.kind !== 'demo' && (
            <button
              type="button"
              onClick={() => select({ kind: 'demo' })}
              className="text-xs font-semibold text-accent-strong hover:underline"
            >
              {t.studio.design}
            </button>
          )}
          <button
            type="button"
            onClick={onCollapse}
            aria-label={t.studio.hidePanel}
            className="flex h-7 w-7 items-center justify-center rounded-md text-ink-faint hover:bg-surface-subtle hover:text-ink"
          >
            <PanelRightClose className="h-4 w-4" />
          </button>
        </div>
        <div className="h-px bg-hairline" />

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
          {selection.kind === 'demo' && <DemoEditor />}
          {selection.kind === 'step' && step && <StepEditor />}
          {selection.kind === 'hotspot' && step?.hotspot && <HotspotEditor />}
          {selection.kind === 'callout' && step?.callout && <CalloutEditor />}
          {selection.kind === 'focus' && step?.focus && <FocusEditor />}
          {selection.kind === 'overlay' && <OverlayEditor id={selection.id} />}
        </div>
      </div>
    </aside>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3 border-t border-hairline pt-4 first:border-0 first:pt-0">
      <span className="t-eyebrow block">{title}</span>
      {children}
    </div>
  );
}

function DemoEditor() {
  const { t } = useT();
  const demo = useEditorStore((st) => st.demo);
  const setTitle = useEditorStore((st) => st.setTitle);
  const setBg = useEditorStore((st) => st.setDemoBackground);
  const setWrapper = useEditorStore((st) => st.setWrapper);
  const wrapper = demo.wrapper ?? 'browser';
  return (
    <>
      <Section title={t.studio.secDemo}>
        <Field label={t.studio.title}>
          <TextInput value={demo.title} onChange={setTitle} />
        </Field>
      </Section>
      <Section title={t.studio.secFrame}>
        <div className="grid grid-cols-3 gap-2">
          {WRAPPERS.map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => setWrapper(w)}
              className={cn(
                'flex flex-col items-center gap-1.5 rounded-xl border p-2',
                wrapper === w ? 'border-accent ring-2 ring-accent-ring' : 'border-hairline hover:bg-surface-subtle',
              )}
            >
              <WrapperPreview value={w} />
              <span className="text-[11px] text-ink-muted">{wrapperLabel(w, t)}</span>
            </button>
          ))}
        </div>
      </Section>
      <Section title={t.studio.secBackground}>
        <div className="flex flex-wrap gap-2">
          {BACKGROUNDS.map((bg) => (
            <button
              key={bg}
              type="button"
              onClick={() => setBg(bg)}
              className={cn(
                'h-7 w-7 rounded-lg border border-black/10',
                demo.defaultBackground === bg && 'ring-2 ring-accent ring-offset-2 ring-offset-surface',
              )}
              style={{ background: bg }}
              aria-label={bg}
            />
          ))}
          <label className="relative h-7 w-7 cursor-pointer overflow-hidden rounded-lg border border-hairline">
            <span className="absolute inset-0 bg-[conic-gradient(from_0deg,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)]" />
            <input
              type="color"
              value="#ffffff"
              onChange={(e) => setBg(e.target.value)}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
          </label>
        </div>
        <p className="text-[11px] text-ink-faint">{t.studio.bgComingSoon}</p>
      </Section>
      <VariablesSection />
      <LeadFormSection />
    </>
  );
}

/** Anahtarı `{{key}}` token regex'ine uyacak şekilde temizler (harfle başlar, harf/rakam/_). */
function sanitizeKey(s: string): string {
  return s
    .replace(/[^a-zA-Z0-9_]/g, '')
    .replace(/^[^a-zA-Z]+/, '')
    .slice(0, 32);
}

/** Kişiselleştirme değişkenleri — callout/metinde `{{key}}`, oynatmada link/`default` ile çözülür. */
function VariablesSection() {
  const { t } = useT();
  const variables = useEditorStore((st) => st.demo.variables);
  const addVariable = useEditorStore((st) => st.addVariable);
  const updateVariable = useEditorStore((st) => st.updateVariable);
  const removeVariable = useEditorStore((st) => st.removeVariable);
  const rows = variables ?? [];

  return (
    <Section title={t.studio.secVariables}>
      <p className="text-[11px] leading-relaxed text-ink-faint">{t.studio.variablesHint}</p>
      {rows.length > 0 && (
        <div className="space-y-2.5">
          {rows.map((v, i) => (
            <div key={i} className="space-y-2 rounded-xl border border-hairline bg-surface-subtle p-2.5">
              <div className="flex items-center gap-1.5">
                <span className="select-none font-mono text-[11px] text-ink-faint">{'{{'}</span>
                <input
                  value={v.key}
                  onChange={(e) => updateVariable(i, { key: sanitizeKey(e.target.value) })}
                  placeholder="key"
                  className="h-7 w-full rounded-md border border-hairline bg-surface px-2 font-mono text-xs text-ink outline-none focus:border-accent-ring focus:ring-2 focus:ring-accent-ring"
                />
                <span className="select-none font-mono text-[11px] text-ink-faint">{'}}'}</span>
                <button
                  type="button"
                  onClick={() => removeVariable(i)}
                  aria-label={t.studio.varRemove}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-ink-faint hover:bg-danger-soft hover:text-danger"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <input
                value={v.label}
                onChange={(e) => updateVariable(i, { label: e.target.value })}
                placeholder={t.studio.varLabel}
                className="h-7 w-full rounded-md border border-hairline bg-surface px-2 text-xs text-ink outline-none focus:border-accent-ring focus:ring-2 focus:ring-accent-ring"
              />
              <input
                value={v.default ?? ''}
                onChange={(e) => updateVariable(i, { default: e.target.value })}
                placeholder={t.studio.varDefault}
                className="h-7 w-full rounded-md border border-hairline bg-surface px-2 text-xs text-ink outline-none focus:border-accent-ring focus:ring-2 focus:ring-accent-ring"
              />
            </div>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={addVariable}
        className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-accent-ring py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent-muted"
      >
        <Plus className="h-3.5 w-3.5" /> {t.studio.varAdd}
      </button>
    </Section>
  );
}

/** Lead yakalama formu — turdan önce/sonra e-posta toplama (Faz 3 satış/CRM). */
function LeadFormSection() {
  const { t } = useT();
  const leadForm = useEditorStore((st) => st.demo.leadForm);
  const setLeadForm = useEditorStore((st) => st.setLeadForm);
  const updateLeadForm = useEditorStore((st) => st.updateLeadForm);

  return (
    <Section title={t.studio.secLead}>
      <Toggle
        checked={!!leadForm}
        onChange={(on) => setLeadForm(on ? { position: 'end', collectName: true } : undefined)}
        label={t.studio.leadEnable}
      />
      {leadForm && (
        <>
          <Field label={t.studio.leadPosition}>
            <Segmented
              value={leadForm.position}
              onChange={(position) => updateLeadForm({ position })}
              options={[
                { value: 'start', label: t.studio.leadStart },
                { value: 'end', label: t.studio.leadEnd },
              ]}
            />
          </Field>
          <Field label={t.studio.leadHeadline}>
            <TextInput
              value={leadForm.headline ?? ''}
              onChange={(v) => updateLeadForm({ headline: v || undefined })}
              placeholder={t.lead.defaultHeadline}
            />
          </Field>
          <Field label={t.studio.leadDescription}>
            <TextInput
              value={leadForm.description ?? ''}
              onChange={(v) => updateLeadForm({ description: v || undefined })}
              placeholder={t.lead.defaultDescription}
            />
          </Field>
          <Toggle
            checked={!!leadForm.collectName}
            onChange={(v) => updateLeadForm({ collectName: v })}
            label={t.studio.leadCollectName}
          />
          <Toggle
            checked={!!leadForm.collectCompany}
            onChange={(v) => updateLeadForm({ collectCompany: v })}
            label={t.studio.leadCollectCompany}
          />
        </>
      )}
    </Section>
  );
}

function WrapperPreview({ value }: { value: Wrapper }) {
  if (value === 'none') return <div className="h-7 w-full rounded-md border border-hairline bg-surface-subtle" />;
  const dark = value === 'dark';
  return (
    <div className={cn('w-full overflow-hidden rounded-md border', dark ? 'border-black/30' : 'border-hairline')}>
      <div className={cn('flex items-center gap-0.5 px-1 py-0.5', dark ? 'bg-[#1B1B20]' : 'bg-surface-subtle')}>
        <span className="h-1 w-1 rounded-full bg-[#ff5f57]" />
        <span className="h-1 w-1 rounded-full bg-[#febc2e]" />
        <span className="h-1 w-1 rounded-full bg-[#28c840]" />
      </div>
      <div className="h-4 bg-surface" />
    </div>
  );
}

function StepEditor() {
  const { t } = useT();
  const demo = useEditorStore((st) => st.demo);
  const stepIndex = useEditorStore((st) => st.stepIndex);
  const setStepBackground = useEditorStore((st) => st.setStepBackground);
  const applyBackgroundToAll = useEditorStore((st) => st.applyBackgroundToAll);
  const select = useEditorStore((st) => st.select);
  const step = demo.steps[stepIndex];
  if (!step) return null;
  const inherited = step.background === undefined;
  return (
    <>
      <Section title={t.studio.secStepBg}>
        <ColorSwatches value={step.background ?? demo.defaultBackground} onChange={setStepBackground} />
        <button
          type="button"
          onClick={() => setStepBackground(undefined)}
          className={cn('text-xs', inherited ? 'text-accent-strong' : 'text-ink-faint hover:text-accent')}
        >
          {inherited ? t.studio.inheritOn : t.studio.inheritOff}
        </button>
        <ApplyAllButton onClick={applyBackgroundToAll} label={t.studio.applyBgAll} />
      </Section>
      <Section title={t.studio.secElements}>
        <p className="text-xs text-ink-faint">{t.studio.elementsHint}</p>
        <div className="space-y-1.5">
          {step.hotspot && <Row label={t.studio.hotspot} onClick={() => select({ kind: 'hotspot' })} />}
          {step.callout && <Row label={`${t.studio.callout} · ${step.callout.title ?? ''}`} onClick={() => select({ kind: 'callout' })} />}
          {step.focus && (
            <Row
              label={`${t.studio.focus} · ${Math.min(1 / step.focus.w, 1 / step.focus.h).toFixed(1)}×`}
              onClick={() => select({ kind: 'focus' })}
            />
          )}
          {step.textOverlays?.map((o) => (
            <Row key={o.id} label={`${t.studio.text} · ${o.text}`} onClick={() => select({ kind: 'overlay', id: o.id })} />
          ))}
          {!step.hotspot && !step.callout && !step.focus && !step.textOverlays?.length && (
            <p className="text-xs text-ink-faint">{t.studio.noElements}</p>
          )}
        </div>
      </Section>
    </>
  );
}

function HotspotEditor() {
  const { t } = useT();
  const h = useEditorStore((st) => st.demo.steps[st.stepIndex]?.hotspot);
  const setHotspot = useEditorStore((st) => st.setHotspot);
  const remove = useEditorStore((st) => st.removeHotspot);
  if (!h) return null;
  return (
    <Section title={t.studio.hotspot}>
      <Field label={t.studio.size}>
        <NumberField value={h.size ?? 14} min={8} max={48} icon={<Maximize2 className="h-3.5 w-3.5" />} onChange={(v) => setHotspot({ size: v })} />
      </Field>
      <Field label={t.studio.color}>
        <ColorSwatches value={h.color} onChange={(c) => setHotspot({ color: c })} />
      </Field>
      <ReadonlyPos x={h.x} y={h.y} />
      <RemoveButton label={t.studio.removeHotspot} onClick={remove} />
    </Section>
  );
}

function CalloutEditor() {
  const { t } = useT();
  const c = useEditorStore((st) => st.demo.steps[st.stepIndex]?.callout);
  const update = useEditorStore((st) => st.updateCallout);
  const updateStyle = useEditorStore((st) => st.updateCalloutStyle);
  const applyStyleToAll = useEditorStore((st) => st.applyCalloutStyleToAll);
  const remove = useEditorStore((st) => st.removeCallout);
  if (!c) return null;
  return (
    <>
      <Section title={t.studio.secContent}>
        <Field label={t.studio.title}>
          <TextInput value={c.title ?? ''} onChange={(v) => update({ title: v || undefined })} />
        </Field>
        <Field label={t.studio.description}>
          <TextArea value={c.body ?? ''} onChange={(v) => update({ body: v || undefined })} />
        </Field>
        <Field label={t.studio.arrowDir}>
          <PointerPicker value={c.pointer ?? 'bottom'} onChange={(v) => update({ pointer: v })} />
        </Field>
        <Toggle checked={c.showNext !== false} onChange={(v) => update({ showNext: v })} label={t.studio.nextBtn} />
        <Toggle checked={c.showBack !== false} onChange={(v) => update({ showBack: v })} label={t.studio.backBtn} />
      </Section>
      <Section title={t.studio.secSizeStyle}>
        <div className="grid grid-cols-2 gap-2">
          <NumberField value={c.width ?? 280} min={160} max={560} icon={<MoveHorizontal className="h-3.5 w-3.5" />} onChange={(v) => update({ width: v })} />
          <NumberField value={c.height ?? 0} min={0} max={420} icon={<MoveVertical className="h-3.5 w-3.5" />} onChange={(v) => update({ height: v || undefined })} />
          <NumberField value={c.style?.radius ?? 20} min={0} max={40} icon={<Frame className="h-3.5 w-3.5" />} onChange={(v) => updateStyle({ radius: v })} />
          <NumberField value={c.style?.borderWidth ?? 1} min={0} max={6} icon={<Square className="h-3.5 w-3.5" />} onChange={(v) => updateStyle({ borderWidth: v })} />
        </div>
        <Field label={t.studio.background}>
          <ColorSwatches value={c.style?.bg} onChange={(v) => updateStyle({ bg: v })} />
        </Field>
        <Field label={t.studio.borderColor}>
          <ColorSwatches value={c.style?.borderColor} onChange={(v) => updateStyle({ borderColor: v })} />
        </Field>
        <ApplyAllButton onClick={applyStyleToAll} label={t.studio.applyStyleAll} />
      </Section>
      <RemoveButton label={t.studio.removeCallout} onClick={remove} />
    </>
  );
}

function FocusEditor() {
  const { t } = useT();
  const f = useEditorStore((st) => st.demo.steps[st.stepIndex]?.focus);
  const setEase = useEditorStore((st) => st.setFocusEase);
  const applyEaseToAll = useEditorStore((st) => st.applyFocusEaseToAll);
  const remove = useEditorStore((st) => st.removeFocus);
  if (!f) return null;
  const scale = Math.min(1 / f.w, 1 / f.h);
  const easeOptions: { value: FocusEase; label: string }[] = [
    { value: 'gentle', label: t.studio.easeGentle },
    { value: 'quick', label: t.studio.easeQuick },
    { value: 'slow', label: t.studio.easeSlow },
  ];
  return (
    <Section title={t.studio.secFocusCam}>
      <Field label={t.studio.transition}>
        <Segmented<FocusEase> value={f.ease ?? 'gentle'} onChange={setEase} options={easeOptions} />
      </Field>
      <ApplyAllButton onClick={applyEaseToAll} label={t.studio.applyEaseAll} />
      <div className="flex items-center gap-3 rounded-xl border border-hairline bg-surface-subtle p-3.5">
        <span className="flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-accent-muted text-accent-strong">
          <Crosshair className="h-5 w-5" />
        </span>
        <div>
          <div className="t-mono text-[22px] font-bold leading-none text-ink">{scale.toFixed(1)}×</div>
          <div className="mt-1 text-[11.5px] text-ink-faint">
            {t.studio.zoomHint(Math.round(f.w * 100), Math.round(f.h * 100))}
          </div>
        </div>
      </div>
      <RemoveButton label={t.studio.removeFocus} onClick={remove} />
    </Section>
  );
}

function OverlayEditor({ id }: { id: string }) {
  const { t } = useT();
  const o = useEditorStore((st) => st.demo.steps[st.stepIndex]?.textOverlays?.find((tx) => tx.id === id));
  const update = useEditorStore((st) => st.updateOverlay);
  const updateStyle = useEditorStore((st) => st.updateOverlayStyle);
  const remove = useEditorStore((st) => st.removeOverlay);
  if (!o) return null;
  return (
    <>
      <Section title={t.studio.secText}>
        <Field label={t.studio.content}>
          <TextInput value={o.text} onChange={(v) => update(id, { text: v })} />
        </Field>
        <Field label={t.studio.size}>
          <Segmented<TextOverlaySize> value={o.size} onChange={(v) => update(id, { size: v })} options={SIZE_OPTIONS} />
        </Field>
        <Field label={t.studio.textColor}>
          <ColorSwatches value={o.color} onChange={(v) => update(id, { color: v })} />
        </Field>
      </Section>
      <Section title={t.studio.secBoxStyle}>
        <Field label={t.studio.cornerRadius}>
          <NumberField value={o.style?.radius ?? 8} min={0} max={24} icon={<Frame className="h-3.5 w-3.5" />} onChange={(v) => updateStyle(id, { radius: v })} />
        </Field>
        <Field label={t.studio.background}>
          <ColorSwatches value={o.style?.bg} onChange={(v) => updateStyle(id, { bg: v })} />
        </Field>
      </Section>
      <RemoveButton label={t.studio.removeText} onClick={() => remove(id)} />
    </>
  );
}

function Row({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center rounded-lg border border-hairline bg-surface-subtle px-3 py-2 text-left text-xs text-ink hover:border-accent-ring"
    >
      <span className="truncate">{label}</span>
    </button>
  );
}
