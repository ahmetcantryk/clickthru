'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@clickthru/ui';
import type { Step } from '@clickthru/schema';
import { usePlayerStore } from '@/store/player-store';
import { useT } from '@/lib/i18n';

/**
 * Yüzen koyu cam kontrol dock'u (design player).
 * Geniş segmentli ilerleme: geçmiş/aktif dolu; aktif VIDEO segmenti süreyle dolar.
 * `compact` = önizleme için daha küçük/minimal dock.
 */
export function ProgressBar({ steps, compact = false }: { steps: Step[]; compact?: boolean }) {
  const { t } = useT();
  const index = usePlayerStore((s) => s.index);
  const next = usePlayerStore((s) => s.next);
  const prev = usePlayerStore((s) => s.prev);
  const goTo = usePlayerStore((s) => s.goTo);
  const videoProgress = usePlayerStore((s) => s.videoProgress);
  const total = steps.length;

  function fill(i: number, step: Step): number {
    if (i < index) return 100;
    if (i > index) return 0;
    if (step.type === 'video') return videoProgress * 100;
    return 100;
  }

  const btn = cn(
    'flex flex-none items-center justify-center rounded-lg transition-colors',
    compact ? 'h-7 w-7' : 'h-9 w-9',
  );
  const icon = compact ? 'h-3.5 w-3.5' : 'h-4 w-4';

  return (
    <div
      className={cn(
        'flex items-center rounded-2xl border border-white/10 bg-[rgba(18,20,28,0.72)] shadow-[0_16px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl',
        compact ? 'gap-2.5 px-2.5 py-2' : 'gap-4 px-4 py-3.5',
      )}
    >
      <button
        type="button"
        onClick={prev}
        disabled={index <= 0}
        aria-label={t.studio.back}
        className={cn(btn, 'bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10')}
      >
        <ChevronLeft className={icon} />
      </button>

      <div className={cn('flex flex-1 items-center', compact ? 'gap-1' : 'gap-1.5')}>
        {steps.map((s, i) => (
          <button
            key={s.id}
            type="button"
            aria-label={t.studio.stepN(i + 1)}
            onClick={() => goTo(i)}
            className={cn('relative flex-1 overflow-hidden rounded-full bg-white/20', compact ? 'h-[3px]' : 'h-1')}
            style={{ flexGrow: s.type === 'video' ? 1.6 : 1 }}
          >
            <span
              className="absolute inset-y-0 left-0 rounded-full bg-white transition-[width] duration-200 ease-linear"
              style={{ width: `${fill(i, s)}%` }}
            />
          </button>
        ))}
      </div>

      <span
        className={cn(
          'flex-none font-mono font-semibold tabular-nums text-white/70',
          compact ? 'text-[10.5px]' : 'text-xs',
        )}
      >
        {Math.min(index + 1, total)} / {total}
      </span>

      <button
        type="button"
        onClick={next}
        disabled={index >= total - 1}
        aria-label={t.studio.next}
        className={cn(btn, 'bg-accent text-white transition-[filter] hover:brightness-110 disabled:opacity-30')}
      >
        <ChevronRight className={icon} />
      </button>
    </div>
  );
}
