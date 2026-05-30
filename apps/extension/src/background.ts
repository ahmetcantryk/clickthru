// clickthru arka plan (service worker).
// İkon tıklanınca recorder overlay'ini aktif sekmeye enjekte eder; CLICK'te görünür sekmeyi yakalar;
// FINALIZE'da adımlardan Demo kurar, Supabase'e yazar, Studio'yu açar.
import type { Demo, Step } from '@clickthru/schema';
import { SUPABASE_ANON_KEY, SUPABASE_URL, STUDIO_BASE_URL } from './config';

interface CapturedStep {
  media: string;
  x: number;
  y: number;
}

const ACCENT = '#F97316';
const CAPTURE_THROTTLE_MS = 600;
let lastCapture = 0;

// Recorder, popup'taki "Kaydı başlat" ile aktif sekmeye enjekte edilir (popup.ts → scripting).
chrome.runtime.onMessage.addListener((message: { type?: string; x?: number; y?: number; title?: string }, sender, sendResponse) => {
  switch (message?.type) {
    case 'CLICK':
      void captureClick(message.x ?? 0.5, message.y ?? 0.5, sender).finally(() => sendResponse({ ok: true }));
      return true;
    case 'FINALIZE':
      void finalize().then(sendResponse);
      return true;
    case 'CANCEL':
      void chrome.storage.local.set({ recording: false, steps: [] }).then(() => sendResponse({ ok: true }));
      return true;
    default:
      return false;
  }
});

async function captureClick(x: number, y: number, sender: chrome.runtime.MessageSender): Promise<void> {
  const state = await chrome.storage.local.get(['recording', 'steps']);
  if (!state.recording) return;

  const now = Date.now();
  if (now - lastCapture < CAPTURE_THROTTLE_MS) return;
  lastCapture = now;

  const windowId = sender.tab?.windowId;
  if (windowId === undefined) return;

  try {
    const media = await chrome.tabs.captureVisibleTab(windowId, { format: 'jpeg', quality: 85 });
    const steps = (state.steps as CapturedStep[] | undefined) ?? [];
    steps.push({ media, x, y });
    await chrome.storage.local.set({ steps });
  } catch {
    // Hız sınırı / korumalı sayfa — bu tıklamayı atla.
  }
}

async function finalize(): Promise<{ ok: boolean; url?: string; error?: string }> {
  const state = await chrome.storage.local.get(['steps', 'title']);
  const captured = (state.steps as CapturedStep[] | undefined) ?? [];
  if (captured.length === 0) return { ok: false, error: 'Hiç adım yakalanmadı' };

  const id = `demo_${crypto.randomUUID().slice(0, 8)}`;
  const steps: Step[] = captured.map((c, i) => ({
    id: `cap_${i + 1}`,
    order: i + 1,
    type: 'screenshot',
    media: c.media,
    hotspot: { x: c.x, y: c.y, color: ACCENT },
  }));
  const title = (state.title as string | undefined)?.trim();
  const demo: Demo = { id, title: title || 'Yakalanan demo', defaultBackground: '#F5F4F2', wrapper: 'browser', steps };

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/demos`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ id, title: demo.title, data: demo, is_public: true }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await chrome.storage.local.set({ recording: false, steps: [], title: '' });
    const url = `${STUDIO_BASE_URL}/studio?demo=${id}`;
    await chrome.tabs.create({ url });
    return { ok: true, url };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'bilinmeyen hata' };
  }
}
