import { create } from 'zustand';
import type {
  BoxStyle,
  Callout,
  Demo,
  DemoVariable,
  FocusEase,
  Hotspot,
  LeadForm,
  Step,
  TextOverlay,
  Wrapper,
} from '@clickthru/schema';
import { sampleZoomDemo } from '@clickthru/schema';
import { genDemoId, genId } from '@/lib/id';

/** Zoom dikdörtgeni (oransal sol-üst köşe + boyut). */
export type FocusRect = { x: number; y: number; w: number; h: number };

/** Dikdörtgenin en küçük kenarı (oransal). */
const MIN_FOCUS = 0.06;

/** Dikdörtgeni min boyuta ve tuval sınırlarına kırpar. */
function clampFocusRect({ x, y, w, h }: FocusRect): FocusRect {
  const cw = Math.min(1, Math.max(MIN_FOCUS, w));
  const ch = Math.min(1, Math.max(MIN_FOCUS, h));
  return {
    w: cw,
    h: ch,
    x: Math.min(1 - cw, Math.max(0, x)),
    y: Math.min(1 - ch, Math.max(0, y)),
  };
}

/** Hangi öğe seçili → sağ Inspector içeriğini belirler. */
export type Selection =
  | { kind: 'demo' }
  | { kind: 'step' }
  | { kind: 'hotspot' }
  | { kind: 'callout' }
  | { kind: 'focus' }
  | { kind: 'overlay'; id: string };

interface EditorState {
  demo: Demo;
  stepIndex: number;
  selection: Selection;

  selectStep: (i: number) => void;
  select: (s: Selection) => void;

  /** Kaydedilmiş bir demoyu editöre yükler (paylaşım linkinden düzenleme). */
  loadDemo: (demo: Demo) => void;
  /** Paylaşım öncesi: örnek demo id'si ise benzersiz id'ye çevirir; kaydedilecek id'yi döndürür. */
  prepareShare: () => string;

  setTitle: (t: string) => void;
  setDemoBackground: (c: string) => void;
  setWrapper: (w: Wrapper) => void;

  // Kişiselleştirme değişkenleri (demo düzeyi; callout/metinde `{{key}}`).
  addVariable: () => void;
  updateVariable: (i: number, patch: Partial<DemoVariable>) => void;
  removeVariable: (i: number) => void;

  // Lead yakalama formu (demo düzeyi; turdan önce/sonra).
  setLeadForm: (form: LeadForm | undefined) => void;
  updateLeadForm: (patch: Partial<LeadForm>) => void;

  addStep: () => void;
  addStepWithMedia: (media: string) => void;
  insertStepAfter: (i: number) => void;
  duplicateStep: (i: number) => void;
  renameStep: (i: number, name: string) => void;
  toggleSkip: (i: number) => void;
  deleteStep: (i: number) => void;
  moveStep: (i: number, dir: -1 | 1) => void;
  /** Sürükle-bırak: `from` adımını `to` konumuna taşır (aktif adım kimliğiyle takip edilir). */
  reorderStep: (from: number, to: number) => void;
  setStepBackground: (c: string | undefined) => void;

  // "Tümüne uygula" — aktif adımdaki ilgili ayarı tüm adımlara yayar (dinamik: o anki değerler).
  applyBackgroundToAll: () => void;
  applyCalloutStyleToAll: () => void;
  applyFocusEaseToAll: () => void;

  addHotspot: () => void;
  setHotspotPos: (x: number, y: number) => void;
  setHotspot: (patch: Partial<Hotspot>) => void;
  removeHotspot: () => void;

  addCallout: () => void;
  updateCallout: (patch: Partial<Callout>) => void;
  updateCalloutStyle: (patch: Partial<BoxStyle>) => void;
  setCalloutPos: (x: number, y: number) => void;
  removeCallout: () => void;

  addFocus: () => void;
  /** Zoom dikdörtgenini ayarla (oransal); tuval sınırına ve min boyuta kırpılır. */
  setFocusRect: (rect: FocusRect) => void;
  setFocusEase: (ease: FocusEase) => void;
  removeFocus: () => void;

  addOverlay: () => void;
  updateOverlay: (id: string, patch: Partial<TextOverlay>) => void;
  updateOverlayStyle: (id: string, patch: Partial<BoxStyle>) => void;
  setOverlayPos: (id: string, x: number, y: number) => void;
  removeOverlay: (id: string) => void;
}

const DEFAULT_MEDIA = '/samples/dashboard-1.svg';

/** Örnek (seed) demo id'leri — paylaşımda üzerine yazılmasın diye yeni id atanır. */
const SAMPLE_IDS = new Set(['demo_showcase', 'demo_screens', 'demo_mixed', 'demo_long', 'demo_video']);

/** order alanını dizi sırasıyla eşitler (sıra değişince bozulmasın). */
function normalize(steps: Step[]): Step[] {
  return steps.map((s, i) => (s.order === i + 1 ? s : { ...s, order: i + 1 }));
}

export const useEditorStore = create<EditorState>((set, get) => {
  // Aktif adımı immutable patch'ler (asla mutate etmez — global coding-style CRITICAL).
  const patchStep = (patch: Partial<Step>) => {
    const { demo, stepIndex } = get();
    const steps = demo.steps.map((s, i) => (i === stepIndex ? { ...s, ...patch } : s));
    set({ demo: { ...demo, steps } });
  };
  const curStep = (): Step | undefined => {
    const { demo, stepIndex } = get();
    return demo.steps[stepIndex];
  };

  return {
    demo: sampleZoomDemo,
    stepIndex: 0,
    selection: { kind: 'step' },

    selectStep: (i) => set({ stepIndex: i, selection: { kind: 'step' } }),
    select: (s) => set({ selection: s }),

    loadDemo: (demo) => set({ demo, stepIndex: 0, selection: { kind: 'step' } }),
    prepareShare: () => {
      const { demo } = get();
      if (!SAMPLE_IDS.has(demo.id)) return demo.id;
      // Örnek demo paylaşılıyor → tahmin edilemez yeni id ata (URL gizliliği).
      const id = genDemoId();
      set({ demo: { ...demo, id } });
      return id;
    },

    setTitle: (t) => set((st) => ({ demo: { ...st.demo, title: t } })),
    setDemoBackground: (c) => set((st) => ({ demo: { ...st.demo, defaultBackground: c } })),
    setWrapper: (w) => set((st) => ({ demo: { ...st.demo, wrapper: w } })),

    addVariable: () =>
      set((st) => {
        const n = (st.demo.variables?.length ?? 0) + 1;
        const v: DemoVariable = { key: `var${n}`, label: `Variable ${n}`, default: '' };
        return { demo: { ...st.demo, variables: [...(st.demo.variables ?? []), v] } };
      }),
    updateVariable: (i, patch) =>
      set((st) => ({
        demo: {
          ...st.demo,
          variables: (st.demo.variables ?? []).map((v, idx) => (idx === i ? { ...v, ...patch } : v)),
        },
      })),
    removeVariable: (i) =>
      set((st) => ({
        demo: { ...st.demo, variables: (st.demo.variables ?? []).filter((_, idx) => idx !== i) },
      })),

    setLeadForm: (form) => set((st) => ({ demo: { ...st.demo, leadForm: form } })),
    updateLeadForm: (patch) =>
      set((st) => ({
        demo: { ...st.demo, leadForm: { ...(st.demo.leadForm ?? { position: 'end' }), ...patch } },
      })),

    addStep: () =>
      set((st) => {
        const newStep: Step = {
          id: genId('step'),
          order: st.demo.steps.length + 1,
          type: 'screenshot',
          media: st.demo.steps[st.stepIndex]?.media ?? DEFAULT_MEDIA,
        };
        const steps = normalize([...st.demo.steps, newStep]);
        return { demo: { ...st.demo, steps }, stepIndex: steps.length - 1, selection: { kind: 'step' } };
      }),

    addStepWithMedia: (media) =>
      set((st) => {
        const newStep: Step = { id: genId('step'), order: st.demo.steps.length + 1, type: 'screenshot', media };
        const steps = normalize([...st.demo.steps, newStep]);
        return { demo: { ...st.demo, steps }, stepIndex: steps.length - 1, selection: { kind: 'step' } };
      }),

    insertStepAfter: (i) =>
      set((st) => {
        const newStep: Step = {
          id: genId('step'),
          order: i + 2,
          type: 'screenshot',
          media: st.demo.steps[i]?.media ?? DEFAULT_MEDIA,
        };
        const arr = [...st.demo.steps];
        arr.splice(i + 1, 0, newStep);
        const steps = normalize(arr);
        return { demo: { ...st.demo, steps }, stepIndex: i + 1, selection: { kind: 'step' } };
      }),

    duplicateStep: (i) =>
      set((st) => {
        const src = st.demo.steps[i];
        if (!src) return {};
        const copy: Step = structuredClone(src);
        copy.id = genId('step');
        if (copy.name) copy.name = `${copy.name} kopya`;
        const arr = [...st.demo.steps];
        arr.splice(i + 1, 0, copy);
        const steps = normalize(arr);
        return { demo: { ...st.demo, steps }, stepIndex: i + 1, selection: { kind: 'step' } };
      }),

    renameStep: (i, name) =>
      set((st) => ({
        demo: { ...st.demo, steps: st.demo.steps.map((s, idx) => (idx === i ? { ...s, name } : s)) },
      })),

    toggleSkip: (i) =>
      set((st) => ({
        demo: {
          ...st.demo,
          steps: st.demo.steps.map((s, idx) => (idx === i ? { ...s, skip: !s.skip } : s)),
        },
      })),

    deleteStep: (i) =>
      set((st) => {
        const steps = normalize(st.demo.steps.filter((_, idx) => idx !== i));
        const stepIndex = Math.max(0, Math.min(st.stepIndex, steps.length - 1));
        return { demo: { ...st.demo, steps }, stepIndex, selection: { kind: 'step' } };
      }),

    moveStep: (i, dir) =>
      set((st) => {
        const j = i + dir;
        if (j < 0 || j >= st.demo.steps.length) return {};
        const steps = [...st.demo.steps];
        const a = steps[i];
        const b = steps[j];
        if (!a || !b) return {};
        steps[i] = b;
        steps[j] = a;
        return { demo: { ...st.demo, steps: normalize(steps) }, stepIndex: j };
      }),

    reorderStep: (from, to) =>
      set((st) => {
        const n = st.demo.steps.length;
        if (from < 0 || from >= n || to < 0 || to >= n || from === to) return {};
        const activeId = st.demo.steps[st.stepIndex]?.id;
        const steps = [...st.demo.steps];
        const [moved] = steps.splice(from, 1);
        steps.splice(to, 0, moved);
        const normalized = normalize(steps);
        const idx = activeId ? normalized.findIndex((s) => s.id === activeId) : st.stepIndex;
        return { demo: { ...st.demo, steps: normalized }, stepIndex: idx < 0 ? 0 : idx };
      }),

    setStepBackground: (c) => patchStep({ background: c }),

    applyBackgroundToAll: () => {
      const bg = curStep()?.background;
      set((st) => ({ demo: { ...st.demo, steps: st.demo.steps.map((s) => ({ ...s, background: bg })) } }));
    },
    applyCalloutStyleToAll: () => {
      const c = curStep()?.callout;
      if (!c) return;
      // Görünümü yay (stil + ok + boyut + buton görünürlüğü); içerik/konum (title/body/x/y) adımın kalır.
      const look = {
        pointer: c.pointer,
        width: c.width,
        height: c.height,
        showNext: c.showNext,
        showBack: c.showBack,
        style: c.style,
      };
      set((st) => ({
        demo: {
          ...st.demo,
          steps: st.demo.steps.map((s) => (s.callout ? { ...s, callout: { ...s.callout, ...look } } : s)),
        },
      }));
    },
    applyFocusEaseToAll: () => {
      const ease = curStep()?.focus?.ease;
      if (!ease) return;
      set((st) => ({
        demo: {
          ...st.demo,
          steps: st.demo.steps.map((s) => (s.focus ? { ...s, focus: { ...s.focus, ease } } : s)),
        },
      }));
    },

    addHotspot: () => {
      patchStep({ hotspot: { x: 0.5, y: 0.5 } });
      set({ selection: { kind: 'hotspot' } });
    },
    setHotspotPos: (x, y) => {
      const h = curStep()?.hotspot;
      patchStep({ hotspot: { ...(h ?? {}), x, y } });
    },
    setHotspot: (patch) => {
      const h = curStep()?.hotspot ?? { x: 0.5, y: 0.5 };
      patchStep({ hotspot: { ...h, ...patch } });
    },
    removeHotspot: () => {
      patchStep({ hotspot: undefined });
      set({ selection: { kind: 'step' } });
    },

    addCallout: () => {
      // Hotspot'tan bağımsız: kendi konumuyla (merkez-altı) eklenir.
      patchStep({ callout: { title: 'Başlık', body: 'Açıklama', pointer: 'bottom', showNext: true, x: 0.5, y: 0.62 } });
      set({ selection: { kind: 'callout' } });
    },
    updateCallout: (patch) => {
      const cur = curStep()?.callout ?? {};
      patchStep({ callout: { ...cur, ...patch } });
    },
    updateCalloutStyle: (patch) => {
      const cur = curStep()?.callout ?? {};
      patchStep({ callout: { ...cur, style: { ...(cur.style ?? {}), ...patch } } });
    },
    setCalloutPos: (x, y) => {
      const cur = curStep()?.callout;
      if (!cur) return;
      patchStep({ callout: { ...cur, x, y } });
    },
    removeCallout: () => {
      patchStep({ callout: undefined });
      set({ selection: { kind: 'step' } });
    },

    addFocus: () => {
      // Ortada, viewport'un yarısı kadar bir başlangıç dikdörtgeni (ölçek ≈ 2×).
      patchStep({ focus: { x: 0.25, y: 0.25, w: 0.5, h: 0.5, ease: 'gentle' } });
      set({ selection: { kind: 'focus' } });
    },
    setFocusRect: (rect) => {
      const f = curStep()?.focus;
      patchStep({ focus: { ...clampFocusRect(rect), ease: f?.ease ?? 'gentle' } });
    },
    setFocusEase: (ease) => {
      const f = curStep()?.focus;
      if (!f) return;
      patchStep({ focus: { ...f, ease } });
    },
    removeFocus: () => {
      patchStep({ focus: undefined });
      set({ selection: { kind: 'step' } });
    },

    addOverlay: () => {
      const cur = curStep()?.textOverlays ?? [];
      const ov: TextOverlay = { id: genId('tx'), text: 'Yeni metin', x: 0.2, y: 0.2, size: 'md' };
      patchStep({ textOverlays: [...cur, ov] });
      set({ selection: { kind: 'overlay', id: ov.id } });
    },
    updateOverlay: (id, patch) => {
      const cur = curStep()?.textOverlays ?? [];
      patchStep({ textOverlays: cur.map((o) => (o.id === id ? { ...o, ...patch } : o)) });
    },
    updateOverlayStyle: (id, patch) => {
      const cur = curStep()?.textOverlays ?? [];
      patchStep({
        textOverlays: cur.map((o) => (o.id === id ? { ...o, style: { ...(o.style ?? {}), ...patch } } : o)),
      });
    },
    setOverlayPos: (id, x, y) => {
      const cur = curStep()?.textOverlays ?? [];
      patchStep({ textOverlays: cur.map((o) => (o.id === id ? { ...o, x, y } : o)) });
    },
    removeOverlay: (id) => {
      const cur = curStep()?.textOverlays ?? [];
      patchStep({ textOverlays: cur.filter((o) => o.id !== id) });
      set({ selection: { kind: 'step' } });
    },
  };
});
