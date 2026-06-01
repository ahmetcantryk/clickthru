'use client';

import { useRouter } from 'next/navigation';
import { ArrowUpRight, Grid2x2, LayoutGrid, Play, Plus, Upload, Users } from 'lucide-react';
import { cn } from '@clickthru/ui';
import { getProfile, getSession, initials } from '@/lib/auth';
import { ThemeToggle } from '@/components/theme-toggle';
import { LogoGlyph } from '@/components/brand';
import { AppLayout, useDemos, useNewDemo } from '@/components/app/app-layout';
import { DemoCard } from './demo-card';

export function WorkspacesApp() {
  return (
    <AppLayout active="home">
      <Home />
    </AppLayout>
  );
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 6) return 'İyi geceler';
  if (h < 12) return 'Günaydın';
  if (h < 18) return 'İyi günler';
  return 'İyi akşamlar';
}

function Home() {
  const router = useRouter();
  const demos = useDemos();
  const openNew = useNewDemo();
  const user = getSession();
  const profile = getProfile();
  const name = user?.name.split(' ')[0] ?? '';
  const brandColor = profile?.brandColor || '#2142E7';

  const tiles = [
    { icon: <LogoGlyph className="h-5 w-5" />, label: 'Yeni Demo', primary: true, onClick: openNew },
    { icon: <Upload className="h-5 w-5" />, label: 'Sıfırdan başla', onClick: () => router.push('/studio?new=1') },
    { icon: <Users className="h-5 w-5" />, label: 'Ekip davet et', onClick: () => { window.location.href = 'mailto:?subject=clickthru ekibine katıl'; } },
  ];

  return (
    <div className="mx-auto max-w-5xl px-8 py-9">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-ink">
            {greeting()}, {name}
          </h1>
          <p className="mt-1 text-[15px] text-ink-faint">Bugün ne oluşturmak istersin?</p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <span className="flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-bold text-white" style={{ background: brandColor }}>
            {user ? initials(user.name) : '–'}
          </span>
        </div>
      </div>

      <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {tiles.map((t) => (
          <button
            key={t.label}
            type="button"
            onClick={t.onClick}
            className={cn(
              'flex flex-col items-start gap-3 rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-soft',
              t.primary ? 'border-accent-ring bg-accent-muted' : 'border-hairline bg-surface hover:border-hairline-strong',
            )}
          >
            <span className={cn('flex h-10 w-10 items-center justify-center rounded-xl', t.primary ? 'bg-accent text-accent-foreground' : 'bg-surface-subtle text-ink-muted')}>{t.icon}</span>
            <span className="text-sm font-semibold text-ink">{t.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-10 flex items-center gap-5 border-b border-hairline">
        <span className="-mb-px border-b-2 border-accent pb-2.5 text-sm font-semibold text-ink">Son düzenlenenler</span>
        <span className="-mb-px border-b-2 border-transparent pb-2.5 text-sm font-medium text-ink-faint">Paylaşılanlar</span>
        <span className="ml-auto flex items-center gap-1 pb-2.5 text-ink-faint">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-surface-subtle text-ink"><LayoutGrid className="h-4 w-4" /></span>
          <span className="flex h-7 w-7 items-center justify-center rounded-md"><Grid2x2 className="h-4 w-4" /></span>
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3">
        <button
          type="button"
          onClick={openNew}
          className="flex min-h-[180px] flex-col items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed border-hairline-strong text-ink-faint transition-colors hover:border-accent-ring hover:bg-accent-muted hover:text-accent"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-subtle"><Plus className="h-5 w-5" /></span>
          <span className="text-sm font-semibold">Yeni demo</span>
        </button>

        {demos === null
          ? Array.from({ length: 5 }).map((_, i) => <div key={i} className="min-h-[180px] animate-pulse rounded-2xl bg-surface-subtle" />)
          : demos.slice(0, 8).map((d) => <DemoCard key={d.id} demo={d} onOpen={() => router.push(`/studio?demo=${d.id}`)} />)}
      </div>

      <h2 className="mt-12 text-lg font-bold text-ink">clickthru ile başla</h2>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { t: 'İnteraktif demo nasıl oluşturulur', href: '/#how' },
          { t: 'Demonu nasıl düzenlersin', href: '/#features' },
          { t: 'Demonu nasıl paylaşırsın', href: '/#showcase' },
        ].map((g) => (
          <a key={g.t} href={g.href} className="group relative flex h-36 flex-col justify-end overflow-hidden rounded-2xl border border-hairline bg-gradient-to-br from-accent-muted to-surface-subtle p-4">
            <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-surface/80 text-accent shadow-soft">
              <Play className="h-3.5 w-3.5 fill-current" />
            </span>
            <span className="flex items-center gap-1 text-sm font-semibold text-ink">
              {g.t}
              <ArrowUpRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
