import { units, BN } from '@zilliqa-js/util'


export function fromZil(value) {
  const amount = units.fromQa(new BN(value), units.Units.Zil);
  return Math.round(+amount * 1000) / 1000;
}

export function toZil(value) {
  return units.toQa(value, units.Units.Zil).toString();
}

export function toQa(value) {
  return units.toQa(value, units.Units.Zil);
}

export function toUSD(value, rate) {
  if (isNaN(rate)) {
    throw new Error('rate is NaN');
  }
  if (value == 0) return 0;
  let zilAmount = +fromZil(value);
  let usdAmount = zilAmount * rate;
  return usdAmount.toFixed(4);
}
