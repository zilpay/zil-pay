import { units, BN } from '@zilliqa-js/util'


export default function (value) {
  return units.fromQa(new BN(value), units.Units.Zil);
}
