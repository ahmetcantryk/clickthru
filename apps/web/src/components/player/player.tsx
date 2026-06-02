'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { BrowserFrame, ScreenScene } from '@clickthru/ui';
import type { Demo } from '@clickthru/schema';
import { usePlayerStore } from '@/store/player-store';
import { useT } from '@/lib/i18n';
import { StepMedia } from './step-media';
import { StepAnnotations } from './step-annotations';
import { ProgressBar } from './progress-bar';
import { cameraTransform, focusEaseDuration } from './camera';

const EASE = [0.22, 0.61, 0.36, 1] as const;

// Sunum tiyatrosu — daima koyu (design player), editör temasından bağımsız.
const THEATER = 'radial-gradient(120% 90% at 50% 0%, oklch(0.2 0.02 264), oklch(0.11 0.01 264))';

/**
 * Schema'dan beslenen player (CLAUDE.md §9).
 * focus = kamera: aynı medyalı ardışık adımlar arası PAN, farklı medyada crossfade.
 */
export function Player({
  demo,
  onClose,
  hideControls = false,
  autoAdvanceMs,
}: {
  demo: Demo;
  onClose?: () => void;
  /** Kontrol dock'unu gizle (embed export / sade gömme). */
  hideControls?: boolean;
  /** Verilirse adımlar bu aralıkla otomatik ilerler (export kaydı için). */
  autoAdvanceMs?: number;
}) {
  const { t } = useT();
  const index = usePlayerStore((s) => s.index);
  const init = usePlayerStore((s) => s.init);
  const next = usePlayerStore((s) => s.next);
  const prev = usePlayerStore((s) => s.prev);

  const steps = demo.steps.filter((s) => !s.skip);

  useEffect(() => {
    init(steps.length);
  }, [demo.id, steps.length, init]);

  // Export modu: adımları otomatik ilerlet (son adımda durur).
  useEffect(() => {
    if (!autoAdvanceMs) return;
    const id = setInterval(() => {
      const s = usePlayerStore.getState();
      if (s.index >= s.total - 1) clearInterval(id);
      else s.next();
    }, autoAdvanceMs);
    return () => clearInterval(id);
  }, [autoAdvanceMs, demo.id]);

  if (steps.length === 0) {
    return (
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl" style={{ background: THEATER }}>
        <div className="text-sm text-white/60">{t.studio.noPlay}</div>
      </div>
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
    <div className="relative flex h-full w-full flex-col overflow-hidden rounded-2xl" style={{ background: THEATER }}>
      {/* tiyatro üst barı: logo + başlık (sol), kapat (sağ) */}
      <div className="pointer-events-none absolute left-6 top-5 z-10 flex items-center gap-2.5">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-accent">
          <svg width="12" height="12" viewBox="0 0 15 15" fill="none" aria-hidden>
            <path d="M2 2.5L11.5 7.5L7 8.2L9.2 12L7.4 12.9L5.2 9.1L2 11.5z" fill="#fff" />
          </svg>
        </span>
        <span className="text-[13.5px] font-semibold text-white/85">{demo.title}</span>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label={t.common.close}
          className="absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white/80 transition-colors hover:bg-white/20"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {/* sahne */}
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-6 pb-28 pt-16">
        <div className="w-full max-w-5xl">
          <ScreenScene data-theme="light" className="!h-auto" background={background}>
            <BrowserFrame url={`acme.com/${demo.id}`} variant={demo.wrapper ?? 'browser'}>
              <div className="relative aspect-video w-full overflow-hidden bg-white">
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
        </div>
      </div>

      {/* yüzen kontrol dock'u */}
      {!hideControls && (
        <div className="absolute bottom-6 left-1/2 z-10 w-[min(760px,calc(100%-48px))] -translate-x-1/2">
          <ProgressBar steps={steps} />
        </div>
      )}
    </div>
  );
}
