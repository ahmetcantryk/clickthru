import { describe, expect, it } from 'vitest';
import { isValidEmail } from './leads';

describe('isValidEmail — lead formu doğrulaması', () => {
  it('geçerli adresleri kabul eder', () => {
    expect(isValidEmail('jane@acme.com')).toBe(true);
    expect(isValidEmail('a.b+tag@sub.example.co')).toBe(true);
    expect(isValidEmail('  spaced@trim.io  ')).toBe(true); // trim edilir
  });

  it('geçersiz/boş adresleri reddeder', () => {
    expect(isValidEmail(undefined)).toBe(false);
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('nope')).toBe(false);
    expect(isValidEmail('a@b')).toBe(false); // alan adında nokta yok
    expect(isValidEmail('a b@c.com')).toBe(false); // boşluk
    expect(isValidEmail('two@@at.com')).toBe(false);
    expect(isValidEmail(`${'x'.repeat(250)}@long.com`)).toBe(false); // >254
  });
});
