# CLAUDE.md — İnteraktif Ürün Demo Platformu

> **Bu dosya projenin tek doğruluk kaynağıdır (single source of truth).**
> Projenin köküne konur; Claude Code her oturumda otomatik okur.
> Aşağıdaki kararlar **sabittir** — değiştirmek için önce §10 Karar Günlüğü güncellenir.
> Resmî referans: https://docs.claude.com/en/docs/claude-code/overview

---

## 0. Claude için çalışma kuralları

1. Kod yazmadan önce **§2 Sabit Kararlar** ve ilgili fazın kapsamını oku. Karar dışına çıkma.
2. Mevcut faz dışındaki özellikleri (HTML klon, AI, analitik, CRM…) **kendiliğinden ekleme.** Önce sor.
3. Her PR/değişiklik tek bir işe odaklanır. "Karman çorman" büyüme yok.
4. Bir karar değişirse: önce §10'a tek satır yaz, sonra kodu değiştir.
5. Emin değilsen dur ve sor; varsayımla ilerleme.
6. **Kabul kapısı:** Bir özellik tamamlanınca, `ACCEPTANCE.md`'deki kullanıcı kabul testinden geçmeden **sonraki özelliğe geçilmez.** Her özellik tek tek ve izole test edilir; yarım/test edilmemiş iş birikmez.

---

## 1. Proje özeti

Kullanıcıların ürünlerini **kaydedip**, üstüne tooltip/zoom/sahne ekleyerek **tıklanabilir interaktif demolar** ürettiği, sonra bunları **link / video / GIF / HTML embed** olarak paylaştığı bir platform. Referans çıta: **Arcade** (görsel kalite) + **Storylane** (format esnekliği).

Çekirdek değer: *"En pürüzsüz zoom + en temiz export + en iyi görünüm."*

---

## 2. Sabit stratejik kararlar

| Konu | Karar | Neden |
|---|---|---|
| **Hedef kitle (wedge)** | **Pazarlama + Satış** | Aynı "standalone demo" çekirdeğini paylaşırlar. Onboarding ayrı bir iş (in-app SDK), sonraya. |
| **Capture yöntemi** | **Önce screenshot + video**, HTML klon Faz 4 | HTML klon kategorinin en zor mühendisliği + bakım kâbusu. Önce satılabilir v1. |
| **Ne YAPIYORUZ** | Cilalı, paylaşılabilir, dışa-bakan demolar | Listemizdeki her özellik (sahne, zoom, export) bu dünyaya ait. |
| **Ne YAPMIYORUZ (şimdilik)** | In-app onboarding/tur (Pendo/Appcues dünyası) | Farklı mimari. Faz 5. |

---

## 3. Konumlandırma & farklılaşma

Rakipler ve kısa kimlikleri:
- **Arcade** — tasarım lideri, record-first, demo+video. Görsel çıtamız.
- **Storylane** — üç format (screenshot/video/HTML), şeffaf fiyat. Konum rakibimiz.
- **Navattic** — kurumsal HTML klon, yüksek fidelity, pahalı.
- **Supademo** — ucuz, screenshot-first giriş.

**Bizim farkımız (öncelik sırası):**
1. **Pürüzsüz zoom + yüksek kaliteli export** — rakiplerde dağınık (örn. zoom %20 adımlarla sınırlı, export optimizasyonsuz).
2. **Mixed-media kurgu** — video + interaktif adım + tooltip tek akıcı player'da.
3. **Görsel kalite** — Arcade seviyesi polish.
4. **Adil fiyat** — giriş katmanı rakiplerde pahalılaştı (boşluk var).

---

## 4. Teknik mimari

**Monorepo** (öneri: `pnpm` workspaces). Üç paket:

```
/apps
  /extension     → kayıt (Chrome uzantısı)
  /web           → editor + player + dashboard
/services
  /api           → backend
  /render-worker → sunucu-taraflı video/gif export
/packages
  /schema        → ortak veri tipleri (Demo, Step) — TEK yerde
  /ui            → paylaşılan tasarım bileşenleri
```

| Katman | Teknoloji | Not |
|---|---|---|
| **Kayıt** | Chrome MV3 + TypeScript | Screenshot: `chrome.tabs.captureVisibleTab`. Video: `getDisplayMedia` + `MediaRecorder`. |
| **Editor + Player** | React + TypeScript + Zustand | Tooltip = DOM overlay. Zoom/focus = CSS `transform`. Animasyon = **Framer Motion**. |
| **Backend** | Next.js (API routes) veya NestJS | Auth, demo CRUD, paylaşım linki. |
| **DB** | **PostgreSQL** | İlişkisel; demo→steps yapısına oturur. |
| **Medya** | **Cloudflare R2** (veya S3) | Görüntü + video dosyaları. |
| **Export** | **Playwright (headless Chrome) + ffmpeg** — sunucuda | Kaliteli, pürüzsüz zoom. Tarayıcıda export YAPMA. |
| **Hosting** | Vercel (web) + R2 (medya) + ayrı render worker | |

**Tek "özel" yatırım:** sunucu-taraflı export. Farkımız orada.

---

## 5. Veri modeli (omurga)

`/packages/schema` içinde tek kaynak. Demo = sıralı adımlar listesi.

```jsonc
{
  "id": "demo_abc",
  "title": "Ürün turu",
  "defaultBackground": "#0A0A0A",   // sahne arka planı
  "steps": [
    {
      "id": "step_1",
      "order": 1,
      "type": "screenshot",          // "screenshot" | "video"  ← KRİTİK ALAN
      "media": "r2://demos/abc/1.png", // video ise .mp4
      "background": "#0A0A0A",
      "hotspot": { "x": 0.78, "y": 0.30 },  // tıklama alanı (oransal 0–1)
      "callout": { "title": "Yeni rapor", "body": "Buradan oluştur", "pointer": "bottom", "showNext": true },
      "focus":   { "x": 0.78, "y": 0.30, "scale": 1.6 } // KAMERA: bu adımın zoom/konumu
    }
  ]
}
```

**Kritik kural — `type` alanı tüm video/screenshot ayrımını çözer:**
- `screenshot` → görüntüyü göster, hotspot+tooltip+zoom uygula, tıklayınca sonraki adım.
- `video` → klibi oynat, bitince (veya tıklayınca) sonraki adım.
- Player **her zaman `type`'a bakıp** doğru dalı render eder. Yeni medya türü = yeni `type` değeri + yeni dal.

Koordinatlar **oransal (0–1)** tutulur ki her ekran boyutunda doğru otursun.

**Kamera/pan:** `focus` adımın **kamera** durumudur (zoom + konum). Ardışık iki adım **aynı medyayı** kullanıyorsa player kamerayı yeni focus'a **kaydırır (pan/zoom)** — aynı ekranda başka noktaya geçiş. Medya değişirse yumuşak **crossfade**.

**Callout:** `tooltip` yerine **callout** kartı — `title` + `body` + isteğe bağlı "İleri" butonu (`showNext`) + ok yönü (`pointer`: `top|bottom|left|right|none`). `hotspot` = tıklama alanı.

**Adım overlay'leri:** Her adım, hotspot'a bağlı tooltip dışında, **serbest konumlu metin/etiket overlay**'leri (`step.textOverlays`) taşıyabilir — oransal `x/y`, boyut `sm|md|lg`, opsiyonel renk.

---

## 6. Tasarım sistemi & stil kuralları

Hedef: Arcade seviyesi görünüm, makul eforla.

**Temel araçlar**
- **Tailwind CSS + shadcn/ui** (Radix tabanlı) — cilalı arayüz standardı.
- **Framer Motion** — tüm hareket (zoom, geçiş, tooltip) buradan.
- **Lucide** — ikonlar.
- Font: **Geist** veya **Inter** (gövde) + kişilik için bir display font.

**Renk & yüzey**
- **Açık (light) canvas — beyaz.** Vurgu **canlı mor + mavi** accent ile gelir (dikkat çekici, vurucu).
- **Tek primary mavi: `#2142E7`** (gradient YOK, düz renk). Tüm butonlar/accent/hotspot/callout bunu kullanır.
- Token'lar **semantik ve tek kaynak** (`packages/ui/tailwind-preset.js`): `canvas`/`surface`/`ink`/`accent`. Tema tek yerden çevrilir.
- Soft shadow + büyük radius (`rounded-2xl`). Beyaz yüzeyleri hairline + gölge + accent ile ayır (düz görünmesin).

**Sahne (scene) reçetesi** — "background ayarlama" maddesi:
- mesh/CSS gradient **+** hafif noise dokusu **+** soft shadow. (Arcade'in tüm sırrı bu üçlü.)
- Demonun "ekran görüntüsü" bir browser/cihaz çerçevesi içinde, sahnenin ortasında.

**İnteraktiflik hissi** (player'ın kalbi) — şu 4 öğe birlikte:
1. **Nabız atan hotspot** — CSS `@keyframes` ring (scale 1→2.6, opacity 1→0, ~1.6s, infinite).
2. **Kendiliğinden hareket eden imleç** — hotspot'a doğru kayar.
3. **Tıklayınca yumuşak zoom** — `transform: scale()` + `transform-origin` hotspot'ta.
4. **Adım geçişi** — Framer Motion, easing `cubic-bezier(.22,.61,.36,1)`, süre ~0.6s.

**Export kalitesi (farkımız):** zoom asla pikselleşmez; video/GIF yüksek çözünürlük + framerate. Sunucuda render edildiği için bu garanti.

---

## 7. Kod kuralları & konvansiyonlar

- **TypeScript strict**; `any` yasak (gerekirse `unknown` + daraltma).
- Klasör adları `kebab-case`, React bileşenleri `PascalCase`, değişken/fonksiyon `camelCase`.
- Ortak tipler **sadece** `/packages/schema`'da; kopyalama yok.
- Bileşenler küçük ve tek sorumluluklu. 200+ satır bileşen = böl.
- State: Zustand store'ları feature bazlı (`useEditorStore`, `usePlayerStore`).
- Tailwind: keyfi değer (`w-[427px]`) yerine ölçek kullan; tekrar eden desen → `/packages/ui` bileşeni.
- Commit: **Conventional Commits** (`feat:`, `fix:`, `refactor:`…). Tek commit = tek mantıksal değişiklik.
- Yan etki/IO katmanı (R2, DB) saf UI'dan ayrı; bileşenler doğrudan fetch yapmaz, hook/servis üzerinden.
- Her PR çalışır halde; yarım özellik main'e gitmez.

---

## 8. Yol haritası (fazlar)

> Bir fazı bitirmeden sonrakine geçme. Faz dışı özellik = önce sor.

**Faz 1 — Çekirdek (MVP)** ← şu an buradayız
- Chrome uzantısıyla kayıt → her tıklama bir `step` (screenshot ya da video klip).
- Editor: adım sırala, **callout** (başlık/açıklama+pointer) + **metin/etiket overlay** + hotspot ekle/düzenle, back/next, background seç, zoom/focus (kamera) noktası. Düzenleme sağ panelde; öğeler taşınabilir.
- Player + preview: oynat, adımlar arası gez.
- Paylaşılabilir link.

**Faz 2 — Export**
- Video / GIF / HTML embed (sunucu-taraflı, yüksek kalite).

**Faz 3 — Satış katmanı**
- Kişiselleştirme (isim/logo/veri değiştir), demo hub, basit analitik, CRM bağlantısı.

**Faz 4 — HTML klon**
- Üst tier olarak. Recapture (UI değişince yeniden yakalama) dahil planlanır.

**Faz 5 — Onboarding + AI agent**
- Ayrı modül. In-app SDK / konuşan AI demo.

**Faz 1'de KESİNLİKLE YAPMA:** HTML klon · kişiselleştirme · analitik · AI · CRM · demo hub.

---

## 9. Faz 1 — adım adım başlangıç

1. **Repo iskeleti:** monorepo (`pnpm` workspaces), §4'teki klasör yapısı, TS strict + ESLint/Prettier.
2. **`/packages/schema`:** §5'teki `Demo` ve `Step` tiplerini yaz. Her şey bunun üstüne kurulacak.
3. **Player (önce bunu):** schema'dan beslenen, `type`'a göre render eden statik player. Örnek JSON ile test et. (İnteraktiflik hissi burada doğar.)
4. **Editor (basit):** adım listesi + tooltip/hotspot/zoom düzenleme; çıktısı schema JSON.
5. **Uzantı:** MV3 kurulumu → screenshot yakalama → adımlara çevirme. Sonra video (`getDisplayMedia`).
6. **Backend + paylaşım:** demo kaydet/getir, medyayı R2'ye yükle, public paylaşım linki.

> Sıra bilinçli: **schema → player → editor → capture → backend.** Önce "neyi" gösterdiğimizi netleştir, sonra "nasıl" yakaladığımızı.

---

## 10. Karar günlüğü (decision log)

Yeni karar veya değişiklik buraya tek satır eklenir (tarih + karar). Böylece Claude geçmişi bilir.

- `2026-05-29` — Wedge: Pazarlama+Satış. Capture: önce screenshot+video, HTML klon Faz 4.
- `2026-05-29` — Stack: MV3+TS uzantı, React+TS+Zustand web, Postgres, R2, Playwright+ffmpeg export.
- `2026-05-29` — Stil: Tailwind+shadcn+Framer Motion; koyu canvas + tek accent; sahne = gradient+noise+shadow.
- `2026-05-30` — Stil revizyonu (kullanıcı talebi): koyu canvas → **açık/beyaz canvas** + canlı **mor+mavi** vurgu (vurucu). Semantik token'lar (canvas/surface/ink/accent) tek kaynak `packages/ui/tailwind-preset.js`. Sahne arka planı açık.
- `2026-05-30` — Accent **mavi baskın** (kullanıcı talebi): primary `#2D7FF9`, gradient mavi→mor, sahne aurası mavi ağırlıklı.
- `2026-05-30` — Faz 1 kapsamına **metin/etiket overlay** eklendi (kullanıcı talebi): adımlara serbest konumlu metin (`step.textOverlays`), schema'da `TextOverlay` tipi. (Blur/şekil eklenmedi — sonraki fazlar.)
- `2026-05-30` — Player modeli düzeltildi (kullanıcı): `focus` = **kamera**; ardışık aynı-medya adımlarda **pan**, farklı medyada crossfade. `tooltip` → **callout** (başlık/açıklama+İleri+pointer yön). Progress = **geniş segment**, video segmenti süreyle dolar.
- `2026-05-30` — Editör v2 + stil (kullanıcı): her öğeye konum+**boyut+radius+border+renk** (schema `BoxStyle`; `hotspot.size/color`; `callout.width/style`; `textOverlay.style`). Üçgen pointer; üstte **ikonlu toolbar**; native dropdown yerine **segment/pointer-picker/renk paleti**. 15 adımlık `demo_showcase` (editör varsayılanı).
- `2026-05-30` — Primary renk **#2142E7** (kullanıcı): eski `#2D7FF9` ve mavi→mor gradient kaldırıldı, tek düz mavi (`accent-grad` artık düz). Adım rozetleri pasif `#878B92`/beyaz, aktif `#2142E7`/beyaz; araya-"+" her zaman görünür + ortadan gri çizgi. Hotspot/callout yuvarlağı her zaman pulse (2 boş halka), hover'da merkez dolar. Sol kartlar büyük (128px), sol-altta sıra no.
- `2026-05-30` — Editör v3 Pass 1 (kullanıcı, ref görseller): yumuşak callout (renge yakın gölge); sol panel = sıra dairesi + tür ikonu + 3-nokta menü (rename/duplicate/download/skip/delete) + araya-ekle + PC'den görsel; sağ "Design" (wrapper `browser/dark/none` + bg swatch); stil alanları **Figma sayısal input + ikon**; sürüklerken **px mesafe kılavuzları**. Schema: `step.name/skip`, `callout.height`, `demo.wrapper`. (Pass 2: pan&zoom dikdörtgeni + gentle/quick/slow, köşeden resize, animasyonlu/PC arka plan.)
- `2026-05-30` — Sol panel ikon/+/skip rötuşu (kullanıcı, `icon.html`): adım rozetleri pasif `#878b92`/beyaz · aktif `#2142e7`/beyaz; görsel/video ikonları `icon.html` SVG'leri; araya-"+" her zaman görünür beyaz daire + ortadan gri çizgi; ellipsis sağ-alt + portal dropdown; skip artık görünümü bozmaz (grayscale kaldırıldı, sadece "Atlandı" rozeti). Eski primary `#2D7FF9`/`#3B74F5` örnek SVG'lerden temizlendi.
- `2026-05-30` — **Uzantı v2: sayfa-içi recorder overlay** (kullanıcı, `record.PNG`): ikon → **dropdown popup** (başlık + "Kaydı başlat") → popup `scripting.executeScript` ile sayfaya **Shadow DOM overlay** enjekte eder → **5-4-3-2-1 geri sayım** (beyaz saydam dim, ince/zarif font), üstte yukarı-yapışık **"Recording area"** şeridi, **ortada ✕ iptal** (Esc), altta **Kaydı durdur** + **Ctrl+Y**. Yakalama anında overlay gizlenir (screenshot'a girmez). Durdur→`FINALIZE` (background Demo kurar, Supabase POST, Studio açar). Manifest: `scripting` izni + `default_popup`.
- `2026-05-30` — **Tek renk turuncu + gradient kaldırıldı + tümüne-uygula onayı** (kullanıcı): "Tümüne uygula" butonu tıklanınca kısa süreli **✓ "Tümüne uygulandı"** onayı verir. `demo_zoom` **tek düz turuncu** (`#F97316`) accent'e çevrildi (callout+hotspot+etiket; mavi kalktı), sahne **tek düz renk** (`#F5F4F2`, adım-başı arka planlar kaldırıldı). **ScreenScene gradient aurası kaldırıldı** (düz zemin + noise + shadow) — §6'daki "gradient aura" kararını override eder (kullanıcı "gradient yapma"). Dashboard'lar teal kalır (içerik kontrastı). Geri almak kolay (mesh tek yerde).
- `2026-05-30` — **Callout buton/kontrast + dashboard rengi** (kullanıcı): callout'a `showBack` eklendi → İleri/Geri ayrı ayrı aç/kapa (inspector toggle). Next/Back butonları **zemine duyarlı** (koyu callout'ta beyaz buton/halka, açıkta düz mavi buton) — aynı renk zeminde kaybolmuyorlar. Örnek dashboard SVG'leri **teal (#0D9488)** yapıldı (mavi callout ile çakışmasın diye; "acme paneli farklı renk"). Uzantı capture → Supabase kaydı doğrulandı (anon POST çalışıyor); açılış sekmesi yalnız `localhost:3000` ayakta değilse `ERR_CONNECTION_REFUSED` verir (dev server gerekli). `apps/extension` gerçeklendi (esbuild; SW=esm, content/popup=iife). `pointerdown`→`captureVisibleTab` (jpeg, throttle) ile her tıklama bir screenshot adımı + oransal hotspot; popup'tan başlat/durdur/kaydet → `Demo` kurar, Supabase REST'e anon `POST`, `/studio?demo=id` açar. Medya şimdilik data URL (Storage/R2 sonra). **Video (`getDisplayMedia`) bir sonraki adım.** Faz 1 (MVP) capture ayağı tamam.
- `2026-05-30` — **Mavi callout + zoom turu demo** (kullanıcı): callout zemini mavi (`#2142E7`); koyu zeminde metin **otomatik beyaz** (`isDarkColor` luminance, UI'dan export, editörde de uygulanır). Editör callout'unda üçgen **nub** eklendi (UI ile birebir) + ok yönü artık çalışıyor. Callout sürüklemesi **delta tabanlı** (zıplama yok); kılavuz çizgileri **anchor'ı** (ok ucu) referans alır. Yeni `sampleZoomDemo` (`demo_zoom`, 9 adım) editör varsayılanı oldu — yalnız-hotspot / yalnız-callout / ikisi-birlikte, tüm ok yönleri, bol pan&zoom, tüm callout'lar mavi.
- `2026-05-30` — **Hotspot ↔ Callout tam bağımsız** (kullanıcı): hotspot = yalnızca tıklanacak alan (metinsiz); callout = **kendi konumlu** (`callout.x/y`, schema'ya eklendi) düz açıklama kutusu, **İleri+Geri** butonlu. Callout artık hotspot konumuna bağlı değil (önceki `anchor = hotspot` kuplajı kaldırıldı); editörde bağımsız sürüklenir. z-sıra netleştirildi: focus(10) < metin overlay(20) < hotspot(30) < callout(40). Hotspot ekleyince callout eklenmiyor. **AutoCursor (otomatik takip imleci) kaldırıldı.**
- `2026-05-30` — **Backend = Supabase** (kullanıcı, MCP kurdu): Faz 1 backend+paylaşım için ham Postgres+R2 yerine **Supabase** (Postgres + Storage). `public.demos(id, title, data jsonb, is_public, ts)` — demo'nun tamamı `data`'da. RLS açık; Faz 1 auth yok → **anon insert/update/select permissive (MVP)**, gerçek auth+sahiplik Faz 3. Medya şimdilik JSON içinde (data URL / örnek yol); Storage/R2 yüklemesi export+uzantı ile gelecek. Studio "Paylaş" → upsert + `/play/{id}` linki (kopyala modalı); `?demo=id` ile editöre yükleme; play sayfası önce Supabase, yoksa örnek demo. Env: `NEXT_PUBLIC_SUPABASE_URL/_ANON_KEY` (publishable).
- `2026-06-02` — **Gerçek Supabase auth + e-posta magic link + hızlı düzeltmeler** (kullanıcı): Mock auth → **gerçek Supabase**. `supabase/client.ts` tarayıcıda **kalıcı-oturum singleton** (pkce, `detectSessionInUrl:false`; sunucu durumsuz). `lib/auth.tsx`: `signInWithGoogle` / `signInWithEmail` (OTP magic link) / `syncSession` / `completeOnboarding`→`updateUser({onboarded,...})`; **ekranlar değişmesin diye Supabase oturumu eski localStorage anahtarlarına aynalanır**; `AuthGate` artık async `syncSession`. **`/auth/callback`** magic link (`verifyOtp` token_hash) veya Google (`exchangeCodeForSession` code) dönüşünü işler → onboarding/workspaces. **Onboarding durumu `user_metadata.onboarded`** (yeni kullanıcı → onboarding; "onboardinge giremiyorum" çözüldü). **/login yeniden:** Google + e-posta magic link ("gelen kutunu kontrol et" durumu). **On-brand magic-link e-posta şablonu** + basit kurulum rehberi → `docs/auth/{magic-link-email.html,SETUP.md}` (link `{{ .SiteURL }}/auth/callback?token_hash=…&type=…`). Hızlı düzeltmeler: New Demo tile ikonu `Sparkles`→**clickthru logosu** (`components/brand.tsx`); **işlevsel ⌘K komut paleti** (`components/app/command-palette.tsx` — demo + gezinme araması; AppLayout'a bağlı, sidebar "Ara" düğmesi + Cmd/Ctrl+K). **App TR/EN dil sonraki tur.**
- `2026-06-02` — **App ekranları tamamlandı + shadcn-tarzı primitives** (kullanıcı, `/frontend-design`): Sidebar artık paylaşılan **`components/app/{app-layout,app-sidebar}.tsx`** (Ana sayfa/Kitaplık/İçgörüler nav + active; üstte **workspace switcher**, **sol-altta hesap menüsü** — ikisi de shadcn-tarzı `DropdownMenu`). AppLayout `AuthGate`+demo verisini (`useDemos`) + new-demo modalını (`useNewDemo`) sağlar; `workspaces-sidebar.tsx` kaldırıldı. **Yeni ekranlar:** `/library` (ara + tür filtresi + sort `Select`), `/insights` (4 stat kartı + trend grafiği + en-çok-izlenen tablosu; **deterministik mock metrik**, gerçek analitik Faz 3), `/settings` (Profil/Hesap/Görünüm/Plan/Bildirimler tab'lı; `?tab=` deep-link; switch/select/danger-zone). **Özel UI primitives** `components/ui/{select,menu}.tsx` — Radix'siz, tema-duyarlı, klavye-erişilebilir shadcn görünümü; **onboarding native `<select>`'leri bununla değişti** (stil sorunu çözüldü). `lib/auth.tsx`'e `updateProfile`/`updateSession` eklendi. Hepsi Tailwind token (dark/light).
- `2026-06-01` — **Ürünleştirme: auth + workspaces + onboarding + login** (kullanıcı, `/frontend-design` + ekran ref'leri `workspaces/new-demo-screen/onboarding*.png`): Akış artık **landing → /login → /onboarding → /workspaces → /studio**. Kullanıcı studio'yu doğrudan açamaz; **/studio `AuthGate` ile korunur** (oturum yoksa /login), logo → /workspaces, `?new=1` boş demo (`blankDemo`). **Auth şimdilik MOCK** (`lib/auth.tsx`: localStorage `clickthru-auth`/`-onboarded`/`-profile`; `getSession/mockSignIn/signOut/completeOnboarding`, `useAuth`, `AuthGate`) — gerçek **Supabase Google OAuth sonraki tur** (imza korunur, kolay takılır). **/login** = immersive koyu, animasyonlu (framer-motion, yüzen dashboard kartları, cam sign-in kartı, "Google ile devam et"). **/onboarding** 3 adım (Profil/Marka/Uzantı; bitince `completeOnboarding`→/workspaces). **/workspaces** = sidebar (workspace switcher + ara ⌘K + Ana sayfa/Kitaplık/İçgörüler + "Hazır ol" checklist + çıkış) + greeting + aksiyon tile'ları + "Son düzenlenenler" demo grid (`listDemos`; boşsa örnek demolara düşer) + "clickthru ile başla" kartları. **New-demo modal** (`new-demo-modal.tsx`, bulanık katman): **Sıfırdan başla**→`/studio?new=1`, **Chrome Uzantısı** (Popüler)→uzantı yükleme paneli. App ekranları Tailwind token (dark/light, studio ile aynı); login kendi koyu teması. Landing CTA'ları `/studio`→`/login`. `lib/demos.ts`: `listDemos()` + `blankDemo()` eklendi. **Faz notu:** bu §8 Faz 3 "satış katmanı/hub" işinin erken alınmış hali; gerçek auth + RLS + demo sahipliği hâlâ Faz 3.
- `2026-06-01` — **Landing sayfası** (kullanıcı, `clickthru-landing/` referansı): Kök `/` artık studio'ya redirect değil, **pazarlama landing'i**. **Kendi-içinde modül** (`apps/web/src/components/landing/*` + `app/landing.css`): kendi CSS token adası `.ct-site[data-theme]` (studio'nun global temasından bağımsız) → **landing-only dark/light**; **TR/EN i18n** (`landing/i18n.tsx`, localStorage, studio Türkçe kalır). Bölümler: nav · hero (canlı player) · sosyal kanıt · nasıl çalışır · 6 özellik modülü (**hepsi canlı animasyon**: capture/camera/studio/mixed/stage/share) · export bandı · "dene" showcase · **detaylı karşılaştırma (Farkımız nerede, 8 satır)** · fiyatlandırma · SSS · kapanış · footer. Demolar = **kendi-içinde LivePlayer** (lokal state, yeni dashboard SVG'leri, çoklu ekran + callout + hotspot + ileri/geri + **alttaki cam dock'ta sayaç/progress**) — global player-store'a dokunmaz. **Üretim-hazır metin** (Faz/yol haritası/"yakında" yok). Showcase tek koyu tiyatro (iç içe siyah yok). **Studio'ya hiç dokunulmadı.**
- `2026-06-01` — **Acme demo paneli + adım DnD + callout çerçeve** (kullanıcı): Örnek dashboard SVG'leri (`public/samples/dashboard-1..4.svg`) **gradyansız, içerik-dolu tek sisteme** yeniden çizildi — sidebar + topbar + 4 KPI + çizgi grafik (db1: Panel), filtre + rapor listesi (db2: Raporlar), arama + hesap tablosu (db3: Müşteriler), bildirim toggle + yükselt kartı + ekip (db4: Ayarlar). Düz **mor accent `#7C5CFC`** (clickthru mavi chrome'dan ayrışsın diye — design'ın Halo violet niyeti), Hanken Grotesk + JetBrains Mono, durum/delta çipleri. **Hotspot/focus landmark koordinatları korundu** (Yeni rapor 0.80/0.22 · grafik 0.5/0.72 · tarih aralığı 0.3/0.5 · arama 0.47/0.16 · bildirim toggle 0.71/0.41 · yükselt 0.3/0.78) → SVG düzeni bu koordinatlara bağlı, değiştirirken `samples.ts`'i de güncelle. Sol adım paneli **sürükle-bırak ile sıralanır** (store `reorderStep`, native HTML5 DnD, aktif adım kimliğiyle takip; +test). Callout artık **kendi rengine tonlanmış gölge + kenarlık** (UI `calloutShadow`/`calloutBorder`; player + editör birebir; kullanıcı `borderColor` verirse öncelikli).
- `2026-06-01` — **Studio yeniden tasarım (Claude Design brief → birebir uygulama)** (kullanıcı, `clickthru-design/`): Tüm editör + player **dark/light tema** kazandı. Tema, semantik token'lar (`canvas/surface{,-subtle,-raised,-elevated,-pit}`/`ink{,-muted,-faint}`/`accent{,-strong,-muted,-ring}`/`hairline{,-strong}`/`success`/`danger`/`warn`) **CSS değişkenlerine** (`globals.css` içinde `[data-theme=light|dark]`, oklch bileşenleri) bağlanarak çevrilir; `tailwind-preset.js` token'ları `oklch(var(--x) / <alpha-value>)` ile tüketir → bileşen markup'ı değişmeden tema-duyarlı. Varsayılan **light**; üst barda toggle (`lib/theme.ts` + `ThemeToggle`, localStorage `clickthru-theme`, FOUC-suz bootstrap script). **Accent #2142E7 → tasarımın oklch mavisi** (light `0.545 0.20 256`, dark `0.665 0.18 256`) — §10'daki eski #2142E7 kilidi bu satırla güncellendi (yine düz mavi, gradient yok). **Fontlar Geist → Hanken Grotesk (gövde) + JetBrains Mono (mono/eyebrow)** (next/font). Üst bar (logo+başlık+Doğrula/Önizle/Paylaş+tema+panel toggle), step rail, inspector (ikon+başlık+alt başlık kabuğu), tuval **alt-orta yüzen dock** (eski üst toolbar yerine), `canvas-pit` (pit + nokta ızgarası) tasarıma uyarlandı. **Sol/sağ paneller macOS tarzı açılır-kapanır** (panel başlığında collapse ikonu + üst barda `PanelLeft/PanelRight` toggle; `panel-slide` genişlik geçişi). Player **koyu tiyatro** + yüzen cam kontrol dock'una çevrildi; `/play` ve önizleme tam ekran tiyatro. Tuval/şahne içeriği (browser frame, callout, hotspot, metin) **daima light** (ürün içeriği) — ScreenScene'e `data-theme="light"` ile sabitlendi. **Hiçbir işlev değişmedi** (store, schema, kamera, capture, paylaşım aynı).
- `2026-05-30` — **Focus Pass 2** (kullanıcı): `focus` modeli **komple değişti** — nokta+ölçek yerine **zoom dikdörtgeni** (`{x,y,w,h,ease}`; x/y = sol-üst köşe, oransal). Tuvalde 4 köşeden resize + ortadan taşı (uygun imleçler), dışı **gri-saydam** karartma (box-shadow). Easing modları **gentle/quick/slow** sağ panelden; player pan/zoom süresi buna bağlı (0.7/0.42/1.15s). Ölçek dikdörtgenden türetilir (contain). `samples.ts` `zoom(fx,fy,scale)` yardımcısıyla migrate edildi.
