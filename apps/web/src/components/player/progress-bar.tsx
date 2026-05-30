'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@clickthru/ui';
import type { Step } from '@clickthru/schema';
import { usePlayerStore } from '@/store/player-store';

/**
 * Geniş segmentli ilerleme çubuğu. Geçmiş/aktif segment dolu.
 * Aktif VIDEO segmenti soldan sağa video süresince dolar (Stories tarzı).
 */
export function ProgressBar({ steps }: { steps: Step[] }) {
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
    <div className="flex items-center gap-3 px-2">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 shrink-0"
        onClick={prev}
        disabled={index <= 0}
        aria-label="Geri"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex flex-1 items-center gap-1.5">
        {steps.map((s, i) => (
          <button
            key={s.id}
            type="button"
            aria-label={`Adım ${i + 1}`}
            onClick={() => goTo(i)}
            className="relative h-2 flex-1 overflow-hidden rounded-full bg-ink/10"
          >
            <span
              className="absolute inset-y-0 left-0 rounded-full bg-accent-grad transition-[width] duration-200 ease-linear"
              style={{ width: `${fill(i, s)}%` }}
            />
          </button>
        ))}
      </div>

      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 shrink-0"
        onClick={next}
        disabled={index >= total - 1}
        aria-label="İleri"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
