'use client';

import { Play, Share2 } from 'lucide-react';
import type { DemoSummary } from '@/lib/demos';
import { useT, type Copy } from '@/lib/i18n';

function ago(iso: string | undefined, t: Copy): string {
  if (!iso) return t.time.recently;
  const ts = Date.parse(iso);
  if (Number.isNaN(ts)) return t.time.recently;
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return t.time.justNow;
  const m = Math.floor(s / 60);
  if (m < 60) return t.time.min(m);
  const h = Math.floor(m / 60);
  if (h < 24) return t.time.hour(h);
  const d = Math.floor(h / 24);
  if (d < 30) return t.time.day(d);
  return t.time.month(Math.floor(d / 30));
}

export function DemoCard({ demo, onOpen }: { demo: DemoSummary; onOpen: () => void }) {
  const { t } = useT();
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
        <span className="absolute left-2 top-2 rounded-md bg-ink/70 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase text-white">{t.steps(demo.steps)}</span>
      </button>
      <div className="flex items-start gap-2 p-3">
        <div className="min-w-0 flex-1">
          <button type="button" onClick={onOpen} className="block w-full truncate text-left text-sm font-semibold text-ink hover:text-accent">{demo.title}</button>
          <div className="mt-0.5 text-[11.5px] text-ink-faint">{ago(demo.updatedAt, t)}</div>
        </div>
        <a href={`/play/${demo.id}`} target="_blank" rel="noreferrer" aria-label="Play" className="flex h-7 w-7 flex-none items-center justify-center rounded-md text-ink-faint hover:bg-surface-subtle hover:text-ink"><Play className="h-3.5 w-3.5" /></a>
        <a href={`/play/${demo.id}`} target="_blank" rel="noreferrer" aria-label="Share" className="flex h-7 w-7 flex-none items-center justify-center rounded-md text-ink-faint hover:bg-surface-subtle hover:text-ink"><Share2 className="h-3.5 w-3.5" /></a>
      </div>
    </div>
  );
}
