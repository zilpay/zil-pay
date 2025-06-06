import { Variant, Version, Config } from '@hicaru/argon2-pure.js';
import { APP_ID } from '../../config/argon2';
import { Argon2Config } from '../../crypto/argon2';
import { utils } from 'aes-js';

export class WalletArgon2Params {
  memory: number;
  iterations: number;
  threads: number;
  secret: string;

  get argonConfgi(): Argon2Config {
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
  }
}
