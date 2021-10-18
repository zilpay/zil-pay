/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type { Account } from 'types/account';
import type { ZilliqaControl } from './blockchain';
import type { TransactionsController } from './transactions';

export class NonceController {
  private _zilliqa: ZilliqaControl;
  private _txns: TransactionsController;

  constructor(
    zilliqa: ZilliqaControl,
    transactions: TransactionsController
  ) {
    this._zilliqa = zilliqa;
    this._txns = transactions;
  }

  public async getNonce(account: Account) {
    const { nonce } = await this._zilliqa.getBalance(account.base16);

    return nonce;
  }
}
