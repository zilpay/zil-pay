/**
 * Converts a Uint8Array to a bigint, assuming big-endian byte order.
 * In big-endian, the most significant byte is placed at the beginning of the array.
 * This format is commonly used in network protocols and cryptography.
 *
 * @param array - The Uint8Array to convert to a bigint.
 * @returns The bigint representation of the input Uint8Array.
 * @throws TypeError if the input parameter is not an instance of Uint8Array.
 */
export function uint8ArrayToBigIntBigEndian(array: Uint8Array): bigint {
  if (!(array instanceof Uint8Array)) {
    array = Uint8Array.from(array);
  }

  let result: bigint = 0n;
  for (const byte of array) {
    result = (result << 8n) | BigInt(byte);
  }
  return result;
}

/**
 * Converts a Uint8Array to a bigint, assuming little-endian byte order.
 * In little-endian, the least significant byte is placed at the beginning of the array.
 * This format is sometimes used for representing numbers in computer memory.
 *
 * @param array - The Uint8Array to convert to a bigint.
 * @returns The bigint representation of the input Uint8Array.
 * @throws TypeError if the input parameter is not an instance of Uint8Array.
 */
export function uint8ArrayToBigIntLittleEndian(array: Uint8Array): bigint {
  if (!(array instanceof Uint8Array)) {
    array = Uint8Array.from(array);
  }

  let result: bigint = 0n;
  for (let i = array.length - 1; i >= 0; i--) {
    result = (result << 8n) | BigInt(array[i]);
  }
  return result;
}
