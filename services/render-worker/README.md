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

## Deploy notu
Playwright + ffmpeg gerektirir → Vercel serverless'a uygun değil; bir VPS / Fly.io /
Render.com / Docker'a deploy et. (Playwright resmi Docker imajı + ffmpeg en kolayı.)
