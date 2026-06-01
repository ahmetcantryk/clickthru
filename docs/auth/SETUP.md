# clickthru — Auth kurulumu (Supabase) · basit rehber

Kod tarafı hazır: **e‑posta magic link** + **Google ile giriş**. Aşağıdaki Supabase panel ayarlarını
yapınca çalışır. (Proje: `hhtdagbepactmhwemect.supabase.co`)

> İyi haber: **e‑posta magic link, Supabase'in dahili e‑posta servisiyle ekstra kurulum olmadan
> hemen çalışır** (düşük hacim/geliştirme için). Google ve özel e‑posta şablonu birkaç adım ister.

---

## 1) URL ayarları (zorunlu — magic link + Google bunu kullanır)
Supabase Dashboard → **Authentication → URL Configuration**:
- **Site URL:** production adresin → **`https://clickthru.vercel.app`** (sonunda `/` olmasın).
- **Redirect URLs** (allowlist — giriş yaptığın her ortamı ekle):
  - `https://clickthru.vercel.app/auth/callback`
  - `http://localhost:3000/auth/callback`  ← lokal geliştirme için
  - (opsiyonel, Vercel preview dalları için) `https://*.vercel.app/auth/callback`

Kaydet. ✅ Bu kadarıyla **e‑posta ile giriş** çalışır.

> **Site URL vs Redirect URLs:** *Site URL* = varsayılan/yedek adres (e‑postalarda `{{ .SiteURL }}`).
> *Redirect URLs* = giriş dönüşüne izin verilen adresler allowlist'i. Kod her ortamda dönüşü
> `<o anki origin>/auth/callback`'e ayarlar; e‑posta şablonu da `{{ .RedirectTo }}` kullandığı için
> **localhost'tan istersen link localhost'a, Vercel'den istersen Vercel'e döner** — ikisi de çalışır
> (yeter ki ilgili `/auth/callback` Redirect URLs'de olsun).

---

## 2) Magic link e‑posta şablonunu markala (önerilen)
Supabase Dashboard → **Authentication → Email Templates → "Magic Link"**:
1. `docs/auth/magic-link-email.html` içeriğini kopyala, şablon gövdesine yapıştır.
2. **Subject** (konu): `clickthru — giriş bağlantın`
3. Kaydet.

> Şablon, linki kendi `/auth/callback` sayfamıza `token_hash` ile gönderir (cihazlar arası çalışır).
> "Confirm signup" şablonuna da aynı HTML'i koyabilirsin.

---

## 3) Google ile giriş (opsiyonel ama istiyorsun)
**a) Google Cloud Console** → APIs & Services → Credentials → *Create OAuth client ID* → **Web application**:
- **Authorized redirect URI:** `https://hhtdagbepactmhwemect.supabase.co/auth/v1/callback`
- Client ID + Client Secret'i kopyala.

**b) Supabase** → **Authentication → Providers → Google** → enable → Client ID + Secret'i yapıştır → Save.

✅ Artık `/login`'deki "Google ile devam et" çalışır.

---

## 4) Ortam değişkenleri (env)
Kodda committed publishable (anon) anahtar fallback var; **localde ekstra bir şey gerekmez.**
Canlı/Vercel'de güvenli olması için ayarla:
```
NEXT_PUBLIC_SUPABASE_URL=https://hhtdagbepactmhwemect.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable-anon-key>
```

---

## 5) Test
1. `pnpm dev` → `http://localhost:3000/login`
2. **E‑posta:** adres gir → "Sihirli bağlantı gönder" → gelen kutusu → linke tıkla → `/auth/callback` → ilk kez ise **/onboarding**, sonra **/workspaces**.
3. **Google:** "Google ile devam et" → Google → geri dönüşte aynı akış.
4. Çıkış: sol‑alt hesap menüsü → "Çıkış yap".

## Nasıl çalışıyor (özet)
- Oturum kaynağı **Supabase** (`lib/supabase/client.ts`, kalıcı oturum). Ekranlar hız için
  localStorage **aynasını** okur; `syncSession()` her korumalı sayfada aynayı tazeler (`lib/auth.tsx`).
- **Onboarding durumu kullanıcıya bağlı** (`user_metadata.onboarded`) → yeni kullanıcı otomatik
  onboarding'e gider, mevcut kullanıcı workspaces'e. (Eski "onboardinge giremiyorum" sorunu çözüldü.)
- `/auth/callback` magic link (`token_hash`) veya Google (`code`) dönüşünü işler.
