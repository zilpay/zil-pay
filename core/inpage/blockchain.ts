/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */

import type { HTTPProvider } from "./provider";
import type { Wallet } from './wallet';

export class Blockchain {
  #provider: HTTPProvider;
  #wallet: Wallet;

  constructor(provider: HTTPProvider, wallet: Wallet) {
    this.#provider = provider;
    this.#wallet = wallet;
  }

  /**
  * createTransaction
  *
  * Creates a transaction and polls the lookup node for a transaction
  * receipt. The transaction is considered to be lost if it is not confirmed
  * within the timeout period.
  *
  * @param {Transaction} tx
  * @param {number} maxAttempts - (optional) number of times to poll before timing out
  * @param {number} number - (optional) interval in ms
  * @returns {Promise<Transaction>} - the Transaction that has been signed and
  * broadcasted to the network.
  */
   async createTransaction(tx, priority = false) {
    const transaction = new Transaction(tx, priority)
    const result = await this.wallet.sign(transaction)

    return new Transaction(result)
  }
}
