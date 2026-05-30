// clickthru arka plan (service worker) — CLICK mesajında görünür sekmeyi yakalar, adımı storage'a ekler.
interface CapturedStep {
  media: string;
  x: number;
  y: number;
}

interface ClickMessage {
  type?: string;
  x?: number;
  y?: number;
}

// captureVisibleTab hız sınırı (~2/sn). Hızlı ardışık tıklamalarda taşmayı önler.
const CAPTURE_THROTTLE_MS = 600;
let lastCapture = 0;

chrome.runtime.onMessage.addListener((message: ClickMessage, sender) => {
  if (message?.type !== 'CLICK') return;
  void handleClick(message.x ?? 0.5, message.y ?? 0.5, sender);
  return false;
});

async function handleClick(x: number, y: number, sender: chrome.runtime.MessageSender): Promise<void> {
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
    // Hız sınırı veya korumalı sayfa (chrome://, eklenti mağazası) — bu tıklamayı atla.
  }
}
