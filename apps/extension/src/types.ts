// Uzantı içi paylaşılan tipler (background ↔ content ↔ popup ↔ offscreen mesajları).

/** Yakalama modu: interactive = tıklama screenshot'ları + scroll videoları; screenshot = yalnız screenshot (yedek). */
export type Mode = 'interactive' | 'screenshot';

/** Tıklama anında yakalanan adım (screenshot URL + oransal konum + kayıt-göreli zaman). */
export interface CapturedClick {
  url: string;
  x: number;
  y: number;
  t: number;
}

/** chrome.storage.local'da tutulan kayıt durumu (SW askıya alınsa da hayatta kalır). */
export interface CaptureState {
  recording: boolean;
  mode: Mode;
  demoId: string;
  title: string;
  recStart: number;
  clicks: CapturedClick[];
  scrolls: number[];
}
