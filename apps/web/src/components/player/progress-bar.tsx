'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Step } from '@clickthru/schema';
import { usePlayerStore } from '@/store/player-store';
import { useT } from '@/lib/i18n';

/**
 * Yüzen koyu cam kontrol dock'u (design player).
 * Geniş segmentli ilerleme: geçmiş/aktif dolu; aktif VIDEO segmenti süreyle dolar.
 */
export function ProgressBar({ steps }: { steps: Step[] }) {
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

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-[rgba(18,20,28,0.72)] px-4 py-3.5 shadow-[0_16px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl">
      <button
        type="button"
        onClick={prev}
        disabled={index <= 0}
        aria-label={t.studio.back}
        className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-white/10 text-white transition-colors hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div className="flex flex-1 items-center gap-1.5">
        {steps.map((s, i) => (
          <button
            key={s.id}
            type="button"
            aria-label={t.studio.stepN(i + 1)}
            onClick={() => goTo(i)}
            className="relative h-1 flex-1 overflow-hidden rounded-full bg-white/20"
            style={{ flexGrow: s.type === 'video' ? 1.6 : 1 }}
          >
            <span
              className="absolute inset-y-0 left-0 rounded-full bg-white transition-[width] duration-200 ease-linear"
              style={{ width: `${fill(i, s)}%` }}
            />
          </button>
        ))}
      </div>

      <span className="flex-none font-mono text-xs font-semibold tabular-nums text-white/70">
        {Math.min(index + 1, total)} / {total}
      </span>

      <button
        type="button"
        onClick={next}
        disabled={index >= total - 1}
        aria-label={t.studio.next}
        className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-accent text-white transition-[filter] hover:brightness-110 disabled:opacity-30"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
