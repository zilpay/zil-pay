import type { Argon2Config } from '../../crypto/argon2';
import { Variant, Version, Config } from '@hicaru/argon2-pure.js';
import { APP_ID } from '../../config/argon2';
import { deriveArgon2Key } from '../../crypto/argon2';
import { utils } from 'aes-js';
import { ShaAlgorithms } from '../../config/pbkdf2';
import { KeyChain } from '../../crypto/keychain';

export enum HashTypes {
  Argon2,
  Pbkdf2,
}

export class WalletHashParams {
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
      utils.hex.toBytes(this.secret),
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
      secret: original.secret,
      iterations: original.timeCost,
      hashType: HashTypes.Argon2,
      hashSize: ShaAlgorithms.Sha512,
    });
  }

  static pq(): WalletHashParams {
    return new WalletHashParams({
      memory: 2097152, 
      threads: 2,
      secret: new Uint8Array(),
      iterations: 1,
      hashType: HashTypes.Argon2,
      hashSize: ShaAlgorithms.Sha512,
    });
  }


  constructor(data: Record<string, unknown>) {
    this.memory = data.memory as number;
    this.iterations = data.iterations as number;
    this.threads = data.threads as number;
    this.secret = data.secret as string;
    this.hashType = data.hashType as HashTypes;
    this.hashSize = data.hashSize as ShaAlgorithms;
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
}
