'use client';

import { useEffect, useRef, useState } from 'react';
import { Maximize2, Minimize2, X } from 'lucide-react';
import type { Demo } from '@clickthru/schema';
import { Player } from '@/components/player/player';
import { useT } from '@/lib/i18n';

/**
 * Tam ekran önizleme — düzenlenen demoyu GERÇEK player ile oynatır (editör ↔ player birebir).
 * Koyu tiyatro kutusu YOK: sahne büyük gösterilir, geri kalan her yer (studio) buzlanır.
 * Kapat/tam ekran kontrolleri sahnenin dışında, blur üstünde minimal yüzer.
 */
export function PreviewOverlay({ demo, onClose }: { demo: Demo; onClose: () => void }) {
  const { t } = useT();
  const ref = useRef<HTMLDivElement>(null);
  const [isFs, setIsFs] = useState(false);

  // Tarayıcı tam ekranını izle (Esc ile çıkışta da ikon senkron kalsın).
  useEffect(() => {
    const onChange = () => setIsFs(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  // Esc → önizlemeyi kapat (tam ekran değilken; tam ekrandaysa önce ondan çıkılır).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !document.fullscreenElement) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (ref.current) await ref.current.requestFullscreen();
    } catch {
      // tarayıcı reddederse sessizce geç.
    }
  }

  const ctrl =
    'flex h-8 w-8 items-center justify-center rounded-lg border border-hairline bg-surface/80 text-ink-muted backdrop-blur transition-colors hover:bg-surface hover:text-ink';

  return (
    <div ref={ref} className="fixed inset-0 z-50 bg-ink/25 backdrop-blur-2xl">
      {/* minimal kontroller — sahnenin dışında, buzlu zemin üstünde */}
      <div className="absolute right-4 top-4 z-20 flex items-center gap-1.5">
        <button
          type="button"
          onClick={toggleFullscreen}
          aria-label={isFs ? t.studio.exitFullscreen : t.studio.fullscreen}
          title={isFs ? t.studio.exitFullscreen : t.studio.fullscreen}
          className={ctrl}
        >
          {isFs ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
        <button type="button" onClick={onClose} aria-label={t.common.close} title={t.common.close} className={ctrl}>
          <X className="h-4 w-4" />
        </button>
      </div>

      <Player demo={demo} bare />
    </div>
  );
}
