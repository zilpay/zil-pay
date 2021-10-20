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
  private readonly _zilliqa: ZilliqaControl;
  private readonly _netwrok: NetworkControl;
  private readonly _transactions: TransactionsController;

  constructor(
    zilliqa: ZilliqaControl,
    netwrok: NetworkControl,
    transactions: TransactionsController
  ) {
    this._zilliqa = zilliqa;
    this._transactions = transactions;
    this._netwrok = netwrok;
  }

  public async checkProcessedTx() {
    const list =  this._transactions.transactions;
    const now = new Date().getTime();
    const dilaySeconds = 5000;
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
        const result = await this._zilliqa.getTransactionStatus(element.hash);

        switch (result.status) {
          case StatusCodes.Confirmed:
            break;
          case StatusCodes.Pending:
            break;
          case StatusCodes.PendingAwait:
            break;
          default:
            element.status = result.status;
            element.confirmed = true;
            element.success = result.success;
            element.nonce = 0;
            element.info = result.status; // test
            rejectAll = {
              info: element.info,
              status: result.status
            };
        }
      } catch (err) {
        if ((now - element.timestamp) > dilaySeconds) {
          element.status = 0;
          element.confirmed = true;
          element.success = false;
          element.nonce = 0;
          element.info = `node_status_0`;
          rejectAll = {
            info: element.info,
            status: element.status
          };
          this._makeNotify(element.type, element.hash, element.info);
        }
      }
    }
  }

  private _makeNotify(title: string, hash: string, message: string) {
    const url = viewTransaction(hash, this._netwrok.selected);
    new NotificationsControl(
      url,
      title,
      message
    );
  }
}