import { toBech32Address } from '@zilliqa-js/crypto'

export default function (hex) {
  return toBech32Address(hex);
}