import { Variant, Version, Config } from '@hicaru/argon2-pure.js';
import { APP_ID } from '../../config/argon2';
import { Argon2Config, deriveArgon2Key } from '../../crypto/argon2';
import { utils } from 'aes-js';
import { pbkdf2 } from '../../crypto/pbkdf2';
import { ShaAlgorithms } from '../../config/pbkdf2';
import { sha256 } from '../../crypto/sha256';

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

  constructor(data: Record<string, unknown>) {
    this.memory = data.memory as number;
    this.iterations = data.iterations as number;
    this.threads = data.threads as number;
    this.secret = data.secret as string;
    this.hashType = data.hashType as HashTypes;
    this.hashSize = data.hashSize as ShaAlgorithms;
  }

  async deriveKey(password: Uint8Array, salt: Uint8Array): Promise<Uint8Array> {
    if (this.hashType == HashTypes.Argon2) {
      return deriveArgon2Key(password, salt, this.argon2);      
    } else if(ShaAlgorithms.Sha512 == this.hashSize) {
      const key = await pbkdf2(
        password,
        salt,
        this.iterations,
        this.hashSize,
      );

      return await sha256(key);
    } else {
       return await sha256(password);
    }
  }
}
