import * as bytes from '@zilliqa-js/util/dist/bytes'
import * as units from '@zilliqa-js/util/dist/unit'
import { BN, Long } from '@zilliqa-js/util/dist/index'
import {
  isAddress,
  isBech32,
  isBN,
  isLong
} from '@zilliqa-js/util/dist/validation'
import {
  toChecksumAddress,
  isValidChecksumAddress,
  normaliseAddress
} from '@zilliqa-js/crypto/dist/util'
import { fromBech32Address, toBech32Address } from '@zilliqa-js/crypto/dist/bech32'
import { AccessError, ERROR_MSGS } from './errors'

export class Validator {
  constructor() {
    this.isAddress = isAddress
    this.isBech32 = isBech32
    this.isBN = isBN
    this.isLong = isLong
  }

  isBase58() {
    throw new AccessError(ERROR_MSGS.DISABLE_DMETHOD)
  }
}

export class CryptoUtils {

  isValidChecksumAddress = isValidChecksumAddress
  fromBech32Address = fromBech32Address

  toHex(hexString) {
    return String(hexString).replace('0x', '').toLowerCase()
  }

  toBech32Address(address) {
    if (new Validator().isBech32(address)) {
      return address
    }

    return toBech32Address(address)
  }

  normaliseAddress(address) {
    if (new Validator().isAddress(address)) {
      address = this.toChecksumAddress(address)
    }

    return normaliseAddress(address)
  }

  toChecksumAddress(address) {
    if (new Validator().isBech32(address)) {
      address = this.fromBech32Address(address)
    }

    return toChecksumAddress(address)
  }

  decodeBase58() {
    throw new AccessError(ERROR_MSGS.DISABLE_DMETHOD)
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
