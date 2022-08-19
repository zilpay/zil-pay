/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import assert from 'assert';
import { ec } from 'elliptic';
import { Buffer } from 'buffer';
import { Signature } from './signature';
import hashjs from 'hash.js';
import DRBG from 'hmac-drbg';
import BN from 'bn.js';
import { getPubKeyFromPrivateKey } from 'lib/utils/address';
import { randomBytes } from './random';
import { ErrorMessages } from 'config/errors';

// Public key is a point (x, y) on the curve.
// Each coordinate requires 32 bytes.
// In its compressed form it suffices to store the x co-ordinate
// and the sign for y.
// Hence a total of 33 bytes.
const PUBKEY_COMPRESSED_SIZE_BYTES = 33;
// Personalization string used for HMAC-DRBG instantiation.
const ALG = Buffer.from('Schnorr+SHA256  ', 'ascii');
// The length in bytes of the string above.
const ALG_LEN = 16;
// The length in bytes of entropy inputs to HMAC-DRBG
const ENT_LEN = 32;

/**
 * Instantiate an HMAC-DRBG.
 *
 * @param {Buffer} msg - used as nonce
 *
 * @returns {DRBG}
 */
const getDRBG = (msg: Buffer): DRBG => {
  const entropy = randomBytes(ENT_LEN);
  const pers = Buffer.allocUnsafe(ALG_LEN + ENT_LEN);

  Buffer.from(randomBytes(ENT_LEN)).copy(pers, 0);
  ALG.copy(pers, ENT_LEN);

  return new DRBG({
    hash: hashjs.sha256,
    entropy,
    nonce: msg,
    pers
  });
};

export class SchnorrControl {
  private _secp256k1 = new ec('secp256k1');
  private _curve = this._secp256k1.curve;
  private _privateKey: string;
  private _publicKey: string;

  constructor(privateKey: string) {
    this._privateKey = privateKey;
    this._publicKey = getPubKeyFromPrivateKey(this._privateKey);
  }

  public getSignature(msg: Buffer) {
    const sig = this._sign(
      msg,
      Buffer.from(this._privateKey, 'hex'),
      Buffer.from(this._publicKey, 'hex')
    );

    let r = sig.r.toString('hex');
    let s = sig.s.toString('hex');

    while (r.length < 64) {
      r = '0' + r;
    }

    while (s.length < 64) {
      s = '0' + s;
    }

    return r + s;
  }

  private _hash(q: BN, pubkey: Buffer, msg: Buffer) {
    const sha256 = hashjs.sha256();
    // 33 q + 33 pubkey + variable msgLen.
    const totalLength = PUBKEY_COMPRESSED_SIZE_BYTES * 2 + msg.byteLength;
    const Q = q.toArrayLike(Buffer, 'be', 33);
    const B = Buffer.allocUnsafe(totalLength);

    Q.copy(B, 0);
    pubkey.copy(B, 33);
    msg.copy(B, 66);

    return new BN(sha256.update(B).digest('hex'), 16);
  }

  private _sign(msg: Buffer, privKey: Buffer, pubKey: Buffer): Signature {
    const prv = new BN(privKey);
    const drbg = getDRBG(msg);
    const len = this._curve.n.byteLength();

    let sig: Signature;
    while (!sig) {
      const k = new BN(drbg.generate(len));
      sig = this._trySign(msg, k, prv, pubKey);
    }

    return sig;
  }

  private _trySign(msg: Buffer, k: BN, privKey: BN, pubKey: Buffer) {
    assert(!privKey.isZero(), ErrorMessages.BadPrivateKey);
    assert(!privKey.gte(this._curve.n), ErrorMessages.BadPrivateKey);

    // 1a. check that k is not 0
    if (k.isZero() || k.gte(this._curve.n)) {
      return null;
    }

    // 2. Compute commitment Q = kG, where g is the base point
    const Q = this._curve.g.mul(k);
    // convert the commitment to octets first
    const compressedQ = new BN(Q.encodeCompressed());

    // 3. Compute the challenge r = H(Q || pubKey || msg)
    // mod reduce the r value by the order of secp256k1, n
    const r = this._hash(compressedQ, pubKey, msg).umod(this._curve.n);
    const h = r.clone();

    if (h.isZero()) {
      return null;
    }

    // 4. Compute s = k - r * prv
    // 4a. Compute r * prv
    let s = h.imul(privKey).umod(this._curve.n);
    // 4b. Compute s = k - r * prv mod n
    s = k.isub(s).umod(this._curve.n);

    if (s.isZero()) {
      return null;
    }

    return new Signature({ r, s });
  }
}
