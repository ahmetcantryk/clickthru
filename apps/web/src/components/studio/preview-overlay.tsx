'use client';

import { X } from 'lucide-react';
import type { Demo } from '@clickthru/schema';
import { Player } from '@/components/player/player';

/** Tam ekran önizleme — düzenlenen demoyu GERÇEK player ile oynatır (editör ↔ player birebir). */
export function PreviewOverlay({ demo, onClose }: { demo: Demo; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/50 p-6 backdrop-blur-sm">
      <div className="mx-auto flex h-full w-full max-w-6xl flex-col">
        <div className="flex items-center justify-between pb-3">
          <span className="text-sm font-medium text-white">Önizleme — {demo.title}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="rounded-lg bg-white/15 p-2 text-white hover:bg-white/25"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 rounded-2xl bg-surface-subtle p-4">
          <Player demo={demo} />
        </div>
      </div>
    </div>
  );
}
