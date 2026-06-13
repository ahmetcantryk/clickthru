import { describe, expect, it } from 'vitest';
import { calloutSchema, demoSchema, demoVariableSchema, stepTypeSchema, textOverlaySchema } from './demo';
import { isValidDemo, safeValidateDemo, validateDemo } from './validate';
import { sampleDemos, sampleMixedDemo, sampleScreenshotDemo, sampleVideoDemo } from './samples';

describe('demoSchema — geçerli örnekler', () => {
  it('tüm örnek demolar validation’dan geçer', () => {
    for (const demo of sampleDemos) {
      expect(safeValidateDemo(demo).ok).toBe(true);
    }
  });

  it('validateDemo geçerli demo’yu aynen döner', () => {
    expect(validateDemo(sampleScreenshotDemo).id).toBe('demo_screens');
    expect(validateDemo(sampleVideoDemo).steps[0]?.type).toBe('video');
  });

  it('karışık demo sırası screenshot → video → screenshot', () => {
    expect(sampleMixedDemo.steps.map((s) => s.type)).toEqual(['screenshot', 'video', 'screenshot']);
  });
});

describe('demoVariableSchema — kişiselleştirme değişkeni', () => {
  it('geçerli anahtar/etiket kabul edilir', () => {
    expect(demoVariableSchema.safeParse({ key: 'company', label: 'Şirket', default: 'Acme' }).success).toBe(true);
    expect(demoVariableSchema.safeParse({ key: 'first_name', label: 'Ad' }).success).toBe(true);
  });

  it('rakamla başlayan/boşluklu/boş anahtar reddedilir', () => {
    expect(demoVariableSchema.safeParse({ key: '1x', label: 'A' }).success).toBe(false);
    expect(demoVariableSchema.safeParse({ key: 'a b', label: 'A' }).success).toBe(false);
    expect(demoVariableSchema.safeParse({ key: '', label: 'A' }).success).toBe(false);
  });

  it('demo.variables opsiyonel; verilince doğrulanır', () => {
    const ok = { ...sampleScreenshotDemo, variables: [{ key: 'name', label: 'Ad', default: 'there' }] };
    expect(safeValidateDemo(ok).ok).toBe(true);
    const bad = { ...sampleScreenshotDemo, variables: [{ key: '99', label: 'X' }] };
    expect(safeValidateDemo(bad).ok).toBe(false);
  });
});

describe('type alanı (KRİTİK) — yalnızca screenshot|video', () => {
  it('whitelist dışı type reddedilir', () => {
    expect(stepTypeSchema.safeParse('gif').success).toBe(false);
    const bad = { ...sampleVideoDemo, steps: [{ ...sampleVideoDemo.steps[0], type: 'gif' }] };
    const res = safeValidateDemo(bad);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.errors.join(' ')).toMatch(/type/);
  });
});

describe('koordinatlar 0–1 aralığında', () => {
  it('1’den büyük hotspot reddedilir', () => {
    const bad = {
      ...sampleScreenshotDemo,
      steps: [{ ...sampleScreenshotDemo.steps[0], hotspot: { x: 1.5, y: 0.2 } }],
    };
    expect(isValidDemo(bad)).toBe(false);
  });

  it('negatif koordinat reddedilir', () => {
    const bad = {
      ...sampleScreenshotDemo,
      steps: [{ ...sampleScreenshotDemo.steps[0], hotspot: { x: 0.2, y: -0.1 } }],
    };
    expect(isValidDemo(bad)).toBe(false);
  });

  it('çok küçük focus dikdörtgeni (w < 0.05) reddedilir', () => {
    const bad = {
      ...sampleScreenshotDemo,
      steps: [{ ...sampleScreenshotDemo.steps[0], focus: { x: 0.5, y: 0.5, w: 0.01, h: 0.4 } }],
    };
    expect(isValidDemo(bad)).toBe(false);
  });

  it('tuval dışına taşan focus dikdörtgeni (x + w > 1) reddedilir', () => {
    const bad = {
      ...sampleScreenshotDemo,
      steps: [{ ...sampleScreenshotDemo.steps[0], focus: { x: 0.8, y: 0.2, w: 0.5, h: 0.5 } }],
    };
    expect(isValidDemo(bad)).toBe(false);
  });

  it('geçerli focus dikdörtgeni + easing kabul edilir', () => {
    const ok = {
      ...sampleScreenshotDemo,
      steps: [{ ...sampleScreenshotDemo.steps[0], focus: { x: 0.2, y: 0.2, w: 0.5, h: 0.4, ease: 'quick' } }],
    };
    expect(isValidDemo(ok)).toBe(true);
  });
});

describe('zorunlu alanlar ve varsayılanlar', () => {
  it('title yoksa reddedilir', () => {
    const { title: _title, ...noTitle } = sampleScreenshotDemo;
    expect(isValidDemo(noTitle)).toBe(false);
  });

  it('callout (başlık/açıklama/pointer/none/showNext) geçerli', () => {
    const ok = demoSchema.safeParse({
      id: 'd',
      title: 't',
      steps: [
        {
          id: 's',
          order: 1,
          type: 'screenshot',
          media: '/a.svg',
          callout: { title: 'Başlık', body: 'Açıklama', pointer: 'none', showNext: false },
        },
      ],
    });
    expect(ok.success).toBe(true);
  });

  it('geçersiz callout pointer reddedilir', () => {
    expect(calloutSchema.safeParse({ pointer: 'diagonal' }).success).toBe(false);
  });

  it('boş steps geçerli (editör taslağı)', () => {
    expect(isValidDemo({ id: 'd', title: 't', steps: [] })).toBe(true);
  });
});

describe('metin/etiket overlay (Faz 1 — eklendi)', () => {
  it('geçerli overlay parse olur, size verilmezse "md" varsayılır', () => {
    const parsed = textOverlaySchema.parse({ id: 'o1', text: 'Merhaba', x: 0.2, y: 0.3 });
    expect(parsed.size).toBe('md');
  });

  it('overlay’li örnek demo validation’dan geçer', () => {
    expect(isValidDemo(sampleScreenshotDemo)).toBe(true);
    expect(sampleScreenshotDemo.steps[0]?.textOverlays?.[0]?.text).toBe('Hoş geldin 👋');
  });

  it('overlay koordinatı 0–1 dışıysa reddedilir', () => {
    const bad = {
      ...sampleScreenshotDemo,
      steps: [
        { ...sampleScreenshotDemo.steps[0], textOverlays: [{ id: 'o', text: 'x', x: 1.4, y: 0.2 }] },
      ],
    };
    expect(isValidDemo(bad)).toBe(false);
  });

  it('overlay metni boşsa reddedilir', () => {
    expect(textOverlaySchema.safeParse({ id: 'o', text: '', x: 0.1, y: 0.1 }).success).toBe(false);
  });
});

describe('video segment alanları (uzantı video capture)', () => {
  it('clipStart/clipEnd/poster/durationMs olan video adımı geçerli', () => {
    const ok = isValidDemo({
      id: 'd',
      title: 't',
      steps: [
        {
          id: 's',
          order: 1,
          type: 'video',
          media: 'https://x/capture.webm',
          clipStart: 2.5,
          clipEnd: 7,
          poster: 'https://x/poster.jpg',
          durationMs: 12000,
        },
      ],
    });
    expect(ok).toBe(true);
  });

  it('negatif clipStart reddedilir', () => {
    expect(
      isValidDemo({
        id: 'd',
        title: 't',
        steps: [{ id: 's', order: 1, type: 'video', media: 'v.webm', clipStart: -1 }],
      }),
    ).toBe(false);
  });

  it('clip alanları opsiyonel — eski video adımı (clip yok) hâlâ geçerli', () => {
    expect(isValidDemo({ id: 'd', title: 't', steps: [{ id: 's', order: 1, type: 'video', media: 'v.mp4' }] })).toBe(true);
  });
});
