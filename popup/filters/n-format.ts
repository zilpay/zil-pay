/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */

export function formatNumber(balance: number | string, currency?: string) {
  const locale = 'en';// navigator.language;
  let opt: Intl.NumberFormatOptions = {
    style: undefined,
    currency: undefined,
    maximumSignificantDigits: 5,
    notation: "compact"
  };

  if (currency) {
    opt.style = 'currency';
    opt.currency = currency;
  }
  return new Intl
    .NumberFormat(locale, opt)
    .format(Number(balance));
}
