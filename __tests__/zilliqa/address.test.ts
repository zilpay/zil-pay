import { describe, expect, it } from 'vitest';
import { toChecksumHexAddress, toChecksumBytesAddress } from 'lib/zilliqa/checksum'; 
import { fromZilPubKey } from 'lib/zilliqa/pubkey.ts';
import { utils } from 'aes-js';

describe('toChecksumAddress', () => {
  it('should correctly checksum a valid lowercase address', async () => {
    const address = '8617b72e22090f0c13167865147ec48a6db788ff';
    const checksummed = await toChecksumHexAddress(address);
    expect(checksummed).toBe('0x8617B72E22090f0c13167865147eC48a6dB788ff'); // Corrected expected value
  });

  it('should correctly checksum another valid address', async () => {
    const address = '0000000000000000000000000000000000000000';
    const checksummed = await toChecksumHexAddress(address);
    expect(checksummed).toBe('0x0000000000000000000000000000000000000000');
  });

  it('should correctly derive a bech32 address from a public key', async () => {
    const pubkeyHex = '03150a7f37063b134cde30070431a69148d60b252f4c7b38de33d813d329a7b7da';
    const pubkeyBytes = utils.hex.toBytes(pubkeyHex);
    const addrBytes = await fromZilPubKey(pubkeyBytes);
    const checksummed = await toChecksumBytesAddress(addrBytes);

    expect(checksummed).toBe('0xEBd8b370Dddb636FAF641040D2181c55190840fb');
  });
});

