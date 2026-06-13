import { describe, expect, it } from 'vitest';
import { aggregate } from './analytics';

const DAY = 86_400_000;
const now = Date.parse('2026-06-13T12:00:00Z');
const at = (daysAgo: number) => new Date(now - daysAgo * DAY).toISOString();

describe('analytics aggregate — gerçek görüntülenme istatistiği', () => {
  const rows = [
    { demo_id: 'a', viewed_at: at(1), session: 's1' },
    { demo_id: 'a', viewed_at: at(2), session: 's1' },
    { demo_id: 'a', viewed_at: at(3), session: 's2' },
    { demo_id: 'b', viewed_at: at(1), session: 's3' },
    // önceki dönem (10–20 gün önce)
    { demo_id: 'a', viewed_at: at(12), session: 's1' },
    { demo_id: 'b', viewed_at: at(15), session: 's1' },
  ];

  it('current/previous dönem ve tekil ziyaretçi doğru ayrışır', () => {
    const s = aggregate(rows, 10, now);
    expect(s.total).toBe(4); // son 10 gün
    expect(s.prevTotal).toBe(2); // 10–20 gün
    expect(s.unique).toBe(3); // s1, s2, s3
    expect(s.prevUnique).toBe(1); // s1
  });

  it('byDemo görüntülenmeye göre sıralı, last alanı dolu', () => {
    const s = aggregate(rows, 10, now);
    expect(s.byDemo.map((d) => d.demoId)).toEqual(['a', 'b']);
    expect(s.byDemo[0]?.views).toBe(3);
    expect(s.byDemo[1]?.views).toBe(1);
    expect(Date.parse(s.byDemo[0]!.last)).not.toBeNaN();
  });

  it('trend kova sayısı = min(days,30) ve toplam = current', () => {
    const s = aggregate(rows, 10, now);
    expect(s.trend).toHaveLength(10);
    expect(s.trend.reduce((a, b) => a + b, 0)).toBe(4);
    const s90 = aggregate(rows, 90, now);
    expect(s90.trend).toHaveLength(30);
  });

  it('boş veri → sıfırlar', () => {
    const s = aggregate([], 30, now);
    expect(s.total).toBe(0);
    expect(s.byDemo).toEqual([]);
    expect(s.trend).toHaveLength(30);
  });
});
