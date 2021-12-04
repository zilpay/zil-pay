/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import Jazzicon from '@metamask/jazzicon';

export function jsNumberForAddress(address: string) {
  const addr = address.slice(2, 10);

  return parseInt(addr, 16);
}

export function jazziconCreate(id: string, address: string) {
  const ctx = window.document.getElementById(id);

  if (!ctx) {
    return null;
  }

  const el = Jazzicon(30, jsNumberForAddress(address));

  if (ctx.children.length > 0) {
    ctx.children[0].remove();
  }

  ctx.appendChild(el);
}
