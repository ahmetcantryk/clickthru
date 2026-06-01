'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LibraryBig, Plus, Search } from 'lucide-react';
import { cn } from '@clickthru/ui';
import { AppLayout, useDemos, useNewDemo } from '@/components/app/app-layout';
import { Select } from '@/components/ui/select';
import { DemoCard } from './demo-card';

export function LibraryApp() {
  return (
    <AppLayout active="library">
      <Library />
    </AppLayout>
  );
}

type TypeFilter = 'all' | 'screenshot' | 'video';
type Sort = 'recent' | 'name' | 'steps';

function Library() {
  const router = useRouter();
  const demos = useDemos();
  const openNew = useNewDemo();
  const [q, setQ] = useState('');
  const [type, setType] = useState<TypeFilter>('all');
  const [sort, setSort] = useState<Sort>('recent');

  const filtered = useMemo(() => {
    if (!demos) return [];
    let list = demos.filter((d) => (type === 'all' || d.type === type) && d.title.toLowerCase().includes(q.toLowerCase()));
    if (sort === 'name') list = [...list].sort((a, b) => a.title.localeCompare(b.title, 'tr'));
    else if (sort === 'steps') list = [...list].sort((a, b) => b.steps - a.steps);
    return list;
  }, [demos, q, type, sort]);

  const chips: { key: TypeFilter; label: string }[] = [
    { key: 'all', label: 'Tümü' },
    { key: 'screenshot', label: 'Ekran görüntüsü' },
    { key: 'video', label: 'Video' },
  ];

  return (
    <div className="mx-auto max-w-6xl px-8 py-9">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-extrabold tracking-tight text-ink">Kitaplık</h1>
          <p className="mt-1 text-[14px] text-ink-faint">{demos === null ? 'Yükleniyor…' : `${demos.length} demo`}</p>
        </div>
        <button type="button" onClick={openNew} className="inline-flex h-10 items-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-accent-foreground shadow-glow hover:brightness-110">
          <Plus className="h-4 w-4" /> Yeni demo
        </button>
      </div>

      {/* toolbar */}
      <div className="mt-7 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 sm:min-w-[260px] sm:flex-none">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Demolarında ara…"
            className="h-11 w-full rounded-xl border border-hairline bg-surface pl-9 pr-3 text-sm text-ink outline-none focus:border-accent-ring focus:ring-2 focus:ring-accent-ring"
          />
        </div>
        <div className="flex items-center gap-1.5 rounded-xl border border-hairline bg-surface-subtle p-1">
          {chips.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setType(c.key)}
              className={cn('rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors', type === c.key ? 'bg-surface text-ink shadow-soft' : 'text-ink-muted hover:text-ink')}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="ml-auto w-[190px]">
          <Select
            value={sort}
            onValueChange={(v) => setSort(v as Sort)}
            options={[
              { value: 'recent', label: 'Son düzenlenen' },
              { value: 'name', label: 'Ada göre (A–Z)' },
              { value: 'steps', label: 'Adım sayısı' },
            ]}
          />
        </div>
      </div>

      {/* grid */}
      {demos === null ? (
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="min-h-[180px] animate-pulse rounded-2xl bg-surface-subtle" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-3 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-subtle text-ink-faint">
            <LibraryBig className="h-6 w-6" />
          </span>
          <p className="text-sm font-semibold text-ink">Sonuç yok</p>
          <p className="max-w-xs text-[13px] text-ink-faint">Aramanı değiştir ya da yeni bir demo oluştur.</p>
          <button type="button" onClick={openNew} className="mt-1 inline-flex h-10 items-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-accent-foreground hover:brightness-110">
            <Plus className="h-4 w-4" /> Yeni demo
          </button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((d) => (
            <DemoCard key={d.id} demo={d} onOpen={() => router.push(`/studio?demo=${d.id}`)} />
          ))}
        </div>
      )}
    </div>
  );
}
