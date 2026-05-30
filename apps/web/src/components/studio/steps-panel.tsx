'use client';

import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Copy, Download, EyeOff, MoreHorizontal, Pencil, Trash2, Upload } from 'lucide-react';
import { cn } from '@clickthru/ui';
import type { Step } from '@clickthru/schema';
import { useEditorStore } from '@/store/editor-store';
import { ImageGlyph, PlusGlyph, VideoGlyph } from './glyphs';

// Adım rozetleri: pasif #878b92, aktif #2142e7 — her ikisinde de içerik beyaz (ref: step.PNG).
const CHIP_ACTIVE = '#2142e7';
const CHIP_INACTIVE = '#878b92';

export function StepsPanel() {
  const steps = useEditorStore((s) => s.demo.steps);
  const addStepWithMedia = useEditorStore((s) => s.addStepWithMedia);
  const fileRef = useRef<HTMLInputElement>(null);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') addStepWithMedia(reader.result);
    };
    reader.readAsDataURL(f);
    e.target.value = '';
  }

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-hairline bg-surface">
      <div className="flex items-center justify-between px-4 py-3.5">
        <span className="text-sm font-semibold text-ink">Adımlar</span>
        <span className="text-xs text-ink-faint">{steps.length}</span>
      </div>

      <div className="flex flex-col overflow-y-auto px-4 pb-3">
        {steps.map((step, i) => (
          <div key={step.id}>
            <StepCard step={step} index={i} />
            <InsertButton index={i} />
          </div>
        ))}
        {steps.length === 0 && <p className="px-2 py-6 text-center text-xs text-ink-faint">Henüz adım yok.</p>}
      </div>

      <div className="mt-auto border-t border-hairline p-3">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-hairline py-2.5 text-sm font-medium text-ink-muted hover:border-accent-ring hover:text-accent"
        >
          <Upload className="h-4 w-4" />
          PC'den görsel ekle
        </button>
        <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
      </div>
    </aside>
  );
}

function InsertButton({ index }: { index: number }) {
  const insertStepAfter = useEditorStore((s) => s.insertStepAfter);
  return (
    // Ortadan geçen gri çizgi + üstünde her zaman görünür beyaz "+" düğmesi (ref: icon.html).
    <div className="relative flex h-8 items-center justify-center">
      <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-ink/15" />
      <button
        type="button"
        onClick={() => insertStepAfter(index)}
        aria-label="Araya adım ekle"
        className="relative z-10 flex h-5 w-5 items-center justify-center rounded-full bg-white text-ink-muted shadow-soft transition-colors hover:bg-surface-subtle hover:text-accent"
      >
        <PlusGlyph className="h-3 w-3" />
      </button>
    </div>
  );
}

function TypeIcon({ type, className }: { type: Step['type']; className?: string }) {
  return type === 'video' ? <VideoGlyph className={className} /> : <ImageGlyph className={className} />;
}

function StepCard({ step, index }: { step: Step; index: number }) {
  const stepIndex = useEditorStore((s) => s.stepIndex);
  const selectStep = useEditorStore((s) => s.selectStep);
  const active = index === stepIndex;

  // İçerik her zaman beyaz; sadece zemin değişir (pasif #878b92, aktif #2142e7).
  const chipStyle = { background: active ? CHIP_ACTIVE : CHIP_INACTIVE };

  return (
    <div
      onClick={() => selectStep(index)}
      className={cn(
        'group relative h-32 w-full cursor-pointer overflow-hidden rounded-xl border-2 bg-surface-subtle transition-colors',
        active ? 'border-accent' : 'border-hairline hover:border-ink/20',
      )}
    >
      {step.type === 'video' ? (
        <div className="flex h-full w-full items-center justify-center bg-black/80">
          <VideoGlyph className="h-6 w-6 text-white/80" />
        </div>
      ) : (
        // Skip edilen adım normal görünümünü korur (renk/opaklık bozulmaz); yalnızca rozet gösterilir.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={step.media} alt="" className="h-full w-full object-cover" />
      )}

      {step.skip && (
        <span className="absolute left-2 top-2 rounded-md bg-ink/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
          Atlandı
        </span>
      )}

      {/* sol alt: sıra numarası + tür */}
      <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
        <span
          className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white shadow-soft"
          style={chipStyle}
        >
          {index + 1}
        </span>
        <span
          className="flex h-7 w-7 items-center justify-center rounded-full text-white shadow-soft"
          style={chipStyle}
        >
          <TypeIcon type={step.type} className="h-3.5 w-3.5" />
        </span>
      </div>

      {/* sağ alt köşe: 3-nokta menüsü */}
      <div className="absolute bottom-2 right-2">
        <StepMenu index={index} step={step} />
      </div>
    </div>
  );
}

function StepMenu({ index, step }: { index: number; step: Step }) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const s = useEditorStore();

  function toggle(e: React.MouseEvent) {
    e.stopPropagation();
    if (pos) {
      setPos(null);
      return;
    }
    const r = btnRef.current?.getBoundingClientRect();
    if (r) setPos({ top: r.bottom + 6, left: Math.max(8, r.right - 176) });
  }

  function download() {
    const a = document.createElement('a');
    a.href = step.media;
    a.download = `${step.name ?? `adim-${index + 1}`}`;
    a.click();
  }

  const items = [
    {
      icon: <Pencil className="h-3.5 w-3.5" />,
      label: 'Yeniden adlandır',
      onClick: () => {
        const name = window.prompt('Adım adı', step.name ?? `Adım ${index + 1}`);
        if (name) s.renameStep(index, name);
      },
    },
    { icon: <Copy className="h-3.5 w-3.5" />, label: 'Çoğalt', onClick: () => s.duplicateStep(index) },
    { icon: <Download className="h-3.5 w-3.5" />, label: 'Görseli indir', onClick: download },
    {
      icon: <EyeOff className="h-3.5 w-3.5" />,
      label: step.skip ? 'Atlamayı kaldır' : 'Adımı atla',
      onClick: () => s.toggleSkip(index),
    },
    { icon: <Trash2 className="h-3.5 w-3.5" />, label: 'Sil', onClick: () => s.deleteStep(index), danger: true },
  ];

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-label="Adım menüsü"
        onClick={toggle}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-ink-muted shadow-soft hover:text-ink"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {pos &&
        createPortal(
          <>
            <div className="fixed inset-0 z-[60]" onClick={() => setPos(null)} />
            <div
              style={{ position: 'fixed', top: pos.top, left: pos.left }}
              className="z-[61] w-44 overflow-hidden rounded-xl border border-hairline bg-surface py-1 shadow-soft"
            >
              {items.map((it) => (
                <button
                  key={it.label}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPos(null);
                    it.onClick();
                  }}
                  className={cn(
                    'flex w-full items-center gap-2.5 px-3 py-1.5 text-left text-xs',
                    it.danger ? 'text-red-500 hover:bg-red-500/10' : 'text-ink hover:bg-surface-subtle',
                  )}
                >
                  {it.icon}
                  {it.label}
                </button>
              ))}
            </div>
          </>,
          document.body,
        )}
    </>
  );
}
