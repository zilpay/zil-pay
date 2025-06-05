import { PrivKey, PubKey } from '@hicaru/ntrup.js';
import { NTRU_CONFIG, ntruEncrypt, ntruKeysFromSeed } from './ntrup';
import { sha256 } from './sha256';
import { deriveArgon2Key, Argon2Config } from './argon2';
import { kuznechikEncrypt } from './kuznechik';

const PUBLICKEYS_BYTES = 1522; 
const SECRETKEYS_BYTES = 382; 
const AES_GCM_KEY_SIZE = 32; 
const KEYCHAIN_BYTES_SIZE = PUBLICKEYS_BYTES + SECRETKEYS_BYTES + AES_GCM_KEY_SIZE;

async function deriveKeyFromSeed(seed: Uint8Array, idx: number): Promise<Uint8Array> {
    const hasher = new Uint8Array([...seed, idx]);
    return sha256(hasher);
}

export enum CipherOrders {
  AESGCM256,
  KUZNECHIK,
  NTRUP1277,
}


export class KeyChain {
    public ntrupKeys: { pk: PubKey; sk: PrivKey };
    public aesKey: Uint8Array;
    public kuznechikKey: Uint8Array;

    constructor(ntrupKeys: { pk: PubKey; sk: PrivKey }, aesKey: Uint8Array, kuznechikKey: Uint8Array) {
        this.ntrupKeys = ntrupKeys;
        this.aesKey = aesKey;
        this.kuznechikKey = kuznechikKey;
    }

    /** Creates a KeyChain from a seed */
    static async fromSeed(seed: Uint8Array): Promise<KeyChain> {
        const ntrupKeys = ntruKeysFromSeed(seed);
        const aesKey = await deriveKeyFromSeed(seed, 0);
        const kuznechikKey = await deriveKeyFromSeed(seed, 1);
        return new KeyChain(ntrupKeys, aesKey, kuznechikKey);
    }

    /** Creates a KeyChain from a password and fingerprint using Argon2 */
    static async fromPass(password: Uint8Array, fingerprint: string, argonConfig: Argon2Config): Promise<KeyChain> {
        const seed = deriveArgon2Key(password, fingerprint, argonConfig);
        return KeyChain.fromSeed(seed);
    }

    /** Creates a KeyChain from a byte array */
    static async fromBytes(bytes: Uint8Array): Promise<KeyChain> {
        if (bytes.length !== KEYCHAIN_BYTES_SIZE) {
            throw new Error('Invalid byte length');
        }
        const pkBytes = bytes.slice(0, PUBLICKEYS_BYTES);
        const skBytes = bytes.slice(PUBLICKEYS_BYTES, PUBLICKEYS_BYTES + SECRETKEYS_BYTES);
        const aesKey = bytes.slice(PUBLICKEYS_BYTES + SECRETKEYS_BYTES, KEYCHAIN_BYTES_SIZE);

        const pk = PubKey.import(pkBytes, NTRU_CONFIG); 
        const sk = PrivKey.import(skBytes, NTRU_CONFIG); 
        const kuznechikKey = await deriveKeyFromSeed(aesKey, 1);

        return new KeyChain({ pk, sk }, aesKey, kuznechikKey);
    }

    /** Serializes the KeyChain to a byte array */
    toBytes(): Uint8Array {
        const pkBytes = this.ntrupKeys.pk.toBytes(NTRU_CONFIG);
        const skBytes = this.ntrupKeys.sk.toBytes(NTRU_CONFIG);
        const aesKey = this.aesKey;

        const res = new Uint8Array(KEYCHAIN_BYTES_SIZE);
        res.set(pkBytes, 0);
        res.set(skBytes, PUBLICKEYS_BYTES);
        res.set(aesKey, PUBLICKEYS_BYTES + SECRETKEYS_BYTES);
        return res;
    }

    /** Encrypts data using the specified cipher order */
    async encrypt(plaintext: Uint8Array, options: CipherOrders[]): Promise<Uint8Array> {
        let data = plaintext;
        for (const o of options) {
            switch (o) {
                case CipherOrders.AESGCM256:
                    data = await aesGcmEncrypt(this.aesKey, data);
                    break;
                case CipherOrders.KUZNECHIK:
                    data = kuznechikEncrypt(this.kuznechikKey, data);
                    break;
                case CipherOrders.NTRUP1277:
                    data = ntruEncrypt(this.ntrupKeys.pk, data);
                    break;
            }
        }
        return data;
    }

    /** Decrypts data using the specified cipher order (reversed) */
    async decrypt(ciphertext: Uint8Array, options: CipherOrders[]): Promise<Uint8Array> {
        let data = ciphertext;
        for (const o of options.slice().reverse()) {
            switch (o) {
                case CipherOrders.AESGCM256:
                    data = await aesGcmDecrypt(this.aesKey, data);
                    break;
                case CipherOrders.KUZNECHIK:
                    data = await kuznechik_decrypt(this.kuznechikKey, data);
                    break;
                case CipherOrders.NTRUP1277:
                    data = await ntruDecrypt(this.ntrupKeys.sk, data);
                    break;
            }
        }
        return data;
    }

    /** Generates an encrypted proof from a seed */
    async makeProof(seed: Uint8Array, options: CipherOrders[]): Promise<Uint8Array> {
        return this.encrypt(seed, options);
    }

    /** Verifies and retrieves the original seed from an encrypted proof */
    async getProof(cipherProof: Uint8Array, options: CipherOrders[]): Promise<Uint8Array> {
        return this.decrypt(cipherProof, options);
    }
}
