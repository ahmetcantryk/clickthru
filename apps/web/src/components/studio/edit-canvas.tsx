'use client';

import { useRef, useState, type CSSProperties } from 'react';
import { ArrowRight } from 'lucide-react';
import { BrowserFrame, ScreenScene, calloutBorder, calloutShadow, cn, isDarkColor } from '@clickthru/ui';
import type { CalloutPointer, Focus } from '@clickthru/schema';
import { useEditorStore, type FocusRect as FocusRectVal } from '@/store/editor-store';

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

const calloutPlacement: Record<CalloutPointer, string> = {
  bottom: '-translate-x-1/2 mt-3',
  top: '-translate-x-1/2 -translate-y-full -mt-3',
  left: '-translate-x-full -translate-y-1/2 -ml-3',
  right: '-translate-y-1/2 ml-3',
  none: '-translate-x-1/2 mt-3',
};

// Üçgen nub — kartın anchor'a (ok ucu) bakan kenarından çıkar (UI Callout ile birebir).
const calloutNub: Record<CalloutPointer, CSSProperties> = {
  bottom: { top: -6, left: '50%', marginLeft: -7 },
  top: { bottom: -6, left: '50%', marginLeft: -7 },
  left: { right: -6, top: '50%', marginTop: -7 },
  right: { left: -6, top: '50%', marginTop: -7 },
  none: { display: 'none' },
};
const overlaySize: Record<string, string> = { sm: 'text-xs', md: 'text-sm', lg: 'text-lg font-semibold' };

type Guide = { x: number; y: number; w: number; h: number };

/** Düzenleme tuvali — tıkla-seç + sürükle-taşı; sürüklerken px mesafe kılavuzları. */
export function EditCanvas() {
  const demo = useEditorStore((s) => s.demo);
  const stepIndex = useEditorStore((s) => s.stepIndex);
  const selection = useEditorStore((s) => s.selection);
  const select = useEditorStore((s) => s.select);
  const selectStep = useEditorStore((s) => s.selectStep);
  const setHotspotPos = useEditorStore((s) => s.setHotspotPos);
  const setFocusRect = useEditorStore((s) => s.setFocusRect);
  const setCalloutPos = useEditorStore((s) => s.setCalloutPos);
  const setOverlayPos = useEditorStore((s) => s.setOverlayPos);

  const containerRef = useRef<HTMLDivElement>(null);
  const [guide, setGuide] = useState<Guide | null>(null);
  const step = demo.steps[stepIndex];
  const background = step?.background ?? demo.defaultBackground;
  const total = demo.steps.length;

  function startDrag(onChange: (x: number, y: number) => void) {
    return (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const move = (ev: PointerEvent) => {
        const x = clamp01((ev.clientX - rect.left) / rect.width);
        const y = clamp01((ev.clientY - rect.top) / rect.height);
        onChange(x, y);
        setGuide({ x, y, w: rect.width, h: rect.height });
      };
      const up = () => {
        setGuide(null);
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
    };
  }

  // Delta tabanlı sürükleme — kavrama offset'i korunur (anchor'dan offsetli kart zıplamaz).
  // Guide, anchor noktasını (ok ucunun çıktığı yer) referans alır.
  function startDragFrom(startX: number, startY: number, onChange: (x: number, y: number) => void) {
    return (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const px = e.clientX;
      const py = e.clientY;
      const move = (ev: PointerEvent) => {
        const x = clamp01(startX + (ev.clientX - px) / rect.width);
        const y = clamp01(startY + (ev.clientY - py) / rect.height);
        onChange(x, y);
        setGuide({ x, y, w: rect.width, h: rect.height });
      };
      const up = () => {
        setGuide(null);
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
    };
  }

  if (!step) {
    return (
      <ScreenScene data-theme="light" className="h-full" background={demo.defaultBackground}>
        <div className="flex items-center justify-center py-20 text-sm text-ink-faint">
          Adım yok — soldan “PC'den görsel ekle” ile başla.
        </div>
      </ScreenScene>
    );
  }

  // Callout artık hotspot'tan bağımsız — kendi konumu (callout.x/y) var.
  const callout = step.callout;

  return (
    <ScreenScene data-theme="light" className="h-full" background={background}>
      <BrowserFrame url={`studio/${demo.id}`} variant={demo.wrapper ?? 'browser'}>
        <div
          ref={containerRef}
          className="relative aspect-video w-full overflow-hidden bg-surface"
          onPointerDown={() => select({ kind: 'step' })}
        >
          {step.type === 'video' ? (
            <video src={step.media} className="h-full w-full bg-black object-cover" muted />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={step.media} alt="" className="h-full w-full object-cover" draggable={false} />
          )}

          {step.textOverlays?.map((o) => (
            <div
              key={o.id}
              onPointerDown={(e) => {
                e.stopPropagation();
                select({ kind: 'overlay', id: o.id });
                startDrag((x, y) => setOverlayPos(o.id, x, y))(e);
              }}
              className={cn(
                'absolute z-20 cursor-move rounded-lg',
                selection.kind === 'overlay' && selection.id === o.id && 'ring-2 ring-accent ring-offset-2',
              )}
              style={{ left: `${o.x * 100}%`, top: `${o.y * 100}%` }}
            >
              <span
                className={cn(
                  'inline-block rounded-lg border border-hairline bg-surface/90 px-2.5 py-1.5 font-medium text-ink shadow-soft',
                  overlaySize[o.size] ?? 'text-sm',
                )}
                style={{
                  color: o.color,
                  borderRadius: o.style?.radius,
                  background: o.style?.bg,
                  borderColor: o.style?.borderColor,
                  borderWidth: o.style?.borderWidth,
                }}
              >
                {o.text}
              </span>
            </div>
          ))}

          {step.focus && (
            <FocusRect
              focus={step.focus}
              selected={selection.kind === 'focus'}
              containerRef={containerRef}
              onSelect={() => select({ kind: 'focus' })}
              onChange={setFocusRect}
            />
          )}

          {step.hotspot && (
            <button
              type="button"
              onPointerDown={(e) => {
                e.stopPropagation();
                select({ kind: 'hotspot' });
                startDrag(setHotspotPos)(e);
              }}
              className="absolute z-30 -translate-x-1/2 -translate-y-1/2 cursor-move"
              style={{ left: `${step.hotspot.x * 100}%`, top: `${step.hotspot.y * 100}%` }}
            >
              <span
                className="relative flex items-center justify-center"
                style={{ width: (step.hotspot.size ?? 16) * 1.9, height: (step.hotspot.size ?? 16) * 1.9 }}
              >
                <span
                  className="absolute rounded-full border-2 animate-pulse-soft"
                  style={{
                    width: (step.hotspot.size ?? 16) * 1.9,
                    height: (step.hotspot.size ?? 16) * 1.9,
                    borderColor: step.hotspot.color ?? '#2142E7',
                  }}
                />
                <span
                  className="absolute rounded-full border-2 animate-pulse-soft"
                  style={{
                    width: step.hotspot.size ?? 16,
                    height: step.hotspot.size ?? 16,
                    borderColor: step.hotspot.color ?? '#2142E7',
                    animationDelay: '0.5s',
                  }}
                />
                <span
                  className={cn('relative rounded-full', selection.kind === 'hotspot' && 'ring-2 ring-accent ring-offset-2')}
                  style={{
                    width: (step.hotspot.size ?? 16) * 0.5,
                    height: (step.hotspot.size ?? 16) * 0.5,
                    background: step.hotspot.color ?? '#2142E7',
                  }}
                />
              </span>
            </button>
          )}

          {callout && (callout.title || callout.body) && (
            <div
              onPointerDown={(e) => {
                e.stopPropagation();
                select({ kind: 'callout' });
                startDragFrom(callout.x ?? 0.5, callout.y ?? 0.62, setCalloutPos)(e);
              }}
              className={cn(
                'absolute z-40 cursor-move text-left',
                calloutPlacement[callout.pointer ?? 'bottom'],
                selection.kind === 'callout' ? 'ring-2 ring-accent' : '',
              )}
              style={{
                left: `${(callout.x ?? 0.5) * 100}%`,
                top: `${(callout.y ?? 0.62) * 100}%`,
                width: callout.width ?? 280,
                height: callout.height || undefined,
                borderRadius: callout.style?.radius ?? 20,
                background: callout.style?.bg ?? '#FFFFFF',
                // Kenarlık + gölge callout'un kendi rengine tonlanır (player ile birebir).
                borderColor: callout.style?.borderColor ?? calloutBorder(callout.style?.bg ?? '#FFFFFF'),
                borderWidth: callout.style?.borderWidth ?? 1,
                borderStyle: 'solid',
                boxShadow: calloutShadow(callout.style?.bg ?? '#FFFFFF'),
                padding: 16,
              }}
            >
              {(callout.pointer ?? 'bottom') !== 'none' && (
                <span
                  aria-hidden
                  className="absolute h-3.5 w-3.5 rotate-45 rounded-[4px]"
                  style={{ ...calloutNub[callout.pointer ?? 'bottom'], background: callout.style?.bg ?? '#FFFFFF' }}
                />
              )}
              {callout.title && (
                <p
                  className="text-sm font-semibold text-ink"
                  style={isDarkColor(callout.style?.bg) ? { color: '#FFFFFF' } : undefined}
                >
                  {callout.title}
                </p>
              )}
              {callout.body && (
                <p
                  className="mt-1 text-sm text-ink-muted"
                  style={isDarkColor(callout.style?.bg) ? { color: 'rgba(255,255,255,0.85)' } : undefined}
                >
                  {callout.body}
                </p>
              )}
              {(callout.showBack !== false || callout.showNext !== false) && (
                <div className="mt-3.5 flex items-center gap-2">
                  {callout.showBack !== false && (
                    <button
                      type="button"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (stepIndex > 0) selectStep(stepIndex - 1);
                      }}
                      className={cn(
                        'cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors',
                        isDarkColor(callout.style?.bg)
                          ? 'border-white/25 bg-white/10 text-white/85 hover:bg-white/20'
                          : 'border-hairline bg-surface-subtle text-ink-muted hover:text-ink',
                      )}
                    >
                      Geri
                    </button>
                  )}
                  <div className="flex-1" />
                  {callout.showNext !== false && (
                    <button
                      type="button"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (stepIndex < total - 1) selectStep(stepIndex + 1);
                      }}
                      className={cn(
                        'inline-flex cursor-pointer items-center gap-1 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-[filter]',
                        isDarkColor(callout.style?.bg) ? 'bg-white text-accent' : 'bg-accent text-white hover:brightness-110',
                      )}
                    >
                      İleri
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {guide && <GuideOverlay guide={guide} />}
        </div>
      </BrowserFrame>
    </ScreenScene>
  );
}

function GuideLabel({ left, top, value }: { left: string; top: string; value: number }) {
  return (
    <span
      className="absolute z-40 -translate-x-1/2 -translate-y-1/2 rounded bg-accent px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-white"
      style={{ left, top }}
    >
      {Math.round(value)}px
    </span>
  );
}

/** Sürüklenen noktanın 4 kenara px uzaklığı — kesik çizgi + ortada değer. */
function GuideOverlay({ guide }: { guide: Guide }) {
  const { x, y, w, h } = guide;
  const xp = `${x * 100}%`;
  const yp = `${y * 100}%`;
  const line = 'pointer-events-none absolute z-30 border-accent/60';
  return (
    <div className="pointer-events-none absolute inset-0">
      {/* yatay sol/sağ */}
      <div className={cn(line, 'border-t border-dashed')} style={{ left: 0, top: yp, width: xp }} />
      <div className={cn(line, 'border-t border-dashed')} style={{ left: xp, top: yp, right: 0 }} />
      {/* dikey üst/alt */}
      <div className={cn(line, 'border-l border-dashed')} style={{ left: xp, top: 0, height: yp }} />
      <div className={cn(line, 'border-l border-dashed')} style={{ left: xp, top: yp, bottom: 0 }} />
      <GuideLabel left={`${(x / 2) * 100}%`} top={yp} value={x * w} />
      <GuideLabel left={`${((x + 1) / 2) * 100}%`} top={yp} value={(1 - x) * w} />
      <GuideLabel left={xp} top={`${(y / 2) * 100}%`} value={y * h} />
      <GuideLabel left={xp} top={`${((y + 1) / 2) * 100}%`} value={(1 - y) * h} />
    </div>
  );
}

type FocusDragMode = 'move' | 'nw' | 'ne' | 'sw' | 'se';

const FOCUS_MIN = 0.06;

const FOCUS_CORNERS: { mode: FocusDragMode; pos: string; cursor: string }[] = [
  { mode: 'nw', pos: '-left-1.5 -top-1.5', cursor: 'nwse-resize' },
  { mode: 'ne', pos: '-right-1.5 -top-1.5', cursor: 'nesw-resize' },
  { mode: 'sw', pos: '-left-1.5 -bottom-1.5', cursor: 'nesw-resize' },
  { mode: 'se', pos: '-right-1.5 -bottom-1.5', cursor: 'nwse-resize' },
];

/**
 * Zoom/pan dikdörtgeni (Pass 2): ortadan tutup taşı, 4 köşeden boyutlandır,
 * dışını karart. Ölçek dikdörtgenden türetilir (etiket olarak gösterilir).
 */
function FocusRect({
  focus,
  selected,
  containerRef,
  onSelect,
  onChange,
}: {
  focus: Focus;
  selected: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onSelect: () => void;
  onChange: (rect: FocusRectVal) => void;
}) {
  const zoomScale = Math.min(1 / focus.w, 1 / focus.h);

  function startFocusDrag(mode: FocusDragMode) {
    return (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onSelect();
      const el = containerRef.current;
      if (!el) return;
      const box = el.getBoundingClientRect();
      const start = { px: e.clientX, py: e.clientY, x: focus.x, y: focus.y, w: focus.w, h: focus.h };
      const right = start.x + start.w;
      const bottom = start.y + start.h;
      const move = (ev: PointerEvent) => {
        const dx = (ev.clientX - start.px) / box.width;
        const dy = (ev.clientY - start.py) / box.height;
        let { x, y, w, h } = start;
        if (mode === 'move') {
          x = start.x + dx;
          y = start.y + dy;
        } else {
          // n/s = mode[0], w/e = mode[1]; karşı kenar sabit kalsın.
          if (mode[0] === 'n') {
            y = Math.min(start.y + dy, bottom - FOCUS_MIN);
            h = bottom - y;
          } else {
            h = start.h + dy;
          }
          if (mode[1] === 'w') {
            x = Math.min(start.x + dx, right - FOCUS_MIN);
            w = right - x;
          } else {
            w = start.w + dx;
          }
        }
        onChange({ x, y, w, h });
      };
      const up = () => {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
    };
  }

  return (
    <div
      className="absolute z-10"
      style={{
        left: `${focus.x * 100}%`,
        top: `${focus.y * 100}%`,
        width: `${focus.w * 100}%`,
        height: `${focus.h * 100}%`,
      }}
    >
      {/* gövde: ortadan tut-taşı + dışını karartan dev gölge (container overflow-hidden ile kırpılır) */}
      <div
        onPointerDown={startFocusDrag('move')}
        className={cn(
          'absolute inset-0 cursor-move rounded-sm border-2',
          selected ? 'border-accent' : 'border-accent/60',
        )}
        style={{ boxShadow: '0 0 0 9999px rgba(17, 17, 20, 0.55)' }}
      />

      <span className="pointer-events-none absolute -top-5 left-0 z-10 whitespace-nowrap rounded bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-white">
        zoom {zoomScale.toFixed(1)}×
      </span>

      {FOCUS_CORNERS.map((c) => (
        <span
          key={c.mode}
          onPointerDown={startFocusDrag(c.mode)}
          className={cn('absolute z-10 h-3 w-3 rounded-sm border-2 border-accent bg-white shadow-soft', c.pos)}
          style={{ cursor: c.cursor }}
        />
      ))}
    </div>
  );
}
