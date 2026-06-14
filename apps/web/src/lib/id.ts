/** Kısa benzersiz id üretir (tarayıcıda crypto, yoksa rastgele). Adım/overlay gibi iç id'ler için. */
export function genId(prefix: string): string {
  const rand =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}_${rand}`;
}

const TOKEN_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

/**
 * Tahmin edilemez, URL-güvenli token. Varsayılan 22 karakter ≈ 130 bit entropi.
 * Kriptografik rastgelelik (crypto.getRandomValues); yoksa Math.random'a düşer.
 */
export function genToken(len = 22): string {
  const c = typeof crypto !== 'undefined' && 'getRandomValues' in crypto ? crypto : null;
  let out = '';
  if (c) {
    const bytes = new Uint8Array(len);
    c.getRandomValues(bytes);
    for (let i = 0; i < len; i++) out += TOKEN_ALPHABET[bytes[i] % 62];
  } else {
    for (let i = 0; i < len; i++) out += TOKEN_ALPHABET[Math.floor(Math.random() * 62)];
  }
  return out;
}

/**
 * Demo paylaşım id'si — **tahmin edilemez** (URL'e rastgele id girip başkasının demosuna
 * erişilemez). `demo_` öneki + 22 karakter token.
 */
export function genDemoId(): string {
  return `demo_${genToken(22)}`;
}
