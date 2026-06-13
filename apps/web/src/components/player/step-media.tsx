'use client';

import { useState } from 'react';
import type { Step } from '@clickthru/schema';
import { usePlayerStore } from '@/store/player-store';
import { BrokenMedia } from './broken-media';

/**
 * Adımın medyası — type'a göre dal (CLAUDE.md §5).
 * Kamera transform'u dışarıda (Player) uygulanır; burada medya viewport'u doldurur.
 */
export function StepMedia({ step, onAdvance }: { step: Step; onAdvance: () => void }) {
  const [broken, setBroken] = useState(false);

  if (broken) return <BrokenMedia />;

  if (step.type === 'video') {
    return <VideoMedia step={step} onAdvance={onAdvance} onBroken={() => setBroken(true)} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={step.media}
      alt=""
      className="h-full w-full object-cover"
      draggable={false}
      onError={() => setBroken(true)}
    />
  );
}

function VideoMedia({
  step,
  onAdvance,
  onBroken,
}: {
  step: Step;
  onAdvance: () => void;
  onBroken: () => void;
}) {
  const setVideoProgress = usePlayerStore((s) => s.setVideoProgress);
  const clipStart = step.clipStart ?? 0;
  const clipEnd = step.clipEnd;

  return (
    <video
      src={step.media}
      poster={step.poster}
      className="h-full w-full bg-black object-cover"
      autoPlay
      muted
      playsInline
      onLoadedMetadata={(e) => {
        // Segment ise başlangıç noktasına seek et (tek video, çok adım).
        if (clipStart > 0) e.currentTarget.currentTime = clipStart;
      }}
      onEnded={onAdvance}
      onError={onBroken}
      onTimeUpdate={(e) => {
        const el = e.currentTarget;
        const end = clipEnd ?? el.duration;
        const span = Math.max(0.01, end - clipStart);
        setVideoProgress(Math.min(1, Math.max(0, (el.currentTime - clipStart) / span)));
        // Segment sonuna gelince adımı ilerlet (clipEnd verilmişse).
        if (clipEnd != null && el.currentTime >= clipEnd) {
          el.pause();
          onAdvance();
        }
      }}
    />
  );
}
