import { deriveFromPrivateKeyPublicKey, derivePrivateKey } from "./bip32";
import { DerivationPath } from "./bip49";

export class KeyPair {
  #privateKey: Uint8Array;
  #pubKey: Uint8Array;

  static async fromPrivateKey(privateKey: Uint8Array, slip44: number) {
    const pubKey = await deriveFromPrivateKeyPublicKey(privateKey, slip44);

    return new KeyPair(privateKey, pubKey);
  }

  static async fromSeed(seed: Uint8Array, slip44: number, index: number) {
    const hdPath = new DerivationPath(slip44, index);
    const privateKey = await derivePrivateKey(seed, hdPath.getPath());
    const pubKey = await deriveFromPrivateKeyPublicKey(privateKey, slip44);

    return new KeyPair(privateKey, pubKey);
  }

  get privateKey() {
    return this.#privateKey;
  }

  get pubKey() {
    return this.#pubKey;
  }

  constructor(privateKey: Uint8Array, pubKey: Uint8Array) {
    this.#privateKey = privateKey;
    this.#pubKey = pubKey;
  }
}
