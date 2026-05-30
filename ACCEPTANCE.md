# ACCEPTANCE.md — Kullanıcı Kabul Testleri (Faz 1)

> **Amaç:** Her özellik bitince, **tek başına**, senin onayından geçsin. Onaylanmadan sonrakine geçme — karışıklık tam da biriken yarım işlerde başlar.
>
> **Yöntem:** özellik biter → ilgili bloğu **izole** test et → kutuları işaretle → "istediğim gibi mi?" → geçtiyse sonraki özellik. Geçmediyse o özelliği düzelt, ileri gitme.
>
> **Test sırası (build sırasıyla aynı):** 1 schema → 2 player → 3 editor → 4 capture → 5 backend.

---

## Orijinal isteklerim → nerede test ediliyor

| İsteğim | Test bloğu |
|---|---|
| İnteraktif demo + customize | §2 Player + §3 Editor |
| Sahne tasarımı | §3 Editor — sahne |
| Tooltip özelleştirme | §3 Editor — tooltip |
| Back / Next | §2 Player + §3 Editor — sıralama |
| Background ayarlama | §3 Editor — background |
| Focus camera modu | §2 Player — zoom + §3 Editor — zoom |
| Run player preview | §2 Player |
| Export (video/gif/html) | §6 (Faz 2) |
| **Video alanı / videoyu anlama** | §2 Player — **video (KRİTİK)** |

---

## §1 — Veri modeli (schema)

- [ ] `Demo` ve `Step` tipleri TS'te derleniyor; `any` yok.
- [ ] `type` alanı yalnızca `"screenshot"` veya `"video"` kabul ediyor.
- [ ] Koordinatlar 0–1 aralığında saklanıyor.
- [ ] Örnek bir JSON tip kontrolünden (validation) geçiyor.

**Kabul:** Tipler tek kaynakta (`/packages/schema`); başka yerde kopya tip yok.
**Not:**

---

## §2 — Player (çekirdek his)

### Screenshot adımı
- [ ] Görüntü doğru gösteriliyor.
- [ ] Hotspot doğru konumda — **farklı ekran boyutlarında da** kaymıyor.
- [ ] Callout (başlık/açıklama + pointer yönü top/bottom/left/right/none) doğru.
- [ ] Tıklayınca (hotspot veya callout "İleri") sonraki adıma geçiyor.
- [ ] **Aynı medyalı ardışık adımlar arasında kamera kayıyor** (aynı ekranda başka noktaya pan/zoom); farklı medyada crossfade.
- [ ] Zoom/focus **pürüzsüz** (pikselleşme yok).

### Video adımı — KRİTİK ("videoyu anlama")
- [ ] `type:"video"` adımda **klip oynuyor**, screenshot gibi davranmıyor.
- [ ] Video bitince (veya tıklayınca) sonraki adıma geçiyor.
- [ ] **Karışık demo** (screenshot → video → screenshot) sırayı bozmadan akıyor.
- [ ] Ses/oynatma kontrolü beklendiği gibi.

### Geçiş & his
- [ ] Adımlar arası geçiş yumuşak (~0.6s, takılma yok).
- [ ] Hotspot nabzı + kendiliğinden imleç hareketi çalışıyor.
- [ ] Progress: geniş segmentler; **video segmenti soldan sağa video süresince dolar**.

### Back / Next
- [ ] İleri/Geri doğru adıma gidiyor.
- [ ] İlk adımda Geri, son adımda İleri pasif.

🔴 **Sınır testleri:** 1 adımlık demo · 20+ adımlık demo · bozuk/eksik medya → **çökmüyor**, anlamlı davranıyor.

**Kabul:** Görünüm Arcade çıtasında; his akıcı.
**Not:**

---

## §3 — Editor

### Callout (başlık/açıklama kartı)
- [ ] Callout ekle / sil / düzenle çalışıyor; başlık + açıklama girilebiliyor.
- [ ] Pointer yönü seçilebiliyor (top/bottom/left/right/none); "İleri" butonu açık/kapalı.
- [ ] Hotspot (tıklama alanı) konumu taşınabiliyor.

### Metin / etiket overlay
- [ ] Adıma metin/etiket ekle / sil / düzenle çalışıyor.
- [ ] Overlay serbest konumlanıyor (oransal x/y); farklı ekranda kaymıyor.
- [ ] Boyut (sm/md/lg) ve opsiyonel renk uygulanıyor; player'da birebir.

### Sahne & background
- [ ] Background değiştirince sahne **anında** güncelleniyor.
- [ ] Demo geneli background + adım bazlı background ayrı ayrı çalışıyor.

### Focus camera / zoom
- [ ] Zoom noktası ve ölçeği ayarlanabiliyor.
- [ ] Editör'deki ayar, player'da **birebir** görünüyor.

### Sıralama (back/next için)
- [ ] Adım sırası değiştirilebiliyor (sürükle veya yukarı/aşağı).
- [ ] Adım silme/ekleme sırayı bozmuyor.

**Kabul:** Editör çıktısı = geçerli schema JSON; player onu **birebir** oynatıyor (editör ↔ player tutarlı).
**Not:**

---

## §4 — Capture (Chrome uzantısı)

### Screenshot
- [ ] Her tıklama bir adım olarak yakalanıyor.
- [ ] Hotspot konumu tıklanan yere denk geliyor.
- [ ] Görüntü çözünürlüğü yeterli.

### Video
- [ ] Ekran kaydı başlıyor/duruyor; doğru `type:"video"` adım üretiyor.

🔴 **Sınır testleri:** farklı ekran boyutu/zoom · kaydırmalı (scroll) sayfa · sekme değişimi.

**Kabul:** Yakalanan demo editöre **temiz** düşüyor, elle düzeltme gerektirmiyor.
**Not:**

---

## §5 — Backend & paylaşım

- [ ] Demo kaydediliyor ve geri yükleniyor (**kayıpsız**).
- [ ] Medya R2'ye yükleniyor; linkler kalıcı.
- [ ] Public paylaşım linki başka tarayıcıda / incognito'da açılıyor.
- [ ] Demo güncellenince link **güncel** sürümü gösteriyor.

**Kabul:** Link, hesabı olmayan birinde de sorunsuz açılıyor.
**Not:**

---

## §6 — Export (Faz 2 — sırası gelince doldur)

- [ ] Video export: zoom pürüzsüz, yüksek çözünürlük, ses senkron.
- [ ] GIF export: akıcı, makul dosya boyutu.
- [ ] HTML embed: iframe başka sitede çalışıyor, responsive.

**Not:**

---

## Bir özellik "istediğim gibi" sayılır eğer:

1. **Çalışıyor** — kabul kutularının tümü işaretli.
2. **Görünüyor** — Arcade seviyesi polish.
3. **Dayanıklı** — 🔴 sınır testlerinde çökmüyor.
4. **Tutarlı** — editör ne ayarlıyorsa player onu gösteriyor.

## Hata bulduğumda
İlgili bloğun **Not** alanına yaz → özelliği **geçirme** → Claude'a *yalnızca o tek özelliği* düzelttir → tekrar test et. Başka özelliğe atlama.
