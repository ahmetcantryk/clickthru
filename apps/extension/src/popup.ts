import type { Demo, Step } from '@clickthru/schema';
import { SUPABASE_ANON_KEY, SUPABASE_URL, STUDIO_BASE_URL } from './config';

interface CapturedStep {
  media: string;
  x: number;
  y: number;
}

function el<T extends HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`#${id} bulunamadı`);
  return node as T;
}

const titleInput = el<HTMLInputElement>('title');
const startBtn = el<HTMLButtonElement>('start');
const stopBtn = el<HTMLButtonElement>('stop');
const saveBtn = el<HTMLButtonElement>('save');
const statusEl = el<HTMLElement>('status');
const countEl = el<HTMLElement>('count');

async function refresh(): Promise<void> {
  const state = await chrome.storage.local.get(['recording', 'steps']);
  const recording = !!state.recording;
  const steps = (state.steps as CapturedStep[] | undefined) ?? [];
  countEl.textContent = String(steps.length);
  if (!statusEl.dataset.busy) statusEl.textContent = recording ? 'Kaydediliyor…' : 'Hazır';
  startBtn.disabled = recording;
  stopBtn.disabled = !recording;
  saveBtn.disabled = recording || steps.length === 0;
}

startBtn.addEventListener('click', async () => {
  await chrome.storage.local.set({ recording: true, steps: [] });
  void refresh();
});

stopBtn.addEventListener('click', async () => {
  await chrome.storage.local.set({ recording: false });
  void refresh();
});

saveBtn.addEventListener('click', async () => {
  const state = await chrome.storage.local.get(['steps']);
  const captured = (state.steps as CapturedStep[] | undefined) ?? [];
  if (captured.length === 0) return;

  const title = titleInput.value.trim() || 'Yakalanan demo';
  const id = `demo_${crypto.randomUUID().slice(0, 8)}`;
  const steps: Step[] = captured.map((c, i) => ({
    id: `cap_${i + 1}`,
    order: i + 1,
    type: 'screenshot',
    media: c.media,
    hotspot: { x: c.x, y: c.y },
  }));
  const demo: Demo = { id, title, defaultBackground: '#F2F6FF', wrapper: 'browser', steps };

  statusEl.dataset.busy = '1';
  statusEl.textContent = 'Kaydediliyor…';
  saveBtn.disabled = true;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/demos`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ id, title, data: demo, is_public: true }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await chrome.storage.local.set({ recording: false, steps: [] });
    await chrome.tabs.create({ url: `${STUDIO_BASE_URL}/studio?demo=${id}` });
    window.close();
  } catch (e) {
    delete statusEl.dataset.busy;
    statusEl.textContent = `Hata: ${e instanceof Error ? e.message : 'bilinmeyen'}`;
    void refresh();
  }
});

chrome.storage.onChanged.addListener(() => {
  void refresh();
});
void refresh();
