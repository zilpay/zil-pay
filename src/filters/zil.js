import { units, BN } from '@zilliqa-js/util'


export function fromZil(value) {
  return units.fromQa(new BN(value), units.Units.Zil);
}

export function toQa(value) {
  return units.toQa(value, units.Units.Zil);
}
