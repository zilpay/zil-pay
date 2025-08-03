export function detectLanguage(word: string): string {
  if (/^[a-zA-Z]+$/.test(word)) return 'en';
  if (/[\u0400-\u04FF]/.test(word)) return 'ru';
  if (/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/.test(word)) return 'ja';
  if (/[\uAC00-\uD7A3]/.test(word)) return 'ko';
  if (/[\u00C0-\u00FF]/.test(word)) return 'es';

  throw new Error('Unknown language');
}
