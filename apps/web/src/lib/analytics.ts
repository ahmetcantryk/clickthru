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
    await supabase.from('demo_views').insert({ demo_id: demoId, session: anonId(), event: 'view' });
  } catch {
    // analitik kritik değil — sessizce geç.
  }
}

/** Tamamlanma kaydet — görüntüleyen turun son adımına ulaştığında (fire-and-forget). */
export async function recordComplete(demoId: string): Promise<void> {
  try {
    const supabase = createSupabaseClient();
    await supabase.from('demo_views').insert({ demo_id: demoId, session: anonId(), event: 'complete' });
  } catch {
    // analitik kritik değil — sessizce geç.
  }
}

export interface DemoViewCount {
  demoId: string;
  views: number;
  /** Bu demoyu tamamlayan tekil oturum oranı (0–100). */
  completion: number;
  last: string;
}

export interface ViewStats {
  total: number;
  prevTotal: number;
  unique: number;
  prevUnique: number;
  /** Tamamlayan tekil oturum / görüntüleyen tekil oturum (0–100). */
  completionRate: number;
  byDemo: DemoViewCount[];
  trend: number[];
  days: number;
}

interface Row {
  demo_id: string;
  viewed_at: string;
  session: string | null;
  /** 'view' (default) | 'complete'. */
  event?: string | null;
}

const DAY = 86_400_000;

function empty(days: number): ViewStats {
  return { total: 0, prevTotal: 0, unique: 0, prevUnique: 0, completionRate: 0, byDemo: [], trend: new Array(Math.min(days, 30)).fill(0), days };
}

/** Aggregate'i saf fonksiyonda tut (test edilebilir). 'view' ve 'complete' olaylarını ayırır. */
export function aggregate(rows: Row[], days: number, now: number): ViewStats {
  const since = now - days * DAY;
  const isView = (r: Row) => (r.event ?? 'view') === 'view';
  const isComplete = (r: Row) => r.event === 'complete';

  const cur: Row[] = [];
  const prev: Row[] = [];
  for (const r of rows) {
    const t = Date.parse(r.viewed_at);
    if (Number.isNaN(t)) continue;
    if (t >= since) cur.push(r);
    else prev.push(r);
  }

  const curViews = cur.filter(isView);
  const prevViews = prev.filter(isView);
  const curCompletes = cur.filter(isComplete);

  const uniq = (rs: Row[]) => new Set(rs.map((r) => r.session ?? '?')).size;
  const unique = uniq(curViews);
  const completionRate = unique ? Math.round((uniq(curCompletes) / unique) * 100) : 0;

  const byMap = new Map<string, { views: number; last: number; viewS: Set<string>; doneS: Set<string> }>();
  const ensure = (id: string) => {
    let e = byMap.get(id);
    if (!e) {
      e = { views: 0, last: 0, viewS: new Set(), doneS: new Set() };
      byMap.set(id, e);
    }
    return e;
  };
  for (const r of curViews) {
    const e = ensure(r.demo_id);
    e.views += 1;
    e.last = Math.max(e.last, Date.parse(r.viewed_at) || 0);
    e.viewS.add(r.session ?? '?');
  }
  for (const r of curCompletes) {
    // yalnız görüntülenmesi olan demolar için tamamlanma sayılır (view-temelli oran).
    byMap.get(r.demo_id)?.doneS.add(r.session ?? '?');
  }
  const byDemo: DemoViewCount[] = [...byMap.entries()]
    .map(([demoId, e]) => ({
      demoId,
      views: e.views,
      completion: e.viewS.size ? Math.round((e.doneS.size / e.viewS.size) * 100) : 0,
      last: new Date(e.last).toISOString(),
    }))
    .sort((a, b) => b.views - a.views);

  const buckets = Math.min(days, 30);
  const width = (days * DAY) / buckets;
  const trend = new Array(buckets).fill(0) as number[];
  for (const r of curViews) {
    const t = Date.parse(r.viewed_at);
    let i = Math.floor((t - since) / width);
    if (i < 0) i = 0;
    if (i >= buckets) i = buckets - 1;
    trend[i] += 1;
  }

  return { total: curViews.length, prevTotal: prevViews.length, unique, prevUnique: uniq(prevViews), completionRate, byDemo, trend, days };
}

/** Son `days` gün için sahibin demolarının görüntülenme istatistiği (önceki dönemle kıyas dahil). */
export async function getViewStats(days: number): Promise<ViewStats | null> {
  const supabase = createSupabaseClient();
  const { data: auth } = await supabase.auth.getSession();
  if (!auth.session) return null;

  const prevSince = new Date(Date.now() - 2 * days * DAY).toISOString();
  const { data, error } = await supabase
    .from('demo_views')
    .select('demo_id, viewed_at, session, event')
    .gte('viewed_at', prevSince)
    .order('viewed_at', { ascending: true })
    .limit(20000);

  if (error || !data) return empty(days);
  return aggregate(data as Row[], days, Date.now());
}
