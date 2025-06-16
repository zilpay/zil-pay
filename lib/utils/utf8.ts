export function utf8ToUint8Array(str: string): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(str);
}

export function uint8ArrayToUtf8(arr: Uint8Array): string {
  const decoder = new TextDecoder();
  return decoder.decode(arr);
}

