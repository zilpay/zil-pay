import { TypeOf } from '../../lib/types/checker';

interface SignatureOpt {
  r: string | bigint;
  s: string | bigint;
}

export class Signature {
  r: bigint;
  s: bigint;

  constructor(options: SignatureOpt) {
    this.r = this.#convertToBigInt(options.r);
    this.s = this.#convertToBigInt(options.s);
  }

  #convertToBigInt(value: string | bigint): bigint {
    return TypeOf.isString(value) ? BigInt('0x' + value) : value as bigint;
  }
}
