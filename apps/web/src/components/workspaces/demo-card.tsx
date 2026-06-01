'use client';

import { Play, Share2 } from 'lucide-react';
import type { DemoSummary } from '@/lib/demos';

export function ago(iso?: string): string {
  if (!iso) return 'geçenlerde düzenlendi';
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return 'geçenlerde düzenlendi';
  const s = Math.floor((Date.now() - t) / 1000);
  if (s < 60) return 'az önce düzenlendi';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} dakika önce düzenlendi`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} saat önce düzenlendi`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} gün önce düzenlendi`;
  return `${Math.floor(d / 30)} ay önce düzenlendi`;
}

export function DemoCard({ demo, onOpen }: { demo: DemoSummary; onOpen: () => void }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-hairline bg-surface transition-all hover:-translate-y-0.5 hover:shadow-soft">
      <button type="button" onClick={onOpen} className="relative block aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-accent-muted to-surface-subtle">
        {demo.thumbnail && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={demo.thumbnail} alt="" className="h-full w-full object-cover object-top" />
        )}
        {demo.type === 'video' && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ink/55 text-white backdrop-blur"><Play className="h-4 w-4 fill-current" /></span>
          </span>
        )}
        <span className="absolute left-2 top-2 rounded-md bg-ink/70 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase text-white">{demo.steps} adım</span>
      </button>
      <div className="flex items-start gap-2 p-3">
        <div className="min-w-0 flex-1">
          <button type="button" onClick={onOpen} className="block w-full truncate text-left text-sm font-semibold text-ink hover:text-accent">
            {demo.title}
          </button>
          <div className="mt-0.5 text-[11.5px] text-ink-faint">{ago(demo.updatedAt)}</div>
        </div>
        <a href={`/play/${demo.id}`} target="_blank" rel="noreferrer" aria-label="Oynat" className="flex h-7 w-7 flex-none items-center justify-center rounded-md text-ink-faint hover:bg-surface-subtle hover:text-ink">
          <Play className="h-3.5 w-3.5" />
        </a>
        <a href={`/play/${demo.id}`} target="_blank" rel="noreferrer" aria-label="Paylaş" className="flex h-7 w-7 flex-none items-center justify-center rounded-md text-ink-faint hover:bg-surface-subtle hover:text-ink">
          <Share2 className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}
