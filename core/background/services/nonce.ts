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

import assert from 'assert';
import { Common } from 'config/common';
import { ErrorMessages } from 'config/errors';

export class NonceController {
  readonly #zilliqa: ZilliqaControl;
  readonly #txns: TransactionsController;

  constructor(
    zilliqa: ZilliqaControl,
    transactions: TransactionsController
  ) {
    this.#zilliqa = zilliqa;
    this.#txns = transactions;
  }

  public async getNonce(account: Account) {
    const { nonce } = await this.#zilliqa.getBalance(account.base16);

    return nonce;
  }

  public async resetNonce(account: Account) {
    const result = await this.#zilliqa.getBalance(account.base16);

    await this.#txns.resetNonce(result.nonce);

    return result.nonce;
  }

  public calcNextNonce(fetchedNonce: number) {
    const list = this
      .#txns
      .transactions
      .filter((t) => !t.confirmed)
      .map((t) => t.nonce);
    assert(list.length <= Common.NONCE_DIFFICULTY, ErrorMessages.HightNonce);

    const maxNonce = Math.max.apply(Math, list);
    let currentNonce = fetchedNonce >= maxNonce ? fetchedNonce : maxNonce;

    return currentNonce + 1;
  }

  public async nextNonce(account: Account): Promise<number> {
    const { nonce } = await this.#zilliqa.getBalance(account.base16);
    return this.calcNextNonce(nonce);
  }
}
