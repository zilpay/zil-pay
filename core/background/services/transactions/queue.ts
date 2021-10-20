/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2020 ZilPay
 */

import type { ZilliqaControl } from 'core/background/services/blockchain';
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

  public async checkProcessedTx() {
    const list =  this.#transactions.transactions;
    const now = new Date().getTime();
    const dilaySeconds = 30000;
    let rejectAll = null;

    for (let index = 0; index < list.length; index++) {
      const element = list[index];

      if (element.confirmed) {
        continue;
      }

      if (rejectAll) {
        element.info = rejectAll.info;
        element.status = rejectAll.status;
        element.confirmed = true;
        element.nonce = 0;

        continue;
      }

      try {
        const result = await this.#zilliqa.getTransactionStatus(element.hash);

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
            element.status = result.status;
            element.confirmed = true;
            element.success = result.success;
            continue;
          case StatusCodes.PendingAwait:
            element.status = result.status;
            element.confirmed = true;
            element.success = result.success;
            element.info = 'Transaction await to confirm.';
            this.#makeNotify(element.teg, element.hash, element.info);
            continue;
          default:
            element.status = result.status;
            element.confirmed = true;
            element.success = result.success;
            element.nonce = 0;
            element.info = `Transaction was rejected status is ${element.status}`;
            rejectAll = {
              info: element.info,
              status: result.status
            };
            this.#makeNotify(element.teg, element.hash, element.info);
            continue;
        }
      } catch (err) {
        if ((now - element.timestamp) > dilaySeconds) {
          element.status = 0;
          element.confirmed = true;
          element.success = false;
          element.nonce = 0;
          element.info = `Transaction rejected by timeout.`;
          rejectAll = {
            info: element.info,
            status: element.status
          };
          this.#makeNotify(element.teg, element.hash, element.info);
        }
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
