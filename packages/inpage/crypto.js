import * as bytes from '@zilliqa-js/util/dist/bytes'
import * as units from '@zilliqa-js/util/dist/unit'
import { BN, Long } from '@zilliqa-js/util/dist/index'
import {
  isAddress,
  isBech32,
  isBN,
  isLong,
  isString
} from '@zilliqa-js/util/dist/validation'
import {
  toChecksumAddress,
  isValidChecksumAddress,
  normaliseAddress
} from '@zilliqa-js/crypto/dist/util'
import { fromBech32Address, toBech32Address } from '@zilliqa-js/crypto/dist/bech32'

export class Validator {
  constructor() {
    this.isAddress = isAddress
    this.isBech32 = isBech32
    this.isBN = isBN
    this.isLong = isLong
    this.isString = isString
  }
}

export class CryptoUtils {

  constructor() {
    this.fromBech32Address = fromBech32Address
    this.toBech32Address = toBech32Address
    this.isValidChecksumAddress = isValidChecksumAddress
    this.toChecksumAddress = toChecksumAddress
    this.normaliseAddress = normaliseAddress
  }

  toHex(sum) {
    return String(sum).replace('0x', '').toLowerCase()
  }
}

export class ZilliqaUtils {
  constructor() {
    this.validation = new Validator()

    this.bytes = bytes
    this.units = units

    this.BN = BN
    this.Long = Long
  }
}
