import {
  toBech32Address,
  toChecksumAddress
} from '@zilliqa-js/crypto'

import { ADDRESS_FORMAT_VARIANTS } from '@/config'


export function trim(string, length = 6) {
  let part0 = string.substr(0, length)
  let part1 = string.substr(length * -1)

  return `${part0}...${part1}`
}

export function toAddress(hex, format, isTrim = true) {
  let address

  try {
    switch (format) {
    case ADDRESS_FORMAT_VARIANTS.base16:
      address = toChecksumAddress(hex)
      break
    case ADDRESS_FORMAT_VARIANTS.bech32:
      address = toBech32Address(hex)
      break
    default:
      return null
    }
  } catch (err) {
    return null
  }

  if (isTrim) {
    address = trim(address)
  }

  return address
}

export default toAddress
