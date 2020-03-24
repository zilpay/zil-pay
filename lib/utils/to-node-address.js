import { validation } from '@zilliqa-js/util'
import { fromBech32Address } from '@zilliqa-js/crypto'

export function toNodeAddress(address) {

  if (validation.isBech32(address)) {
    address = fromBech32Address(address)
  }

  return address.replace('0x', '').toLowerCase()
}
