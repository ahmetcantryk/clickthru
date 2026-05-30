'use client';

import * as React from 'react';
import { Check, Layers } from 'lucide-react';
import { cn } from '@clickthru/ui';

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-ink-muted">{label}</label>
      {children}
    </div>
  );
}

const inputBase =
  'w-full rounded-lg border border-hairline bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent-ring focus:ring-2 focus:ring-accent-ring';

export function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      className={cn(inputBase, 'h-9')}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function TextArea({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <textarea
      className={cn(inputBase, 'min-h-[72px] resize-none')}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function ColorField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-10 shrink-0 cursor-pointer rounded-lg border border-hairline bg-surface"
      />
      <input className={cn(inputBase, 'h-9 font-mono text-xs')} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

export function SelectField<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <select className={cn(inputBase, 'h-9')} value={value} onChange={(e) => onChange(e.target.value as T)}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between rounded-lg border border-hairline bg-surface px-3 py-2 text-sm text-ink"
    >
      {label}
      <span className={cn('relative h-5 w-9 rounded-full transition-colors', checked ? 'bg-accent' : 'bg-ink/20')}>
        <span
          className={cn(
            'absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all',
            checked ? 'left-[18px]' : 'left-0.5',
          )}
        />
      </span>
    </button>
  );
}

export function Range({
  value,
  min,
  max,
  step,
  onChange,
  suffix = '',
  decimals = 1,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  suffix?: string;
  decimals?: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 flex-1 cursor-pointer accent-accent"
      />
      <span className="w-12 text-right font-mono text-xs text-ink-muted">
        {value.toFixed(decimals)}
        {suffix}
      </span>
    </div>
  );
}

/** Figma tarzı sayısal input — ikon + değer + birim (slider değil). */
export function NumberField({
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix = 'px',
  icon,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex h-9 items-center gap-2 rounded-lg border border-hairline bg-surface px-2.5 focus-within:border-accent-ring focus-within:ring-2 focus-within:ring-accent-ring">
      {icon && <span className="shrink-0 text-ink-faint">{icon}</span>}
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (Number.isNaN(n)) return;
          const clamped = Math.min(max ?? Infinity, Math.max(min ?? -Infinity, n));
          onChange(clamped);
        }}
        className="w-full bg-transparent text-sm tabular-nums text-ink outline-none"
      />
      <span className="shrink-0 text-xs text-ink-faint">{suffix}</span>
    </div>
  );
}

export function RemoveButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-2 rounded-lg border border-hairline py-2 text-sm text-red-500 hover:bg-red-500/5"
    >
      {label}
    </button>
  );
}

/** "Tümüne uygula" — aktif adımdaki ayarı tüm adımlara yayar; tıklayınca kısa süreli ✓ onayı verir. */
export function ApplyAllButton({ onClick, label = 'Tümüne uygula' }: { onClick: () => void; label?: string }) {
  const [done, setDone] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined);

  React.useEffect(() => () => clearTimeout(timer.current), []);

  function handleClick() {
    onClick();
    setDone(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setDone(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'flex w-full items-center justify-center gap-1.5 rounded-lg border py-1.5 text-xs font-medium transition-colors',
        done
          ? 'border-solid border-accent bg-accent text-white'
          : 'border-dashed border-accent-ring text-accent hover:bg-accent-muted',
      )}
    >
      {done ? <Check className="h-3.5 w-3.5" /> : <Layers className="h-3.5 w-3.5" />}
      {done ? 'Tümüne uygulandı' : label}
    </button>
  );
}

export function ReadonlyPos({ x, y }: { x: number; y: number }) {
  return (
    <p className="font-mono text-xs text-ink-faint">
      x {x.toFixed(2)} · y {y.toFixed(2)} — tuvalde sürükleyerek taşı
    </p>
  );
}
