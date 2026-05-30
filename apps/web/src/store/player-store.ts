import { create } from 'zustand';

/** Player oynatma durumu (CLAUDE.md §7 — feature bazlı Zustand store). */
interface PlayerState {
  index: number;
  total: number;
  /** Aktif video adımının oynatma ilerlemesi 0–1 (progress segmenti için). */
  videoProgress: number;
  init: (total: number) => void;
  next: () => void;
  prev: () => void;
  goTo: (i: number) => void;
  reset: () => void;
  setVideoProgress: (p: number) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  index: 0,
  total: 0,
  videoProgress: 0,
  init: (total) => set({ total, index: 0, videoProgress: 0 }),
  next: () => {
    const { index, total } = get();
    if (index < total - 1) set({ index: index + 1, videoProgress: 0 });
  },
  prev: () => {
    const { index } = get();
    if (index > 0) set({ index: index - 1, videoProgress: 0 });
  },
  goTo: (i) => {
    const { total } = get();
    if (i >= 0 && i < total) set({ index: i, videoProgress: 0 });
  },
  reset: () => set({ index: 0, videoProgress: 0 }),
  setVideoProgress: (p) => set({ videoProgress: Math.min(1, Math.max(0, p)) }),
}));
