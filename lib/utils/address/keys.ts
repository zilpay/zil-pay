/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import sha256 from 'hash.js/lib/hash/sha/256';
import EC from 'elliptic/lib/elliptic/ec';
import { ErrorMessages } from 'config/errors';
import { tohexString, toChecksumAddress, isByteString } from './hex';

const secp256k1 = new EC('secp256k1');

export const getAddressFromPublicKey = (publicKey: string) => {
  const pub = tohexString(publicKey);
  const hash = sha256()
    .update(pub, 'hex')
    .digest('hex')
    .slice(24);

  return toChecksumAddress(hash);
};

/**
 * getPubKeyFromPrivateKey
 *
 * takes a hex-encoded string (private key) and returns its corresponding
 * hex-encoded 33-byte public key.
 *
 * @param {string} privateKey
 * @returns {string}
 */
 export const getPubKeyFromPrivateKey = (privateKey: string) => {
  const normalizedPrviateKey = tohexString(privateKey);
  const keyPair = secp256k1.keyFromPrivate(normalizedPrviateKey, 'hex');

  return keyPair.getPublic(true, 'hex');
};

export const isPrivateKey = (privateKey: string) => {
  if (!isByteString(privateKey, 64)) {
    throw new Error(ErrorMessages.BadPrivateKey);
  }
};
