import { describe, test, expect } from 'vitest';
import { safeChunkTransaction } from 'crypto/rlp';
import { hexToUint8Array } from 'lib/utils/hex';

describe('safeChunkTransaction', () => {
  test('single chunk for small transaction', () => {
    const derivationPath = hexToUint8Array('058000002c8000003c800000008000000000000000');

    const rawTxRlp = new Uint8Array([
      0xec, 0x80, 0x01, 0x82, 0x52, 0x08, 0x94, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x80, 0x01, 0x80,
      0x80, 0x80
    ]);

    const payload = new Uint8Array([...derivationPath, ...rawTxRlp]);
    
    expect(payload.length).toBeLessThanOrEqual(255);

    const chunks = safeChunkTransaction(rawTxRlp, derivationPath, 'legacy');

    expect(chunks.length).toBe(1);
    expect(chunks[0]).toEqual(payload);
  });

  test('multiple 255b chunks for typed transaction', () => {
    const derivationPath = hexToUint8Array('058000002c8000003c800000008000000000000000');

    const input = new Uint8Array(256).fill(0);
    const rawTxRlp = new Uint8Array([
      0x01, 0xf8, 0x84, 0x01, 0x80, 0x01, 0x82, 0x52, 0x08, 0x94,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x80, 0xb9, 0x01, 0x00, ...input, 0xc0, 0x80, 0x80, 0x80
    ]);

    const payload = new Uint8Array([...derivationPath, ...rawTxRlp]);
    
    expect(payload.length).toBeGreaterThan(255);

    const chunks = safeChunkTransaction(rawTxRlp, derivationPath, 'eip1559');

    expect(chunks.length).toBe(2);
    expect(chunks[0].length).toBe(255);
    expect(chunks[0]).toEqual(payload.slice(0, 255));
    expect(chunks[1]).toEqual(payload.slice(255));
  });

  test('legacy transaction chunking with real data', () => {
    const derivationPath = hexToUint8Array('058000002c8000003c800000008000000000000000');
    
    const rlpHex = '0xf901d28086053275f90e008302924494cd205474f63234d0ff1efe65da4438167f6fb2c189055de6a779bbac0000b901a45ae401dc0000000000000000000000000000000000000000000000000000000068bd2d2100000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000e4472b43f30000000000000000000000000000000000000000000000055de6a779bbac0000000000000000000000000000000000000000000000000002d044375cf277987b0000000000000000000000000000000000000000000000000000000000000080000000000000000000000000a1b2ff03f501a4d8278cb75a9075f406a5b8c5ff0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000878c5008a348a60a5b239844436a7b483fadb7f20000000000000000000000001fd09f6701a1852132a649fe9d07f2a3b991ecfa00000000000000000000000000000000000000000000000000000000';
    const rlpTx = hexToUint8Array(rlpHex);

    const payload = new Uint8Array([...derivationPath, ...rlpTx]);
    const chunks = safeChunkTransaction(rlpTx, derivationPath, 'legacy');

    const expectedChunk1 = new Uint8Array([
       5, 128, 0, 0, 44, 128, 0, 0, 60, 128, 0, 0, 0, 128, 0, 0, 0, 0, 0, 0, 0, 249,
      1, 210, 128, 134, 5, 50, 117, 249, 14, 0, 131, 2, 146, 68, 148, 205, 32, 84,
      116, 246, 50, 52, 208, 255, 30, 254, 101, 218, 68, 56, 22, 127, 111, 178, 193,
      137, 5, 93, 230, 167, 121, 187, 172, 0, 0, 185, 1, 164, 90, 228, 1, 220, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      104, 189, 45, 33, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 32, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 228, 71, 43, 67, 243, 0, 0, 0, 0, 0, 0, 0
    ]);

    const expectedChunk2 = new Uint8Array([
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 93, 230, 167, 121, 187, 172,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2,
      208, 68, 55, 92, 242, 119, 152, 123, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 128, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 161, 178, 255, 3, 245, 1, 164, 216, 39, 140, 183, 90, 144, 117,
      244, 6, 165, 184, 197, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 135, 140, 80, 8, 163, 72, 166, 10, 91, 35, 152, 68, 67, 106, 123, 72, 63,
      173, 183, 242, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 31, 208, 159, 103, 1, 161,
      133, 33, 50, 166, 73, 254, 157, 7, 242, 163, 185, 145, 236, 250, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
    ]);

    expect(chunks.length).toBe(2);
    expect(chunks[0].length).toBe(245);
    expect(chunks[1].length).toBe(245);

    expect(chunks[0]).toEqual(expectedChunk1);
    expect(chunks[1]).toEqual(expectedChunk2);

    expect(chunks[0]).toEqual(payload.slice(0, 245));
    expect(chunks[1]).toEqual(payload.slice(245, 490));
  });
});
