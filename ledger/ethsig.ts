import { HEX_PREFIX } from "lib/utils/hex";

export class EthSignature {
  constructor(
    public readonly v: number,
    public readonly r: string,
    public readonly s: string
  ) {}

  toHex(): string {
    const vHex = this.v.toString(16).padStart(2, '0');
    return `${HEX_PREFIX}${this.r}${this.s}${vHex}`;
  }
}
