/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type { KeyPair } from 'types/account';
import { Buffer } from 'buffer';
import assert from 'assert';
import { HDKey } from './hd-key';
import { MnemonicController } from './mnemonic';
import secp256k1 from 'secp256k1/elliptic';
import { getAddressFromPublicKey } from 'lib/utils/address';
import { getPubKeyFromPrivateKey } from 'lib/utils/address';

export class AccountController {
  private _hdKey = new HDKey();
  private _mnemonic = new MnemonicController();

  public add(keyPair: KeyPair) {}

  public remove(index: number) {}

  public async fromSeed(words: string, index = 0): Promise<KeyPair> {
    const path = this._mnemonic.getKey(index);
    const seed = await this._mnemonic.mnemonicToSeed(words);
    const hdKey = this._hdKey.fromMasterSeed(seed);
    const childKey = hdKey.derive(path);

    return childKey.keyPair;
  }

  public fromPrivateKey(privateKey: string): KeyPair {
    const bytes = Buffer.from(privateKey, 'hex');

    assert.equal(bytes.length, 32, 'Private key must be 32 bytes.');
    assert(secp256k1.privateKeyVerify(bytes), 'Invalid private key');

    const pubKey = getPubKeyFromPrivateKey(privateKey);
    const base16 = getAddressFromPublicKey(pubKey);

    return {
      pubKey,
      base16,
      privKey: privateKey
    };
  }
}
