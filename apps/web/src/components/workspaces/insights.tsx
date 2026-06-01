'use client';

import { useMemo, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Eye, Play, Share2, Timer } from 'lucide-react';
import type { DemoSummary } from '@/lib/demos';
import { AppLayout, useDemos } from '@/components/app/app-layout';
import { Select } from '@/components/ui/select';

export function InsightsApp() {
  return (
    <AppLayout active="insights">
      <Insights />
    </AppLayout>
  );
}

// Deterministik sahte metrik (gerçek analitik Faz 3) — demo başlığı/adımından türetilir.
function metricsFor(d: DemoSummary, factor: number) {
  const seed = d.title.length * 37 + d.steps * 53 + d.id.length * 11;
  const views = Math.round((140 + (seed % 920)) * factor);
  const plays = Math.round(views * (0.52 + ((seed % 17) / 100)));
  const completion = 48 + (seed % 46);
  return { views, plays, completion };
}

function Insights() {
  const demos = useDemos();
  const [range, setRange] = useState('30');
  const factor = range === '7' ? 0.3 : range === '90' ? 2.6 : 1;

  const { totals, rows, trend } = useMemo(() => {
    const list = demos ?? [];
    const per = list.map((d) => ({ d, m: metricsFor(d, factor) }));
    const views = per.reduce((s, x) => s + x.m.views, 0);
    const plays = per.reduce((s, x) => s + x.m.plays, 0);
    const completion = per.length ? Math.round(per.reduce((s, x) => s + x.m.completion, 0) / per.length) : 0;
    const shares = Math.round(plays * 0.18);
    const rows = [...per].sort((a, b) => b.m.views - a.m.views).slice(0, 6);
    // trend: 12 nokta, views toplamından türeyen yumuşak yükseliş
    const base = Math.max(20, Math.round(views / 14));
    const wave = [0.45, 0.5, 0.42, 0.58, 0.55, 0.66, 0.62, 0.74, 0.7, 0.82, 0.78, 0.92];
    const trend = wave.map((w) => Math.round(base * (0.6 + w)));
    return { totals: { views, plays, completion, shares }, rows, trend };
  }, [demos, factor]);

  const stats = [
    { icon: <Eye className="h-4 w-4" />, label: 'Toplam görüntüleme', value: totals.views.toLocaleString('tr-TR'), delta: '+12,4%', up: true },
    { icon: <Play className="h-4 w-4" />, label: 'Oynatma', value: totals.plays.toLocaleString('tr-TR'), delta: '+8,1%', up: true },
    { icon: <Timer className="h-4 w-4" />, label: 'Ort. tamamlanma', value: `%${totals.completion}`, delta: '+3,2%', up: true },
    { icon: <Share2 className="h-4 w-4" />, label: 'Paylaşım', value: totals.shares.toLocaleString('tr-TR'), delta: '−1,5%', up: false },
  ];

  const loading = demos === null;

  return (
    <div className="mx-auto max-w-5xl px-8 py-9">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-extrabold tracking-tight text-ink">İçgörüler</h1>
          <p className="mt-1 text-[14px] text-ink-faint">Demolarının nasıl performans gösterdiğini gör.</p>
        </div>
        <div className="w-[150px]">
          <Select
            value={range}
            onValueChange={setRange}
            options={[
              { value: '7', label: 'Son 7 gün' },
              { value: '30', label: 'Son 30 gün' },
              { value: '90', label: 'Son 90 gün' },
            ]}
          />
        </div>
      </div>

      {/* stat cards */}
      <div className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-hairline bg-surface p-5">
            <div className="flex items-center gap-2 text-ink-faint">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-subtle text-ink-muted">{s.icon}</span>
              <span className="text-[12.5px] font-medium text-ink-muted">{s.label}</span>
            </div>
            <div className="mt-3 text-[28px] font-extrabold tracking-tight text-ink">{loading ? '—' : s.value}</div>
            <div className={`mt-1.5 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[12px] font-semibold ${s.up ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'}`}>
              {s.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {s.delta}
            </div>
          </div>
        ))}
      </div>

      {/* trend chart */}
      <div className="mt-5 rounded-2xl border border-hairline bg-surface p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-bold text-ink">Görüntüleme trendi</h2>
          <span className="font-mono text-[12px] text-ink-faint">son {range} gün</span>
        </div>
        <TrendChart points={trend} />
      </div>

      {/* top demos */}
      <div className="mt-5 overflow-hidden rounded-2xl border border-hairline bg-surface">
        <div className="flex items-center justify-between border-b border-hairline px-6 py-4">
          <h2 className="text-[15px] font-bold text-ink">En çok izlenen demolar</h2>
        </div>
        <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-6 py-2.5 text-[11.5px] font-semibold uppercase tracking-wide text-ink-faint">
          <span>Demo</span>
          <span className="w-24 text-right">Görüntüleme</span>
          <span className="w-24 text-right">Tamamlanma</span>
        </div>
        {loading ? (
          <div className="px-6 pb-6">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="my-2 h-8 animate-pulse rounded-lg bg-surface-subtle" />)}
          </div>
        ) : (
          rows.map(({ d, m }) => (
            <div key={d.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-t border-hairline px-6 py-3 text-[14px]">
              <div className="flex items-center gap-3 truncate">
                <span className="h-8 w-12 flex-none overflow-hidden rounded-md bg-gradient-to-br from-accent-muted to-surface-subtle">
                  {d.thumbnail && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={d.thumbnail} alt="" className="h-full w-full object-cover object-top" />
                  )}
                </span>
                <a href={`/play/${d.id}`} target="_blank" rel="noreferrer" className="truncate font-semibold text-ink hover:text-accent">{d.title}</a>
              </div>
              <span className="w-24 text-right font-mono tabular-nums text-ink">{m.views.toLocaleString('tr-TR')}</span>
              <span className="w-24 text-right font-semibold text-success">%{m.completion}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function TrendChart({ points }: { points: number[] }) {
  const w = 900;
  const h = 200;
  const max = Math.max(...points, 1);
  const step = w / (points.length - 1);
  const pts = points.map((p, i) => `${i * step},${h - (p / max) * (h - 24) - 12}`);
  const line = pts.join(' ');
  const area = `0,${h} ${line} ${w},${h}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="mt-5 h-44 w-full">
      <defs>
        <linearGradient id="ins-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="oklch(var(--accent))" stopOpacity="0.18" />
          <stop offset="1" stopColor="oklch(var(--accent))" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((g) => (
        <line key={g} x1="0" y1={h * g} x2={w} y2={h * g} stroke="oklch(var(--line))" strokeWidth="1" />
      ))}
      <polygon points={area} fill="url(#ins-fill)" />
      <polyline points={line} fill="none" stroke="oklch(var(--accent))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={w} cy={h - (points[points.length - 1] / max) * (h - 24) - 12} r="4.5" fill="oklch(var(--accent))" stroke="oklch(var(--panel))" strokeWidth="2.5" />
    </svg>
  );
}
