// clickthru arka plan (service worker) — kayıt orkestrasyonu.
// interactive mod: tabCapture streamId → offscreen MediaRecorder (video) + her tıklamada
// ekran görüntüsü (Storage'a yüklenir) + scroll işaretleri → FINALIZE'da hibrit demo kurulur
// (tık → screenshot adımı, scroll aralığı → video segmenti). screenshot modu = yalnız screenshot (yedek).
import type { Demo, Step } from '@clickthru/schema';
import type { CaptureState, CapturedClick, Mode } from './types';
import { SUPABASE_ANON_KEY, SUPABASE_URL, STUDIO_BASE_URL, dataUrlToBlob, uploadToStorage } from './config';

const ACCENT = '#F97316';
const CAPTURE_THROTTLE_MS = 600;
const STATE_KEY = 'capture';
let lastCapture = 0;
let videoResolve: ((r: VideoResult) => void) | null = null;

interface VideoResult {
  videoUrl?: string;
  durationMs?: number;
  error?: string;
}

interface InMsg {
  type?: string;
  x?: number;
  y?: number;
  mode?: Mode;
  streamId?: string;
  title?: string;
  videoUrl?: string;
  durationMs?: number;
  error?: string;
}

/* ---------- durum (chrome.storage.local) ---------- */
async function getState(): Promise<CaptureState | null> {
  const r = await chrome.storage.local.get(STATE_KEY);
  return (r[STATE_KEY] as CaptureState | undefined) ?? null;
}
async function setState(s: CaptureState): Promise<void> {
  await chrome.storage.local.set({ [STATE_KEY]: s });
}
async function clearState(): Promise<void> {
  await chrome.storage.local.remove(STATE_KEY);
}

/* ---------- offscreen yaşam döngüsü ---------- */
async function ensureOffscreen(): Promise<void> {
  const has = await chrome.offscreen.hasDocument();
  if (has) return;
  await chrome.offscreen.createDocument({
    url: 'offscreen.html',
    reasons: [chrome.offscreen.Reason.USER_MEDIA],
    justification: 'Sekme videosu kaydı (clickthru capture)',
  });
}
async function closeOffscreen(): Promise<void> {
  try {
    if (await chrome.offscreen.hasDocument()) await chrome.offscreen.closeDocument();
  } catch {
    // yoksay
  }
}

function badge(on: boolean): void {
  chrome.action.setBadgeText({ text: on ? 'REC' : '' });
  if (on) chrome.action.setBadgeBackgroundColor({ color: '#ef4444' });
}

/* ---------- mesaj yönlendirme ---------- */
chrome.runtime.onMessage.addListener((message: InMsg, sender, sendResponse) => {
  switch (message?.type) {
    case 'START':
      void start(message).then(() => sendResponse({ ok: true })).catch((e) => sendResponse({ ok: false, error: String(e) }));
      return true;
    case 'RECORD_NOW':
      void recordNow().finally(() => sendResponse({ ok: true }));
      return true;
    case 'CLICK':
      void captureClick(message.x ?? 0.5, message.y ?? 0.5, sender).finally(() => sendResponse({ ok: true }));
      return true;
    case 'SCROLL':
      void markScroll().finally(() => sendResponse({ ok: true }));
      return true;
    case 'FINALIZE':
      void finalize().then(sendResponse);
      return true;
    case 'CANCEL':
      void cancel().finally(() => sendResponse({ ok: true }));
      return true;
    case 'OFFSCREEN_RESULT':
      if (videoResolve) {
        videoResolve({ videoUrl: message.videoUrl, durationMs: message.durationMs, error: message.error });
        videoResolve = null;
      }
      return false;
    default:
      return false;
  }
});

chrome.commands.onCommand.addListener((cmd) => {
  if (cmd === 'stop-recording') void finalize();
});

/* ---------- kayıt akışı ---------- */
async function start(msg: InMsg): Promise<void> {
  const mode: Mode = msg.mode === 'screenshot' ? 'screenshot' : 'interactive';
  const demoId = `demo_${crypto.randomUUID().slice(0, 8)}`;
  await setState({ recording: false, mode, demoId, title: msg.title ?? '', recStart: 0, clicks: [], scrolls: [] });
  if (mode === 'interactive' && msg.streamId) {
    await ensureOffscreen();
    chrome.runtime.sendMessage({ type: 'OFFSCREEN_ACQUIRE', streamId: msg.streamId, demoId });
  }
}

// Geri sayım bitti — gerçek kayıt başlasın (overlay artık gizli → videoya girmez).
async function recordNow(): Promise<void> {
  const s = await getState();
  if (!s) return;
  s.recording = true;
  s.recStart = Date.now();
  await setState(s);
  badge(true);
  if (s.mode === 'interactive') chrome.runtime.sendMessage({ type: 'OFFSCREEN_START' });
}

async function captureClick(x: number, y: number, sender: chrome.runtime.MessageSender): Promise<void> {
  const s = await getState();
  if (!s?.recording) return;
  const now = Date.now();
  if (now - lastCapture < CAPTURE_THROTTLE_MS) return;
  lastCapture = now;
  const windowId = sender.tab?.windowId;
  if (windowId === undefined) return;

  try {
    const dataUrl = await chrome.tabs.captureVisibleTab(windowId, { format: 'jpeg', quality: 85 });
    let url = dataUrl;
    try {
      url = await uploadToStorage(`captures/${s.demoId}/shot_${s.clicks.length + 1}.jpg`, dataUrlToBlob(dataUrl));
    } catch {
      // Yükleme başarısızsa data URL ile devam (en kötü durumda base64).
    }
    s.clicks.push({ url, x, y, t: now - s.recStart });
    await setState(s);
  } catch {
    // Hız sınırı / korumalı sayfa — bu tıklamayı atla.
  }
}

async function markScroll(): Promise<void> {
  const s = await getState();
  if (!s?.recording) return;
  s.scrolls.push(Date.now() - s.recStart);
  await setState(s);
}

function awaitVideo(): Promise<VideoResult> {
  return new Promise((resolve) => {
    videoResolve = resolve;
    setTimeout(() => {
      if (videoResolve) {
        videoResolve = null;
        resolve({ error: 'video zaman aşımı' });
      }
    }, 30000);
  });
}

function buildSteps(clicks: CapturedClick[], scrolls: number[], video: VideoResult): Step[] {
  const sorted = [...clicks].sort((a, b) => a.t - b.t);
  const dur = video.durationMs ?? 0;
  const hasVideo = !!video.videoUrl;
  const motion = (a: number, b: number): boolean => scrolls.some((t) => t > a + 200 && t < b - 200);
  const steps: Step[] = [];
  let order = 1;

  const seg = (aMs: number, bMs: number): void => {
    const end = Math.min(bMs, dur || bMs);
    if (end - aMs < 400) return; // 0.4sn altı segmentleri atla
    steps.push({
      id: `v${order}`,
      order,
      type: 'video',
      media: video.videoUrl as string,
      clipStart: Number((aMs / 1000).toFixed(2)),
      clipEnd: Number((end / 1000).toFixed(2)),
      durationMs: dur,
    });
    order += 1;
  };

  let prev = 0;
  for (const c of sorted) {
    if (hasVideo && motion(prev, c.t)) seg(prev, c.t);
    steps.push({ id: `s${order}`, order, type: 'screenshot', media: c.url, hotspot: { x: c.x, y: c.y, color: ACCENT } });
    order += 1;
    prev = c.t;
  }
  if (hasVideo && motion(prev, dur)) seg(prev, dur);
  if (steps.length === 0 && hasVideo && dur > 0) seg(0, dur);
  return steps;
}

async function finalize(): Promise<{ ok: boolean; url?: string; error?: string }> {
  const s = await getState();
  if (!s) return { ok: false, error: 'kayıt bulunamadı' };

  let video: VideoResult = {};
  if (s.mode === 'interactive') {
    const p = awaitVideo();
    chrome.runtime.sendMessage({ type: 'OFFSCREEN_STOP' });
    video = await p;
  }

  const steps = buildSteps(s.clicks, s.scrolls, video);
  if (steps.length === 0) {
    await cleanupAfter();
    return { ok: false, error: 'Hiç adım yakalanmadı' };
  }

  const demo: Demo = {
    id: s.demoId,
    title: s.title.trim() || 'Yakalanan demo',
    defaultBackground: '#F5F4F2',
    wrapper: 'browser',
    steps,
  };

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/demos`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ id: demo.id, title: demo.title, data: demo, is_public: true }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const url = `${STUDIO_BASE_URL}/studio?demo=${demo.id}`;
    await chrome.tabs.create({ url });
    await cleanupAfter();
    return { ok: true, url };
  } catch (e) {
    await cleanupAfter();
    return { ok: false, error: e instanceof Error ? e.message : 'bilinmeyen hata' };
  }
}

async function cancel(): Promise<void> {
  if ((await getState())?.mode === 'interactive') chrome.runtime.sendMessage({ type: 'OFFSCREEN_STOP' });
  await cleanupAfter();
}

async function cleanupAfter(): Promise<void> {
  badge(false);
  await clearState();
  await closeOffscreen();
}
