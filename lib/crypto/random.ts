/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */

const QUOTA = 65536;

export function randomBytes(length: number): Uint8Array {
 const crypto = globalThis.crypto;
 const a = new Uint8Array(length);

 for (let i = 0; i < length; i += QUOTA) {
  crypto.getRandomValues(a.subarray(i, i + Math.min(length - i, QUOTA)));
 }

 return a;
};
