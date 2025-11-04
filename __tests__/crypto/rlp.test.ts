import { describe, test, expect } from 'vitest';
import { safeChunkTransaction } from 'crypto/rlp';
import { hexToUint8Array } from 'lib/utils/hex';

describe('safeChunkTransaction', () => {
  test('single chunk for small transaction', () => {
    const derivationPath = new Uint8Array([
      0x05, 0x80, 0x00, 0x00, 0x2c, 0x80, 0x00, 0x00, 0x3c, 0x80, 
      0x00, 0x00, 0x00, 0x80, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
    ]);

    const rlpTx = new Uint8Array([
      0xec, 0x80, 0x01, 0x82, 0x52, 0x08, 0x94, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x80, 0x01, 0x80,
      0x80, 0x80
    ]);

    const payload = new Uint8Array([...derivationPath, ...rlpTx]);
    expect(payload.length).toBeLessThanOrEqual(255);

    const chunks = safeChunkTransaction(rlpTx, derivationPath, 'legacy');

    expect(chunks.length).toBe(1);
    expect(chunks[0]).toEqual(payload);
  });

  test('multiple 255b chunks for typed transaction', () => {
    const derivationPath = new Uint8Array([
      0x05, 0x80, 0x00, 0x00, 0x2c, 0x80, 0x00, 0x00, 0x3c, 0x80,
      0x00, 0x00, 0x00, 0x80, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
    ]);

    const input = new Uint8Array(256).fill(0);
    const rlpTx = new Uint8Array([
      0x01, 0xf8, 0x84, 0x01, 0x80, 0x01, 0x82, 0x52, 0x08, 0x94,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x80, 0xb9, 0x01, 0x00, ...input, 0xc0, 0x80, 0x80, 0x80
    ]);

    const payload = new Uint8Array([...derivationPath, ...rlpTx]);
    expect(payload.length).toBeGreaterThan(255);

    const chunks = safeChunkTransaction(rlpTx, derivationPath, 'eip1559');

    expect(chunks.length).toBe(2);
    expect(chunks[0].length).toBe(255);
    expect(chunks[0]).toEqual(payload.slice(0, 255));
    expect(chunks[1]).toEqual(payload.slice(255));
  });

  test('variable chunks for legacy transaction', () => {
    const derivationPath = new Uint8Array([
      0x05, 0x80, 0x00, 0x00, 0x2c, 0x80, 0x00, 0x00, 0x3c, 0x80,
      0x00, 0x00, 0x00, 0x80, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
    ]);

    const input = new Uint8Array(458).fill(0);
    const rlpTx = new Uint8Array([
      0xf9, 0x01, 0xf2, 0x80, 0x01, 0x02, 0x94, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x80, 0xb9, 0x01,
      0xca, ...input, 0x81, 0x7f, 0x80, 0x80
    ]);

    const payload = new Uint8Array([...derivationPath, ...rlpTx]);
    
    const chunks = safeChunkTransaction(rlpTx, derivationPath, 'legacy');

    expect(chunks.length).toBeGreaterThanOrEqual(2);
    
    const reconstructed = new Uint8Array(
      chunks.reduce((acc, chunk) => acc + chunk.length, 0)
    );
    let offset = 0;
    for (const chunk of chunks) {
      reconstructed.set(chunk, offset);
      offset += chunk.length;
    }
    
    expect(reconstructed).toEqual(payload);
  });

  test('legacy transaction chunking with real data', () => {
    const derivationPath = new Uint8Array([
      0x05, 0x80, 0x00, 0x00, 0x2c, 0x80, 0x00, 0x00, 0x3c, 0x80,
      0x00, 0x00, 0x00, 0x80, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
    ]);

    const rlpHex = 'f901d28086053275f90e008302924494cd205474f63234d0ff1efe65da4438167f6fb2c189055de6a779bbac0000b901a45ae401dc0000000000000000000000000000000000000000000000000000000068bd2d2100000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000e4472b43f30000000000000000000000000000000000000000000000055de6a779bbac0000000000000000000000000000000000000000000000000002d044375cf277987b0000000000000000000000000000000000000000000000000000000000000080000000000000000000000000a1b2ff03f501a4d8278cb75a9075f406a5b8c5ff0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000878c5008a348a60a5b239844436a7b483fadb7f20000000000000000000000001fd09f6701a1852132a649fe9d07f2a3b991ecfa00000000000000000000000000000000000000000000000000000000';
    const rlpTx = hexToUint8Array(rlpHex);

    const payload = new Uint8Array([...derivationPath, ...rlpTx]);
    const chunks = safeChunkTransaction(rlpTx, derivationPath, 'legacy');

    expect(chunks.length).toBeGreaterThanOrEqual(2);
    expect(payload.length).toBeGreaterThan(255);

    const reconstructed = new Uint8Array(
      chunks.reduce((acc, chunk) => acc + chunk.length, 0)
    );
    let offset = 0;
    for (const chunk of chunks) {
      expect(chunk.length).toBeLessThanOrEqual(255);
      reconstructed.set(chunk, offset);
      offset += chunk.length;
    }
    
    expect(reconstructed).toEqual(payload);
  });
});

