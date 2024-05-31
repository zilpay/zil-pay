/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */

/**
 * Get the favicon from current tab.
 */
 export function getFavicon() {
  try {
    return document.querySelector('link[rel*=\'icon\']')['href'];
  } catch (err) {
    return null;
  }
}
