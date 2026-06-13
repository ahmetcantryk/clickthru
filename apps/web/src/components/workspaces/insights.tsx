'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Eye, LayoutGrid, Sigma, Users } from 'lucide-react';
import { getViewStats, type ViewStats } from '@/lib/analytics';
import { getLeads, type Lead } from '@/lib/leads';
import type { DemoSummary } from '@/lib/demos';
import { useT, type Copy } from '@/lib/i18n';
import { AppLayout, useDemos } from '@/components/app/app-layout';
import { Select } from '@/components/ui/select';

export function InsightsApp() {
  return (
    <AppLayout active="insights">
      <Insights />
    </AppLayout>
  );
}

function ago(iso: string | undefined, t: Copy): string {
  if (!iso) return t.time.recently;
  const s = Math.floor((Date.now() - Date.parse(iso)) / 1000);
  if (Number.isNaN(s)) return t.time.recently;
  if (s < 60) return t.time.justNow;
  const m = Math.floor(s / 60);
  if (m < 60) return t.time.min(m);
  const h = Math.floor(m / 60);
  if (h < 24) return t.time.hour(h);
  const d = Math.floor(h / 24);
  if (d < 30) return t.time.day(d);
  return t.time.month(Math.floor(d / 30));
}

function delta(cur: number, prev: number): { text: string; up: boolean } | null {
  if (prev === 0) return cur > 0 ? { text: '+100%', up: true } : null;
  const d = Math.round(((cur - prev) / prev) * 100);
  if (d === 0) return null;
  return { text: `${d > 0 ? '+' : '−'}${Math.abs(d)}%`, up: d > 0 };
}

function Insights() {
  const { t, lang } = useT();
  const demos = useDemos();
  const [range, setRange] = useState('30');
  const [stats, setStats] = useState<ViewStats | null>(null);
  const locale = lang === 'tr' ? 'tr-TR' : 'en-US';
  const days = range === '7' ? 7 : range === '90' ? 90 : 30;

  useEffect(() => {
    let alive = true;
    setStats(null);
    getViewStats(days)
      .then((s) => alive && setStats(s))
      .catch(() => alive && setStats(null));
    return () => {
      alive = false;
    };
  }, [days]);

  const byId = useMemo(() => {
    const m = new Map<string, DemoSummary>();
    (demos ?? []).forEach((d) => m.set(d.id, d));
    return m;
  }, [demos]);

  const loading = stats === null;
  const empty = !loading && stats.total === 0 && stats.prevTotal === 0;
  const viewedDemos = stats?.byDemo.length ?? 0;
  const avg = stats && viewedDemos ? Math.round(stats.total / viewedDemos) : 0;

  const cards = [
    { icon: <Eye className="h-4 w-4" />, label: t.insights.views, value: stats?.total ?? 0, d: stats ? delta(stats.total, stats.prevTotal) : null },
    { icon: <Users className="h-4 w-4" />, label: t.insights.uniqueVisitors, value: stats?.unique ?? 0, d: stats ? delta(stats.unique, stats.prevUnique) : null },
    { icon: <LayoutGrid className="h-4 w-4" />, label: t.insights.viewedDemos, value: viewedDemos, d: null },
    { icon: <Sigma className="h-4 w-4" />, label: t.insights.avgPerDemo, value: avg, d: null },
  ];

  return (
    <div className="mx-auto max-w-5xl px-8 py-9">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-extrabold tracking-tight text-ink">{t.insights.title}</h1>
          <p className="mt-1 text-[14px] text-ink-faint">{t.insights.sub}</p>
        </div>
        <div className="w-[150px]">
          <Select value={range} onValueChange={setRange} options={[{ value: '7', label: t.insights.ranges.d7 }, { value: '30', label: t.insights.ranges.d30 }, { value: '90', label: t.insights.ranges.d90 }]} />
        </div>
      </div>

      <div className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((s) => (
          <div key={s.label} className="rounded-2xl border border-hairline bg-surface p-5">
            <div className="flex items-center gap-2 text-ink-faint">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-subtle text-ink-muted">{s.icon}</span>
              <span className="text-[12.5px] font-medium text-ink-muted">{s.label}</span>
            </div>
            <div className="mt-3 text-[28px] font-extrabold tracking-tight text-ink">{loading ? '—' : s.value.toLocaleString(locale)}</div>
            {s.d ? (
              <div className={`mt-1.5 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[12px] font-semibold ${s.d.up ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'}`}>
                {s.d.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {s.d.text}
              </div>
            ) : (
              <div className="mt-1.5 h-[21px]" />
            )}
          </div>
        ))}
      </div>

      {empty ? (
        <div className="mt-5 flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-hairline-strong bg-surface-subtle py-16 text-center">
          <Eye className="h-7 w-7 text-ink-faint" />
          <p className="text-[15px] font-semibold text-ink">{t.insights.empty}</p>
          <p className="max-w-sm text-[13px] text-ink-faint">{t.insights.emptySub}</p>
        </div>
      ) : (
        <>
          <div className="mt-5 rounded-2xl border border-hairline bg-surface p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-bold text-ink">{t.insights.trend}</h2>
              <span className="font-mono text-[12px] text-ink-faint">{t.insights.rangeShort(range)}</span>
            </div>
            {loading ? <div className="mt-5 h-44 animate-pulse rounded-xl bg-surface-subtle" /> : <TrendChart points={stats.trend} />}
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-hairline bg-surface">
            <div className="flex items-center justify-between border-b border-hairline px-6 py-4">
              <h2 className="text-[15px] font-bold text-ink">{t.insights.topTitle}</h2>
            </div>
            <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-6 py-2.5 text-[11.5px] font-semibold uppercase tracking-wide text-ink-faint">
              <span>{t.insights.colDemo}</span>
              <span className="w-24 text-right">{t.insights.colViews}</span>
              <span className="w-32 text-right">{t.insights.colLast}</span>
            </div>
            {loading ? (
              <div className="px-6 pb-6">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="my-2 h-8 animate-pulse rounded-lg bg-surface-subtle" />)}</div>
            ) : (
              stats.byDemo.slice(0, 6).map((row) => {
                const d = byId.get(row.demoId);
                return (
                  <div key={row.demoId} className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-t border-hairline px-6 py-3 text-[14px]">
                    <div className="flex items-center gap-3 truncate">
                      <span className="h-8 w-12 flex-none overflow-hidden rounded-md bg-gradient-to-br from-accent-muted to-surface-subtle">
                        {d?.thumbnail && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={d.thumbnail} alt="" className="h-full w-full object-cover object-top" />
                        )}
                      </span>
                      <a href={`/play/${row.demoId}`} target="_blank" rel="noreferrer" className="truncate font-semibold text-ink hover:text-accent">{d?.title ?? row.demoId}</a>
                    </div>
                    <span className="w-24 text-right font-mono tabular-nums text-ink">{row.views.toLocaleString(locale)}</span>
                    <span className="w-32 text-right text-[12.5px] text-ink-faint">{ago(row.last, t)}</span>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      <LeadsPanel byId={byId} />
    </div>
  );
}

/** Lead yakalama tablosu — sahibin demolarına gelen son leadler (RLS owner; lead yoksa gizli). */
function LeadsPanel({ byId }: { byId: Map<string, DemoSummary> }) {
  const { t } = useT();
  const [leads, setLeads] = useState<Lead[] | null>(null);

  useEffect(() => {
    let alive = true;
    getLeads(100)
      .then((l) => alive && setLeads(l))
      .catch(() => alive && setLeads(null));
    return () => {
      alive = false;
    };
  }, []);

  if (!leads || leads.length === 0) return null;

  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-hairline bg-surface">
      <div className="flex items-center justify-between border-b border-hairline px-6 py-4">
        <h2 className="text-[15px] font-bold text-ink">{t.insights.leadsTitle}</h2>
        <span className="font-mono text-[12px] text-ink-faint">{leads.length}</span>
      </div>
      <div className="grid grid-cols-[1.4fr_1fr_auto] gap-4 px-6 py-2.5 text-[11.5px] font-semibold uppercase tracking-wide text-ink-faint">
        <span>{t.insights.leadContact}</span>
        <span className="truncate">{t.insights.colDemo}</span>
        <span className="w-28 text-right">{t.insights.colLast}</span>
      </div>
      {leads.slice(0, 15).map((l, i) => (
        <div
          key={i}
          className="grid grid-cols-[1.4fr_1fr_auto] items-center gap-4 border-t border-hairline px-6 py-3 text-[14px]"
        >
          <div className="min-w-0">
            <div className="truncate font-semibold text-ink">{l.email}</div>
            {(l.name || l.company) && (
              <div className="truncate text-[12.5px] text-ink-faint">
                {[l.name, l.company].filter(Boolean).join(' · ')}
              </div>
            )}
          </div>
          <a
            href={`/play/${l.demoId}`}
            target="_blank"
            rel="noreferrer"
            className="truncate text-[13px] font-medium text-ink-muted hover:text-accent"
          >
            {byId.get(l.demoId)?.title ?? l.demoId}
          </a>
          <span className="w-28 text-right text-[12.5px] text-ink-faint">{ago(l.createdAt, t)}</span>
        </div>
      ))}
    </div>
  );
}

function TrendChart({ points }: { points: number[] }) {
  const w = 900;
  const h = 200;
  const max = Math.max(...points, 1);
  const n = Math.max(points.length, 2);
  const step = w / (n - 1);
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
      {points.length > 0 && (
        <circle cx={w} cy={h - (points[points.length - 1] / max) * (h - 24) - 12} r="4.5" fill="oklch(var(--accent))" stroke="oklch(var(--panel))" strokeWidth="2.5" />
      )}
    </svg>
  );
}
