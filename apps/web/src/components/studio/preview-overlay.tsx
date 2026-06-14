'use client';

import { useEffect, useRef, useState } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import type { Demo } from '@clickthru/schema';
import { Player } from '@/components/player/player';
import { useT } from '@/lib/i18n';

/** Tam ekran önizleme — düzenlenen demoyu GERÇEK player ile oynatır (editör ↔ player birebir). */
export function PreviewOverlay({ demo, onClose }: { demo: Demo; onClose: () => void }) {
  const { t } = useT();
  const ref = useRef<HTMLDivElement>(null);
  const [isFs, setIsFs] = useState(false);

  // Tarayıcı tam ekranını izle (Esc ile çıkışta da senkron kalsın).
  useEffect(() => {
    const onChange = () => setIsFs(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (ref.current) await ref.current.requestFullscreen();
    } catch {
      // tarayıcı reddederse sessizce geç.
    }
  }

  return (
    <div ref={ref} className="fixed inset-0 z-50 bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative mx-auto h-full w-full max-w-6xl">
        {/* tam ekran aç/kapa — player'ın kapat (✕) düğmesinin solunda */}
        <button
          type="button"
          onClick={toggleFullscreen}
          aria-label={isFs ? t.studio.exitFullscreen : t.studio.fullscreen}
          title={isFs ? t.studio.exitFullscreen : t.studio.fullscreen}
          className="absolute right-16 top-5 z-20 flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white/80 transition-colors hover:bg-white/20"
        >
          {isFs ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
        <Player demo={demo} onClose={onClose} />
      </div>
    </div>
  );
}
