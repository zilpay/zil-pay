export function writeInt32LE(arr: Uint8Array, value: number, offset = 0): void {
  const view = new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
  view.setInt32(offset, value, true);
}

export function writeUInt16BE(arr: Uint8Array, value: number, offset = 0): void {
  const view = new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
  view.setUint16(offset, value, false);
}

export function readUInt16BE(arr: Uint8Array, offset = 0): number {
  const view = new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
  return view.getUint16(offset, false);
}

export function writeUInt32BE(buffer: Uint8Array, value: number, offset: number): void {
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  view.setUint32(offset, value, false);
}

export function concatUint8Arrays(...arrays: Uint8Array[]): Uint8Array {
  const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}
