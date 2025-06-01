/**
 * Converts a base64 string to a Uint8Array.
 * @param base64 - The base64 string to convert.
 * @returns A Uint8Array containing the decoded data.
 * @throws {Error} If the input string is not a valid base64 string.
 */
export function base64ToUint8Array(base64: string): Uint8Array {
  try {
    const binaryString = atob(base64);
    const length = binaryString.length;
    const bytes = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  } catch (error) {
    throw new Error("Invalid base64 string");
  }
}

/**
 * Converts a Uint8Array to a base64 string.
 * @param uint8Array - The Uint8Array to convert.
 * @returns A base64 string representing the input data.
 */
export function uint8ArrayToBase64(uint8Array: Uint8Array): string {
  const binaryString = String.fromCharCode(...uint8Array);
  return btoa(binaryString);
}
