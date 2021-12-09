/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2020 ZilPay
 */

import { Methods, ZilliqaControl } from 'core/background/services/blockchain';
import type { NetworkControl } from 'core/background/services/network';
import type { TransactionsController } from './transactions';

import { NotificationsControl } from 'core/background/services/notifications';
import { StatusCodes } from './statuses';
import { viewTransaction } from 'lib/block-explorer/view';

export class TransactionsQueue {
  readonly #zilliqa: ZilliqaControl;
  readonly #netwrok: NetworkControl;
  readonly #transactions: TransactionsController;

  constructor(
    zilliqa: ZilliqaControl,
    netwrok: NetworkControl,
    transactions: TransactionsController
  ) {
    this.#zilliqa = zilliqa;
    this.#transactions = transactions;
    this.#netwrok = netwrok;
  }

  public async checkProcessedTx(): Promise<void> {
    const list =  this.#transactions.transactions;
    const now = new Date().getTime();
    const dilaySeconds = 3000;

    const identities = list.filter((t) => {
      return !t.confirmed && (now - t.timestamp) > dilaySeconds;
    });
    if (identities.length === 0) {
      return null;
    }

    const requests = identities.map(({ hash }) => {
      return this.#zilliqa.provider.buildBody(
        Methods.GetTransactionStatus,
        [hash]
      );
    });
    let replies = await this.#zilliqa.sendJsonNative(...requests);

    if (!Array.isArray(replies)) {
      replies = [replies];
    }

    for (let index = 0; index < replies.length; index++) {
      const { error, result } = replies[index];
      const indicator = identities[index];
      const listIndex = list.findIndex((t) => t.hash === indicator.hash);
      const element = list[listIndex];

      if (error) {
        element.status = 0;
        element.confirmed = true;
        element.success = false;
        element.nonce = 0;
        element.info = String(error.message);
        this.#makeNotify(element.teg, element.hash, element.info);
        continue;
      }

      switch (result.status) {
        case StatusCodes.Confirmed:
          element.status = result.status;
          element.confirmed = true;
          element.success = result.success;
          element.nonce = result.nonce;
          element.info = 'Transaction was confirmed.';
          this.#makeNotify(element.teg, element.hash, element.info);
          continue;
        case StatusCodes.Pending:
          continue;
        case StatusCodes.PendingAwait:
          element.status = result.status;
          element.confirmed = true;
          element.success = result.success;
          element.nonce = result.nonce;
          element.info = 'Transaction await to confirm.';
          this.#makeNotify(element.teg, element.hash, element.info);
          continue;
        default:
          element.status = result.status;
          element.confirmed = true;
          element.success = result.success;
          element.nonce = 0;
          element.info = `Transaction was rejected status is ${element.status}`;
          this.#makeNotify(element.teg, element.hash, element.info);
          continue;
      }
    }
    await this.#transactions.updateHistory(list);
  }

  #makeNotify(title: string, hash: string, message: string) {
    const url = viewTransaction(hash, this.#netwrok.selected);
    new NotificationsControl(
      url,
      title,
      message
    ).create();
  }
}
