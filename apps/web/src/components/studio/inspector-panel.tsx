'use client';

import { ChevronLeft, Frame, Maximize2, MoveHorizontal, MoveVertical, Square } from 'lucide-react';
import { cn } from '@clickthru/ui';
import type { FocusEase, TextOverlaySize, Wrapper } from '@clickthru/schema';
import { useEditorStore } from '@/store/editor-store';
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

const WRAPPERS: { value: Wrapper; label: string }[] = [
  { value: 'browser', label: 'Browser' },
  { value: 'dark', label: 'Koyu' },
  { value: 'none', label: 'Yok' },
];

export function InspectorPanel() {
  const selection = useEditorStore((s) => s.selection);
  const step = useEditorStore((s) => s.demo.steps[s.stepIndex]);

  return (
    <aside className="flex w-80 shrink-0 flex-col gap-4 overflow-y-auto border-l border-hairline bg-surface p-4">
      <Header />
      {selection.kind === 'demo' && <DemoEditor />}
      {selection.kind === 'step' && step && <StepEditor />}
      {selection.kind === 'hotspot' && step?.hotspot && <HotspotEditor />}
      {selection.kind === 'callout' && step?.callout && <CalloutEditor />}
      {selection.kind === 'focus' && step?.focus && <FocusEditor />}
      {selection.kind === 'overlay' && <OverlayEditor id={selection.id} />}
    </aside>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3 border-t border-hairline pt-4 first:border-0 first:pt-0">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">{title}</span>
      {children}
    </div>
  );
}

function Header() {
  const selection = useEditorStore((s) => s.selection);
  const stepIndex = useEditorStore((s) => s.stepIndex);
  const select = useEditorStore((s) => s.select);
  const titles: Record<string, string> = {
    demo: 'Design',
    step: `Adım ${stepIndex + 1}`,
    hotspot: 'Hotspot',
    callout: 'Callout',
    focus: 'Focus',
    overlay: 'Metin',
  };
  const isElement = ['hotspot', 'callout', 'focus', 'overlay'].includes(selection.kind);
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {isElement && (
          <button type="button" onClick={() => select({ kind: 'step' })} aria-label="Adıma dön" className="text-ink-faint hover:text-ink">
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
        <span className="text-sm font-semibold text-ink">{titles[selection.kind]}</span>
      </div>
      {selection.kind !== 'demo' && (
        <button type="button" onClick={() => select({ kind: 'demo' })} className="text-xs text-ink-faint hover:text-accent">
          Design
        </button>
      )}
    </div>
  );
}

function DemoEditor() {
  const demo = useEditorStore((st) => st.demo);
  const setTitle = useEditorStore((st) => st.setTitle);
  const setBg = useEditorStore((st) => st.setDemoBackground);
  const setWrapper = useEditorStore((st) => st.setWrapper);
  const wrapper = demo.wrapper ?? 'browser';
  return (
    <>
      <Section title="Demo">
        <Field label="Başlık">
          <TextInput value={demo.title} onChange={setTitle} />
        </Field>
      </Section>
      <Section title="Wrapper">
        <div className="grid grid-cols-3 gap-2">
          {WRAPPERS.map((w) => (
            <button
              key={w.value}
              type="button"
              onClick={() => setWrapper(w.value)}
              className={cn(
                'flex flex-col items-center gap-1.5 rounded-xl border p-2',
                wrapper === w.value ? 'border-accent ring-2 ring-accent-ring' : 'border-hairline hover:bg-surface-subtle',
              )}
            >
              <WrapperPreview value={w.value} />
              <span className="text-[11px] text-ink-muted">{w.label}</span>
            </button>
          ))}
        </div>
      </Section>
      <Section title="Arka plan">
        <div className="flex flex-wrap gap-2">
          {BACKGROUNDS.map((bg) => (
            <button
              key={bg}
              type="button"
              onClick={() => setBg(bg)}
              className={cn(
                'h-7 w-7 rounded-lg border',
                demo.defaultBackground === bg ? 'ring-2 ring-accent ring-offset-1' : 'border-hairline',
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
        <p className="text-[11px] text-ink-faint">Animasyonlu &amp; PC görseli yakında.</p>
      </Section>
    </>
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
      <Section title="Adım arka planı">
        <ColorSwatches value={step.background ?? demo.defaultBackground} onChange={setStepBackground} />
        <button
          type="button"
          onClick={() => setStepBackground(undefined)}
          className={cn('text-xs', inherited ? 'text-accent' : 'text-ink-faint hover:text-accent')}
        >
          {inherited ? '✓ Demo arka planından miras' : 'Demo arka planına dön'}
        </button>
        <ApplyAllButton onClick={applyBackgroundToAll} label="Arka planı tümüne uygula" />
      </Section>
      <Section title="Öğeler">
        <p className="text-xs text-ink-faint">Üstteki araç çubuğundan ekle; düzenlemek için seç:</p>
        <div className="space-y-1.5">
          {step.hotspot && <Row label="Hotspot" onClick={() => select({ kind: 'hotspot' })} />}
          {step.callout && <Row label={`Callout · ${step.callout.title ?? ''}`} onClick={() => select({ kind: 'callout' })} />}
          {step.focus && (
            <Row
              label={`Focus · ${Math.min(1 / step.focus.w, 1 / step.focus.h).toFixed(1)}×`}
              onClick={() => select({ kind: 'focus' })}
            />
          )}
          {step.textOverlays?.map((o) => (
            <Row key={o.id} label={`Metin · ${o.text}`} onClick={() => select({ kind: 'overlay', id: o.id })} />
          ))}
          {!step.hotspot && !step.callout && !step.focus && !step.textOverlays?.length && (
            <p className="text-xs text-ink-faint">Henüz öğe yok.</p>
          )}
        </div>
      </Section>
    </>
  );
}

function HotspotEditor() {
  const h = useEditorStore((st) => st.demo.steps[st.stepIndex]?.hotspot);
  const setHotspot = useEditorStore((st) => st.setHotspot);
  const remove = useEditorStore((st) => st.removeHotspot);
  if (!h) return null;
  return (
    <Section title="Hotspot">
      <Field label="Boyut">
        <NumberField value={h.size ?? 14} min={8} max={48} icon={<Maximize2 className="h-3.5 w-3.5" />} onChange={(v) => setHotspot({ size: v })} />
      </Field>
      <Field label="Renk">
        <ColorSwatches value={h.color} onChange={(c) => setHotspot({ color: c })} />
      </Field>
      <ReadonlyPos x={h.x} y={h.y} />
      <RemoveButton label="Hotspot'u kaldır" onClick={remove} />
    </Section>
  );
}

function CalloutEditor() {
  const c = useEditorStore((st) => st.demo.steps[st.stepIndex]?.callout);
  const update = useEditorStore((st) => st.updateCallout);
  const updateStyle = useEditorStore((st) => st.updateCalloutStyle);
  const applyStyleToAll = useEditorStore((st) => st.applyCalloutStyleToAll);
  const remove = useEditorStore((st) => st.removeCallout);
  if (!c) return null;
  return (
    <>
      <Section title="İçerik">
        <Field label="Başlık">
          <TextInput value={c.title ?? ''} onChange={(v) => update({ title: v || undefined })} />
        </Field>
        <Field label="Açıklama">
          <TextArea value={c.body ?? ''} onChange={(v) => update({ body: v || undefined })} />
        </Field>
        <Field label="Ok yönü">
          <PointerPicker value={c.pointer ?? 'bottom'} onChange={(v) => update({ pointer: v })} />
        </Field>
        <Toggle checked={c.showNext !== false} onChange={(v) => update({ showNext: v })} label="“İleri” butonu" />
        <Toggle checked={c.showBack !== false} onChange={(v) => update({ showBack: v })} label="“Geri” butonu" />
      </Section>
      <Section title="Boyut & stil">
        <div className="grid grid-cols-2 gap-2">
          <NumberField value={c.width ?? 280} min={160} max={560} icon={<MoveHorizontal className="h-3.5 w-3.5" />} onChange={(v) => update({ width: v })} />
          <NumberField value={c.height ?? 0} min={0} max={420} icon={<MoveVertical className="h-3.5 w-3.5" />} onChange={(v) => update({ height: v || undefined })} />
          <NumberField value={c.style?.radius ?? 20} min={0} max={40} icon={<Frame className="h-3.5 w-3.5" />} onChange={(v) => updateStyle({ radius: v })} />
          <NumberField value={c.style?.borderWidth ?? 1} min={0} max={6} icon={<Square className="h-3.5 w-3.5" />} onChange={(v) => updateStyle({ borderWidth: v })} />
        </div>
        <Field label="Arka plan">
          <ColorSwatches value={c.style?.bg} onChange={(v) => updateStyle({ bg: v })} />
        </Field>
        <Field label="Kenarlık rengi">
          <ColorSwatches value={c.style?.borderColor} onChange={(v) => updateStyle({ borderColor: v })} />
        </Field>
        <ApplyAllButton onClick={applyStyleToAll} label="Stili tümüne uygula" />
      </Section>
      <RemoveButton label="Callout'u kaldır" onClick={remove} />
    </>
  );
}

const FOCUS_EASE_OPTIONS: { value: FocusEase; label: string }[] = [
  { value: 'gentle', label: 'Yumuşak' },
  { value: 'quick', label: 'Hızlı' },
  { value: 'slow', label: 'Yavaş' },
];

function FocusEditor() {
  const f = useEditorStore((st) => st.demo.steps[st.stepIndex]?.focus);
  const setEase = useEditorStore((st) => st.setFocusEase);
  const applyEaseToAll = useEditorStore((st) => st.applyFocusEaseToAll);
  const remove = useEditorStore((st) => st.removeFocus);
  if (!f) return null;
  const scale = Math.min(1 / f.w, 1 / f.h);
  return (
    <Section title="Focus (kamera)">
      <Field label="Geçiş (easing)">
        <Segmented<FocusEase> value={f.ease ?? 'gentle'} onChange={setEase} options={FOCUS_EASE_OPTIONS} />
      </Field>
      <ApplyAllButton onClick={applyEaseToAll} label="Geçişi tümüne uygula" />
      <p className="font-mono text-xs text-ink-faint">
        zoom {scale.toFixed(1)}× · {Math.round(f.w * 100)}×{Math.round(f.h * 100)}% — tuvalde dikdörtgeni taşı/boyutlandır
      </p>
      <RemoveButton label="Focus'u kaldır" onClick={remove} />
    </Section>
  );
}

function OverlayEditor({ id }: { id: string }) {
  const o = useEditorStore((st) => st.demo.steps[st.stepIndex]?.textOverlays?.find((t) => t.id === id));
  const update = useEditorStore((st) => st.updateOverlay);
  const updateStyle = useEditorStore((st) => st.updateOverlayStyle);
  const remove = useEditorStore((st) => st.removeOverlay);
  if (!o) return null;
  return (
    <>
      <Section title="Metin">
        <Field label="İçerik">
          <TextInput value={o.text} onChange={(v) => update(id, { text: v })} />
        </Field>
        <Field label="Boyut">
          <Segmented<TextOverlaySize> value={o.size} onChange={(v) => update(id, { size: v })} options={SIZE_OPTIONS} />
        </Field>
        <Field label="Metin rengi">
          <ColorSwatches value={o.color} onChange={(v) => update(id, { color: v })} />
        </Field>
      </Section>
      <Section title="Kutu stili">
        <Field label="Köşe yuvarlaklığı">
          <NumberField value={o.style?.radius ?? 8} min={0} max={24} icon={<Frame className="h-3.5 w-3.5" />} onChange={(v) => updateStyle(id, { radius: v })} />
        </Field>
        <Field label="Arka plan">
          <ColorSwatches value={o.style?.bg} onChange={(v) => updateStyle(id, { bg: v })} />
        </Field>
      </Section>
      <RemoveButton label="Metni kaldır" onClick={() => remove(id)} />
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
