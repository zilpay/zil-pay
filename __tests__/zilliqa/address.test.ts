import { describe, expect, it } from 'vitest';
import { toChecksumAddress } from 'lib/zilliqa/checksum'; 

describe('toChecksumAddress', () => {
  it('should correctly checksum a valid lowercase address', async () => {
    const address = '8617b72e22090f0c13167865147ec48a6db788ff';
    const checksummed = await toChecksumAddress(address);
    expect(checksummed).toBe('0x8617B72E22090f0c13167865147eC48a6dB788ff'); // Corrected expected value
  });

  it('should correctly checksum another valid address', async () => {
    const address = '0000000000000000000000000000000000000000';
    const checksummed = await toChecksumAddress(address);
    expect(checksummed).toBe('0x0000000000000000000000000000000000000000');
  });
});

