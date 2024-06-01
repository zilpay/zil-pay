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
 let ref = globalThis.document.querySelector<HTMLLinkElement>('link[rel*=\'icon\']');

 if (!ref) {
  throw new Error('app favicon is required');
 }

 return ref.href;
}
