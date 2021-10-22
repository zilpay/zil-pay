/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type { NetworkControl } from 'core/background/services/network';
import type { AccountController } from 'core/background/services/account';
import type { MinParams, StoredTx } from 'types/transaction';
import { BrowserStorage, buildObject } from 'lib/storage';
import { Fields } from 'config/fields';
import { NotificationsControl } from 'core/background/services/notifications';
import { Common } from 'config/common';

export class TransactionsController {
  #txns: StoredTx[] = [];
  #confirm: MinParams[] = [];
  readonly #network: NetworkControl;
  readonly #account: AccountController;

  public get transactions() {
    return this.#txns;
  }

  public get forConfirm() {
    return this.#confirm;
  }

  get #transactionsField() {
    if (this.#account.selectedAccount) {
      return `${Fields.TRANSACTIONS}/${this.#network.selected}/${this.#account.selectedAccount.base16}`;
    }

    return Fields.CONFIRM_TX;
  }

  get #confirmField() {
    if (this.#account.selectedAccount) {
      return `${Fields.CONFIRM_TX}/${this.#network.selected}/${this.#account.selectedAccount.base16}`;
    }

    return Fields.CONFIRM_TX;
  }

  constructor(network: NetworkControl, account: AccountController) {
    this.#network = network;
    this.#account = account;
  }

  public async addHistory(tx: StoredTx) {
    const newList = [tx, ...this.transactions];

    // Circumcision Array.
    newList.length = Common.MAX_TX_QUEUE;

    this.#txns = newList.filter(Boolean);

    await BrowserStorage.set(
      buildObject(this.#transactionsField, this.transactions)
    );
  }

  public async updateHistory(txns: StoredTx[]) {
    this.#txns = txns;
    await BrowserStorage.set(
      buildObject(this.#transactionsField, this.transactions)
    );
  }

  public async clearHistory() {
    this.#txns = [];
    await BrowserStorage.set(
      buildObject(this.#transactionsField, this.transactions)
    );
  }

  public async clearConfirm() {
    this.#confirm = [];

    await BrowserStorage.set(
      buildObject(this.#confirmField, this.forConfirm)
    );

    NotificationsControl.counter(this.#confirm.length);
  }

  public async addConfirm(tx: MinParams) {
    this.#confirm.push(tx);
    NotificationsControl.counter(this.#confirm.length);
    await BrowserStorage.set(
      buildObject(this.#confirmField, this.forConfirm)
    );
  }

  public async rmConfirm(index: number) {
    delete this.#confirm[index];

    this.#confirm = this.#confirm.filter(Boolean);
    NotificationsControl.counter(this.#confirm.length);

    await BrowserStorage.set(
      buildObject(this.#confirmField, this.forConfirm)
    );
  }

  public async resetNonce(nonce: number) {
    this.#txns = this.#txns.map((t) => ({
      ...t,
      nonce
    }));

    await BrowserStorage.set(
      buildObject(this.#transactionsField, this.transactions)
    );
  }

  public async sync() {
    if (!this.#account.selectedAccount) {
      return null;
    }

    const txnsJson = await BrowserStorage.get(this.#transactionsField);
    const confirmJson = await BrowserStorage.get(this.#confirmField);

    try {
      if (!txnsJson) {
        throw new Error();
      }
      const txns = JSON.parse(String(txnsJson));

      this.#txns = txns;
    } catch {
      ////
    }

    try {
      if (confirmJson) {
        this.#confirm = JSON.parse(String(confirmJson));
      }
    } catch {
      ////
    }

    NotificationsControl.counter(this.#confirm.length);
  }

}
