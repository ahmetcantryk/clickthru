// clickthru sayfa-içi recorder overlay (popup'taki "Kaydı başlat" ile enjekte edilir).
// 5-4-3-2-1 geri sayım (beyaz saydam overlay) · ortada ✕ iptal · üstte "Recording area" · altta Durdur + Ctrl+Y.
// Kayıt sırasında her tıklama arka plana bildirilir; yakalama anında overlay gizlenir (screenshot'a girmesin).
(() => {
  const w = window as unknown as { __clickthruRecorder?: boolean };
  if (w.__clickthruRecorder) return;
  w.__clickthruRecorder = true;

  const ACCENT = '#2142e7';
  const START_FROM = 5;
  type Phase = 'countdown' | 'recording' | 'saving';
  let phase: Phase = 'countdown';

  const host = document.createElement('div');
  host.style.cssText = 'all:initial;position:fixed;inset:0;z-index:2147483647;pointer-events:none;';
  const root = host.attachShadow({ mode: 'open' });
  (document.documentElement || document.body).appendChild(host);

  root.innerHTML = `
    <style>
      :host, * { box-sizing: border-box; }
      .ui { font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; -webkit-font-smoothing: antialiased; }
      .dim {
        position: fixed; inset: 0; pointer-events: auto;
        background: rgba(255,255,255,0.66);
        backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
      }
      .timer {
        position: fixed; top: 30%; left: 50%; transform: translate(-50%,-50%);
        display: flex; flex-direction: column; align-items: center; gap: 10px; text-align: center;
      }
      .count {
        font-size: clamp(150px, 27vh, 300px); font-weight: 200; letter-spacing: -0.04em; line-height: .9;
        color: #0b0b12; font-variant-numeric: tabular-nums; font-feature-settings: "tnum";
      }
      .count.anim { animation: tick .92s cubic-bezier(.22,.61,.36,1); }
      @keyframes tick { 0% { opacity: 0; transform: scale(.82) } 35% { opacity: 1; transform: scale(1) } 100% { opacity: .92; transform: scale(1) } }
      .hint { font-size: 14px; font-weight: 500; letter-spacing: .01em; color: #5b5b66; }
      .pill-top {
        position: fixed; top: 0; left: 50%; transform: translateX(-50%); pointer-events: auto;
        display: flex; align-items: center; gap: 8px; padding: 7px 16px;
        background: #0b0b12; color: #fff; font-size: 12px; font-weight: 600; letter-spacing: .01em;
        border-radius: 0 0 14px 14px; box-shadow: 0 6px 20px rgba(0,0,0,.22);
      }
      .rec-dot { width: 9px; height: 9px; border-radius: 50%; background: #ff4d4f; animation: blink 1.3s ease-in-out infinite; }
      @keyframes blink { 50% { opacity: .25 } }
      .x-btn {
        position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%); pointer-events: auto;
        width: 56px; height: 56px; border: 0; border-radius: 50%; cursor: pointer;
        background: #fff; color: #0b0b12;
        box-shadow: 0 14px 38px -10px rgba(20,22,60,.34), 0 2px 6px rgba(0,0,0,.08);
        display: flex; align-items: center; justify-content: center; transition: transform .15s, background .15s;
      }
      .x-btn:hover { background: #f5f5f7; transform: translate(-50%,-50%) scale(1.06); }
      .x-btn svg { width: 22px; height: 22px; }
      .bar {
        position: fixed; bottom: 26px; left: 50%; transform: translateX(-50%); pointer-events: auto;
        display: flex; align-items: center; gap: 12px; padding: 9px 14px 9px 9px;
        background: #fff; border-radius: 999px; box-shadow: 0 16px 44px -12px rgba(20,22,60,.32), 0 2px 8px rgba(0,0,0,.08);
      }
      .stop-btn {
        display: inline-flex; align-items: center; gap: 8px; height: 38px; padding: 0 16px;
        border: 0; border-radius: 999px; cursor: pointer; background: ${ACCENT}; color: #fff;
        font-size: 13px; font-weight: 600; transition: filter .15s;
      }
      .stop-btn:hover { filter: brightness(1.08); }
      .stop-sq { width: 11px; height: 11px; border-radius: 3px; background: #fff; }
      .kbd { font-size: 11px; font-weight: 600; color: #5b5b66; background: #f1f1f4; border: 1px solid rgba(15,15,30,.1); border-bottom-width: 2px; border-radius: 7px; padding: 3px 8px; }
      .toast {
        position: fixed; bottom: 26px; left: 50%; transform: translateX(-50%); pointer-events: auto;
        padding: 11px 20px; background: #0b0b12; color: #fff; font-size: 13px; font-weight: 600;
        border-radius: 999px; box-shadow: 0 16px 44px -12px rgba(20,22,60,.4);
      }
      .hidden { display: none !important; }
    </style>
    <div class="ui">
      <div class="dim"></div>
      <div class="timer">
        <div class="count anim">${START_FROM}</div>
        <div class="hint">Kayıt başlıyor…</div>
      </div>
      <div class="pill-top hidden"><span class="rec-dot"></span>Recording area</div>
      <button class="x-btn" title="İptal (Esc)" aria-label="İptal">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
      </button>
      <div class="bar hidden">
        <button class="stop-btn"><span class="stop-sq"></span>Kaydı durdur</button>
        <span class="kbd">Ctrl+Y</span>
      </div>
      <div class="toast hidden">Kaydediliyor…</div>
    </div>
  `;

  const $ = <T extends Element>(sel: string) => root.querySelector(sel) as T;
  const dim = $<HTMLDivElement>('.dim');
  const timer = $<HTMLDivElement>('.timer');
  const countEl = $<HTMLDivElement>('.count');
  const pillTop = $<HTMLDivElement>('.pill-top');
  const bar = $<HTMLDivElement>('.bar');
  const toast = $<HTMLDivElement>('.toast');
  const xBtn = $<HTMLButtonElement>('.x-btn');
  const stopBtn = $<HTMLButtonElement>('.stop-btn');

  // --- Geri sayım (5'ten) → kayıt ---
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
    void beginRecording();
  }, 1000);

  async function beginRecording(): Promise<void> {
    phase = 'recording';
    dim.classList.add('hidden');
    timer.classList.add('hidden');
    pillTop.classList.remove('hidden');
    bar.classList.remove('hidden');
    await chrome.storage.local.set({ recording: true, steps: [] });
  }

  // --- Sayfa tıklamaları → yakalama (overlay'in kendi tıklamaları hariç) ---
  window.addEventListener(
    'pointerdown',
    (e) => {
      if (phase !== 'recording') return;
      if (e.target === host) return;
      void capture(e.clientX / window.innerWidth, e.clientY / window.innerHeight);
    },
    true,
  );

  async function capture(x: number, y: number): Promise<void> {
    host.style.visibility = 'hidden';
    try {
      await chrome.runtime.sendMessage({ type: 'CLICK', x, y });
    } catch {
      // arka plan uyanıyor olabilir
    }
    host.style.visibility = 'visible';
  }

  // --- Durdur / İptal / kısayol ---
  async function stop(): Promise<void> {
    if (phase === 'saving') return;
    if (phase === 'countdown') return cancel();
    phase = 'saving';
    pillTop.classList.add('hidden');
    bar.classList.add('hidden');
    xBtn.classList.add('hidden');
    toast.classList.remove('hidden');
    const res = (await chrome.runtime.sendMessage({ type: 'FINALIZE' })) as { ok: boolean; error?: string } | undefined;
    if (res && !res.ok) {
      toast.textContent = `Hata: ${res.error ?? 'kaydedilemedi'}`;
      window.setTimeout(teardown, 2600);
    } else {
      teardown();
    }
  }

  function cancel(): void {
    void chrome.runtime.sendMessage({ type: 'CANCEL' });
    teardown();
  }

  function teardown(): void {
    window.clearInterval(tick);
    window.removeEventListener('keydown', onKey, true);
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

  stopBtn.addEventListener('click', () => void stop());
  xBtn.addEventListener('click', () => cancel());
  window.addEventListener('keydown', onKey, true);
})();
