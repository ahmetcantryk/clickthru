'use client';

import * as React from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Ban } from 'lucide-react';
import { cn } from '@clickthru/ui';
import type { CalloutPointer } from '@clickthru/schema';

/** Segment kontrol — native dropdown yerine şık, ikon/etiketli. */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label?: string; icon?: React.ReactNode; title?: string }[];
}) {
  return (
    <div className="flex rounded-lg border border-hairline bg-surface-subtle p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          title={o.title}
          onClick={() => onChange(o.value)}
          className={cn(
            'flex flex-1 items-center justify-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors',
            value === o.value ? 'bg-surface text-ink shadow-soft' : 'text-ink-muted hover:text-ink',
          )}
        >
          {o.icon}
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Callout pointer yön seçici — yorum kutusu üçgen yönü (yok/üst/alt/sol/sağ). */
export function PointerPicker({
  value,
  onChange,
}: {
  value: CalloutPointer;
  onChange: (v: CalloutPointer) => void;
}) {
  return (
    <Segmented<CalloutPointer>
      value={value}
      onChange={onChange}
      options={[
        { value: 'none', icon: <Ban className="h-3.5 w-3.5" />, title: 'Yok' },
        { value: 'top', icon: <ArrowUp className="h-3.5 w-3.5" />, title: 'Üst' },
        { value: 'bottom', icon: <ArrowDown className="h-3.5 w-3.5" />, title: 'Alt' },
        { value: 'left', icon: <ArrowLeft className="h-3.5 w-3.5" />, title: 'Sol' },
        { value: 'right', icon: <ArrowRight className="h-3.5 w-3.5" />, title: 'Sağ' },
      ]}
    />
  );
}

const PALETTE = ['#2142E7', '#6D5BF5', '#0B0B12', '#FFFFFF', '#22C55E', '#F59E0B', '#EF4444'];

/** Renk paleti + özel renk — on-brand swatch'lar. */
export function ColorSwatches({
  value,
  onChange,
}: {
  value?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {PALETTE.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className={cn(
            'h-6 w-6 rounded-full border',
            value?.toLowerCase() === c.toLowerCase() ? 'ring-2 ring-accent ring-offset-1' : 'border-hairline',
          )}
          style={{ background: c }}
          aria-label={c}
        />
      ))}
      <label className="relative h-6 w-6 cursor-pointer overflow-hidden rounded-full border border-hairline">
        <span className="absolute inset-0 bg-[conic-gradient(from_0deg,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)]" />
        <input
          type="color"
          value={value ?? '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      </label>
    </div>
  );
}
