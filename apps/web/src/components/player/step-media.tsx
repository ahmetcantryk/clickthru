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

  return (
    <video
      src={step.media}
      className="h-full w-full bg-black object-cover"
      autoPlay
      muted
      playsInline
      controls
      onEnded={onAdvance}
      onError={onBroken}
      onTimeUpdate={(e) => {
        const el = e.currentTarget;
        if (el.duration > 0) setVideoProgress(el.currentTime / el.duration);
      }}
    />
  );
}
