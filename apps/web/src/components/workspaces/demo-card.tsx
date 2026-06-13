'use client';

import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MoreHorizontal, Pencil, Play, Share2, Trash2 } from 'lucide-react';
import { deleteDemo, getErrorMessage, renameDemo, type DemoSummary } from '@/lib/demos';
import { useDemosReload } from '@/components/app/app-layout';
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
        {!demo.sample && <DemoMenu demo={demo} />}
      </div>
    </div>
  );
}

function DemoMenu({ demo }: { demo: DemoSummary }) {
  const { t } = useT();
  const reload = useDemosReload();
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [busy, setBusy] = useState(false);

  function toggle(e: React.MouseEvent) {
    e.stopPropagation();
    if (pos) {
      setPos(null);
      return;
    }
    const r = btnRef.current?.getBoundingClientRect();
    if (r) setPos({ top: r.bottom + 6, left: Math.max(8, r.right - 168) });
  }

  async function run(fn: () => Promise<void>) {
    setPos(null);
    setBusy(true);
    try {
      await fn();
      reload();
    } catch (err) {
      window.alert(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  function onRename() {
    const name = window.prompt(t.card.renamePrompt, demo.title);
    if (name && name.trim() && name.trim() !== demo.title) void run(() => renameDemo(demo.id, name));
  }

  function onDelete() {
    if (window.confirm(t.card.deleteConfirm)) void run(() => deleteDemo(demo.id));
  }

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-label={t.card.options}
        onClick={toggle}
        disabled={busy}
        className="flex h-7 w-7 flex-none items-center justify-center rounded-md text-ink-faint hover:bg-surface-subtle hover:text-ink"
      >
        <MoreHorizontal className="h-3.5 w-3.5" />
      </button>
      {pos &&
        createPortal(
          <>
            <div className="fixed inset-0 z-[60]" onClick={() => setPos(null)} />
            <div
              style={{ position: 'fixed', top: pos.top, left: pos.left }}
              className="z-[61] w-40 overflow-hidden rounded-xl border border-hairline bg-surface p-1.5 shadow-soft"
            >
              <button type="button" onClick={onRename} className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium text-ink hover:bg-surface-subtle">
                <Pencil className="h-3.5 w-3.5" /> {t.card.rename}
              </button>
              <button type="button" onClick={onDelete} className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium text-red-500 hover:bg-red-500/10">
                <Trash2 className="h-3.5 w-3.5" /> {t.card.delete}
              </button>
            </div>
          </>,
          document.body,
        )}
    </>
  );
}
