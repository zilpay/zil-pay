/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import BN from 'bn.js';
import sha256 from 'hash.js/lib/hash/sha/256';
import { ErrorMessages } from 'config/errors';

export function tohexString(hex: string) {
  return String(hex).toLowerCase().replace('0x', '');
}

export const isByteString = (str: string, len: number) => {
  return Boolean(tohexString(str).match(`^[0-9a-fA-F]{${len}}$`));
};

export const isAddress = (address: string) => {
  if (!isByteString(address, 40)) {
    throw new Error(ErrorMessages.Base16NotValid);
  }
};

export const toChecksumAddress = (address: string): string => {
  isAddress(address);

  address = tohexString(address);
  const hash = sha256()
    .update(address, 'hex')
    .digest('hex');
  const v = new BN(hash, 'hex', 'be');
  let ret = '0x';

  for (let i = 0; i < address.length; i++) {
    if ('0123456789'.indexOf(address[i]) !== -1) {
      ret += address[i];
    } else {
      ret += v.and(new BN(2).pow(new BN(255 - 6 * i))).gte(new BN(1))
        ? address[i].toUpperCase()
        : address[i].toLowerCase();
    }
  }

  return ret;
};

export const isBech32 = (raw: string) => {
  return !!raw.match(/^zil1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{38}$/);
};
