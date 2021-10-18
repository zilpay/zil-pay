/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type { NetworkControl } from './network';
import type { TxParams } from 'types/transaction';
import { BrowserStorage, buildObject } from 'lib/storage';
import { Fields } from 'config/fields';
import { NotificationsControl } from './notifications'; 

export class TransactionsController {
  private _txns: TxParams[] = [];
  private _confirm: TxParams[] = [];
  private readonly _network: NetworkControl;

  public get transactions() {
    return this._txns;
  }

  public get forConfirm() {
    return this._confirm;
  }

  public get transactionsField() {
    return `${Fields.TRANSACTIONS}/${this._network.selected}`;
  }

  public get confirmField() {
    return `${Fields.CONFIRM_TX}/${this._network.selected}`;
  }

  constructor(
    network: NetworkControl
  ) {
    this._network = network;
  }

  public async addConfirm(tx: TxParams) {
    this._confirm.push(tx);
    NotificationsControl.counter(this._confirm.length);
    await BrowserStorage.set(
      buildObject(this.confirmField, this.forConfirm)
    );
  }

  public async rmConfirm(index: number) {
    delete this._confirm[index];

    this._confirm = this._confirm.filter(Boolean);
    NotificationsControl.counter(this._confirm.length);

    await BrowserStorage.set(
      buildObject(this.confirmField, this.forConfirm)
    );
  }

  public async reset() {
    this._txns = [];
    this._confirm = [];

    await BrowserStorage.set(
      buildObject(this.transactionsField, this.transactions),
      buildObject(this.confirmField, this.forConfirm)
    );

    NotificationsControl.counter(this._confirm.length);
  }

  public async sync() {
    const txnsJson = await BrowserStorage.get(this.transactionsField);
    const confirmJson = await BrowserStorage.get(this.confirmField);

    try {
      if (!txnsJson) {
        throw new Error();
      }
      const txns = JSON.parse(String(txnsJson));

      this._txns = txns;
    } catch {
      await BrowserStorage.set(
        buildObject(this.transactionsField, this.transactions)
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
        buildObject(this.confirmField, this.forConfirm)
      );
    }
  }

}
