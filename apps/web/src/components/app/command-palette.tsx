'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, CornerDownLeft, Home, Play, Plus, Search, Settings, Sparkles } from 'lucide-react';
import { cn } from '@clickthru/ui';
import { useT } from '@/lib/i18n';
import type { DemoSummary } from '@/lib/demos';

type Action = { id: string; label: string; sub?: string; icon: React.ReactNode; group: string; run: () => void };

export function CommandPalette({ open, onClose, demos, onNew }: { open: boolean; onClose: () => void; demos: DemoSummary[] | null; onNew: () => void }) {
  const router = useRouter();
  const { t } = useT();
  const [q, setQ] = useState('');
  const [hi, setHi] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQ('');
      setHi(0);
      const tm = setTimeout(() => inputRef.current?.focus(), 20);
      return () => clearTimeout(tm);
    }
  }, [open]);

  const actions = useMemo<Action[]>(() => {
    const go = (href: string) => () => {
      onClose();
      router.push(href);
    };
    const demoActions: Action[] = (demos ?? []).map((d) => ({
      id: `d_${d.id}`,
      label: d.title,
      sub: t.steps(d.steps),
      icon: <Play className="h-4 w-4" />,
      group: t.cmd.demos,
      run: go(`/studio?demo=${d.id}`),
    }));
    const nav: Action[] = [
      { id: 'new', label: t.cmd.newDemo, icon: <Plus className="h-4 w-4" />, group: t.cmd.actions, run: () => { onClose(); onNew(); } },
      { id: 'home', label: t.cmd.home, icon: <Home className="h-4 w-4" />, group: t.cmd.go, run: go('/workspaces') },
      { id: 'lib', label: t.cmd.library, icon: <BookOpen className="h-4 w-4" />, group: t.cmd.go, run: go('/library') },
      { id: 'ins', label: t.cmd.insights, icon: <Sparkles className="h-4 w-4" />, group: t.cmd.go, run: go('/insights') },
      { id: 'set', label: t.cmd.settings, icon: <Settings className="h-4 w-4" />, group: t.cmd.go, run: go('/settings') },
    ];
    return [...demoActions, ...nav];
  }, [demos, router, onClose, onNew, t]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? actions.filter((a) => a.label.toLowerCase().includes(s)) : actions;
  }, [q, actions]);

  useEffect(() => setHi(0), [q]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowDown') { e.preventDefault(); setHi((h) => Math.min(filtered.length - 1, h + 1)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setHi((h) => Math.max(0, h - 1)); }
      else if (e.key === 'Enter') { e.preventDefault(); filtered[hi]?.run(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, filtered, hi, onClose]);

  if (!open) return null;

  let lastGroup = '';
  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center p-4 pt-[12vh]">
      <button type="button" aria-label="close" onClick={onClose} className="absolute inset-0 cursor-default bg-canvas/70 backdrop-blur-sm" />
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-hairline bg-surface-elevated shadow-soft animate-[fadein_.12s_ease]">
        <div className="flex items-center gap-2.5 border-b border-hairline px-4">
          <Search className="h-4 w-4 flex-none text-ink-faint" />
          <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.cmd.placeholder} className="h-12 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-faint" />
          <span className="rounded border border-hairline px-1.5 py-0.5 font-mono text-[10px] text-ink-faint">Esc</span>
        </div>
        <div className="max-h-80 overflow-auto p-1.5">
          {filtered.length === 0 ? (
            <div className="px-3 py-10 text-center text-sm text-ink-faint">{t.cmd.empty}</div>
          ) : (
            filtered.map((a, i) => {
              const header = a.group !== lastGroup ? a.group : null;
              lastGroup = a.group;
              return (
                <div key={a.id}>
                  {header && <div className="px-2.5 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">{header}</div>}
                  <button type="button" onMouseEnter={() => setHi(i)} onClick={a.run} className={cn('flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors', i === hi ? 'bg-accent-muted text-ink' : 'text-ink-muted')}>
                    <span className={cn(i === hi ? 'text-accent' : 'text-ink-faint')}>{a.icon}</span>
                    <span className="flex-1 truncate text-[14px] font-medium text-ink">{a.label}</span>
                    {a.sub && <span className="font-mono text-[11px] text-ink-faint">{a.sub}</span>}
                    {i === hi && <CornerDownLeft className="h-3.5 w-3.5 text-ink-faint" />}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
