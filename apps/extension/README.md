# @clickthru/extension — Chrome MV3 capture

Tıklamaları yakalar → her tıklamada ekran görüntüsü + oransal hotspot → bir **Demo** üretir, Supabase'e kaydeder ve Studio'da açar.

> Faz 1 kapsamı: **screenshot capture**. Video (`getDisplayMedia` + `MediaRecorder`) bir sonraki adım.

## Derleme

```bash
pnpm --filter @clickthru/extension build
```

Çıktı: `apps/extension/dist/` (manifest + background.js + content.js + popup.js + popup.html).

## Chrome'a yükleme (geliştirme)

1. `chrome://extensions` → sağ üstte **Developer mode** açık.
2. **Load unpacked** → `apps/extension/dist` klasörünü seç.

> Sayfa-içi recorder ikon tıklayınca enjekte edilir; eski sekmelerde **yenilemeye gerek yok**.

## Kullanım (sayfa-içi recorder)

1. `pnpm --filter @clickthru/web dev` ile web'i çalıştır (Studio = `http://localhost:3000`, `src/config.ts`).
2. Yakalamak istediğin sayfaya git, **uzantı simgesine tıkla** → açılan **dropdown**'dan (opsiyonel başlık girip) **Kaydı başlat**.
3. Ekranda **5-4-3-2-1 geri sayım** (beyaz saydam overlay) → kayıt başlar. Üstte **"Recording area"** şeridi, **ortada ✕ iptal** (Esc), altta **Kaydı durdur** çubuğu (**Ctrl+Y**).
4. Sayfada akışını tıkla — her tıklama bir adım (o anki ekran + tıklama noktası hotspot). Yakalama anında overlay gizlenir, screenshot'a girmez.
5. **Kaydı durdur** (veya Ctrl+Y) → demo Supabase'e yazılır, yeni sekmede `/studio?demo=<id>` açılır. **✕ / Esc** kaydetmeden iptal eder.
6. Studio'da callout/zoom/metin ekleyip **Paylaş** ile linkini al.

## Yapılandırma

`src/config.ts`:
- `SUPABASE_URL`, `SUPABASE_ANON_KEY` — publishable key (istemci tarafında güvenli).
- `STUDIO_BASE_URL` — yakalanan demonun açılacağı adres (üretimde dağıtım URL'i).

## Mimari

- **content.ts** — sayfa-içi recorder overlay (Shadow DOM ile izole): geri sayım, "Recording area" şeridi, Durdur çubuğu, ✕ iptal, Ctrl+Y/Esc. `pointerdown`'da konumu arka plana yollar; yakalamada overlay'i gizler.
- **background.ts** — ikon tıklayınca `scripting.executeScript` ile content'i enjekte eder; `CLICK`'te `captureVisibleTab` (throttle'lı) → adımı storage'a ekler; `FINALIZE`'da `Demo` (schema tipleri) kurup Supabase REST'e `POST`'lar ve Studio'yu açar; `CANCEL`'da temizler.

## Bilinen sınırlar (MVP)

- `captureVisibleTab` ~2/sn sınırlı → çok hızlı tıklamalarda bazı kareler atlanır (600 ms throttle).
- `chrome://` ve mağaza sayfaları yakalanamaz (korumalı).
- Medya şimdilik demo JSON'una **data URL** olarak gömülür (Storage/R2 yüklemesi sonraki adım).
