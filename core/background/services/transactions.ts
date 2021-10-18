/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type { NetworkControl } from './network';
import type { AccountController } from './account/account';
import type { TxParams } from 'types/transaction';
import { BrowserStorage, buildObject } from 'lib/storage';
import { Fields } from 'config/fields';
import { NotificationsControl } from './notifications'; 

export class TransactionsController {
  private _txns: TxParams[] = [];
  private _confirm: TxParams[] = [];
  private readonly _network: NetworkControl;
  private readonly _account: AccountController;

  public get transactions() {
    return this._txns;
  }

  public get forConfirm() {
    return this._confirm;
  }

  private get _transactionsField() {
    return `${Fields.TRANSACTIONS}/${this._network.selected}/${this._account.selectedAccount.base16}`;
  }

  private get _confirmField() {
    return `${Fields.CONFIRM_TX}/${this._network.selected}/${this._account.selectedAccount.base16}`;
  }

  constructor(network: NetworkControl, account: AccountController) {
    this._network = network;
    this._account = account;
  }

  public async addHistory(tx: TxParams) {
    this._txns.push(tx);
    await BrowserStorage.set(
      buildObject(this._transactionsField, this.transactions)
    );
  }

  public async clearHistory() {
    this._txns = [];
    await BrowserStorage.set(
      buildObject(this._transactionsField, this.transactions)
    );
  }

  public async clearConfirm() {
    this._confirm = [];

    await BrowserStorage.set(
      buildObject(this._confirmField, this.forConfirm)
    );

    NotificationsControl.counter(this._confirm.length);
  }

  public async addConfirm(tx: TxParams) {
    this._confirm.push(tx);
    NotificationsControl.counter(this._confirm.length);
    await BrowserStorage.set(
      buildObject(this._confirmField, this.forConfirm)
    );
  }

  public async rmConfirm(index: number) {
    delete this._confirm[index];

    this._confirm = this._confirm.filter(Boolean);
    NotificationsControl.counter(this._confirm.length);

    await BrowserStorage.set(
      buildObject(this._confirmField, this.forConfirm)
    );
  }

  public async sync() {
    const txnsJson = await BrowserStorage.get(this._transactionsField);
    const confirmJson = await BrowserStorage.get(this._confirmField);

    try {
      if (!txnsJson) {
        throw new Error();
      }
      const txns = JSON.parse(String(txnsJson));

      this._txns = txns;
    } catch {
      await BrowserStorage.set(
        buildObject(this._transactionsField, this.transactions)
      );
    }

    try {
      if (!confirmJson) {
        throw new Error();
      }
      const txnsForConfirm = JSON.parse(String(confirmJson));

      this._confirm = txnsForConfirm;

      NotificationsControl.counter(this._confirm.length);
    } catch {
      await BrowserStorage.set(
        buildObject(this._confirmField, this.forConfirm)
      );
    }
  }

}
