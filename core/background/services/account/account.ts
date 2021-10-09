/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type { ZilliqaControl } from 'core/background/services/blockchain';
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
  private readonly _hdKey = new HDKey();
  private readonly _mnemonic = new MnemonicController();
  private readonly _zilliqa: ZilliqaControl;
  private _wallet: Wallet = {
    selectedAddress: 0,
    identities: []
  };

  public get wallet() {
    return this._wallet;
  }

  public get selectedAccount(): undefined | Account {
    if (this.wallet.identities.length === 0) {
      return null;
    }
    if (!this.wallet.identities[this.wallet.selectedAddress]) {
      return null;
    }
    return this.wallet.identities[this.wallet.selectedAddress];
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

  constructor(zilliqa: ZilliqaControl) {
    this._zilliqa = zilliqa;
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

  public async migrate() {}

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

  private async _add(account: Account) {
    await this._checkAccount(account);

    this._wallet
      .identities
      .push(account);
    this._wallet
      .selectedAddress = this.wallet.identities.length - 1;

    await BrowserStorage.set(
      buildObject(Fields.WALLET, this._wallet)
    );

    return this.wallet;
  }

  private async _checkAccount(account: Account) {
    await this.sync();

    const isUnique = this.wallet.identities.some(
      (acc) => (acc.base16 === account.base16)
    );
    const isIndex = this.wallet.identities.some(
      (acc) => (acc.index === account.index) && (acc.type === account.type)
    );

    assert(!isUnique, 'Account must be unique');
    assert(!isIndex, 'Incorect index and account type');
  }
}
