import { createSupabaseClient } from './supabase/client';

/**
 * Demo görüntülenme analitiği. View kaydı /play & /embed'de yazılır (RLS: yalnız public demo);
 * istatistikler yalnızca demonun sahibine döner (RLS: owner). Mock yok — gerçek veri.
 */

const ANON_KEY = 'clickthru-anon';

/** Kalıcı anonim ziyaretçi kimliği (tekil ziyaretçi sayımı için). */
function anonId(): string {
  if (typeof window === 'undefined') return 'srv';
  try {
    let id = localStorage.getItem(ANON_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(ANON_KEY, id);
    }
    return id;
  } catch {
    return 'anon';
  }
}

/** Bir görüntülenme kaydet (fire-and-forget; örnek/özel demo → RLS reddeder, yoksayılır). */
export async function recordView(demoId: string): Promise<void> {
  try {
    const supabase = createSupabaseClient();
    await supabase.from('demo_views').insert({ demo_id: demoId, session: anonId() });
  } catch {
    // analitik kritik değil — sessizce geç.
  }
}

export interface DemoViewCount {
  demoId: string;
  views: number;
  last: string;
}

export interface ViewStats {
  total: number;
  prevTotal: number;
  unique: number;
  prevUnique: number;
  byDemo: DemoViewCount[];
  trend: number[];
  days: number;
}

interface Row {
  demo_id: string;
  viewed_at: string;
  session: string | null;
}

const DAY = 86_400_000;

function empty(days: number): ViewStats {
  return { total: 0, prevTotal: 0, unique: 0, prevUnique: 0, byDemo: [], trend: new Array(Math.min(days, 30)).fill(0), days };
}

/** Aggregate'i saf fonksiyonda tut (test edilebilir). */
export function aggregate(rows: Row[], days: number, now: number): ViewStats {
  const since = now - days * DAY;
  const cur: Row[] = [];
  const prev: Row[] = [];
  for (const r of rows) {
    const t = Date.parse(r.viewed_at);
    if (Number.isNaN(t)) continue;
    if (t >= since) cur.push(r);
    else prev.push(r);
  }

  const uniq = (rs: Row[]) => new Set(rs.map((r) => r.session ?? '?')).size;

  const byMap = new Map<string, { views: number; last: number }>();
  for (const r of cur) {
    const e = byMap.get(r.demo_id) ?? { views: 0, last: 0 };
    e.views += 1;
    e.last = Math.max(e.last, Date.parse(r.viewed_at) || 0);
    byMap.set(r.demo_id, e);
  }
  const byDemo: DemoViewCount[] = [...byMap.entries()]
    .map(([demoId, e]) => ({ demoId, views: e.views, last: new Date(e.last).toISOString() }))
    .sort((a, b) => b.views - a.views);

  const buckets = Math.min(days, 30);
  const width = (days * DAY) / buckets;
  const trend = new Array(buckets).fill(0) as number[];
  for (const r of cur) {
    const t = Date.parse(r.viewed_at);
    let i = Math.floor((t - since) / width);
    if (i < 0) i = 0;
    if (i >= buckets) i = buckets - 1;
    trend[i] += 1;
  }

  return { total: cur.length, prevTotal: prev.length, unique: uniq(cur), prevUnique: uniq(prev), byDemo, trend, days };
}

/** Son `days` gün için sahibin demolarının görüntülenme istatistiği (önceki dönemle kıyas dahil). */
export async function getViewStats(days: number): Promise<ViewStats | null> {
  const supabase = createSupabaseClient();
  const { data: auth } = await supabase.auth.getSession();
  if (!auth.session) return null;

  const prevSince = new Date(Date.now() - 2 * days * DAY).toISOString();
  const { data, error } = await supabase
    .from('demo_views')
    .select('demo_id, viewed_at, session')
    .gte('viewed_at', prevSince)
    .order('viewed_at', { ascending: true })
    .limit(20000);

  if (error || !data) return empty(days);
  return aggregate(data as Row[], days, Date.now());
}
