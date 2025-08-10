export function truncate(
  text: string,
  startChars: number = 6,
  endChars: number = 6,
  separator: string = '...'
): string {
  if (!text) {
    return '';
  }

  if (text.length <= startChars + endChars) {
    return text;
  }

  const start = text.slice(0, startChars);
  const end = text.slice(text.length - endChars);

  return `${start}${separator}${end}`;
}
