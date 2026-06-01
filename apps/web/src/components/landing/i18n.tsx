'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export type Lang = 'tr' | 'en';

const tr = {
  nav: { features: 'Özellikler', how: 'Nasıl çalışır', pricing: 'Fiyatlandırma', faq: 'SSS', login: 'Giriş yap', start: 'Ücretsiz başla' },
  hero: {
    eyebrow: 'İNTERAKTİF ÜRÜN DEMOLARI',
    title: 'Ürün turlarını saniyeler içinde tıklanabilir demoya çevir.',
    lead: 'Ekranını kaydet, üstüne callout ve zoom ekle, link olarak paylaş. Kod yok, video editörü yok — sadece pürüzsüz, paylaşılabilir bir ürün deneyimi.',
    ctaPrimary: 'Ücretsiz başla',
    ctaSecondary: 'Canlı demoyu izle',
    trust1: 'Kredi kartı yok',
    trust2: '60 saniyede ilk demon',
  },
  proof: {
    eyebrow: 'NEDEN CLICKTHRU',
    headline: 'Sinematik zoom kalitesi ve esnek format — tek araçta, adil fiyatla.',
    stats: [
      { n: '60', u: 'sn', l: 'ilk demoya kadar' },
      { n: '100', u: '%', l: 'tarayıcıda çalışır' },
      { n: '4', u: '', l: 'paylaşım formatı' },
    ],
  },
  how: {
    eyebrow: 'NASIL ÇALIŞIR',
    title: 'Üç adımda canlı bir demo',
    lead: 'Kaydından paylaşılabilir linke — arada ne kod var, ne karmaşık video editörü.',
    motif: 'Yeni rapor',
    steps: [
      { n: '01', title: 'Kaydet', body: 'Chrome uzantısını aç, kaydı başlat. Her tıklaman bir adım olur.' },
      { n: '02', title: 'Düzenle', body: 'Studio’da callout, hotspot, zoom ve metin ekle. Her şey sürükle-bırak.' },
      { n: '03', title: 'Paylaş', body: 'Tek tıkla link üret. İzleyen, tıklayarak ilerleyen bir tur görür.' },
    ],
  },
  features: {
    eyebrow: 'ÖZELLİKLER',
    title: 'Kayıttan paylaşıma kadar her şey tek yerde',
    lead: 'Yakalama, kamera, editör, mixed-media ve paylaşım — hepsi aynı pürüzsüz akışta.',
    star: '★ Baş farklılaşma',
    capture: {
      eyebrow: 'YAKALAMA',
      title: 'Kaydı başlat, gerisini biz halledelim.',
      body: 'Chrome uzantısı sayfana zarif bir overlay enjekte eder. Geri sayım biter, sen ürününü kullanırsın — her tıklama otomatik bir ekran görüntüsü ve hotspot’a dönüşür. Yakalama anında overlay kaybolur, ekran görüntüne girmez.',
      items: ['5-4-3-2-1 geri sayımla zarif başlangıç', 'Kayıt alanı şeridi · Esc ile iptal · Ctrl+Y ile durdur', 'Her tıklama = oransal konumlu, hotspot’lu bir adım', 'Durdur → demo otomatik kurulur, Studio açılır'],
    },
    camera: {
      eyebrow: 'KAMERA',
      title: 'Adım adım sınırlı değil — sinematik zoom.',
      body: 'Her adıma bir focus dikdörtgeni çiz; player o bölgeye yumuşakça yakınlaşır. Aynı ekranda kalan adımlarda kamera kayar (pan), ekran değişince crossfade olur. Üç geçiş hızı: yumuşak, hızlı, yavaş.',
      items: ['Köşeden boyutlandırılır, oran (örn. 1.8×) anlık gösterilir', 'Pan / zoom / crossfade otomatik seçilir', 'Export’ta asla pikselleşmez — sunucuda render'],
    },
    studio: {
      eyebrow: 'STUDIO',
      title: 'Bağlama duyarlı editör. Ne seçtiysen, onun ayarı.',
      body: 'Sol panelde adımlar, ortada tuval, sağda akıllı inspector. Tuvale dört öğe koyarsın; her biri sürüklenir, hizalama kılavuzlarıyla piksel piksel oturur. Adımları sürükle-bırak ile sırala.',
      items: ['🎯 Hotspot — nabız atan tıklama noktası', '💬 Callout — başlık + açıklama, 4 yön ok, İleri/Geri', '🔤 Metin etiketi — serbest konum, S/M/L, renk', '🎬 Focus — kamera bölgesi (yumuşak/hızlı/yavaş)'],
    },
    mixed: {
      eyebrow: 'KARIŞIK MEDYA',
      title: 'Ekran görüntüsü, video, interaktif adım — tek akıcı player.',
      body: 'Bir adım statik screenshot, sonraki bir video klip, sonraki interaktif bir tur olabilir. İzleyici için hepsi tek pürüzsüz akış; geçişlerde otomatik crossfade.',
      items: ['Screenshot adımı: tıkla → ilerle', 'Video adımı: oynat, bitince geç — progress kendi süresince dolar', 'Geçişlerde otomatik crossfade'],
    },
    stage: {
      eyebrow: 'SAHNE',
      title: 'Çıplak ekran görüntüsü değil — sahnelenmiş bir ürün.',
      body: 'Demonu bir tarayıcı penceresi ya da sade koyu çerçeve içine al, veya çerçevesiz bırak. Arka planı hazır sahnelerden seç ya da kendi rengini ver. Soft shadow + dokulu zemin ile cilalı bir his.',
      items: ['3 çerçeve: Tarayıcı · Koyu · Yok', 'Hazır arka plan paleti + özel renk', 'Dark & light tema'],
    },
    share: {
      eyebrow: 'PAYLAŞIM',
      title: 'Tek link. Kurulum yok. Anında tıklanabilir tur.',
      body: 'Paylaş’a bas, halka açık bir link al. İzleyen kişi koyu bir tiyatroda, yüzen cam kontrol dock’uyla adım adım ilerler — ileri/geri gider, istediği adıma atlar.',
      items: ['Herkese açık paylaşım linki', 'Kopyala / yeni sekmede aç', 'Segment’li ilerleme, atlanabilir adımlar'],
    },
  },
  exportBand: {
    eyebrow: 'EXPORT',
    title: 'Sunucu-taraflı export. Tarayıcıda değil, stüdyo kalitesinde.',
    body: 'Demolarını yüksek çözünürlüklü video, GIF veya HTML embed olarak dışa aktar. Sunucuda render edilir — zoom asla pikselleşmez, framerate düşmez.',
    fmts: [
      { ic: 'MP4', l: 'yüksek çözünürlük video' },
      { ic: 'GIF', l: 'döngüsel önizleme' },
      { ic: '<embed/>', l: 'siteye gömülebilir' },
    ],
    cta: 'Ücretsiz başla',
  },
  showcase: {
    eyebrow: 'CANLI ÖNİZLEME',
    title: 'Sadece anlatmıyoruz — dene.',
    lead: 'Gerçek player, gerçek adımlar. İleri/geri gez, zoom’u hisset, video adımını gör. İzleyenin göreceği deneyimin aynısı.',
    cta: 'Sen de böyle bir demo oluştur',
  },
  comparison: {
    eyebrow: 'KONUM',
    title: 'Farkımız nerede?',
    lead: 'Diğer araçlara saygı duyuyoruz — farkımız sinematik zoom kalitesi, mixed-media kurgu ve adil fiyat.',
    cols: ['clickthru', 'Araç A', 'Araç B', 'Araç C'],
    rows: [
      { label: 'Pürüzsüz / sinematik zoom', us: 'yes', a: 'partial:kısmi', b: 'partial:sınırlı', c: 'partial:sınırlı' },
      { label: 'Pan + crossfade kamera', us: 'yes', a: 'no', b: 'partial:kısmi', c: 'no' },
      { label: 'Mixed-media (video + interaktif)', us: 'yes', a: 'yes', b: 'yes', c: 'partial:kısmi' },
      { label: 'Yüksek kaliteli sunucu export', us: 'yes', a: 'yes', b: 'partial:düşük', c: 'partial:sınırlı' },
      { label: 'Çerçeve + sahne kurgusu', us: 'yes', a: 'partial:kısmi', b: 'no', c: 'partial:kısmi' },
      { label: 'Dark & light player', us: 'yes', a: 'no', b: 'partial:kısmi', c: 'yes' },
      { label: 'Kurulumsuz paylaşım linki', us: 'yes', a: 'yes', b: 'yes', c: 'yes' },
      { label: 'Adil giriş fiyatı', us: 'yes', a: 'no', b: 'no', c: 'partial:orta' },
    ],
  },
  pricing: {
    eyebrow: 'FİYATLANDIRMA',
    title: 'Adil bir giriş, büyüdükçe esneyen plan',
    lead: 'Ücretsiz başla, hazır olunca yükselt. İstediğin an iptal et.',
    badge: 'POPÜLER',
    note: 'Yıllık ödemede 2 ay hediye · İstediğin an iptal · KDV dahil değildir.',
    plans: [
      { name: 'Free', price: '₺0', per: '/ sonsuza dek', cta: 'Ücretsiz başla', pop: false, feats: [{ t: '3 demo' }, { t: 'Yakalama + Studio' }, { t: 'Pürüzsüz zoom & player' }, { t: 'Paylaşım linki (clickthru markalı)' }, { t: 'Video / GIF / HTML export', off: true }, { t: 'Analitik & kişiselleştirme', off: true }] },
      { name: 'Pro', price: '₺149', per: '/ ay', cta: 'Pro’ya geç', pop: true, feats: [{ t: 'Sınırsız demo' }, { t: 'Markasız paylaşım linki' }, { t: 'Pürüzsüz zoom & player' }, { t: 'Video / GIF / HTML export' }, { t: 'Temel analitik' }, { t: 'Takım & CRM', off: true }] },
      { name: 'Team', price: '₺99', per: '/ kişi · ay', cta: 'Satışla görüş', pop: false, feats: [{ t: 'Pro’daki her şey' }, { t: 'Sınırsız demo & koltuk' }, { t: 'Markasız paylaşım linki' }, { t: 'Gelişmiş analitik' }, { t: 'Takım & CRM' }, { t: 'Öncelikli destek' }] },
    ],
  },
  faq: {
    eyebrow: 'SSS',
    title: 'Sık sorulanlar',
    items: [
      { q: 'Kod bilmem gerekir mi?', a: 'Hayır. Yakalama, düzenleme ve paylaşım tamamen görsel — tek satır kod yazmadan demo oluşturursun.' },
      { q: 'Verilerim nerede tutuluyor?', a: 'Demolar güvenli bir bulut veritabanı ve depolamada, hesabına bağlı olarak saklanır. Linki paylaşmadıkça demon herkese açık olmaz.' },
      { q: 'Hangi tarayıcıyı destekliyor?', a: 'Yakalama, modern bir Chrome uzantısı (MV3) ile çalışır. Oluşan demolar her modern tarayıcıda oynatılır.' },
      { q: 'Video da kaydedebilir miyim?', a: 'Evet. Bir adımı ekran görüntüsü ya da video klip olarak ekleyebilirsin; player ikisini tek akışta oynatır.' },
      { q: 'Export hangi formatları destekliyor?', a: 'Demolarını MP4 video, GIF veya siteye gömülebilir HTML olarak dışa aktarabilirsin — hepsi sunucuda yüksek kalitede render edilir.' },
    ],
  },
  closing: {
    title: 'İlk demonu 60 saniyede oluştur.',
    lead: 'Kaydet, üstüne anlat, link olarak paylaş — en pürüzsüz zoom ve en temiz görünümle.',
    ctaPrimary: 'Ücretsiz başla',
    ctaSecondary: 'Canlı demoyu izle',
  },
  footer: {
    pitch: 'Ürününü kaydet, üstüne anlat, tıklanabilir demo olarak paylaş — en pürüzsüz zoom ve en temiz görünümle.',
    cols: [
      { h: 'Ürün', links: [['Özellikler', '#features'], ['Fiyatlandırma', '#pricing'], ['Canlı demo', '#showcase']] },
      { h: 'Kaynaklar', links: [['SSS', '#faq'], ['Dokümanlar', '#'], ['Değişiklikler', '#']] },
      { h: 'Yasal', links: [['Gizlilik', '#'], ['Şartlar', '#'], ['İletişim', '#']] },
    ],
    copy: '© 2026 clickthru',
  },
  player: { auto: 'otomatik oynatılıyor — sen de böyle paylaşırsın', interactive: 'interaktif önizleme — sen gez' },
  demo: {
    preparing: 'Hazırlanıyor',
    recording: 'Kayıt alanı',
    stepAdded: 'Adım eklendi',
    stop: 'Kaydı durdur',
    videoStep: 'video adımı · süreyle dolar',
    imageStep: 'ekran adımı · tıkla-ilerle',
    wrappers: ['Tarayıcı çerçeve', 'Koyu çerçeve', 'Çerçevesiz'],
    inspectorCtx: ['Callout', 'Hotspot', 'Metin'],
    shareTitle: 'Demon hazır',
    shareBody: 'Linke sahip herkes interaktif turu oynatabilir. Giriş gerekmez.',
    shareBtn: 'Paylaş',
    saving: 'Kaydediliyor…',
    copy: 'Kopyala',
    copied: 'Kopyalandı',
  },
  heroSteps: [
    { title: 'Acme Analytics turu', body: 'Ürününü kaydet — her tıklaman bir adıma dönüşür.' },
    { title: 'Tek tıkla rapor', body: 'Sağ üstten yeni rapor oluştur.' },
    { title: 'Gelir trendini izle', body: 'Kamera grafiğe yumuşakça yaklaşır.' },
    { title: 'Her hesabın sağlığı', body: 'Gelir ve sağlık skoruna göre sıralı liste.' },
    { title: 'Tarih aralığı', body: 'Dönemi seç, rapor anında güncellensin.' },
    { title: 'Tek link ile paylaş', body: 'Kurulum yok — anında tıklanabilir tur.' },
  ],
  showcaseSteps: [
    { title: 'Acme ürün turuna hoş geldin', body: 'İleri / geri gez, zoom’u hisset — tıpkı izleyicinin göreceği gibi.' },
    { title: 'Yeni rapor', body: 'En sık kullanılan eylem, en görünür yerde.' },
    { title: 'Gelir trendi', body: 'Kamera grafiğe yaklaşır; aynı ekranda kayar (pan).' },
    { title: 'Hesap tablosu', body: 'Gelir ve sağlık skoruyla sıralı müşteri listesi.' },
    { title: 'Rapor oluştur (video)', body: 'Ekran değişince crossfade; video kendi süresince dolar.' },
    { title: 'Tarih aralığı', body: 'Raporu istediğin döneme göre filtrele.' },
    { title: 'Tur tamam', body: 'Sen de 60 saniyede böyle bir demo oluşturabilirsin.' },
  ],
};

export type Copy = typeof tr;

const en: Copy = {
  nav: { features: 'Features', how: 'How it works', pricing: 'Pricing', faq: 'FAQ', login: 'Log in', start: 'Start free' },
  hero: {
    eyebrow: 'INTERACTIVE PRODUCT DEMOS',
    title: 'Turn product tours into clickable demos in seconds.',
    lead: 'Record your screen, add callouts and zoom, share as a link. No code, no video editor — just a smooth, shareable product experience.',
    ctaPrimary: 'Start free',
    ctaSecondary: 'Watch live demo',
    trust1: 'No credit card',
    trust2: 'First demo in 60 seconds',
  },
  proof: {
    eyebrow: 'WHY CLICKTHRU',
    headline: 'Cinematic zoom quality and flexible formats — one tool, fair pricing.',
    stats: [
      { n: '60', u: 's', l: 'to your first demo' },
      { n: '100', u: '%', l: 'runs in the browser' },
      { n: '4', u: '', l: 'sharing formats' },
    ],
  },
  how: {
    eyebrow: 'HOW IT WORKS',
    title: 'A live demo in three steps',
    lead: 'From capture to a shareable link — no code, no complex video editor in between.',
    motif: 'New report',
    steps: [
      { n: '01', title: 'Record', body: 'Open the Chrome extension and start recording. Every click becomes a step.' },
      { n: '02', title: 'Edit', body: 'Add callouts, hotspots, zoom and text in Studio. Everything is drag-and-drop.' },
      { n: '03', title: 'Share', body: 'Generate a link in one click. Viewers get a click-through, guided tour.' },
    ],
  },
  features: {
    eyebrow: 'FEATURES',
    title: 'Everything from capture to share, in one place',
    lead: 'Capture, camera, editor, mixed-media and sharing — all in one smooth flow.',
    star: '★ Core differentiator',
    capture: {
      eyebrow: 'CAPTURE',
      title: 'Hit record — we handle the rest.',
      body: 'The Chrome extension injects an elegant overlay onto your page. The countdown ends, you use your product — every click becomes a screenshot and a hotspot. The overlay disappears at capture time, so it never shows up in your shot.',
      items: ['Graceful 5-4-3-2-1 countdown start', 'Recording-area strip · cancel with Esc · stop with Ctrl+Y', 'Each click = a proportionally placed step with a hotspot', 'Stop → demo is built automatically, Studio opens'],
    },
    camera: {
      eyebrow: 'CAMERA',
      title: 'Not just step-by-step — cinematic zoom.',
      body: 'Draw a focus rectangle on each step; the player eases into that region. On steps that stay on the same screen the camera pans, and it crossfades when the screen changes. Three transition speeds: gentle, fast, slow.',
      items: ['Resize from corners, live ratio (e.g. 1.8×)', 'Pan / zoom / crossfade chosen automatically', 'Never pixelates on export — rendered server-side'],
    },
    studio: {
      eyebrow: 'STUDIO',
      title: 'A context-aware editor. Select anything — its controls appear.',
      body: 'Steps on the left, canvas in the middle, a smart inspector on the right. Drop four element types on the canvas; each drags freely and snaps with alignment guides. Reorder steps with drag-and-drop.',
      items: ['🎯 Hotspot — a pulsing click target', '💬 Callout — title + body, 4-way arrow, Next/Back', '🔤 Text label — free position, S/M/L, color', '🎬 Focus — camera region (gentle/fast/slow)'],
    },
    mixed: {
      eyebrow: 'MIXED MEDIA',
      title: 'Screenshot, video, interactive step — one fluid player.',
      body: 'One step can be a static screenshot, the next a video clip, the next an interactive tour. To the viewer it’s a single smooth flow with automatic crossfades between them.',
      items: ['Screenshot step: click → advance', 'Video step: plays, then advances — progress fills over its duration', 'Automatic crossfade between steps'],
    },
    stage: {
      eyebrow: 'STAGE',
      title: 'Not a bare screenshot — a staged product.',
      body: 'Frame your demo in a browser window or a clean dark frame, or leave it frameless. Pick a background from ready-made scenes or set your own color. Soft shadow + textured ground for a polished feel.',
      items: ['3 frames: Browser · Dark · None', 'Ready-made background palette + custom color', 'Dark & light theme'],
    },
    share: {
      eyebrow: 'SHARING',
      title: 'One link. No setup. Instantly clickable tour.',
      body: 'Hit Share and get a public link. The viewer moves through it step by step in a dark theater with a floating glass control dock — forward/back, jump to any step.',
      items: ['Public share link', 'Copy / open in new tab', 'Segmented progress, skippable steps'],
    },
  },
  exportBand: {
    eyebrow: 'EXPORT',
    title: 'Server-side export. Studio quality, not browser quality.',
    body: 'Export your demos as high-resolution video, GIF or embeddable HTML. Rendered on the server — zoom never pixelates and the framerate never drops.',
    fmts: [
      { ic: 'MP4', l: 'high-resolution video' },
      { ic: 'GIF', l: 'looping preview' },
      { ic: '<embed/>', l: 'embeddable on your site' },
    ],
    cta: 'Start free',
  },
  showcase: {
    eyebrow: 'LIVE PREVIEW',
    title: 'We don’t just tell you — try it.',
    lead: 'Real player, real steps. Go forward/back, feel the zoom, see a video step. The exact experience your viewers get.',
    cta: 'Build a demo like this',
  },
  comparison: {
    eyebrow: 'POSITIONING',
    title: 'Where we’re different',
    lead: 'We respect the other tools — our edge is cinematic zoom quality, mixed-media storytelling and fair pricing.',
    cols: ['clickthru', 'Tool A', 'Tool B', 'Tool C'],
    rows: [
      { label: 'Smooth / cinematic zoom', us: 'yes', a: 'partial:partial', b: 'partial:limited', c: 'partial:limited' },
      { label: 'Pan + crossfade camera', us: 'yes', a: 'no', b: 'partial:partial', c: 'no' },
      { label: 'Mixed-media (video + interactive)', us: 'yes', a: 'yes', b: 'yes', c: 'partial:partial' },
      { label: 'High-quality server export', us: 'yes', a: 'yes', b: 'partial:low', c: 'partial:limited' },
      { label: 'Frame + scene staging', us: 'yes', a: 'partial:partial', b: 'no', c: 'partial:partial' },
      { label: 'Dark & light player', us: 'yes', a: 'no', b: 'partial:partial', c: 'yes' },
      { label: 'No-setup share link', us: 'yes', a: 'yes', b: 'yes', c: 'yes' },
      { label: 'Fair entry price', us: 'yes', a: 'no', b: 'no', c: 'partial:mid' },
    ],
  },
  pricing: {
    eyebrow: 'PRICING',
    title: 'A fair entry, a plan that flexes as you grow',
    lead: 'Start free, upgrade when you’re ready. Cancel anytime.',
    badge: 'POPULAR',
    note: 'Annual billing gets 2 months free · Cancel anytime · VAT not included.',
    plans: [
      { name: 'Free', price: '₺0', per: '/ forever', cta: 'Start free', pop: false, feats: [{ t: '3 demos' }, { t: 'Capture + Studio' }, { t: 'Smooth zoom & player' }, { t: 'Share link (clickthru branded)' }, { t: 'Video / GIF / HTML export', off: true }, { t: 'Analytics & personalization', off: true }] },
      { name: 'Pro', price: '₺149', per: '/ mo', cta: 'Go Pro', pop: true, feats: [{ t: 'Unlimited demos' }, { t: 'Unbranded share link' }, { t: 'Smooth zoom & player' }, { t: 'Video / GIF / HTML export' }, { t: 'Basic analytics' }, { t: 'Team & CRM', off: true }] },
      { name: 'Team', price: '₺99', per: '/ seat · mo', cta: 'Talk to sales', pop: false, feats: [{ t: 'Everything in Pro' }, { t: 'Unlimited demos & seats' }, { t: 'Unbranded share link' }, { t: 'Advanced analytics' }, { t: 'Team & CRM' }, { t: 'Priority support' }] },
    ],
  },
  faq: {
    eyebrow: 'FAQ',
    title: 'Frequently asked',
    items: [
      { q: 'Do I need to know how to code?', a: 'No. Capture, editing and sharing are entirely visual — you build a demo without writing a single line of code.' },
      { q: 'Where is my data stored?', a: 'Demos are stored in a secure cloud database and storage, tied to your account. Your demo isn’t public until you share its link.' },
      { q: 'Which browser is supported?', a: 'Capture runs via a modern Chrome extension (MV3). The demos you create play back in any modern browser.' },
      { q: 'Can I record video too?', a: 'Yes. A step can be a screenshot or a video clip; the player plays both in a single flow.' },
      { q: 'Which export formats are supported?', a: 'You can export demos as MP4 video, GIF or embeddable HTML — all rendered at high quality on the server.' },
    ],
  },
  closing: {
    title: 'Build your first demo in 60 seconds.',
    lead: 'Record, narrate on top, share as a link — with the smoothest zoom and the cleanest look.',
    ctaPrimary: 'Start free',
    ctaSecondary: 'Watch live demo',
  },
  footer: {
    pitch: 'Record your product, narrate on top, share as a clickable demo — with the smoothest zoom and the cleanest look.',
    cols: [
      { h: 'Product', links: [['Features', '#features'], ['Pricing', '#pricing'], ['Live demo', '#showcase']] },
      { h: 'Resources', links: [['FAQ', '#faq'], ['Docs', '#'], ['Changelog', '#']] },
      { h: 'Legal', links: [['Privacy', '#'], ['Terms', '#'], ['Contact', '#']] },
    ],
    copy: '© 2026 clickthru',
  },
  player: { auto: 'auto-playing — this is how you share', interactive: 'interactive preview — explore it' },
  demo: {
    preparing: 'Getting ready',
    recording: 'Recording area',
    stepAdded: 'Step added',
    stop: 'Stop recording',
    videoStep: 'video step · fills over time',
    imageStep: 'screen step · click to advance',
    wrappers: ['Browser frame', 'Dark frame', 'Frameless'],
    inspectorCtx: ['Callout', 'Hotspot', 'Text'],
    shareTitle: 'Your demo is ready',
    shareBody: 'Anyone with the link can play the interactive tour. No sign-in required.',
    shareBtn: 'Share',
    saving: 'Saving…',
    copy: 'Copy',
    copied: 'Copied',
  },
  heroSteps: [
    { title: 'Acme Analytics tour', body: 'Record your product — every click becomes a step.' },
    { title: 'New report in one click', body: 'Create a new report from the top right.' },
    { title: 'Watch revenue trend', body: 'The camera eases into the chart.' },
    { title: 'Health of every account', body: 'A list sorted by revenue and health score.' },
    { title: 'Date range', body: 'Pick a period — the report updates instantly.' },
    { title: 'Share with one link', body: 'No setup — an instantly clickable tour.' },
  ],
  showcaseSteps: [
    { title: 'Welcome to the Acme tour', body: 'Go forward / back, feel the zoom — exactly what your viewer sees.' },
    { title: 'New report', body: 'The most-used action, in the most visible spot.' },
    { title: 'Revenue trend', body: 'The camera eases into the chart and pans on the same screen.' },
    { title: 'Accounts table', body: 'Customers sorted by revenue and health score.' },
    { title: 'Create a report (video)', body: 'Crossfade on screen change; video fills over its duration.' },
    { title: 'Date range', body: 'Filter the report by any period.' },
    { title: 'Tour complete', body: 'You can build a demo like this in 60 seconds too.' },
  ],
};

const dict: Record<Lang, Copy> = { tr, en };

const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: Copy }>({
  lang: 'tr',
  setLang: () => {},
  t: tr,
});

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('tr');
  useEffect(() => {
    const saved = localStorage.getItem('clickthru-landing-lang');
    if (saved === 'tr' || saved === 'en') setLangState(saved);
  }, []);
  function setLang(l: Lang) {
    setLangState(l);
    try {
      localStorage.setItem('clickthru-landing-lang', l);
    } catch {
      // yoksay
    }
  }
  return <LangContext.Provider value={{ lang, setLang, t: dict[lang] }}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}
