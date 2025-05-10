import { getPublicKey } from 'noble-secp256k1';

export function fromZILPrivateKey(privateKey: Uint8Array): Uint8Array {
  const publicKey = getPublicKey(privateKey, true);
  return publicKey;
}

