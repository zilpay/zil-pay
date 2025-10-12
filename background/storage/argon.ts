import type { Argon2Config } from '../../crypto/argon2';
import { Variant, Version, Config } from '@hicaru/argon2-pure.js';
import { APP_ID, HashTypes } from '../../config/argon2';
import { deriveArgon2Key } from '../../crypto/argon2';
import { ShaAlgorithms } from '../../config/pbkdf2';
import { KeyChain } from '../../crypto/keychain';
import { hexToUint8Array, uint8ArrayToHex } from 'lib/utils/hex';

export interface IWalletHashParams {
  memory: number;
  iterations: number;
  threads: number;
  secret: string;
  hashType: HashTypes;
  hashSize: ShaAlgorithms;
}

export class WalletHashParams implements IWalletHashParams {
  memory: number;
  iterations: number;
  threads: number;
  secret: string;
  hashType: HashTypes;
  hashSize: ShaAlgorithms;

  get argon2(): Argon2Config {
    return new Config(
      APP_ID,
      64,
      this.threads,
      this.memory,
      hexToUint8Array(this.secret),
      this.iterations,
      Variant.Argon2id,
      Version.Version13,
    );
  }

  static default(): WalletHashParams {
    const original = Config.original();

    return new WalletHashParams({
      memory: original.memCost, 
      threads: original.lanes,
      secret: uint8ArrayToHex(original.secret),
      iterations: original.timeCost,
      hashType: HashTypes.Argon2,
      hashSize: ShaAlgorithms.Sha512,
    });
  }

  static pq(): WalletHashParams {
    return new WalletHashParams({
      memory: 2097152, 
      threads: 2,
      secret: uint8ArrayToHex(new Uint8Array()),
      iterations: 1,
      hashType: HashTypes.Argon2,
      hashSize: ShaAlgorithms.Sha512,
    });
  }


  constructor(data: IWalletHashParams) {
    this.memory = data.memory;
    this.iterations = data.iterations;
    this.threads = data.threads;
    this.secret = data.secret;
    this.hashType = data.hashType;
    this.hashSize = data.hashSize;
  }

  async deriveKey(password: Uint8Array, salt: Uint8Array): Promise<KeyChain> {
    if (this.hashType == HashTypes.Argon2) {
      const seed = deriveArgon2Key(password, salt, this.argon2);      
      return KeyChain.fromSeed(seed);
    } else if(ShaAlgorithms.Sha512 == this.hashSize) {
      return KeyChain.fromAesV3(password, this.hashSize, this.iterations);
    } else {
      return KeyChain.fromAesV2(password);
    }
  }

  toJSON(): IWalletHashParams {
    return {
      memory: this.memory,
      iterations: this.iterations,
      threads: this.threads,
      secret: this.secret,
      hashType: this.hashType,
      hashSize: this.hashSize,
    };
  }
}
