import { ZILLIQA, ETHEREUM } from '../config/slip44';

export class DerivationPath {
  private slip44: number;
  private index: number;

  constructor(slip44: number, index: number) {
    this.slip44 = slip44;
    this.index = index;
  }

  public getPath(): string {
    return `m/44'/${this.slip44}'/0'/0/${this.index}`;
  }

  public getBasePath(): string {
    return `m/44'/${this.slip44}'/0'/0/`;
  }

  public getIndex(): number {
    return this.index;
  }

  public toString(): string {
    return this.getPath();
  }
}

