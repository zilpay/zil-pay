import { sha256 } from 'crypto/sha256';

export async function fromZilPubKey(pubKey: Uint8Array): Promise<Uint8Array> {
  const hashBytes = await sha256(pubKey);
  const addressBytes = hashBytes.slice(12);

  if (addressBytes.length !== 20) {
    throw new Error('Invalid public key length or unexpected hash output length.');
  }

  return addressBytes;
}
