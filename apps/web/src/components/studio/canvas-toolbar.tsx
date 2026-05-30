'use client';

import * as React from 'react';
import { Crosshair, MessageSquare, MousePointerClick, Trash2, Type } from 'lucide-react';
import { cn } from '@clickthru/ui';
import { useEditorStore } from '@/store/editor-store';

function ToolBtn({
  icon,
  label,
  onClick,
  disabled,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={cn(
        'flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-30',
        danger ? 'text-red-500 hover:bg-red-500/10' : 'text-ink-muted hover:bg-accent-muted hover:text-accent',
      )}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

/** Tuval üstü araç çubuğu — öğeleri kolayca ekle/yönet (ikonlu). */
export function CanvasToolbar() {
  const step = useEditorStore((s) => s.demo.steps[s.stepIndex]);
  const total = useEditorStore((s) => s.demo.steps.length);
  const stepIndex = useEditorStore((s) => s.stepIndex);
  const s = useEditorStore();

  return (
    <div className="flex items-center gap-1 self-center rounded-2xl border border-hairline bg-surface p-1.5 shadow-soft">
      <ToolBtn
        icon={<MousePointerClick className="h-4 w-4" />}
        label="Hotspot"
        onClick={s.addHotspot}
        disabled={!step || !!step.hotspot}
      />
      <ToolBtn
        icon={<MessageSquare className="h-4 w-4" />}
        label="Callout"
        onClick={s.addCallout}
        disabled={!step || !!step.callout}
      />
      <ToolBtn icon={<Type className="h-4 w-4" />} label="Metin" onClick={s.addOverlay} disabled={!step} />
      <ToolBtn
        icon={<Crosshair className="h-4 w-4" />}
        label="Focus"
        onClick={s.addFocus}
        disabled={!step || !!step.focus}
      />
      <div className="mx-1 h-5 w-px bg-hairline" />
      <ToolBtn
        icon={<Trash2 className="h-4 w-4" />}
        label="Adımı sil"
        onClick={() => s.deleteStep(stepIndex)}
        disabled={total === 0}
        danger
      />
    </div>
  );
}
