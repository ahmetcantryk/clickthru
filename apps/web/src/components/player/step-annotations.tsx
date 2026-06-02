'use client';

import { Callout, Hotspot, TextLabel } from '@clickthru/ui';
import type { Step } from '@clickthru/schema';
import { useT } from '@/lib/i18n';
import { project } from './camera';

/**
 * Annotation katmanı — viewport-uzayında (kameraya yansıtılmış), SABİT boyut.
 * z-sıra: metin overlay < hotspot < callout. Öğeler **bağımsız**:
 * hotspot = yalnızca tıklanacak alan; callout = kendi konumlu açıklama kutusu (İleri/Geri).
 */
export function StepAnnotations({
  step,
  onNext,
  onBack,
  showNext,
  showBack,
}: {
  step: Step;
  onNext: () => void;
  onBack: () => void;
  showNext: boolean;
  showBack: boolean;
}) {
  const { t } = useT();
  const f = step.focus;
  const hotspot = step.hotspot;
  const hp = hotspot ? project(hotspot.x, hotspot.y, f) : null;

  const callout = step.callout;
  const hasCallout = !!callout && (!!callout.title || !!callout.body);
  // Callout kendi konumunda (hotspot'tan bağımsız), kameraya yansıtılır.
  const cp = callout ? project(callout.x ?? 0.5, callout.y ?? 0.62, f) : null;
  const wantsNext = !!callout && callout.showNext !== false && showNext;
  const wantsBack = !!callout && callout.showBack !== false && showBack;

  return (
    <div className="pointer-events-none absolute inset-0">
      {step.textOverlays?.map((o) => {
        const p = project(o.x, o.y, f);
        return (
          <TextLabel key={o.id} text={o.text} x={p.x} y={p.y} size={o.size} color={o.color} style={o.style} />
        );
      })}

      {hp && hotspot && (
        <div className="pointer-events-auto">
          <Hotspot x={hp.x} y={hp.y} size={hotspot.size} color={hotspot.color} onClick={onNext} />
        </div>
      )}

      {hasCallout && callout && cp && (
        <Callout
          x={cp.x}
          y={cp.y}
          pointer={callout.pointer ?? 'bottom'}
          title={callout.title}
          body={callout.body}
          width={callout.width}
          height={callout.height}
          style={callout.style}
          onNext={wantsNext ? onNext : undefined}
          onBack={wantsBack ? onBack : undefined}
          nextLabel={t.studio.next}
          backLabel={t.studio.back}
        />
      )}
    </div>
  );
}
