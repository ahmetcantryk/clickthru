import { beforeEach, describe, expect, it, vi } from 'vitest';

// Paylaşılan, değiştirilebilir mock durumu (vi.mock fabrikasından erişilir).
const h = vi.hoisted(() => ({
  state: {
    session: null as null | { user: { id: string } },
    listData: { data: [] as unknown[], error: null as unknown },
    getData: { data: null as unknown, error: null as unknown },
    cap: {} as Record<string, unknown>,
  },
}));

vi.mock('./supabase/client', () => {
  const builder = () => {
    const b: Record<string, unknown> = {};
    Object.assign(b, {
      select: () => b,
      eq: (c: string, v: unknown) => {
        const arr = (h.state.cap.eq as [string, unknown][] | undefined) ?? [];
        arr.push([c, v]);
        h.state.cap.eq = arr;
        return b;
      },
      order: (c: string, o: unknown) => {
        h.state.cap.order = [c, o];
        return b;
      },
      limit: () => Promise.resolve(h.state.listData),
      maybeSingle: () => Promise.resolve(h.state.getData),
      upsert: (row: unknown) => {
        h.state.cap.upsert = row;
        return Promise.resolve({ error: null });
      },
      delete: () => {
        h.state.cap.deleted = true;
        return { eq: (c: string, v: unknown) => ((h.state.cap.deleteEq = [c, v]), Promise.resolve({ error: null })) };
      },
      update: (patch: unknown) => {
        h.state.cap.update = patch;
        return { eq: (c: string, v: unknown) => ((h.state.cap.updateEq = [c, v]), Promise.resolve({ error: null })) };
      },
    });
    return b;
  };
  const client = {
    from: () => builder(),
    auth: { getSession: () => Promise.resolve({ data: { session: h.state.session } }) },
  };
  return { createSupabaseClient: () => client };
});

import { blankDemo, deleteDemo, listDemos, renameDemo, saveDemo } from './demos';
import type { Demo } from '@clickthru/schema';

const validDemo: Demo = { id: 'd1', title: 'T', steps: [] };

beforeEach(() => {
  h.state.session = null;
  h.state.listData = { data: [], error: null };
  h.state.getData = { data: null, error: null };
  h.state.cap = {};
});

describe('demos lib — ownership & queries', () => {
  it('blankDemo geçerli, boş adımlı bir demo üretir', () => {
    const d = blankDemo();
    expect(d.steps).toEqual([]);
    expect(d.title.length).toBeGreaterThan(0);
    expect(d.id).toMatch(/^demo/);
  });

  it('saveDemo geçersiz demoyu YAZMADAN reddeder (fail-fast)', async () => {
    await expect(saveDemo({ id: '', title: '', steps: [] } as unknown as Demo)).rejects.toThrow();
    expect(h.state.cap.upsert).toBeUndefined();
  });

  it('saveDemo owner_id = oturum kullanıcısı + is_public true ile sahiplenir', async () => {
    h.state.session = { user: { id: 'U1' } };
    await saveDemo(validDemo);
    expect(h.state.cap.upsert).toMatchObject({ id: 'd1', is_public: true, owner_id: 'U1' });
  });

  it('listDemos oturum yoksa boş döner ve sorgu açmaz', async () => {
    const r = await listDemos();
    expect(r).toEqual([]);
    expect(h.state.cap.eq).toBeUndefined();
  });

  it('listDemos owner_id ile filtreler, updated_at desc sıralar, geçersiz satırı eler', async () => {
    h.state.session = { user: { id: 'U1' } };
    h.state.listData = {
      data: [
        { id: 'd1', title: 'A', data: validDemo, updated_at: '2026-06-02T00:00:00Z' },
        { id: 'bad', title: null, data: { nope: true }, updated_at: null },
      ],
      error: null,
    };
    const r = await listDemos();
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({ id: 'd1', title: 'A', steps: 0 });
    expect(h.state.cap.eq).toContainEqual(['owner_id', 'U1']);
    expect(h.state.cap.order).toEqual(['updated_at', { ascending: false }]);
  });

  it('deleteDemo id ile siler', async () => {
    await deleteDemo('d1');
    expect(h.state.cap.deleted).toBe(true);
    expect(h.state.cap.deleteEq).toEqual(['id', 'd1']);
  });

  it('renameDemo boş başlığı reddeder, dolu başlığı id ile günceller', async () => {
    await expect(renameDemo('d1', '   ')).rejects.toThrow();
    expect(h.state.cap.update).toBeUndefined();
    await renameDemo('d1', 'Yeni ad');
    expect(h.state.cap.update).toEqual({ title: 'Yeni ad' });
    expect(h.state.cap.updateEq).toEqual(['id', 'd1']);
  });
});
