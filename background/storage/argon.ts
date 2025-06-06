export class WalletArgon2Params {
  memory: number;
  iterations: number;
  threads: number;
  secret: string;

  constructor(data: Record<string, unknown>) {
    this.memory = data.memory as number;
    this.iterations = data.iterations as number;
    this.threads = data.threads as number;
    this.secret = data.secret as string;
  }
}
