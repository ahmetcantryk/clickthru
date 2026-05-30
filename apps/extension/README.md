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
3. (Önceden açık sekmelerde) kaydetmeden önce sayfayı **yenile** — içerik betiği yeni yüklenen sayfalara enjekte olur.

## Kullanım

1. `pnpm --filter @clickthru/web dev` ile web'i çalıştır (Studio = `http://localhost:3000`, `src/config.ts`'te ayarlı).
2. Yakalamak istediğin sayfaya git, uzantı simgesine tıkla → **Kaydı başlat**.
3. Sayfada akışını tıkla — her tıklama bir adım (o anki ekran + tıklama noktası hotspot olur).
4. **Durdur** → **Demoyu oluştur & aç**. Demo Supabase'e yazılır, yeni sekmede `/studio?demo=<id>` açılır.
5. Studio'da callout/zoom/metin ekleyip **Paylaş** ile linkini al.

## Yapılandırma

`src/config.ts`:
- `SUPABASE_URL`, `SUPABASE_ANON_KEY` — publishable key (istemci tarafında güvenli).
- `STUDIO_BASE_URL` — yakalanan demonun açılacağı adres (üretimde dağıtım URL'i).

## Mimari

- **content.ts** — `pointerdown`'da (kayıt açıkken) oransal konumu arka plana yollar. Durum `chrome.storage.local`'dan okunur; navigasyonda otomatik yeniden enjekte.
- **background.ts** — `CLICK` mesajında `chrome.tabs.captureVisibleTab` ile görünür sekmeyi yakalar (throttle'lı), adımı storage'a ekler.
- **popup.ts** — başlat/durdur/kaydet; adımlardan `Demo` (schema tipleri) kurar, Supabase REST'e `POST`'lar, Studio'yu açar.

## Bilinen sınırlar (MVP)

- `captureVisibleTab` ~2/sn sınırlı → çok hızlı tıklamalarda bazı kareler atlanır (600 ms throttle).
- `chrome://` ve mağaza sayfaları yakalanamaz (korumalı).
- Medya şimdilik demo JSON'una **data URL** olarak gömülür (Storage/R2 yüklemesi sonraki adım).
