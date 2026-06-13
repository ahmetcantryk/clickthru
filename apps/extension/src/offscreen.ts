// Offscreen document — MediaRecorder burada çalışır (SW'de DOM/MediaRecorder yok).
// SW akışı: OFFSCREEN_ACQUIRE (streamId ile getUserMedia, kaydı BAŞLATMA) →
// OFFSCREEN_START (recorder.start) → OFFSCREEN_STOP (durdur, Storage'a yükle, sonucu SW'ye yolla).
import { uploadToStorage } from './config';

interface AcquireMsg { type: 'OFFSCREEN_ACQUIRE'; streamId: string; demoId: string }
interface StartMsg { type: 'OFFSCREEN_START' }
interface StopMsg { type: 'OFFSCREEN_STOP' }
type Incoming = AcquireMsg | StartMsg | StopMsg | { type: string };

let stream: MediaStream | null = null;
let recorder: MediaRecorder | null = null;
let chunks: Blob[] = [];
let demoId = '';
let startTs = 0;

function pickMime(): string {
  const types = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
  return types.find((t) => MediaRecorder.isTypeSupported(t)) ?? 'video/webm';
}

async function acquire(streamId: string, id: string): Promise<void> {
  demoId = id;
  chunks = [];
  // Chrome'a özgü tab capture kısıtları (standart dışı → cast).
  const constraints = {
    audio: false,
    video: { mandatory: { chromeMediaSource: 'tab', chromeMediaSourceId: streamId } },
  } as unknown as MediaStreamConstraints;
  stream = await navigator.mediaDevices.getUserMedia(constraints);
  recorder = new MediaRecorder(stream, { mimeType: pickMime() });
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };
}

function start(): void {
  if (!recorder) return;
  startTs = Date.now();
  recorder.start(1000); // 1sn timeslice → bellek sınırlı, parça parça
}

function cleanup(): void {
  stream?.getTracks().forEach((t) => t.stop());
  stream = null;
  recorder = null;
}

function stop(): void {
  if (!recorder) {
    chrome.runtime.sendMessage({ type: 'OFFSCREEN_RESULT', error: 'kayıt yok' });
    return;
  }
  const durationMs = Date.now() - startTs;
  recorder.onstop = async () => {
    try {
      const blob = new Blob(chunks, { type: chunks[0]?.type || 'video/webm' });
      const url = await uploadToStorage(`captures/${demoId}/capture.webm`, blob);
      chrome.runtime.sendMessage({ type: 'OFFSCREEN_RESULT', videoUrl: url, durationMs });
    } catch (e) {
      chrome.runtime.sendMessage({ type: 'OFFSCREEN_RESULT', error: e instanceof Error ? e.message : 'yükleme hatası' });
    } finally {
      cleanup();
    }
  };
  recorder.stop();
}

chrome.runtime.onMessage.addListener((msg: Incoming) => {
  switch (msg?.type) {
    case 'OFFSCREEN_ACQUIRE':
      void acquire((msg as AcquireMsg).streamId, (msg as AcquireMsg).demoId).catch((e) =>
        chrome.runtime.sendMessage({ type: 'OFFSCREEN_RESULT', error: e instanceof Error ? e.message : 'stream alınamadı' }),
      );
      break;
    case 'OFFSCREEN_START':
      start();
      break;
    case 'OFFSCREEN_STOP':
      stop();
      break;
    default:
      break;
  }
  return false;
});
