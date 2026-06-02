// clickthru render-worker — sunucu-taraflı export (CLAUDE.md §4/§8 Faz 2).
// Playwright (headless Chromium) ile /embed/{id}?export=1 sayfasını kaydeder,
// ffmpeg ile mp4 / gif / webm üretir. Tarayıcıda export YAPMA — burada yapılır.
import express from 'express';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const PORT = process.env.PORT || 4000;
const SECRET = process.env.RENDER_SECRET || '';

const app = express();
app.use(express.json({ limit: '2mb' }));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.post('/render', async (req, res) => {
  if (SECRET && req.headers.authorization !== `Bearer ${SECRET}`) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  const { url, format = 'mp4', durationMs = 20000, width = 1280, height = 800 } = req.body || {};
  if (!url) return res.status(400).json({ error: 'url gerekli' });
  const fmt = ['mp4', 'gif', 'webm'].includes(format) ? format : 'mp4';
  const dur = Math.min(120000, Math.max(2000, Number(durationMs) || 20000));

  const dir = await mkdtemp(path.join(os.tmpdir(), 'ct-render-'));
  let browser;
  try {
    browser = await chromium.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] });
    const ctx = await browser.newContext({
      viewport: { width, height },
      recordVideo: { dir, size: { width, height } },
    });
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(1200); // ilk frame/animasyon otursun
    const video = page.video();
    await page.waitForTimeout(dur);
    await ctx.close(); // videoyu finalize eder
    const webmPath = video ? await video.path() : null;
    if (!webmPath) throw new Error('video kaydı alınamadı');

    if (fmt === 'webm') {
      const buf = await readFile(webmPath);
      return send(res, buf, fmt);
    }
    const out = path.join(dir, `out.${fmt}`);
    await convert(webmPath, out, fmt, width);
    const buf = await readFile(out);
    return send(res, buf, fmt);
  } catch (e) {
    console.error('[render] hata:', e);
    return res.status(500).json({ error: String(e && e.message ? e.message : e) });
  } finally {
    if (browser) await browser.close().catch(() => {});
    await rm(dir, { recursive: true, force: true }).catch(() => {});
  }
});

function send(res, buf, fmt) {
  res.setHeader('content-type', fmt === 'gif' ? 'image/gif' : fmt === 'webm' ? 'video/webm' : 'video/mp4');
  res.send(buf);
}

function convert(input, output, fmt, width) {
  return new Promise((resolve, reject) => {
    const args =
      fmt === 'gif'
        ? ['-y', '-i', input, '-filter_complex', `fps=15,scale=${width}:-1:flags=lanczos,split[a][b];[a]palettegen[p];[b][p]paletteuse`, output]
        : ['-y', '-i', input, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', output];
    const ff = spawn('ffmpeg', args);
    let err = '';
    ff.stderr.on('data', (d) => (err += d));
    ff.on('error', (e) =>
      reject(new Error(e.code === 'ENOENT' ? 'ffmpeg bulunamadı — sisteme ffmpeg kur (brew/choco/apt).' : String(e))),
    );
    ff.on('close', (code) => (code === 0 ? resolve() : reject(new Error('ffmpeg ' + code + ': ' + err.slice(-400)))));
  });
}

app.listen(PORT, () => console.log(`clickthru render-worker → http://localhost:${PORT}`));
