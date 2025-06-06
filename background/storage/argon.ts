export class WalletArgon2Params {
  memory: number;
  iterations: number;
  threads: number;
  secret: string;

  constructor(data: {
    memory: number;
    iterations: number;
    threads: number;
    secret: string;
  }) {
    this.memory = data.memory;
    this.iterations = data.iterations;
    this.threads = data.threads;
    this.secret = data.secret;
  }
}
