# @clickthru/render-worker

Sunucu‑taraflı export (CLAUDE.md §4/§8 **Faz 2**). Playwright (headless Chromium) ile
`/embed/{id}?export=1` sayfasını kaydeder, **ffmpeg** ile **MP4 / GIF / WebM** üretir.
Tarayıcıda export YAPMA — kalite (pürüzsüz zoom, yüksek framerate) burada garanti edilir.

> **Bilinçli olarak pnpm workspace DIŞINDA** (`pnpm-workspace.yaml`'de hariç tutulur). Ağır
> bağımlılıkları (Playwright + Chromium) kök/Vercel kurulumunu yavaşlatmasın diye ayrı,
> kendi başına deploy edilen bir servistir.

## Kurulum (standalone)
```bash
cd services/render-worker
pnpm install            # veya: npm install
pnpm run setup          # Chromium'u indirir (playwright install chromium)
# ffmpeg sistemde kurulu olmalı:
#   macOS:   brew install ffmpeg
#   Windows: choco install ffmpeg   (veya scoop install ffmpeg)
#   Linux:   apt-get install -y ffmpeg
```

## Çalıştır
```bash
PORT=4000 pnpm start
# sağlık: GET http://localhost:4000/health  → {"ok":true}
```

## Web tarafına bağla
`apps/web` ortamına (lokal `.env.local` veya Vercel env):
```
RENDER_WORKER_URL=http://localhost:4000        # canlıda: https://render.senin-domainin
# opsiyonel paylaşılan sır (worker'daki RENDER_SECRET ile aynı olmalı):
# RENDER_SECRET=...
```
Studio → **Paylaş & dışa aktar → Video & GIF** artık çalışır. `RENDER_WORKER_URL` yoksa
Bağlantı + HTML embed çalışmaya devam eder; video/GIF "yapılandırılmadı" mesajı verir.

## API
`POST /render`
```json
{ "url": "https://app/embed/<id>?export=1", "format": "mp4|gif|webm", "durationMs": 22000, "width": 1280, "height": 800 }
```
→ dosyayı (binary) döndürür. `RENDER_SECRET` ayarlıysa `Authorization: Bearer <secret>` gerekir.

## Deploy (Docker)
Playwright + ffmpeg gerektirir → Vercel serverless'a UYGUN DEĞİL. Bu klasördeki
`Dockerfile` Chromium + ffmpeg dahil her şeyi içerir; herhangi bir Docker host'una çıkar.

**Fly.io** (en kolay; `fly.toml` hazır):
```bash
cd services/render-worker
fly launch --no-deploy        # app adını oluştur (fly.toml'daki "clickthru-render")
fly secrets set RENDER_SECRET=$(openssl rand -hex 16)   # opsiyonel ama önerilir
fly deploy
# → https://clickthru-render.fly.dev   (sağlık: /health)
```

**Railway / Render.com:** "Deploy from Dockerfile" / root = `services/render-worker`.
Port'u env `PORT` ile verirler (server `process.env.PORT` okur). Gerekirse `RENDER_SECRET` ekle.

**Lokal Docker:**
```bash
docker build -t clickthru-render services/render-worker
docker run -p 8080:8080 -e RENDER_SECRET=dev clickthru-render
```

### Web'e bağla (canlıya alma adımı)
Deploy'dan sonra **Vercel → Project → Settings → Environment Variables**:
```
RENDER_WORKER_URL = https://clickthru-render.fly.dev
RENDER_SECRET     = <fly secrets ile aynı değer>     # ayarladıysan
```
Redeploy et → Studio **Paylaş & dışa aktar → Video & GIF** canlıda çalışır.
`apps/web/src/app/api/export/route.ts` bu URL'e proxy yapar; URL yoksa 503 ("yapılandırılmadı")
döner ama Bağlantı + HTML embed çalışmaya devam eder.

> `/api/export`, `RENDER_SECRET` env'i ayarlıysa otomatik `Authorization: Bearer ...`
> gönderir — worker ile aynı secret'i Vercel'e ekle, yeter.
