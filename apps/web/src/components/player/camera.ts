import type { Focus, FocusEase } from '@clickthru/schema';

/**
 * Kamera (CLAUDE.md §5): focus = bu adımın zoom dikdörtgeni (Pass 2).
 * Dikdörtgenin merkezi viewport ortasına gelir; ölçek dikdörtgeni viewport'a sığdırır (contain).
 */
function rectCenterScale(focus?: Focus): { cx: number; cy: number; scale: number } {
  if (!focus) return { cx: 0.5, cy: 0.5, scale: 1 };
  const cx = focus.x + focus.w / 2;
  const cy = focus.y + focus.h / 2;
  // contain: dikdörtgenin tamamı görünür kalır.
  const scale = Math.min(10, Math.max(1, Math.min(1 / focus.w, 1 / focus.h)));
  return { cx, cy, scale };
}

/** Bu adımın zoom ölçeği (UI etiketleri için). */
export function focusScale(focus?: Focus): number {
  return rectCenterScale(focus).scale;
}

/**
 * transform-origin 0 0 + scale s + translate ile dikdörtgen merkezini viewport ortasına getirir.
 */
export function cameraTransform(focus?: Focus): { scale: number; x: string; y: string } {
  const { cx, cy, scale } = rectCenterScale(focus);
  return {
    scale,
    x: `${(0.5 - cx * scale) * 100}%`,
    y: `${(0.5 - cy * scale) * 100}%`,
  };
}

/**
 * Bir görüntü-uzayı noktasını (0–1) kameraya göre viewport-uzayına (0–1) yansıtır.
 * Böylece annotation'lar zoom'la birlikte doğru yere oturur ama boyutları sabit kalır.
 */
export function project(x: number, y: number, focus?: Focus): { x: number; y: number } {
  const { cx, cy, scale } = rectCenterScale(focus);
  return { x: 0.5 + (x - cx) * scale, y: 0.5 + (y - cy) * scale };
}

/** Easing modu → kamera hareketi süresi (saniye). Pan/zoom geçişine uygulanır. */
export function focusEaseDuration(ease?: FocusEase): number {
  switch (ease) {
    case 'quick':
      return 0.42;
    case 'slow':
      return 1.15;
    case 'gentle':
    default:
      return 0.7;
  }
}
