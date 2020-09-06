import { validation } from '@zilliqa-js/util/dist/index'
import { fromBech32Address } from '@zilliqa-js/crypto/dist/bech32'

export function toNodeAddress(address) {
  if (!address) {
    throw new Error('address is undefind')
  }

  if (validation.isBech32(address)) {
    address = fromBech32Address(address)
  }

  return address.replace('0x', '').toLowerCase()
}
