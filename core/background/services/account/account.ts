/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type { Account, KeyPair, Wallet } from 'types/account';
import { Buffer } from 'buffer';
import assert from 'assert';
import { HDKey } from './hd-key';
import { MnemonicController } from './mnemonic';
import secp256k1 from 'secp256k1/elliptic';
import { getAddressFromPublicKey } from 'lib/utils/address';
import { getPubKeyFromPrivateKey } from 'lib/utils/address';
import { BrowserStorage, buildObject } from 'lib/storage';
import { Fields } from 'config/fields';
import { TypeOf } from 'lib/type/type-checker';
import { AccountTypes } from 'config/account-type';

export class AccountController {
  private _hdKey = new HDKey();
  private _mnemonic = new MnemonicController();
  private _wallet: Wallet = {
    selectedAddress: 0,
    identities: []
  };

  public get wallet() {
    return this._wallet;
  }

  public get lastIndexPrivKey() {
    return this._wallet
      .identities
      .filter((acc) => acc.type === AccountTypes.privateKey)
      .length;
  }

  public get lastIndexSeed() {
    return this._wallet
      .identities
      .filter((acc) => acc.type === AccountTypes.Seed)
      .length;
  }

  public get lastIndexLedger() {
    return this._wallet
      .identities
      .filter((acc) => acc.type === AccountTypes.Ledger)
      .length;
  }

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

  public async migrate() {
    
  }

  public async sync() {
    const list = await BrowserStorage.get(Fields.WALLET);
    const field0 = 'identities';
    const field1 = 'selectedAddress';

    if (!list || !TypeOf.isArray(list[field0]) || !TypeOf.isNumber(list[field1])) {
      await BrowserStorage.set(
        buildObject(Fields.WALLET, this._wallet)
      );

      return null;
    }

    this._wallet = {
      selectedAddress: list[field1],
      identities: list[field0]
    };
  }

  private _add(acc: Account) {}
}
