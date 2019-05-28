import fromZil from './from-zil'

export default function(value, rate) {
  if (isNaN(rate)) {
    throw new Error('rate is NaN');
  }
  if (value == 0) return 0;
  let zilAmount = +fromZil(value);
  let usdAmount = zilAmount * +rate;
  return usdAmount.toFixed(4);
}