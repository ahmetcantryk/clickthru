import { describe, expect, it } from 'vitest';
import type { DemoVariable } from '@clickthru/schema';
import { overridesFromParams, personalizedQuery, resolveVars } from './personalize';

const vars: DemoVariable[] = [
  { key: 'name', label: 'Ad', default: 'there' },
  { key: 'company', label: 'Şirket', default: 'Acme' },
  { key: 'empty', label: 'Boş' }, // default yok
];

describe('resolveVars — token çözümü', () => {
  it('override default’u ezer', () => {
    expect(resolveVars('Merhaba {{name}}', vars, { name: 'Jane' })).toBe('Merhaba Jane');
  });

  it('override yoksa default kullanılır', () => {
    expect(resolveVars('{{company}} ekibine hoş geldin', vars)).toBe('Acme ekibine hoş geldin');
  });

  it('boş override default’a düşer (yok sayılır)', () => {
    expect(resolveVars('Hi {{name}}', vars, { name: '' })).toBe('Hi there');
  });

  it('default’u olmayan tanımlı değişken boş çözülür', () => {
    expect(resolveVars('x{{empty}}y', vars)).toBe('xy');
  });

  it('tanımsız token olduğu gibi kalır (yazım hatası görünür)', () => {
    expect(resolveVars('{{unknown}}', vars)).toBe('{{unknown}}');
  });

  it('boşluklu token ve çoklu token çözülür', () => {
    expect(resolveVars('{{ name }} @ {{company}}', vars, { name: 'Jo' })).toBe('Jo @ Acme');
  });

  it('token içermeyen metin aynen döner; undefined → boş', () => {
    expect(resolveVars('düz metin', vars)).toBe('düz metin');
    expect(resolveVars(undefined, vars)).toBe('');
  });
});

describe('overridesFromParams — yalnız tanımlı anahtarlar', () => {
  it('tanımlı + dolu paramları alır, tanımsızları eler', () => {
    const o = overridesFromParams({ name: 'Jane', company: '', evil: 'x' }, vars);
    expect(o).toEqual({ name: 'Jane' });
  });

  it('URLSearchParams kaynağını da kabul eder; dizi paramda ilki', () => {
    const sp = new URLSearchParams();
    sp.append('name', 'A');
    sp.append('name', 'B');
    expect(overridesFromParams(sp, vars)).toEqual({ name: 'A' });
  });
});

describe('personalizedQuery — link kuyruğu', () => {
  it('dolu değerleri kodlar, boşları atlar', () => {
    expect(personalizedQuery({ name: 'Jane Doe', company: '  ' })).toBe('?name=Jane+Doe');
  });

  it('hepsi boşsa boş string', () => {
    expect(personalizedQuery({ a: '', b: '   ' })).toBe('');
  });
});
