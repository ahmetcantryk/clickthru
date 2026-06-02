'use client';

import * as React from 'react';
import { Crosshair, MessageSquare, MousePointerClick, Trash2, Type } from 'lucide-react';
import { cn } from '@clickthru/ui';
import { useEditorStore } from '@/store/editor-store';
import { useT } from '@/lib/i18n';

function DockButton({
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
  const { t } = useT();
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={disabled ? t.studio.already(label) : t.studio.add(label)}
      className={cn(
        'flex flex-col items-center gap-1 rounded-xl px-3 pb-1.5 pt-2 transition-colors disabled:cursor-not-allowed disabled:opacity-30',
        danger ? 'text-danger hover:bg-danger-soft' : 'text-ink-muted hover:bg-accent-muted hover:text-accent',
      )}
    >
      {icon}
      <span className="text-[10.5px] font-semibold">{label}</span>
    </button>
  );
}

/** Tuval altında yüzen ekleme dock'u — öğeleri ekle/sil (design AddDock). */
export function CanvasToolbar() {
  const { t } = useT();
  const step = useEditorStore((s) => s.demo.steps[s.stepIndex]);
  const total = useEditorStore((s) => s.demo.steps.length);
  const stepIndex = useEditorStore((s) => s.stepIndex);
  const s = useEditorStore();

  return (
    <div className="pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2">
      <div className="pointer-events-auto flex items-center gap-1 rounded-2xl border border-hairline bg-surface-elevated p-1.5 shadow-soft">
        <DockButton
          icon={<MousePointerClick className="h-[18px] w-[18px]" />}
          label={t.studio.hotspot}
          onClick={s.addHotspot}
          disabled={!step || !!step.hotspot}
        />
        <DockButton
          icon={<MessageSquare className="h-[18px] w-[18px]" />}
          label={t.studio.callout}
          onClick={s.addCallout}
          disabled={!step || !!step.callout}
        />
        <DockButton
          icon={<Type className="h-[18px] w-[18px]" />}
          label={t.studio.text}
          onClick={s.addOverlay}
          disabled={!step}
        />
        <DockButton
          icon={<Crosshair className="h-[18px] w-[18px]" />}
          label={t.studio.focus}
          onClick={s.addFocus}
          disabled={!step || !!step.focus}
        />
        <span className="mx-1 h-9 w-px bg-hairline" />
        <DockButton
          icon={<Trash2 className="h-[18px] w-[18px]" />}
          label={t.studio.delete}
          onClick={() => s.deleteStep(stepIndex)}
          disabled={total === 0}
          danger
        />
      </div>
    </div>
  );
}
