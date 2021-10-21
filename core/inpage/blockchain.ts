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
  public async getTransaction(hash: string): Promise<Transaction> {
    assert(Boolean(hash), 'hash is REQUIRED');
    const fixedhash = CryptoUtils.toHex(hash);

    const { error, result } = await this.#provider.send(
      RPCMethod.GetTransaction,
      String(fixedhash)
    );

    assert(Boolean(result), String(error['message']));

    return new Transaction(result as TransactionParams);
  }

  /**
   * getRecentTransactions
   *
   * Gets a list of recent transactions
   */
  public getRecentTransactions() {
    return this.#provider.send(RPCMethod.GetRecentTransactions);
  }

   /**
   * getTransactionsForTxBlock
   *
   * Gets all transactions for a given TxBlock, grouped by shard id
   */
  public getTransactionsForTxBlock(txBlock: number) {
    assert(!isNaN(txBlock), 'Txblock should be number');
    return this.#provider.send(
      RPCMethod.GetTransactionsForTxBlock,
      String(txBlock)
    );
  }

  /**
   * getBlockChainInfo
   */
  public getBlockChainInfo() {
    return this.#provider.send(RPCMethod.GetBlockchainInfo);
  }

  /**
   * getShardingStructure
   */
  public getShardingStructure() {
    return this.#provider.send(RPCMethod.GetShardingStructure);
  }

  /**
   * getDSBlock
   *
   * Get details of a Directory Service block by block number.
   */
  public getDSBlock(blockNum: number) {
    assert(!isNaN(blockNum), 'blockNum should be number');

    return this.#provider.send(RPCMethod.GetDSBlock, String(blockNum));
  }

  /**
   * getLatestDSBlock
   *
   * Get details of the most recent Directory Service block.
   */
  public getLatestDSBlock() {
    return this.#provider.send(RPCMethod.GetLatestDSBlock);
  }

  /**
   * getNumDSBlocks
   *
   * Gets the number of DS blocks that the network has processed.
   */
  public getNumDSBlocks() {
    return this.#provider.send(RPCMethod.GetNumDSBlocks);
  }

  /**
   * getDSBlockRate
   *
   * Gets the average rate of DS blocks processed per second
   */
  public getDSBlockRate() {
    return this.#provider.send(RPCMethod.GetDSBlockRate);
  }

  /**
   * getDSBlockListing
   *
   * Get a paginated list of Directory Service blocks. Pass in page number as
   * parameter. Returns a maxPages variable that specifies the max number of
   * pages. 1 - latest blocks, maxPages - oldest blocks.
   */
  public getDSBlockListing(max: number) {
    assert(!isNaN(max), 'max should be number');

    return this.#provider.send(RPCMethod.DSBlockListing, String(max));
  }
}
