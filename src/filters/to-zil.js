import { units } from '@zilliqa-js/util'

export function toZIL(value) {
  return units
    .toQa(value, units.Units.Zil)
    .toString()
}
