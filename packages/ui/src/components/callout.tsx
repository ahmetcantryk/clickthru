'use client';

import * as React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
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

/** #RRGGBB → düşük alfalı gölge rengi. */
function tintedShadow(bg?: string): string {
  if (bg && /^#[0-9a-fA-F]{6}$/.test(bg)) return `0 18px 44px -12px ${bg}66`;
  return '0 18px 44px -14px rgba(33,66,231,0.30)';
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
  const hasBg = !!style?.bg;
  const dark = isDarkColor(style?.bg);
  const cardStyle: React.CSSProperties = {
    width,
    height,
    borderRadius: style?.radius ?? 20,
    background: style?.bg,
    borderColor: style?.borderColor,
    borderWidth: hasBg && !style?.borderColor ? 0 : style?.borderWidth,
    boxShadow: tintedShadow(style?.bg),
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
        className={cn(
          'relative max-w-sm rounded-[20px] bg-surface p-4',
          !hasBg && 'border border-hairline',
        )}
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
          <div className="mt-3 flex items-center justify-between gap-2">
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                aria-label={backLabel}
                className={cn(
                  'inline-flex h-10 w-10 items-center justify-center rounded-full shadow-soft transition-colors',
                  dark
                    ? 'border border-white/50 bg-white/15 text-white hover:bg-white/25'
                    : 'border border-hairline bg-surface-subtle text-ink-muted hover:text-ink',
                )}
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            ) : (
              <span className="h-10 w-10" aria-hidden />
            )}
            {onNext && (
              <button
                type="button"
                onClick={onNext}
                aria-label={nextLabel}
                className={cn(
                  'relative inline-flex h-10 w-10 items-center justify-center rounded-full shadow-soft transition-colors',
                  dark ? 'bg-white text-accent hover:bg-white/90' : 'bg-accent text-white hover:brightness-110',
                )}
              >
                <span
                  className={cn(
                    'pointer-events-none absolute inset-0 rounded-full border-2 animate-pulse-soft',
                    dark ? 'border-white/70' : 'border-accent/50',
                  )}
                  aria-hidden
                />
                <ArrowRight className="relative h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
