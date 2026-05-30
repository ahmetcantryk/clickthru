// clickthru içerik betiği — kayıt açıkken her pointerdown'ı (oransal konumla) arka plana bildirir.
// Navigasyonda yeni sayfaya manifest ile otomatik yeniden enjekte olur; durum storage'dan okunur.
(() => {
  const w = window as unknown as { __clickthruAttached?: boolean };
  if (w.__clickthruAttached) return;
  w.__clickthruAttached = true;

  let recording = false;
  void chrome.storage.local.get('recording').then((s) => {
    recording = !!s.recording;
  });
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.recording) recording = !!changes.recording.newValue;
  });

  window.addEventListener(
    'pointerdown',
    (e) => {
      if (!recording) return;
      // pointerdown click/navigasyondan önce → tıklama anındaki ekranı yakalarız.
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      void chrome.runtime.sendMessage({ type: 'CLICK', x, y });
    },
    true,
  );
})();
