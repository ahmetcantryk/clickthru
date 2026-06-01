'use client';

import type { Demo } from '@clickthru/schema';
import { Player } from '@/components/player/player';

/** Tam ekran önizleme — düzenlenen demoyu GERÇEK player ile oynatır (editör ↔ player birebir). */
export function PreviewOverlay({ demo, onClose }: { demo: Demo; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 p-4 backdrop-blur-sm">
      <div className="mx-auto h-full w-full max-w-6xl">
        <Player demo={demo} onClose={onClose} />
      </div>
    </div>
  );
}
