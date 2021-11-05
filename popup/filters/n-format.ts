/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */

export function formatNumber(balance: number | string, currency: string) {
  const locale = 'en'; // navigator.language;
  return new Intl.NumberFormat(locale, {
    currency,
    style: 'currency'
  }).format(Number(balance));
}
