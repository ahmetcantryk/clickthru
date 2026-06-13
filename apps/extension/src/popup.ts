// Popup — kayıt başlat (mod seç) / durdur. interactive modda tabCapture streamId
// kullanıcı jesti gerektirir → burada (buton tıklamasında) alınır, SW'ye iletilir.
import type { CaptureState, Mode } from './types';

const startView = document.getElementById('startView') as HTMLElement;
const recView = document.getElementById('recView') as HTMLElement;
const startBtn = document.getElementById('start') as HTMLButtonElement;
const stopBtn = document.getElementById('stop') as HTMLButtonElement;
const titleInput = document.getElementById('title') as HTMLInputElement;
const modeSel = document.getElementById('mode') as HTMLSelectElement;
const errEl = document.getElementById('err') as HTMLElement;

const PROTECTED = /^(chrome|edge|about|chrome-extension|devtools):/i;

function getStreamId(targetTabId: number): Promise<string> {
  return new Promise((resolve, reject) => {
    chrome.tabCapture.getMediaStreamId({ targetTabId }, (id) => {
      const err = chrome.runtime.lastError;
      if (err || !id) reject(new Error(err?.message ?? 'Sekme yakalanamadı'));
      else resolve(id);
    });
  });
}

async function refresh(): Promise<void> {
  const r = await chrome.storage.local.get('capture');
  const recording = (r.capture as CaptureState | undefined)?.recording === true;
  startView.classList.toggle('hidden', recording);
  recView.classList.toggle('hidden', !recording);
}
void refresh();

startBtn.addEventListener('click', async () => {
  errEl.textContent = '';
  startBtn.disabled = true;
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id || (tab.url && PROTECTED.test(tab.url))) {
      throw new Error('Bu sayfada kayıt yapılamaz (korumalı sayfa). Normal bir web sayfası aç.');
    }
    const mode: Mode = modeSel.value === 'screenshot' ? 'screenshot' : 'interactive';
    // tabCapture streamId yalnızca bu kullanıcı jestinde alınabilir (interactive).
    const streamId = mode === 'interactive' ? await getStreamId(tab.id) : undefined;
    await chrome.runtime.sendMessage({ type: 'START', mode, streamId, title: titleInput.value.trim() });
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] });
    window.close();
  } catch (e) {
    startBtn.disabled = false;
    errEl.textContent = e instanceof Error ? e.message : 'Başlatılamadı';
  }
});

stopBtn.addEventListener('click', async () => {
  stopBtn.disabled = true;
  await chrome.runtime.sendMessage({ type: 'FINALIZE' });
  window.close();
});
