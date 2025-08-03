import { describe, it, expect } from 'vitest';
import { detectLanguage } from '../../lib/utils/locale';


describe('detectLanguage', () => {
  it('detects English', () => {
    expect(detectLanguage('hello')).toBe('en');
  });

  it('detects Russian', () => {
    expect(detectLanguage('привет')).toBe('ru');
  });

  it('detects Japanese', () => {
    expect(detectLanguage('こんにちは')).toBe('ja');
  });

  it('detects Korean', () => {
    expect(detectLanguage('안녕하세요')).toBe('ko');
  });

  it('detects Spanish with accents', () => {
    expect(detectLanguage('niño')).toBe('es');
  });

  it('detects basic Spanish as English', () => {
    expect(detectLanguage('hola')).toBe('en');
  });

  it('throws for unknown language', () => {
    expect(() => detectLanguage('مرحبا')).toThrow('Unknown language');
    expect(() => detectLanguage('')).toThrow('Unknown language');
    expect(() => detectLanguage('123')).toThrow('Unknown language');
  });
});
