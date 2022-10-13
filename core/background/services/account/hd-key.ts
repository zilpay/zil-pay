/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import assert from 'assert';
import { Buffer } from 'buffer';
import sha256 from 'hash.js/lib/hash/sha/256';
import sha512 from 'hash.js/lib/hash/sha/512';
import { ripemd160 } from 'hash.js/lib/hash/ripemd';
import Hmac from 'hash.js/lib/hash/hmac';
import secp256k1 from 'secp256k1/elliptic';
import { getAddressFromPublicKey } from 'lib/utils/address';
import { ErrorMessages } from 'config/errors';

const MASTER_SECRET = 'Bitcoin seed';
const HARDENED_OFFSET = 0x80000000;

// Bitcoin hardcoded by default, can use package `coininfo` for others
const BITCOIN_VERSIONS = {
  private: 0x0488ADE4,
  public: 0x0488B21E
};

export class HDKey {
  #privateKey?: Uint8Array;
  #publicKey?: Buffer;
  #fingerprint = 0;
  #identifier?: Buffer;

  public parentFingerprint = 0;
  public chainCode?: Buffer | number[];
  public depth = 0;
  public index = 0;
  public versions: typeof BITCOIN_VERSIONS;

  public set privateKey(value: Uint8Array) {
    assert.equal(value.length, 32, ErrorMessages.PrivateKeyMustBe);
    assert(secp256k1.privateKeyVerify(value) === true, ErrorMessages.BadPrivateKey);

    this.#privateKey = value;
    this.#publicKey = Buffer.from(secp256k1.publicKeyCreate(value, true));
    this.#identifier = Buffer.from(this.#hash160(this.#publicKey));
    this.#fingerprint = this.#identifier.slice(0, 4).readUInt32BE(0);
  }

  public set publicKey(value: Buffer) {
    assert(value.length === 33 || value.length === 65, ErrorMessages.PublicKeyMustBe);
    assert(secp256k1.publicKeyVerify(value) === true, ErrorMessages.BadPubKey);

    // force compressed point
    this.#publicKey = Buffer.from(secp256k1.publicKeyConvert(value, true));
    this.#identifier = this.#hash160(this.publicKey);
    this.#fingerprint = this.#identifier.slice(0, 4).readUInt32BE(0);
    this.#privateKey = null;
  }

  public get keyPair() {
    const pubKey = this.publicKey.toString('hex');
    const privKey = this.privateKey.toString('hex');
    const base16 = getAddressFromPublicKey(pubKey);
    return {
      pubKey,
      privKey,
      base16
    };
  }

  public get publicKey() {
    return Buffer.from(this.#publicKey);
  }

  public get privateKey(): Buffer {
    return Buffer.from(this.#privateKey);
  }

  constructor(versions?: typeof BITCOIN_VERSIONS) {
    this.versions = versions || BITCOIN_VERSIONS;
  }

  public setChainCode(ir: Buffer | number[]) {
    this.chainCode = ir;
  }

  public derive(path: string) {
    if (path === 'm' || path === 'M' || path === "m'" || path === "M'") {
      return this;
    }
  
    const entries = path.split('/');
    let hdkey = this;

    for (let i = 0; i < entries.length; i++) {
      const c = entries[i];
      
      if (i === 0) {
        assert(/^[mM]{1}/.test(c), 'Path must start with "m" or "M"');
        continue;
      }
  
      const hardened = (c.length > 1) && (c[c.length - 1] === "'");
      let childIndex = parseInt(c, 10); // & (HARDENED_OFFSET - 1)

      assert(childIndex < HARDENED_OFFSET, 'Invalid index');

      if (hardened) {
        childIndex += HARDENED_OFFSET;
      }
  
      hdkey = hdkey.deriveChild(childIndex);
    }

    return hdkey;
  }

  public deriveChild(index: number) {
    const isHardened = index >= HARDENED_OFFSET;
    const indexBuffer = Buffer.allocUnsafe(4);

    indexBuffer.writeUInt32BE(index, 0);
  
    let data: Buffer;
  
    if (isHardened) { // Hardened child
      assert(this.privateKey, ErrorMessages.CouldNotDeriveHardened);
  
      let pk = Buffer.from(this.privateKey);
      let zb = Buffer.alloc(1, 0);
      pk = Buffer.concat([zb, pk]);
  
      // data = 0x00 || ser256(kpar) || ser32(index)
      data = Buffer.concat([pk, indexBuffer]);
    } else { // Normal child
      // data = serP(point(kpar)) || ser32(index)
      //      = serP(Kpar) || ser32(index)
      data = Buffer.concat([this.publicKey, indexBuffer]);
    }

    const I = Hmac(sha512, this.chainCode)
      .update(data)
      .digest();
    const IL = Uint8Array.from(I.slice(0, 32));
    const IR = Uint8Array.from(I.slice(32));
    const hd = new HDKey(this.versions);

    // Private parent key -> private child key
    if (this.privateKey) {
      // ki = parse256(IL) + kpar (mod n)
      try {
        hd.privateKey = Uint8Array.from(secp256k1.privateKeyTweakAdd(this.privateKey, IL));
        // throw if IL >= n || (privateKey + IL) === 0
      } catch (err) {
        // In case parse256(IL) >= n or ki == 0, one should proceed with the next value for i
        return this.deriveChild(index + 1);
      }
    // Public parent key -> public child key
    } else {
      // Ki = point(parse256(IL)) + Kpar
      //    = G*IL + Kpar
      try {
        hd.publicKey = Buffer.from(secp256k1.publicKeyTweakAdd(this.publicKey, IL, true))
        // throw if IL >= n || (g**IL + publicKey) is infinity
      } catch (err) {
        // In case parse256(IL) >= n or Ki is the point at infinity, one should proceed with the next value for i
        return this.deriveChild(index + 1);
      }
    }

    hd.chainCode = Buffer.from(IR);
    hd.depth = this.depth + 1;
    hd.parentFingerprint = this.#fingerprint; // .readUInt32BE(0)
    hd.index = index;
  
    return hd;
  }

  public fromMasterSeed(seedBuffer: Buffer, versions?: typeof BITCOIN_VERSIONS) {
    const I = Hmac(sha512, MASTER_SECRET)
      .update(seedBuffer)
      .digest()
    const IL = I.slice(0, 32);
    const IR = I.slice(32);  
    const hdkey = new HDKey(versions);

    hdkey.setChainCode(IR);
    hdkey.privateKey = Uint8Array.from(IL);
  
    return hdkey
  }

  #hash160(buf: Buffer) {
    const hash = sha256()
      .update(buf)
      .digest();
    return ripemd160()
      .update(hash)
      .digest();
  }
}
