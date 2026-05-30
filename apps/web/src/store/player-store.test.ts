import { beforeEach, describe, expect, it } from 'vitest';
import { usePlayerStore } from './player-store';

beforeEach(() => {
  usePlayerStore.getState().init(3);
});

describe('usePlayerStore — gezinme mantığı', () => {
  it('init total’i ayarlar ve index’i sıfırlar', () => {
    usePlayerStore.getState().goTo(2);
    usePlayerStore.getState().init(5);
    expect(usePlayerStore.getState().total).toBe(5);
    expect(usePlayerStore.getState().index).toBe(0);
  });

  it('next index’i artırır ama son adımda durur', () => {
    const { next } = usePlayerStore.getState();
    next();
    expect(usePlayerStore.getState().index).toBe(1);
    next();
    next();
    next(); // total=3 → max index 2'de kalır
    expect(usePlayerStore.getState().index).toBe(2);
  });

  it('prev index’i azaltır ama ilk adımda durur', () => {
    usePlayerStore.getState().goTo(2);
    const { prev } = usePlayerStore.getState();
    prev();
    expect(usePlayerStore.getState().index).toBe(1);
    prev();
    prev(); // 0'da kalır
    expect(usePlayerStore.getState().index).toBe(0);
  });

  it('goTo yalnızca geçerli aralıkta çalışır', () => {
    usePlayerStore.getState().goTo(5); // total=3 → yok say
    expect(usePlayerStore.getState().index).toBe(0);
    usePlayerStore.getState().goTo(-1); // yok say
    expect(usePlayerStore.getState().index).toBe(0);
    usePlayerStore.getState().goTo(2);
    expect(usePlayerStore.getState().index).toBe(2);
  });

  it('tek adımlık demoda next/prev index’i değiştirmez (sınır)', () => {
    usePlayerStore.getState().init(1);
    usePlayerStore.getState().next();
    usePlayerStore.getState().prev();
    expect(usePlayerStore.getState().index).toBe(0);
  });

  it('reset index’i sıfırlar', () => {
    usePlayerStore.getState().goTo(2);
    usePlayerStore.getState().reset();
    expect(usePlayerStore.getState().index).toBe(0);
  });
});
