'use client';

import * as React from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '../lib/cn';

export type CalloutPointer = 'top' | 'bottom' | 'left' | 'right' | 'none';

export interface CalloutStyle {
  radius?: number;
  bg?: string;
  borderColor?: string;
  borderWidth?: number;
}

export interface CalloutProps {
  x: number;
  y: number;
  pointer?: CalloutPointer;
  title?: string;
  body?: string;
  width?: number;
  height?: number;
  style?: CalloutStyle;
  onNext?: () => void;
  onBack?: () => void;
  nextLabel?: string;
  backLabel?: string;
  className?: string;
}

const cardPlacement: Record<CalloutPointer, string> = {
  bottom: '-translate-x-1/2 mt-3',
  top: '-translate-x-1/2 -translate-y-full -mt-3',
  left: '-translate-x-full -translate-y-1/2 -ml-3',
  right: '-translate-y-1/2 ml-3',
  none: '-translate-x-1/2 mt-3',
};

// Yumuşak üçgen nub — kartın anchor'a bakan kenarından çıkar (kenarlıksız, merge).
const nubPlacement: Record<CalloutPointer, React.CSSProperties> = {
  bottom: { top: -6, left: '50%', marginLeft: -7 },
  top: { bottom: -6, left: '50%', marginLeft: -7 },
  left: { right: -6, top: '50%', marginTop: -7 },
  right: { left: -6, top: '50%', marginTop: -7 },
  none: { display: 'none' },
};

const HEX6 = /^#[0-9a-fA-F]{6}$/;

/** Callout gölgesi — kendi rengine (bg) tonlanmış renkli halo + nötr yumuşak taban. */
export function calloutShadow(bg?: string): string {
  const base = '0 8px 22px -10px rgba(15,17,40,0.22)';
  if (bg && HEX6.test(bg)) return `0 20px 46px -12px ${bg}5C, ${base}`;
  return base;
}

/** Callout kenarlığı — bg'nin biraz koyu tonu (ilgili renkte tanımlı çerçeve). */
export function calloutBorder(bg?: string): string {
  if (bg && HEX6.test(bg)) return `color-mix(in srgb, ${bg}, #0B0B12 16%)`;
  return 'rgba(15,15,30,0.10)';
}

/** #RRGGBB koyu mu? (mavi/koyu callout zemininde metni beyaza çevirmek için). */
export function isDarkColor(color?: string): boolean {
  if (!color || !/^#[0-9a-fA-F]{6}$/.test(color)) return false;
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.6;
}

/** Yumuşak başlık/açıklama kartı + yumuşak üçgen pointer + renge yakın gölge (callout.png). */
export function Callout({
  x,
  y,
  pointer = 'bottom',
  title,
  body,
  width,
  height,
  style,
  onNext,
  onBack,
  nextLabel = 'İleri',
  backLabel = 'Geri',
  className,
}: CalloutProps) {
  const dark = isDarkColor(style?.bg);
  const cardStyle: React.CSSProperties = {
    width,
    height,
    borderRadius: style?.radius ?? 20,
    background: style?.bg,
    // Kenarlık + gölge daima callout'un kendi rengine tonlanır (kullanıcı borderColor verirse o öncelikli).
    borderColor: style?.borderColor ?? calloutBorder(style?.bg),
    borderWidth: style?.borderWidth ?? 1,
    boxShadow: calloutShadow(style?.bg),
  };
  const nubStyle: React.CSSProperties = {
    ...nubPlacement[pointer],
    background: style?.bg ?? 'var(--callout-nub, #FFFFFF)',
  };

  return (
    <div
      className={cn('pointer-events-auto absolute z-40', cardPlacement[pointer], className)}
      style={{ left: `${x * 100}%`, top: `${y * 100}%` }}
    >
      <div
        className={cn('relative max-w-sm rounded-[20px] border bg-surface p-4')}
        style={cardStyle}
      >
        <span className="absolute h-3.5 w-3.5 rotate-45 rounded-[4px] bg-surface" style={nubStyle} aria-hidden />
        {title && (
          <p className="text-sm font-semibold text-ink" style={dark ? { color: '#FFFFFF' } : undefined}>
            {title}
          </p>
        )}
        {body && (
          <p
            className={cn('text-sm text-ink-muted', title && 'mt-1')}
            style={dark ? { color: 'rgba(255,255,255,0.85)' } : undefined}
          >
            {body}
          </p>
        )}
        {(onBack || onNext) && (
          <div className="mt-3.5 flex items-center gap-2">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className={cn(
                  'cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors',
                  dark
                    ? 'border-white/25 bg-white/10 text-white/85 hover:bg-white/20'
                    : 'border-hairline bg-surface-subtle text-ink-muted hover:text-ink',
                )}
              >
                {backLabel}
              </button>
            )}
            <div className="flex-1" />
            {onNext && (
              <button
                type="button"
                onClick={onNext}
                className={cn(
                  'inline-flex cursor-pointer items-center gap-1 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-[filter]',
                  dark ? 'bg-white text-accent' : 'bg-accent text-white hover:brightness-110',
                )}
              >
                {nextLabel}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
