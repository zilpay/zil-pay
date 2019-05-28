
import { units } from '@zilliqa-js/util'

export default function(value) {
  return units.toQa(value, units.Units.Zil).toString();
}