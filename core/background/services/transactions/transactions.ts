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
import type { BadgeControl } from 'core/background/services/badge';
import type { StoredTx, MessagePayload, TransactionForConfirm } from 'types/transaction';

import { BrowserStorage, buildObject } from 'lib/storage';
import { Fields } from 'config/fields';
import { Common } from 'config/common';

export class TransactionsController {
  #txns: StoredTx[] = [];
  #confirm: TransactionForConfirm[] = [];
  #message?: MessagePayload;
  readonly #network: NetworkControl;
  readonly #account: AccountController;
  readonly #badge: BadgeControl;

  public get transactions() {
    return this.#txns;
  }

  public get forConfirm() {
    return this.#confirm;
  }

  public get message() {
    return this.#message;
  }

  get #transactionsField() {
    if (this.#account.selectedAccount) {
      return `${Fields.TRANSACTIONS}/${this.#network.selected}/${this.#account.selectedAccount.base16}`;
    }

    return Fields.CONFIRM_TX;
  }

  get #confirmField() {
    return `${Fields.CONFIRM_TX}/${this.#network.selected}`;
  }

  constructor(network: NetworkControl, account: AccountController, badge: BadgeControl) {
    this.#badge = badge;
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
  }

  public async addConfirm(params: TransactionForConfirm) {
    this.#confirm.push(params);
    await BrowserStorage.set(
      buildObject(this.#confirmField, this.forConfirm)
    );
    await this.#badge.increase();
  }

  public async addMessage(message: MessagePayload) {
    this.#message = message;

    await BrowserStorage.set(
      buildObject(Fields.CONFIRM_MESSAGE, this.message)
    );
    await this.#badge.increase();
  }

  public async rmMessage() {
    this.#message = undefined;

    await BrowserStorage.rm(Fields.CONFIRM_MESSAGE);
    await this.#badge.decrease();
  }

  public async rmConfirm(index: number) {
    delete this.#confirm[index];

    this.#confirm = this.#confirm.filter(Boolean);

    await BrowserStorage.set(
      buildObject(this.#confirmField, this.forConfirm)
    );
    await this.#badge.decrease();
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
      this.#txns = JSON.parse(String(txnsJson));
    } catch (err) {
      this.#txns = [];
    }

    try {
      if (confirmJson) {
        this.#confirm = JSON.parse(String(confirmJson));
      }
    } catch (err) {
      this.#confirm = [];
    }
  }
}
