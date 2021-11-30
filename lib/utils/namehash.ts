/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import sha256 from 'hash.js/lib/hash/sha/256';

const ZERO_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

export interface Parent {
  parent?: string;
  prefix?: boolean;
}

interface InputEnc {
  inputEnc?: string;
  outputEnc?: string;
  hexPrefix?: boolean;
}

function sha3(message: string, _a: InputEnc) {
  let _b = _a === void 0 ? {} : _a,
    _d = _b.inputEnc,
    inputEnc = _d === void 0 ? null : _d,
    _e = _b.outputEnc,
    outputEnc = _e === void 0 ? 'hex' : _e;

  return sha256()
    .update(message, inputEnc)
    .digest(outputEnc);
}

export function nameHash(name: string, p?: Parent) {
  if (name === void 0) {
    name = '';
  }

  let _b = p === void 0 ? {} : p,
    _c = _b.parent,
    parent = _c === void 0 ? null : _c, _d = _b.prefix,
    prefix = _d === void 0 ? true : _d;

  parent = parent || ZERO_HASH;

  if (parent.match(/^0x/)) {
      parent = parent.substring(2);
  }
  var address = [parent]
    .concat(name
    .split('.')
    .reverse()
    .filter((label) => label)
    .map((label) => sha3(label, { hexPrefix: false })))
    .reduce((a, labelHash) => {
      return sha3(a + labelHash, {
        hexPrefix: false,
        inputEnc: 'hex'
      });
    });
  return prefix ? '0x' + address : address;
}
