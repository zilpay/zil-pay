import { getPublicKey } from 'noble-secp256k1';

export function fromZILPrivateKey(privateKey: Uint8Array): Uint8Array {
  const publicKey = getPublicKey(Uint8Array.from(privateKey), true);
  return publicKey;
}

