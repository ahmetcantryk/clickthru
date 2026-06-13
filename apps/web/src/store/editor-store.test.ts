import { beforeEach, describe, expect, it } from 'vitest';
import type { Demo } from '@clickthru/schema';
import { safeValidateDemo } from '@clickthru/schema';
import { useEditorStore } from './editor-store';

const base: Demo = {
  id: 't',
  title: 'T',
  defaultBackground: '#ffffff',
  steps: [
    { id: 'a', order: 1, type: 'screenshot', media: '/a.svg' },
    { id: 'b', order: 2, type: 'video', media: '/v.mp4' },
  ],
};

beforeEach(() => {
  useEditorStore.setState({ demo: structuredClone(base), stepIndex: 0, selection: { kind: 'step' } });
});

const st = () => useEditorStore.getState();

describe('editor-store — immutable düzenleme', () => {
  it('addStep adım ekler, order normalize olur', () => {
    st().addStep();
    expect(st().demo.steps.length).toBe(3);
    expect(st().demo.steps.map((s) => s.order)).toEqual([1, 2, 3]);
  });

  it('moveStep sırayı değiştirir, order korunur', () => {
    st().moveStep(0, 1);
    expect(st().demo.steps.map((s) => s.id)).toEqual(['b', 'a']);
    expect(st().demo.steps.map((s) => s.order)).toEqual([1, 2]);
  });

  it('reorderStep adımı taşır, order normalize olur, aktif adım kimliğiyle takip eder', () => {
    useEditorStore.setState({
      demo: {
        ...structuredClone(base),
        steps: [
          { id: 'a', order: 1, type: 'screenshot', media: '/a.svg' },
          { id: 'b', order: 2, type: 'screenshot', media: '/b.svg' },
          { id: 'c', order: 3, type: 'screenshot', media: '/c.svg' },
        ],
      },
      stepIndex: 0,
      selection: { kind: 'step' },
    });
    st().reorderStep(0, 2); // 'a'yı sona taşı
    expect(st().demo.steps.map((s) => s.id)).toEqual(['b', 'c', 'a']);
    expect(st().demo.steps.map((s) => s.order)).toEqual([1, 2, 3]);
    expect(st().stepIndex).toBe(2); // aktif 'a' yeni konumunda
  });

  it('deleteStep siler, index sınırda kalır', () => {
    st().selectStep(1);
    st().deleteStep(1);
    expect(st().demo.steps.length).toBe(1);
    expect(st().stepIndex).toBe(0);
  });

  it('setHotspotPos orijinali MUTATE ETMEZ', () => {
    const before = st().demo;
    st().setHotspotPos(0.3, 0.4);
    expect(st().demo).not.toBe(before);
    expect(before.steps[0]?.hotspot).toBeUndefined();
    expect(st().demo.steps[0]?.hotspot).toEqual({ x: 0.3, y: 0.4 });
  });

  it('callout ekle/güncelle/sil', () => {
    st().addCallout();
    st().updateCallout({ title: 'X', pointer: 'right' });
    expect(st().demo.steps[0]?.callout?.title).toBe('X');
    expect(st().demo.steps[0]?.callout?.pointer).toBe('right');
    st().removeCallout();
    expect(st().demo.steps[0]?.callout).toBeUndefined();
  });

  it('overlay ekle/taşı/sil', () => {
    st().addOverlay();
    const id = st().demo.steps[0]?.textOverlays?.[0]?.id;
    expect(id).toBeTruthy();
    if (id) {
      st().setOverlayPos(id, 0.6, 0.7);
      expect(st().demo.steps[0]?.textOverlays?.[0]).toMatchObject({ x: 0.6, y: 0.7 });
      st().removeOverlay(id);
    }
    expect(st().demo.steps[0]?.textOverlays?.length ?? 0).toBe(0);
  });

  it('kişiselleştirme değişkeni ekle/güncelle/sil', () => {
    st().addVariable();
    expect(st().demo.variables?.length).toBe(1);
    expect(st().demo.variables?.[0]?.key).toBe('var1');
    st().updateVariable(0, { key: 'company', label: 'Şirket', default: 'Acme' });
    expect(st().demo.variables?.[0]).toMatchObject({ key: 'company', label: 'Şirket', default: 'Acme' });
    st().addVariable();
    expect(st().demo.variables?.[1]?.key).toBe('var2');
    st().removeVariable(0);
    expect(st().demo.variables?.map((v) => v.key)).toEqual(['var2']);
  });

  it('düzenleme sonrası çıktı geçerli schema JSON', () => {
    st().addStep();
    st().addCallout();
    st().addHotspot();
    st().addFocus();
    st().addOverlay();
    st().addVariable();
    expect(safeValidateDemo(st().demo).ok).toBe(true);
  });
});
