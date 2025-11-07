import { writeUInt32BE } from "lib/utils/bytes";

export function bip32asUInt8Array(path: string): Uint8Array {
  const parts = path.split("/");
  const buffer = new Uint8Array(1 + parts.length * 4);
  buffer[0] = parts.length;
  parts.forEach((part, i) => {
    let value = parseInt(part, 10);
    if (part.endsWith("'")) {
      value = 0x80000000 | (value & ~0x80000000);
    }
    writeUInt32BE(buffer, value, 1 + i * 4);
  });
  return buffer;
}
