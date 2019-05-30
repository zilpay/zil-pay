import { units, BN } from '@zilliqa-js/util'


export default function(value, isRound=true) {
  const amount = units.fromQa(new BN(value), units.Units.Zil);
  if (isRound) {
    return Math.round(+amount * 1000) / 1000;
  } else {
    return amount;
  }
}