# clickthru Studio — İşlevsel Tasarım Brief'i (stilden bağımsız)

> **Bu brief'in amacı:** Studio editörünün **ne yaptığını** — hangi ekranlar, hangi nesneler, hangi işlevler — anlatmak.
> **Görünümü kasıtlı olarak tarif ETMİYOR.** Renk, font, yerleşim (kaç kolon), boşluk, gölge, ikon, animasyon stili — **tamamen sana ait.**
> Mevcut üründe bir tasarım var; **onu kopyalama.** Aşağıdaki işlevleri karşılayan **yepyeni, özgün bir tasarım** üret. Yerleşimi de değiştirebilirsin (3 panel şart değil; tek-panel, katmanlı, modal-ağırlıklı, sol-sekme, alt-dock… ne istersen).
> **Tek kısıt:** Listelenen işlevlerin hiçbiri kaybolmasın. Her işlev için bir giriş yolu ve bir görsel durum olsun.

---

## 1. Ürün ne yapıyor? (bağlam)

clickthru, kullanıcıların ürün ekranlarından **tıklanabilir interaktif demolar** ürettiği bir araç. Kullanıcı ekran görüntüleri / video klipleri alır, üstlerine açıklama ve yönlendirme öğeleri ekler, sonra bunu bir link olarak paylaşır. İzleyen kişi adım adım, tıklayarak ilerleyen bir ürün turu izler.

**Demo = sıralı adımlar.** Her adım bir görsel (veya video) + o görselin üstüne yerleştirilen öğelerdir. Oynatıcı adımları sırayla gösterir; aynı görselde kalan ardışık adımlarda **kamera kayar/yakınlaşır**, görsel değişince **yumuşak geçiş** olur.

**Studio**, bu demonun kurulduğu/düzenlendiği editör ekranıdır. Bu brief sadece Studio'yu kapsar.

**Tasarımın ruhu (yön, kural değil):** profesyonel, modern, cilalı bir içerik-üretim aracı. Referans dünya: ekran kaydı/demo araçları (Arcade, Storylane) ve tasarım editörleri (Figma benzeri kontrol hissi). Ama görsel dili sana bırakıyorum — **klişeden kaçın, özgün ol.**

---

## 2. Studio'nun mantıksal bölgeleri (yerleşimi sen kur)

Studio'nun yapması gereken **dört iş** var. Bunları nasıl yerleştireceğin (yan yana panel, sekme, katman, çekmece…) senin kararın:

1. **Adımları yönet** — demodaki adımların listesi; ekle/sil/sırala/seç.
2. **Adımı düzenle (tuval)** — seçili adımın görselini gör, üstündeki öğeleri yerleştir/taşı.
3. **Öğe ayarları (inspector)** — seçili öğenin/adımın/demonun ayarlarını değiştir.
4. **Üst eylemler** — doğrula, önizle, paylaş.

> Not: Bu dördünü tek ekranda mı, sekmeli mi, modal'lı mı vereceğin tamamen serbest. "Ne seçtiysem onun ayarları görünür" mantığı (bağlama duyarlı inspector) korunsun yeter.

---

## 3. Ekran ekran işlevler

### 3.1 Üst eylem çubuğu
- **Marka/kimlik** alanı.
- **Doğrula:** Demonun veri yapısını kontrol eder; sonucu kullanıcıya bildirir (geçerli / hatalı + kısa mesaj). → *Tasarım: geçici geri bildirim durumu gerekiyor.*
- **Önizle:** Demoyu gerçek oynatıcıda tam ekran açar (bkz. 3.6).
- **Paylaş:** Demoyu kaydeder, halka açık bir link üretir, paylaşım ekranını açar (bkz. 3.7). → *Tasarım: "kaydediliyor" yükleniyor durumu gerekiyor.*

### 3.2 Adım listesi
Demodaki tüm adımların gezilebilir listesi. İşlevler:
- Her adımın **küçük önizlemesi** (görsel ise küçük resim, video ise video olduğu belli).
- **Sıra numarası** ve **tür göstergesi** (görsel / video).
- **Aktif adım** belli olmalı (hangisini düzenliyorum).
- **"Atlandı" durumu:** bir adım oynatmada atlanabilir; listede bu belli olmalı (ama önizlemesi okunur kalsın).
- **Adıma tıkla → o adımı düzenlemeye geç.**
- Her adım için **işlem menüsü:** yeniden adlandır · çoğalt · görseli indir · oynatmada atla/atlamayı geri al · sil.
- **Araya adım ekleme:** iki adımın arasına yeni adım eklemek için bir yol.
- **Yeni adım ekleme:** kullanıcının bilgisayarından görsel yükleyerek yeni adım oluşturma.
- **Adımları yeniden sıralama** (örn. sürükle-bırak) — destekle.
- **Boş durum:** hiç adım yokken yönlendirici mesaj.

### 3.3 Düzenleme tuvali
Seçili adımın görselini büyük gösterir; üstüne **öğeler** yerleştirilir. Tüm öğeler **tıkla-seç** ve **sürükle-taşı** edilebilir; sürüklerken kullanıcı konumu rahat ayarlayabilmeli (hizalama/mesafe yardımcıları faydalı olur, biçimi sana kalmış).

Görsel bir **çerçeve (wrapper)** içinde gösterilebilir — üç seçenek: tarayıcı penceresi görünümü / sade koyu çerçeve / çerçevesiz.

Tuvale yerleştirilebilen **4 öğe türü:**

1. **Hotspot (tıklama noktası):** Dikkat çeken, "buraya tıkla" hissi veren bir işaret. Konum, boyut, renk ayarlanır. (Canlı/animasyonlu görünmesi beklenir — biçimi sana ait.)
2. **Callout (açıklama kartı):** Başlık + açıklama metni taşıyan kart. Bir yöne **ok/işaretçi** gösterebilir (yukarı/aşağı/sol/sağ/oksuz). İçinde **"İleri" ve "Geri"** gezinme butonları olabilir (her biri ayrı açılıp kapanabilir). Konumu, boyutu, görünümü ayarlanır. **Hotspot'tan bağımsızdır** (kendi yeri vardır).
3. **Metin etiketi:** Serbest konumlu kısa metin. Boyut (küçük/orta/büyük), renk, basit kutu görünümü.
4. **Focus (kamera):** Oynatmada o adımda kameranın **nereye yakınlaşacağını/kayacağını** belirleyen bir alan. Kullanıcı bu alanı tuvalde **taşıyıp boyutlandırabilmeli**; alanın dışı (kameranın görmeyeceği yer) görsel olarak ayırt edilmeli. Bir **yakınlaşma oranı** kullanıcıya gösterilmeli. Geçişin **hızı/yumuşaklığı** ayarlanır (3 mod: yumuşak/hızlı/yavaş).

**Boş tuval durumu:** adım yokken ne yapılacağını söyleyen mesaj.

### 3.4 Öğe ekleme
Tuvaldeki adıma yukarıdaki 4 öğeyi eklemek için hızlı bir yol (örn. araç çubuğu). Kurallar:
- Bir adımda hotspot/callout/focus **en fazla birer tane** — zaten varsa tekrar eklenemez (giriş pasifleşmeli).
- Metin etiketi **birden fazla** olabilir.
- Aktif adımı silmek için de bir yol burada olabilir.

### 3.5 Ayarlar (bağlama duyarlı inspector)
Kullanıcı ne seçtiyse onun ayarları görünür. **Altı bağlam** var:

**(a) Demo ayarları** (hiçbir öğe seçili değilken):
- Demo **başlığı**.
- **Wrapper** seçimi (tarayıcı / koyu / yok) — seçenekler önizlemeli olursa iyi.
- **Arka plan** seçimi (hazır seçenekler + özel renk).

**(b) Adım ayarları:**
- Adıma özel **arka plan** (yoksa demodan miras alır; mirasa geri dönebilme).
- Bu ayarı **tüm adımlara uygula** seçeneği.
- Bu adımdaki **öğelerin listesi** — tıklayınca ilgili öğenin ayarına geç.

**(c) Hotspot ayarları:** boyut, renk, (konum tuvalden), kaldır.

**(d) Callout ayarları:** başlık, açıklama, ok yönü, "İleri"/"Geri" butonları aç-kapa, genişlik, yükseklik, köşe yuvarlaklığı, kenarlık, arka plan rengi, kenarlık rengi; **stili tüm adımlara uygula**; kaldır.

**(e) Focus ayarları:** geçiş modu (yumuşak/hızlı/yavaş); **geçişi tüm adımlara uygula**; yakınlaşma oranı bilgisi; kaldır.

**(f) Metin etiketi ayarları:** içerik, boyut (S/M/L), renk, kutu görünümü (köşe/arka plan); kaldır.

> **"Tümüne uygula" eylemleri** (arka plan / callout stili / focus geçişi): tıklanınca kullanıcıya **uygulandı onayı** verilmeli (görsel geri bildirim).

### 3.6 Önizleme (oynatıcı)
Demoyu gerçek izleyici deneyimiyle tam ekran oynatır:
- Adımlar sırayla; aynı görselde **kamera kayar/yakınlaşır**, görsel değişince **yumuşak geçiş**.
- Callout/hotspot/metin görselle birlikte doğru konumda görünür.
- **İlerleme göstergesi:** adım adım dolan bir çubuk; **video adımları kendi süresince dolar**. Bir adıma **tıklayıp atlama** mümkün. İleri/geri gezinme.
- Kapat → editöre dön.

### 3.7 Paylaşım
- "Demo hazır" mesajı + üretilen **link**.
- Linki **kopyala** (kopyalandı onayı).
- Linki **yeni sekmede aç**.

---

## 4. Tuval öğelerinin "durum" özeti (tasarımın göstermesi gerekenler)

| Öğe | Düzenlenir | Durumlar |
|---|---|---|
| Adım kartı | — | normal / aktif / atlandı / video / boş liste |
| Hotspot | konum, boyut, renk | seçili / seçili değil / (canlı görünüm) |
| Callout | metinler, ok yönü, butonlar, boyut, renkler, konum | seçili / oklu (4 yön) / oksuz / koyu zeminde okunur |
| Metin etiketi | içerik, boyut, renk, kutu | seçili / seçili değil |
| Focus | konum, boyut, geçiş modu | seçili (taşı/boyutlandır) / dış alan ayrımı / oran etiketi |
| Sürükleme | — | konum yardımcıları/geri bildirim |
| "Tümüne uygula" | — | normal / uygulandı onayı |
| Üst eylemler | — | boşta / işlem sonucu / yükleniyor |

---

## 5. Tasarım özgürlüğü ve sınırlar

**Tamamen serbest:** renk paleti, tipografi, yerleşim/grid, panel sayısı ve konumu, ikon dili, gölge/derinlik, köşe yuvarlaklıkları, animasyon karakteri, koyu/açık tema, boşluk ritmi, kartların biçimi, inspector'ın sunumu (akordeon, sekme, tek liste…).

**Korunması gereken (sadece işlev, biçim değil):**
- Yukarıdaki **tüm ekranlar ve işlevler** erişilebilir olmalı.
- "Ne seçtiysem onun ayarı" mantığı (bağlama duyarlı düzenleme).
- Öğeleri **doğrudan tuvalde** konumlandırma.
- Önizlemenin **gerçek oynatma** deneyimini vermesi.

**Beklenen çıktılar (üretmen iyi olur):**
1. Ana Studio görünümü (dolu bir demoyla).
2. Inspector'ın altı bağlamı (demo / adım / hotspot / callout / focus / metin).
3. Adım listesi: dolu hali + işlem menüsü açık + boş durum.
4. Tuval: dört öğe türü de yerleştirilmiş + öğe ekleme + 3 wrapper varyantı.
5. Önizleme (oynatıcı + ilerleme) ve paylaşım ekranı.
6. Bileşen durumları (seçili/hover/pasif/uygulandı/yükleniyor vb.).

> **Hatırlatma:** Mevcut tasarımı taklit etme. Bu liste *ne gösterileceğini* söyler; *nasıl görüneceği* senin özgün katkın.
