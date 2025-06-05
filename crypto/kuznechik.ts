import { KeyStore, AlgOfb, MIN_GAMMA_SIZE } from '@hicaru/kuznechik.js';
import { randomBytes } from './random';

export function kuznechik_encrypt(key: Uint8Array, plaintext: Uint8Array): Uint8Array {
    const keyStore = new KeyStore();
    keyStore.setMasterKey(key);
    const gamma = randomBytes(MIN_GAMMA_SIZE);
    const alg = new AlgOfb(keyStore);
    alg.setGamma(gamma);
    const encrypted = alg.encrypt(plaintext);
    const finalCiphertext = new Uint8Array(encrypted.length + gamma.length);
    finalCiphertext.set(encrypted, 0);
    finalCiphertext.set(gamma, encrypted.length);
    return finalCiphertext;
}

export function kuznechik_decrypt(key: Uint8Array, ciphertext: Uint8Array): Uint8Array {
    const gamma = ciphertext.slice(ciphertext.length - MIN_GAMMA_SIZE);
    const actualCiphertext = ciphertext.slice(0, ciphertext.length - MIN_GAMMA_SIZE);
    const keyStore = new KeyStore();
    keyStore.setMasterKey(key);
    const alg = new AlgOfb(keyStore);
    alg.setGamma(gamma);
    const plaintext = alg.decrypt(actualCiphertext);
    return plaintext;
}
