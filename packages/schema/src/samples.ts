import type { Demo, Focus } from './demo';

/**
 * Eski merkez+ölçek tanımını Pass 2 zoom dikdörtgenine çevirir.
 * Ölçek s → görünür alan 1/s; (fx,fy) merkezli, tuval içine kırpılmış.
 */
function zoom(fx: number, fy: number, scale: number, ease: Focus['ease'] = 'gentle'): Focus {
  const s = Math.max(1, scale);
  const w = Math.min(1, 1 / s);
  const h = w;
  const x = Math.min(1 - w, Math.max(0, fx - w / 2));
  const y = Math.min(1 - h, Math.max(0, fy - h / 2));
  return { x, y, w, h, ease };
}

/**
 * Screenshot demo — aynı ekranda kamera pan'ı gösterir:
 * genel görünüm → butona zoom → grafiğe pan (hepsi dashboard-1) → farklı ekran (dashboard-2, crossfade).
 */
export const sampleScreenshotDemo: Demo = {
  id: 'demo_screens',
  title: 'Panel turu',
  defaultBackground: '#F2F6FF',
  steps: [
    {
      id: 's1',
      order: 1,
      type: 'screenshot',
      media: '/samples/dashboard-1.svg',
      callout: { title: 'Acme Paneli', body: 'Kısa bir tur atalım.', pointer: 'none' },
      textOverlays: [{ id: 's1_t', text: 'Hoş geldin 👋', x: 0.07, y: 0.08, size: 'lg' }],
    },
    {
      id: 's2',
      order: 2,
      type: 'screenshot',
      media: '/samples/dashboard-1.svg',
      focus: zoom(0.79, 0.22, 1.7),
      hotspot: { x: 0.79, y: 0.22 },
      callout: { title: 'Yeni rapor', body: 'Buradan yeni rapor oluşturursun.', pointer: 'top' },
    },
    {
      id: 's3',
      order: 3,
      type: 'screenshot',
      media: '/samples/dashboard-1.svg',
      focus: zoom(0.37, 0.74, 1.7),
      hotspot: { x: 0.37, y: 0.74 },
      callout: { title: 'Haftalık gelir', body: 'Grafikten trendi gör.', pointer: 'top' },
    },
    {
      id: 's4',
      order: 4,
      type: 'screenshot',
      media: '/samples/dashboard-2.svg',
      focus: zoom(0.3, 0.5, 1.4),
      hotspot: { x: 0.3, y: 0.5 },
      callout: { title: 'Tarih aralığı', body: 'Aralığı buradan değiştir.', pointer: 'right' },
    },
  ],
};

/** Video-only demo (1 adım — sınır testi). */
export const sampleVideoDemo: Demo = {
  id: 'demo_video',
  title: 'Onboarding klibi',
  defaultBackground: '#F2F6FF',
  steps: [
    {
      id: 'v1',
      order: 1,
      type: 'video',
      media: '/samples/onboarding.mp4',
    },
  ],
};

/** Karışık demo: screenshot → video → screenshot. */
export const sampleMixedDemo: Demo = {
  id: 'demo_mixed',
  title: 'Karışık akış',
  defaultBackground: '#F2F6FF',
  steps: [
    {
      id: 'm1',
      order: 1,
      type: 'screenshot',
      media: '/samples/dashboard-1.svg',
      callout: { title: 'Başlayalım', body: 'Önce panele bakalım.', pointer: 'none' },
    },
    {
      id: 'm2',
      order: 2,
      type: 'video',
      media: '/samples/onboarding.mp4',
    },
    {
      id: 'm3',
      order: 3,
      type: 'screenshot',
      media: '/samples/dashboard-2.svg',
      focus: zoom(0.3, 0.5, 1.4),
      hotspot: { x: 0.3, y: 0.5 },
      callout: { title: 'İşte sonuç', body: 'Raporların hazır.', pointer: 'right' },
    },
  ],
};

/** Uzun demo — 22 adım (ACCEPTANCE §2 "20+ adım" sınır testi). */
export const sampleLongDemo: Demo = {
  id: 'demo_long',
  title: 'Uzun demo (22 adım)',
  defaultBackground: '#F2F6FF',
  steps: Array.from({ length: 22 }, (_, i) => ({
    id: `long_${i + 1}`,
    order: i + 1,
    type: 'screenshot' as const,
    media: i % 2 === 0 ? '/samples/dashboard-1.svg' : '/samples/dashboard-2.svg',
    hotspot: { x: 0.5, y: 0.5 },
    callout: { title: `Adım ${i + 1}/22`, pointer: 'bottom' as const },
  })),
};

/**
 * Gerçeğe yakın 15 adımlık tam tur — tüm senaryolar:
 * screenshot + video, aynı ekranda kamera pan, tüm pointer yönleri, hotspot,
 * metin overlay, focus/zoom, farklı arka planlar, stilli callout.
 */
export const sampleShowcaseDemo: Demo = {
  id: 'demo_showcase',
  title: 'Acme ürün turu',
  defaultBackground: '#F2F6FF',
  steps: [
    {
      id: 'sc1',
      order: 1,
      type: 'screenshot',
      media: '/samples/dashboard-1.svg',
      callout: { title: "Acme'ye hoş geldin", body: '30 saniyede ürünü gezelim.', pointer: 'none' },
      textOverlays: [{ id: 'sc1t', text: '👋 Hoş geldin', x: 0.07, y: 0.08, size: 'lg' }],
    },
    {
      id: 'sc2',
      order: 2,
      type: 'screenshot',
      media: '/samples/dashboard-1.svg',
      focus: zoom(0.79, 0.22, 1.7),
      hotspot: { x: 0.79, y: 0.22 },
      callout: { title: 'Yeni rapor', body: 'Tek tıkla rapor oluştur.', pointer: 'top' },
    },
    {
      id: 'sc3',
      order: 3,
      type: 'screenshot',
      media: '/samples/dashboard-1.svg',
      focus: zoom(0.34, 0.4, 1.6),
      hotspot: { x: 0.34, y: 0.4 },
      callout: { title: 'Canlı metrikler', body: 'Gelir, kullanıcı, dönüşüm.', pointer: 'bottom' },
    },
    {
      id: 'sc4',
      order: 4,
      type: 'screenshot',
      media: '/samples/dashboard-1.svg',
      focus: zoom(0.5, 0.78, 1.5),
      callout: { title: 'Haftalık gelir', body: 'Trendi grafikten izle.', pointer: 'top' },
    },
    {
      id: 'sc5',
      order: 5,
      type: 'video',
      media: '/samples/onboarding.mp4',
    },
    {
      id: 'sc6',
      order: 6,
      type: 'screenshot',
      media: '/samples/dashboard-2.svg',
      callout: { title: 'Raporlar', body: 'Tüm raporların tek yerde.', pointer: 'none' },
    },
    {
      id: 'sc7',
      order: 7,
      type: 'screenshot',
      media: '/samples/dashboard-2.svg',
      focus: zoom(0.3, 0.5, 1.6),
      hotspot: { x: 0.3, y: 0.5 },
      callout: { title: 'Tarih aralığı', body: 'İstediğin dönemi seç.', pointer: 'right' },
    },
    {
      id: 'sc8',
      order: 8,
      type: 'screenshot',
      media: '/samples/dashboard-2.svg',
      focus: zoom(0.66, 0.6, 1.4),
      callout: { title: 'Rapor listesi', body: 'Hazır ve taslak raporlar.', pointer: 'left' },
    },
    {
      id: 'sc9',
      order: 9,
      type: 'screenshot',
      media: '/samples/dashboard-3.svg',
      callout: { title: 'Müşteriler', body: 'Tüm hesaplar burada.', pointer: 'none' },
    },
    {
      id: 'sc10',
      order: 10,
      type: 'screenshot',
      media: '/samples/dashboard-3.svg',
      focus: zoom(0.5, 0.45, 1.5),
      hotspot: { x: 0.5, y: 0.45 },
      callout: { title: 'Müşteri detayı', body: 'Satıra tıkla, profili aç.', pointer: 'top' },
    },
    {
      id: 'sc11',
      order: 11,
      type: 'screenshot',
      media: '/samples/dashboard-3.svg',
      focus: zoom(0.47, 0.16, 1.6),
      hotspot: { x: 0.47, y: 0.16 },
      callout: { title: 'Hızlı ara', body: 'İsimle anında bul.', pointer: 'bottom' },
    },
    {
      id: 'sc12',
      order: 12,
      type: 'screenshot',
      media: '/samples/dashboard-4.svg',
      callout: { title: 'Ayarlar', body: 'Hesabını yönet.', pointer: 'none' },
    },
    {
      id: 'sc13',
      order: 13,
      type: 'screenshot',
      media: '/samples/dashboard-4.svg',
      focus: zoom(0.7, 0.4, 1.6),
      hotspot: { x: 0.71, y: 0.41, color: '#2142e7' },
      callout: { title: 'Bildirimler', body: 'Anlık bildirimleri aç.', pointer: 'left' },
    },
    {
      id: 'sc14',
      order: 14,
      type: 'screenshot',
      media: '/samples/dashboard-4.svg',
      focus: zoom(0.3, 0.7, 1.5),
      hotspot: { x: 0.3, y: 0.78 },
      callout: {
        title: 'Planını yükselt',
        body: 'Pro ile sınırsız demo.',
        pointer: 'top',
        style: { bg: '#F0F4FF', borderColor: '#2142E7', borderWidth: 2, radius: 18 },
      },
    },
    {
      id: 'sc15',
      order: 15,
      type: 'screenshot',
      media: '/samples/dashboard-1.svg',
      callout: { title: 'Hazırsın 🚀', body: 'Kendi demonu oluştur.', pointer: 'none', showNext: false },
      textOverlays: [
        {
          id: 'sc15t',
          text: 'Teşekkürler!',
          x: 0.5,
          y: 0.84,
          size: 'lg',
          color: '#FFFFFF',
          style: { bg: '#2142E7', borderColor: '#2142E7', radius: 14 },
        },
      ],
    },
  ],
};

/**
 * Cilalı zoom turu — hotspot ve callout'u **farklı şekillerde** kullanır:
 * yalnız-callout, hotspot+callout, yalnız-hotspot; tüm ok yönleri; bol pan&zoom.
 * **Tek renk: düz turuncu** (#F97316) accent (callout + hotspot), gradient yok;
 * sahne düz tek renk zemin. Editör varsayılanı.
 */
const ACCENT = '#F97316';
const CALLOUT = { bg: ACCENT, radius: 18 } as const;

export const sampleZoomDemo: Demo = {
  id: 'demo_zoom',
  title: 'Acme Analytics — zoom turu',
  defaultBackground: '#F5F4F2',
  wrapper: 'browser',
  steps: [
    // 1 — yalnız callout (oksuz, ortada) + karşılama etiketi. Tam görünüm.
    {
      id: 'z1',
      order: 1,
      type: 'screenshot',
      media: '/samples/dashboard-1.svg',
      callout: {
        title: 'Acme Analytics turu',
        body: '30 saniyede en önemli 3 ekranı gezelim.',
        pointer: 'none',
        x: 0.5,
        y: 0.52,
        width: 300,
        showNext: true,
        style: CALLOUT,
      },
      textOverlays: [{ id: 'z1t', text: '👋 Hoş geldin', x: 0.06, y: 0.07, size: 'lg' }],
    },
    // 2 — hotspot + callout (sağ-üst butona zoom). Ok hotspot'u gösterir (sola kart).
    {
      id: 'z2',
      order: 2,
      type: 'screenshot',
      media: '/samples/dashboard-1.svg',
      focus: zoom(0.8, 0.22, 2.1, 'gentle'),
      hotspot: { x: 0.82, y: 0.21, color: ACCENT },
      callout: {
        title: 'Yeni rapor',
        body: 'Tek tıkla rapor oluştur.',
        pointer: 'left',
        x: 0.82,
        y: 0.21,
        width: 230,
        style: CALLOUT,
      },
    },
    // 3 — yalnız callout (grafiğe pan; aynı medya). Ok yukarı (kart altta).
    {
      id: 'z3',
      order: 3,
      type: 'screenshot',
      media: '/samples/dashboard-1.svg',
      focus: zoom(0.5, 0.72, 1.8, 'gentle'),
      callout: {
        title: 'Gelir grafiği',
        body: 'Haftalık trendi tek bakışta gör.',
        pointer: 'bottom',
        x: 0.5,
        y: 0.6,
        width: 240,
        style: CALLOUT,
      },
    },
    // 4 — farklı ekran (crossfade), yalnız callout (oksuz tanıtım).
    {
      id: 'z4',
      order: 4,
      type: 'screenshot',
      media: '/samples/dashboard-2.svg',
      callout: {
        title: 'Raporlar',
        body: 'Tüm raporların tek yerde.',
        pointer: 'none',
        x: 0.5,
        y: 0.5,
        width: 280,
        style: CALLOUT,
      },
    },
    // 5 — hotspot + callout (tarih aralığına zoom). Ok sağa (kart sağda).
    {
      id: 'z5',
      order: 5,
      type: 'screenshot',
      media: '/samples/dashboard-2.svg',
      focus: zoom(0.3, 0.5, 2, 'quick'),
      hotspot: { x: 0.3, y: 0.5, color: ACCENT },
      callout: {
        title: 'Tarih aralığı',
        body: 'İstediğin dönemi seç.',
        pointer: 'right',
        x: 0.3,
        y: 0.5,
        width: 220,
        style: CALLOUT,
      },
    },
    // 6 — YALNIZ hotspot (callout yok) + ipucu etiketi. Hafif geniş zoom.
    {
      id: 'z6',
      order: 6,
      type: 'screenshot',
      media: '/samples/dashboard-3.svg',
      focus: zoom(0.5, 0.5, 1.4, 'gentle'),
      hotspot: { x: 0.5, y: 0.45, color: ACCENT },
      textOverlays: [{ id: 'z6t', text: 'Bir müşteriye tıkla', x: 0.5, y: 0.12, size: 'md' }],
    },
    // 7 — hotspot + callout (arama kutusuna zoom). Ok aşağı (kart altta).
    {
      id: 'z7',
      order: 7,
      type: 'screenshot',
      media: '/samples/dashboard-3.svg',
      focus: zoom(0.47, 0.16, 1.9, 'quick'),
      hotspot: { x: 0.47, y: 0.16, color: ACCENT },
      callout: {
        title: 'Hızlı ara',
        body: 'İsimle anında bul.',
        pointer: 'bottom',
        x: 0.47,
        y: 0.16,
        width: 210,
        style: CALLOUT,
      },
    },
    // 8 — hotspot + callout (ayarlara zoom, yavaş). Ok sola (kart solda).
    {
      id: 'z8',
      order: 8,
      type: 'screenshot',
      media: '/samples/dashboard-4.svg',
      focus: zoom(0.7, 0.4, 1.8, 'slow'),
      hotspot: { x: 0.71, y: 0.41, color: ACCENT },
      callout: {
        title: 'Bildirimler',
        body: 'Anlık uyarıları aç.',
        pointer: 'left',
        x: 0.71,
        y: 0.41,
        width: 220,
        style: CALLOUT,
      },
    },
    // 9 — kapanış: yalnız callout (oksuz) + teşekkür etiketi.
    {
      id: 'z9',
      order: 9,
      type: 'screenshot',
      media: '/samples/dashboard-4.svg',
      callout: {
        title: 'Hazırsın 🚀',
        body: 'Artık kendi demonu oluşturabilirsin.',
        pointer: 'none',
        x: 0.5,
        y: 0.5,
        width: 300,
        showNext: false,
        style: CALLOUT,
      },
      textOverlays: [
        {
          id: 'z9t',
          text: 'Teşekkürler!',
          x: 0.5,
          y: 0.86,
          size: 'lg',
          color: '#FFFFFF',
          style: { bg: ACCENT, radius: 14 },
        },
      ],
    },
  ],
};

/** Tüm örnekler. */
export const sampleDemos: Demo[] = [
  sampleZoomDemo,
  sampleShowcaseDemo,
  sampleScreenshotDemo,
  sampleVideoDemo,
  sampleMixedDemo,
  sampleLongDemo,
];
