'use client';

import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Copy,
  Download,
  EyeOff,
  GripVertical,
  MoreHorizontal,
  PanelLeftClose,
  Pencil,
  Trash2,
  Upload,
} from 'lucide-react';
import { cn } from '@clickthru/ui';
import type { Step } from '@clickthru/schema';
import { useEditorStore } from '@/store/editor-store';
import { ImageGlyph, PlusGlyph, VideoGlyph } from './glyphs';

export function StepsPanel({ open, onCollapse }: { open: boolean; onCollapse: () => void }) {
  const steps = useEditorStore((s) => s.demo.steps);
  const addStepWithMedia = useEditorStore((s) => s.addStepWithMedia);
  const reorderStep = useEditorStore((s) => s.reorderStep);
  const fileRef = useRef<HTMLInputElement>(null);

  // Sürükle-bırak durumu (sıralama).
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

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

  function endDrag() {
    if (dragIndex !== null && overIndex !== null && dragIndex !== overIndex) {
      reorderStep(dragIndex, overIndex);
    }
    setDragIndex(null);
    setOverIndex(null);
  }

  return (
    <aside
      className={cn(
        'panel-slide flex h-full flex-none flex-col overflow-hidden bg-surface',
        open ? 'w-[264px] border-r border-hairline' : 'w-0',
      )}
    >
      <div className="flex h-full w-[264px] flex-none flex-col">
        <div className="flex items-center gap-2 px-4 py-3.5">
          <span className="t-eyebrow">Adımlar</span>
          <span className="rounded-md bg-surface-raised px-1.5 py-0.5 text-[11px] font-semibold text-ink-muted">
            {steps.length}
          </span>
          <div className="flex-1" />
          <button
            type="button"
            onClick={onCollapse}
            aria-label="Paneli gizle"
            className="flex h-7 w-7 items-center justify-center rounded-md text-ink-faint hover:bg-surface-subtle hover:text-ink"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>
        <div className="h-px bg-hairline" />

        <div className="flex flex-1 flex-col overflow-y-auto px-4 py-3">
          {steps.map((step, i) => (
            <div key={step.id}>
              <StepCard
                step={step}
                index={i}
                isDragging={dragIndex === i}
                isOver={overIndex === i && dragIndex !== null && dragIndex !== i}
                onDragStart={() => setDragIndex(i)}
                onDragEnter={() => dragIndex !== null && setOverIndex(i)}
                onDrop={endDrag}
                onDragEnd={endDrag}
              />
              {i < steps.length - 1 && <InsertButton index={i} />}
            </div>
          ))}
          {steps.length === 0 && <p className="px-2 py-6 text-center text-xs text-ink-faint">Henüz adım yok.</p>}
        </div>

        <div className="h-px bg-hairline" />
        <div className="p-3.5">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-hairline-strong bg-surface-subtle py-2.5 text-sm font-semibold text-ink-muted transition-colors hover:border-accent-ring hover:bg-accent-muted hover:text-accent"
          >
            <Upload className="h-4 w-4" />
            PC'den görsel ekle
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
        </div>
      </div>
    </aside>
  );
}

function InsertButton({ index }: { index: number }) {
  const insertStepAfter = useEditorStore((s) => s.insertStepAfter);
  return (
    // Ortadan geçen gri çizgi + üstünde her zaman görünür "+" düğmesi (§10).
    <div className="relative flex h-7 items-center justify-center">
      <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-hairline" />
      <button
        type="button"
        onClick={() => insertStepAfter(index)}
        aria-label="Araya adım ekle"
        className="relative z-10 flex h-5 w-5 items-center justify-center rounded-full border border-hairline bg-surface-elevated text-ink-muted shadow-soft-sm transition-colors hover:border-accent-ring hover:text-accent"
      >
        <PlusGlyph className="h-3 w-3" />
      </button>
    </div>
  );
}

function TypeChip({ type }: { type: Step['type'] }) {
  return (
    <span className="flex items-center gap-1 rounded-md bg-surface-raised px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
      {type === 'video' ? <VideoGlyph className="h-3 w-3" /> : <ImageGlyph className="h-3 w-3" />}
      {type === 'video' ? 'Video' : 'Görsel'}
    </span>
  );
}

function StepCard({
  step,
  index,
  isDragging,
  isOver,
  onDragStart,
  onDragEnter,
  onDrop,
  onDragEnd,
}: {
  step: Step;
  index: number;
  isDragging: boolean;
  isOver: boolean;
  onDragStart: () => void;
  onDragEnter: () => void;
  onDrop: () => void;
  onDragEnd: () => void;
}) {
  const stepIndex = useEditorStore((s) => s.stepIndex);
  const selectStep = useEditorStore((s) => s.selectStep);
  const active = index === stepIndex;
  const title = step.name ?? `Adım ${index + 1}`;

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', String(index));
        onDragStart();
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      }}
      onDragEnter={onDragEnter}
      onDrop={(e) => {
        e.preventDefault();
        onDrop();
      }}
      onDragEnd={onDragEnd}
      onClick={() => selectStep(index)}
      className={cn(
        'group relative cursor-grab rounded-xl border p-[7px] transition-colors active:cursor-grabbing',
        active ? 'border-accent-ring bg-accent-muted' : 'border-transparent hover:bg-surface-subtle',
        isDragging && 'opacity-40',
        isOver && 'ring-2 ring-accent',
      )}
    >
      {/* bırakma göstergesi */}
      {isOver && <div className="absolute -top-1 left-1 right-1 z-10 h-0.5 rounded-full bg-accent" />}

      <div className="relative overflow-hidden rounded-lg border border-hairline">
        {step.type === 'video' ? (
          <div className="flex aspect-video w-full items-center justify-center bg-ink/80">
            <VideoGlyph className="h-6 w-6 text-white/80" />
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={step.media} alt="" draggable={false} className="aspect-video w-full object-cover" />
        )}

        <span
          className={cn(
            'absolute left-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-md font-mono text-[11px] font-semibold text-white',
            active ? 'bg-accent' : 'bg-ink/70',
          )}
        >
          {index + 1}
        </span>

        {step.skip && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="rounded-md bg-ink/75 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
              Atlandı
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 px-1 pb-0.5 pt-2">
        <GripVertical className="h-3.5 w-3.5 flex-none text-ink-faint opacity-0 transition-opacity group-hover:opacity-100" />
        <TypeChip type={step.type} />
        <span className={cn('flex-1 truncate text-xs font-semibold', active ? 'text-ink' : 'text-ink-muted')}>
          {title}
        </span>
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
    if (r) setPos({ top: r.bottom + 6, left: Math.max(8, r.right - 196) });
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
        className="flex h-6 w-6 flex-none items-center justify-center rounded-md text-ink-faint opacity-60 transition-opacity hover:bg-surface-raised hover:text-ink group-hover:opacity-100"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {pos &&
        createPortal(
          <>
            <div className="fixed inset-0 z-[60]" onClick={() => setPos(null)} />
            <div
              style={{ position: 'fixed', top: pos.top, left: pos.left }}
              className="z-[61] w-48 overflow-hidden rounded-xl border border-hairline bg-surface-elevated p-1.5 shadow-soft"
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
                    'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium',
                    it.danger ? 'text-danger hover:bg-danger-soft' : 'text-ink hover:bg-surface-subtle',
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
