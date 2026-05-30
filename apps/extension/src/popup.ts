// Popup (dropdown) — "Kaydı başlat" recorder overlay'ini aktif sekmeye enjekte eder.
const startBtn = document.getElementById('start') as HTMLButtonElement;
const titleInput = document.getElementById('title') as HTMLInputElement;
const errEl = document.getElementById('err') as HTMLElement;

const PROTECTED = /^(chrome|edge|about|chrome-extension|devtools):/i;

startBtn.addEventListener('click', async () => {
  errEl.textContent = '';
  startBtn.disabled = true;
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id || (tab.url && PROTECTED.test(tab.url))) {
      throw new Error('Bu sayfada kayıt yapılamaz (korumalı sayfa). Normal bir web sayfası aç.');
    }
    // Başlığı recorder'a taşı (FINALIZE'da kullanılır).
    await chrome.storage.local.set({ title: titleInput.value.trim(), recording: false, steps: [] });
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] });
    window.close();
  } catch (e) {
    startBtn.disabled = false;
    errEl.textContent = e instanceof Error ? e.message : 'Başlatılamadı';
  }
});
