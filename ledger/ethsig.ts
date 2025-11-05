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

  static fromHex(fullHex: string): EthSignature {
    const hex = fullHex.startsWith(HEX_PREFIX) ? fullHex.slice(2) : fullHex;
    if (hex.length !== 130) {
      throw new Error(`Invalid signature length: expected 130 hex chars, got ${hex.length}`);
    }
    const r = hex.slice(0, 64);
    const s = hex.slice(64, 128);
    const vHex = hex.slice(128);
    const v = parseInt(vHex, 16);
    return new EthSignature(v, r, s);
  }
}
