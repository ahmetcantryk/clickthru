import { z } from 'zod';

/**
 * Demo veri modeli — TEK kaynak (CLAUDE.md §5).
 * Demo = sıralı adımlar listesi. Koordinatlar oransal (0–1) ki her ekranda doğru otursun.
 */

/** Oransal koordinat 0–1 (responsive). */
export const ratio = z.number().min(0).max(1);

/** Kutu stili — callout ve metin overlay için ortak (radius/arka plan/kenarlık). */
export const boxStyleSchema = z.object({
  radius: z.number().min(0).max(32).optional(),
  bg: z.string().min(1).optional(),
  borderColor: z.string().min(1).optional(),
  borderWidth: z.number().min(0).max(6).optional(),
});
export type BoxStyle = z.infer<typeof boxStyleSchema>;

/** Callout ok (pointer) yönü. 'none' = oksuz kart. */
export const calloutPointerSchema = z.enum(['top', 'bottom', 'left', 'right', 'none']);
export type CalloutPointer = z.infer<typeof calloutPointerSchema>;

/**
 * KRİTİK alan — tüm video/screenshot ayrımını bu çözer (CLAUDE.md §5).
 * Yeni medya türü = yeni `type` değeri + player'da yeni dal.
 */
export const stepTypeSchema = z.enum(['screenshot', 'video']);
export type StepType = z.infer<typeof stepTypeSchema>;

/** Hotspot — oransal konum + boyut/renk. */
export const hotspotSchema = z.object({
  x: ratio,
  y: ratio,
  size: z.number().min(8).max(64).optional(),
  color: z.string().min(1).optional(),
});
export type Hotspot = z.infer<typeof hotspotSchema>;

/**
 * Callout — başlık/açıklama kartı + İleri/Geri butonları + ok yönü.
 * **Hotspot'tan tamamen bağımsız**: kendi oransal konumu (x/y) vardır; düz açıklama kutusudur.
 * `hotspot` = yalnızca tıklanacak alan (metinsiz); callout = açıklama kartı.
 */
export const calloutSchema = z.object({
  title: z.string().min(1).optional(),
  body: z.string().min(1).optional(),
  pointer: calloutPointerSchema.optional(),
  /** "İleri" butonu görünsün mü (varsayılan: evet). */
  showNext: z.boolean().optional(),
  /** "Geri" butonu görünsün mü (varsayılan: evet; ilk adımda zaten gizli). */
  showBack: z.boolean().optional(),
  /** Bağımsız konum (oransal). Verilmezse player/editör merkez-altı varsayar. */
  x: ratio.optional(),
  y: ratio.optional(),
  /** Kart genişliği (px). */
  width: z.number().min(120).max(560).optional(),
  /** Kart yüksekliği (px) — verilmezse içeriğe göre. */
  height: z.number().min(48).max(420).optional(),
  style: boxStyleSchema.optional(),
});
export type Callout = z.infer<typeof calloutSchema>;

/** Focus geçiş (easing) modu — kamera hareketinin hızı/yumuşaklığı. */
export const focusEaseSchema = z.enum(['gentle', 'quick', 'slow']);
export type FocusEase = z.infer<typeof focusEaseSchema>;

/**
 * Focus/kamera — zoom **dikdörtgeni** (oransal): sol-üst köşe x/y + genişlik/yükseklik (Pass 2).
 * Player bu dikdörtgeni viewport'a sığdırır (ölçek dikdörtgenden türetilir). Dışı kararır.
 */
export const focusSchema = z
  .object({
    x: ratio,
    y: ratio,
    w: z.number().min(0.05).max(1),
    h: z.number().min(0.05).max(1),
    ease: focusEaseSchema.optional(),
  })
  // Dikdörtgen tuvalin içinde kalmalı.
  .refine((f) => f.x + f.w <= 1.0001 && f.y + f.h <= 1.0001, {
    message: 'focus dikdörtgeni tuval sınırlarını aşıyor',
  });
export type Focus = z.infer<typeof focusSchema>;

/** Metin/etiket overlay boyutu. */
export const textOverlaySizeSchema = z.enum(['sm', 'md', 'lg']);
export type TextOverlaySize = z.infer<typeof textOverlaySizeSchema>;

/**
 * Serbest konumlu metin/etiket overlay (CLAUDE.md §5, §8 — Faz 1).
 * Tooltip'ten farkı: hotspot'a bağlı değil, oransal x/y ile istenen yere konur.
 */
export const textOverlaySchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  x: ratio,
  y: ratio,
  size: textOverlaySizeSchema.default('md'),
  /** Opsiyonel renk (verilmezse tema metin rengi). */
  color: z.string().min(1).optional(),
  style: boxStyleSchema.optional(),
});
export type TextOverlay = z.infer<typeof textOverlaySchema>;

/** Tek adım. `type`'a göre player doğru dalı render eder. */
export const stepSchema = z.object({
  id: z.string().min(1),
  order: z.number().int().min(0),
  /** Adım adı (rename için; yoksa "Adım N"). */
  name: z.string().min(1).optional(),
  /** Oynatmada atlanır. */
  skip: z.boolean().optional(),
  type: stepTypeSchema,
  /** Medya referansı (screenshot: görsel URL; video: kaynak video URL — segmentler paylaşır). */
  media: z.string().min(1),
  /**
   * Video segmenti in/out noktaları (saniye). Tek bir kaynak videoyu birden çok
   * `video` adımı paylaşabilir; player bu aralığa seek eder ve clipEnd'de durur.
   */
  clipStart: z.number().min(0).optional(),
  clipEnd: z.number().min(0).optional(),
  /** Video adımı için poster/önizleme görseli URL'i (yüklenmeden önce gösterilir). */
  poster: z.string().min(1).optional(),
  /** Kaynak video süresi (ms) — progress çubuğunu metadata gelmeden boyutlamak için. */
  durationMs: z.number().int().min(0).optional(),
  /** Adım bazlı arka plan (yoksa demo.defaultBackground kullanılır). */
  background: z.string().min(1).optional(),
  hotspot: hotspotSchema.optional(),
  callout: calloutSchema.optional(),
  focus: focusSchema.optional(),
  /** Serbest konumlu metin/etiket overlay'leri (hotspot dışı). */
  textOverlays: z.array(textOverlaySchema).optional(),
});
export type Step = z.infer<typeof stepSchema>;

/** Demo görüntüsünü saran çerçeve stili. */
export const wrapperSchema = z.enum(['browser', 'dark', 'none']);
export type Wrapper = z.infer<typeof wrapperSchema>;

/** Demo — başlık + sahne arka planı + çerçeve + sıralı adımlar. */
export const demoSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  /** Sahne arka planı (renk veya css gradient; adım kendi background'ını vermezse bu). */
  defaultBackground: z.string().min(1).optional(),
  wrapper: wrapperSchema.optional(),
  steps: z.array(stepSchema),
});
export type Demo = z.infer<typeof demoSchema>;
