'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BrowserFrame, ScreenScene } from '@clickthru/ui';
import type { Demo } from '@clickthru/schema';
import { usePlayerStore } from '@/store/player-store';
import { StepMedia } from './step-media';
import { StepAnnotations } from './step-annotations';
import { ProgressBar } from './progress-bar';
import { cameraTransform, focusEaseDuration } from './camera';

const EASE = [0.22, 0.61, 0.36, 1] as const;

/**
 * Schema'dan beslenen player (CLAUDE.md §9).
 * focus = kamera: aynı medyalı ardışık adımlar arası PAN, farklı medyada crossfade.
 */
export function Player({ demo }: { demo: Demo }) {
  const index = usePlayerStore((s) => s.index);
  const init = usePlayerStore((s) => s.init);
  const next = usePlayerStore((s) => s.next);
  const prev = usePlayerStore((s) => s.prev);

  const steps = demo.steps.filter((s) => !s.skip);

  useEffect(() => {
    init(steps.length);
  }, [demo.id, steps.length, init]);

  if (steps.length === 0) {
    return (
      <ScreenScene className="h-full" background={demo.defaultBackground}>
        <div className="flex items-center justify-center py-20 text-sm text-ink-faint">
          Bu demoda oynatılacak adım yok.
        </div>
      </ScreenScene>
    );
  }

  const safeIndex = Math.min(index, steps.length - 1);
  const step = steps[safeIndex];
  if (!step) return null;

  const background = step.background ?? demo.defaultBackground;
  const cam = cameraTransform(step.focus);
  const camDur = focusEaseDuration(step.focus?.ease);
  const isLast = safeIndex >= steps.length - 1;

  return (
    <div className="flex h-full flex-col gap-4">
      <ScreenScene className="min-h-0 flex-1" background={background}>
        <BrowserFrame url={`acme.com/${demo.id}`} variant={demo.wrapper ?? 'browser'}>
          <div className="relative aspect-video w-full overflow-hidden bg-surface">
            {/* görüntü katmanı: aynı medyada PAN, farklı medyada crossfade */}
            <AnimatePresence initial={false}>
              <motion.div
                key={step.media}
                className="absolute inset-0"
                style={{ transformOrigin: '0 0' }}
                initial={{ opacity: 0, ...cam }}
                animate={{ opacity: 1, ...cam }}
                exit={{ opacity: 0 }}
                transition={{
                  opacity: { duration: 0.45, ease: EASE },
                  scale: { duration: camDur, ease: EASE },
                  x: { duration: camDur, ease: EASE },
                  y: { duration: camDur, ease: EASE },
                }}
              >
                <StepMedia step={step} onAdvance={next} />
              </motion.div>
            </AnimatePresence>

            {/* annotation katmanı: sabit boyut, kameraya yansıtılmış */}
            <AnimatePresence>
              <motion.div
                key={step.id}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: EASE }}
              >
                <StepAnnotations
                  step={step}
                  onNext={next}
                  onBack={prev}
                  showNext={!isLast}
                  showBack={safeIndex > 0}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </BrowserFrame>
      </ScreenScene>

      <ProgressBar steps={steps} />
    </div>
  );
}
