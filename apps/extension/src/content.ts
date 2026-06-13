// clickthru sayfa-içi recorder overlay (popup'taki "Kaydı başlat" ile enjekte edilir).
// 5-4-3-2-1 geri sayım (pre-roll, kaydedilmez) → overlay GİZLENİR (videoya girmesin) → kayıt başlar.
// Kayıt sırasında: tıklama → CLICK, scroll → SCROLL (arka plana). Durdurma: Ctrl+Y / uzantı simgesi. İptal: Esc.
(() => {
  const w = window as unknown as { __clickthruRecorder?: boolean };
  if (w.__clickthruRecorder) return;
  w.__clickthruRecorder = true;

  const ACCENT = '#2142e7';
  const START_FROM = 5;
  type Phase = 'countdown' | 'recording' | 'saving';
  let phase: Phase = 'countdown';

  const alive = (): boolean => {
    try {
      return !!chrome.runtime?.id;
    } catch {
      return false;
    }
  };

  const host = document.createElement('div');
  host.style.cssText = 'all:initial;position:fixed;inset:0;z-index:2147483647;pointer-events:none;';
  const root = host.attachShadow({ mode: 'open' });
  (document.documentElement || document.body).appendChild(host);

  root.innerHTML = `
    <style>
      :host, * { box-sizing: border-box; }
      .ui { font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
      .dim { position: fixed; inset: 0; pointer-events: auto; background: rgba(255,255,255,0.66); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); }
      .timer { position: fixed; top: 32%; left: 50%; transform: translate(-50%,-50%); display: flex; flex-direction: column; align-items: center; gap: 12px; text-align: center; }
      .count { font-size: clamp(150px, 27vh, 300px); font-weight: 200; letter-spacing: -0.04em; line-height: .9; color: #0b0b12; font-variant-numeric: tabular-nums; }
      .count.anim { animation: tick .92s cubic-bezier(.22,.61,.36,1); }
      @keyframes tick { 0% { opacity: 0; transform: scale(.82) } 35% { opacity: 1; transform: scale(1) } 100% { opacity: .92; transform: scale(1) } }
      .hint { font-size: 15px; font-weight: 500; color: #5b5b66; }
      .go { display: flex; flex-direction: column; align-items: center; gap: 14px; }
      .go .ring { width: 60px; height: 60px; border-radius: 50%; background: ${ACCENT}; display: flex; align-items: center; justify-content: center; box-shadow: 0 14px 40px -10px rgba(33,66,231,.6); }
      .go .ring span { width: 18px; height: 18px; border-radius: 50%; background: #fff; animation: pulse 1.2s ease-in-out infinite; }
      @keyframes pulse { 50% { opacity: .4 } }
      .go .lbl { font-size: 16px; font-weight: 600; color: #0b0b12; }
      .go .kbd { font-size: 12px; font-weight: 600; color: #5b5b66; background: #f1f1f4; border: 1px solid rgba(15,15,30,.1); border-bottom-width: 2px; border-radius: 7px; padding: 3px 8px; }
      .x-btn { position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%); pointer-events: auto; width: 56px; height: 56px; border: 0; border-radius: 50%; cursor: pointer; background: #fff; color: #0b0b12; box-shadow: 0 14px 38px -10px rgba(20,22,60,.34); display: flex; align-items: center; justify-content: center; }
      .x-btn svg { width: 22px; height: 22px; }
      .toast { position: fixed; bottom: 26px; left: 50%; transform: translateX(-50%); pointer-events: auto; padding: 11px 20px; background: #0b0b12; color: #fff; font-size: 13px; font-weight: 600; border-radius: 999px; box-shadow: 0 16px 44px -12px rgba(20,22,60,.4); }
      .hidden { display: none !important; }
    </style>
    <div class="ui">
      <div class="dim"></div>
      <div class="timer">
        <div class="count anim">${START_FROM}</div>
        <div class="hint">Kayıt başlıyor…</div>
      </div>
      <div class="go hidden">
        <div class="ring"><span></span></div>
        <div class="lbl">Kayıt başladı</div>
        <div><span class="kbd">Ctrl+Y</span> ile durdur · uzantı simgesi</div>
      </div>
      <button class="x-btn" title="İptal (Esc)" aria-label="İptal">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
      </button>
      <div class="toast hidden">Kaydediliyor…</div>
    </div>
  `;

  const $ = <T extends Element>(sel: string) => root.querySelector(sel) as T;
  const dim = $<HTMLDivElement>('.dim');
  const timer = $<HTMLDivElement>('.timer');
  const countEl = $<HTMLDivElement>('.count');
  const go = $<HTMLDivElement>('.go');
  const toast = $<HTMLDivElement>('.toast');
  const xBtn = $<HTMLButtonElement>('.x-btn');

  async function send<T = unknown>(message: unknown): Promise<T | undefined> {
    if (!alive()) {
      teardown();
      return undefined;
    }
    try {
      return (await chrome.runtime.sendMessage(message)) as T;
    } catch {
      teardown();
      return undefined;
    }
  }

  // --- Geri sayım (pre-roll) → kısa "kayıt başladı" ipucu → overlay gizlenir → kayıt ---
  let n = START_FROM;
  const tick = window.setInterval(() => {
    n -= 1;
    if (n > 0) {
      countEl.textContent = String(n);
      countEl.classList.remove('anim');
      void countEl.offsetWidth;
      countEl.classList.add('anim');
      return;
    }
    window.clearInterval(tick);
    void preRoll();
  }, 1000);

  async function preRoll(): Promise<void> {
    timer.classList.add('hidden');
    go.classList.remove('hidden');
    xBtn.classList.add('hidden');
    // ~1.1sn ipucu (hâlâ pre-roll, kaydedilmez), sonra overlay'i tamamen gizle ve kaydı başlat.
    window.setTimeout(() => void beginRecording(), 1100);
  }

  async function beginRecording(): Promise<void> {
    phase = 'recording';
    host.style.display = 'none'; // overlay videoya GİRMESİN
    await send({ type: 'RECORD_NOW' });
  }

  // --- Sayfa tıklamaları → yakalama ---
  const onPointerDown = (e: PointerEvent): void => {
    if (phase !== 'recording') return;
    if (e.target === host) return;
    void send({ type: 'CLICK', x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
  };

  // --- Scroll işaretleri (throttle) ---
  let lastScroll = 0;
  const onScroll = (): void => {
    if (phase !== 'recording') return;
    const now = Date.now();
    if (now - lastScroll < 350) return;
    lastScroll = now;
    void send({ type: 'SCROLL' });
  };

  // --- Durdur / İptal / kısayol ---
  async function stop(): Promise<void> {
    if (phase === 'saving') return;
    if (phase === 'countdown') return cancel();
    phase = 'saving';
    host.style.display = ''; // toast için tekrar göster
    dim.classList.add('hidden');
    go.classList.add('hidden');
    xBtn.classList.add('hidden');
    toast.classList.remove('hidden');
    const res = await send<{ ok: boolean; error?: string }>({ type: 'FINALIZE' });
    if (res && !res.ok) {
      toast.textContent = `Hata: ${res.error ?? 'kaydedilemedi'}`;
      window.setTimeout(teardown, 2600);
    } else {
      teardown();
    }
  }

  function cancel(): void {
    void send({ type: 'CANCEL' });
    teardown();
  }

  let torn = false;
  function teardown(): void {
    if (torn) return;
    torn = true;
    window.clearInterval(tick);
    window.removeEventListener('keydown', onKey, true);
    window.removeEventListener('pointerdown', onPointerDown, true);
    window.removeEventListener('scroll', onScroll, true);
    host.remove();
    w.__clickthruRecorder = false;
  }

  function onKey(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      e.preventDefault();
      cancel();
    } else if (e.ctrlKey && (e.key === 'y' || e.key === 'Y')) {
      e.preventDefault();
      void stop();
    }
  }

  xBtn.addEventListener('click', () => cancel());
  window.addEventListener('pointerdown', onPointerDown, true);
  window.addEventListener('scroll', onScroll, true);
  window.addEventListener('keydown', onKey, true);
})();
