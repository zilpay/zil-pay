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
import assert from 'assert';
import { Transaction, TransactionParams } from './transaction';
import { CryptoUtils } from "./crypto";
import { RPCMethod } from 'config/methods';

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
  * broadcasted to the network.
  */
  public async createTransaction(params: TransactionParams, priority = false) {
    const transaction = new Transaction(params, priority);
    const result = await this.#wallet.sign(transaction);

    return new Transaction(result);
  }

  /**
   * getTransaction
   *
   * Retrieves a transaction from the blockchain by its hash. If the result
   * contains an Error, a rejected Promise is returned with the erorr message.
   * If it does not contained an error, but `receipt.success` is `false`, then
   * a rejected Transaction instance is returned.
   */
   async getTransaction(hash: string): Promise<Transaction> {
    assert(Boolean(hash), 'hash is REQUIRED');
    const fixedhash = CryptoUtils.toHex(hash);

    const { error, result } = await this.#provider.send(
      RPCMethod.GetTransaction,
      String(fixedhash)
    );

    assert(Boolean(result), String(error['message']));

    return new Transaction(result as TransactionParams);
  }
}
