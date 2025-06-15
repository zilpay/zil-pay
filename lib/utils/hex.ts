export function stripHexPrefix(hex: string): string {
  return hex.toLowerCase().startsWith('0x') ? hex.slice(2) : hex;
}

