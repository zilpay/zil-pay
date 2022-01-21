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
import type { TransactionParams, TxParams } from "types/transaction";

import assert from 'assert';
import { Transaction } from './transaction';
import { CryptoUtils } from "./crypto";
import { RPCMethod } from 'config/methods';
import { ErrorMessages } from "config/errors";

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

    return new Transaction(result as TxParams);
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
    assert(Boolean(hash), `hash ${ErrorMessages.RequiredParam}`);
    const fixedhash = CryptoUtils.toHex(hash);

    const { error, result } = await this.#provider.send(
      RPCMethod.GetTransaction,
      String(fixedhash)
    );

    assert(Boolean(result), String(error));

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

  public getTransactionsForTxBlockEx(txBlock: number, page: number) {
    assert(!isNaN(page), `page ${ErrorMessages.ShouldBeNumber}`);
    assert(!isNaN(txBlock), `txBlock ${ErrorMessages.ShouldBeNumber}`);
    return this.#provider.send(
      RPCMethod.GetTransactionsForTxBlockEx,
      String(txBlock),
      String(page)
    );
  }

  public getTxnBodiesForTxBlockEx(block: number, page: number) {
    assert(!isNaN(page), `page ${ErrorMessages.ShouldBeNumber}`);
    assert(!isNaN(block), `block ${ErrorMessages.ShouldBeNumber}`);

    return this.#provider.send(
      RPCMethod.GetTxnBodiesForTxBlockEx,
      String(block),
      String(page)
    );
  }

  public getTxnBodiesForTxBlock(block: number) {
    assert(!isNaN(block), `block ${ErrorMessages.ShouldBeNumber}`);
    return this.#provider.send(RPCMethod.GetTxnBodiesForTxBlock, String(block));
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
    assert(!isNaN(blockNum), `blockNum ${ErrorMessages.ShouldBeNumber}`);

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
    assert(!isNaN(max), `max ${ErrorMessages.ShouldBeNumber}`);

    return this.#provider.send(RPCMethod.DSBlockListing, String(max));
  }

  /**
   * getTxBlock
   *
   * Get details of a Transaction block by block number.
   */
  public getTxBlock(blockNum: number) {
    assert(!isNaN(blockNum), `blockNum ${ErrorMessages.ShouldBeNumber}`);

    return this.#provider.send(RPCMethod.GetTxBlock, String(blockNum));
  }

  /**
   * getLatestTxBlock
   *
   * Get details of the most recent Transaction block.
   */
  public getLatestTxBlock() {
    return this.#provider.send(RPCMethod.GetLatestTxBlock);
  }

  /**
   * getNumTxBlocks
   *
   * Gets the total number of TxBlocks.
   */
  public getNumTxBlocks() {
    return this.#provider.send(RPCMethod.GetNumTxBlocks);
  }

  /**
   * getTxBlockRate
   *
   * Gets the average number of Tx blocks per second.
   */
  public getTxBlockRate() {
    return this.#provider.send(RPCMethod.GetTxBlockRate);
  }

  /**
   * getTxBlockListing
   *
   * Get a paginated list of Transaction blocks. Takes a page number as
   * parameter, where each page contains a list of 10 blocks (max). Returns
   * a maxPages variable that specifies the max number of pages. 1 - latest
   * blocks, maxPages - oldest blocks.
   */
  public getTxBlockListing(max: number) {
    assert(!isNaN(max), `max ${ErrorMessages.ShouldBeNumber}`);

    return this.#provider.send(RPCMethod.TxBlockListing, String(max));
  }

  /**
   * getNumTransactions
   *
   * Gets the number of transactions processed by the network so far.
   */
  public getNumTransactions() {
    return this.#provider.send(RPCMethod.GetNumTransactions);
  }

  /**
   * getTransactionRate
   *
   * Gets the number of transactions processed per second
   */
  public getTransactionRate() {
    return this.#provider.send(RPCMethod.GetTransactionRate);
  }

  /**
   * getCurrentMiniEpoch
   *
   * Gets the current Tx Epoch.
   */
  public getCurrentMiniEpoch() {
    return this.#provider.send(RPCMethod.GetCurrentMiniEpoch);
  }

  /**
   * getCurrentDSEpoch
   *
   * Gets the current DS Epoch.
   */
  public getCurrentDSEpoch() {
    return this.#provider.send(RPCMethod.GetCurrentDSEpoch);
  }

  /**
   * getPrevDifficulty
   *
   * Gets shard difficulty for previous PoW round
   */
  public getPrevDifficulty() {
    return this.#provider.send(RPCMethod.GetPrevDifficulty);
  }

  /**
   * getPrevDSDifficulty
   *
   * Gets DS difficulty for previous PoW round
   */
  public getPrevDSDifficulty() {
    return this.#provider.send(RPCMethod.GetPrevDSDifficulty);
  }

  /**
   * getTotalCoinSupply
   *
   * Returns the total supply (ZIL) of coins in the network.
   */
  public getTotalCoinSupply() {
    return this.#provider.send(RPCMethod.GetTotalCoinSupply);
  }

  /**
   * getMinerInfo
   *
   * Returns the mining nodes (i.e., the members of the DS committee and shards) at the specified DS block.
   *
   * Notes:
   * 1. Nodes owned by Zilliqa Research are omitted.
   * 2. dscommittee has no size field since the DS committee size is fixed for a given chain.
   * 3. For the Zilliqa Mainnet, this API is only available from DS block 5500 onwards.
   */
  public getMinerInfo(dsBlockNumber: number) {
    assert(!isNaN(dsBlockNumber), `dsBlockNumber ${ErrorMessages.ShouldBeNumber}`);
    return this.#provider.send(RPCMethod.GetMinerInfo, String(dsBlockNumber));
  }

  /**
   * getNumTxnsTxEpoch
   *
   * Gets the number of transactions procesed for a given Tx Epoch.
   */
  public getNumTxnsTxEpoch(epoch: number) {
    assert(!isNaN(epoch), `epoch ${ErrorMessages.ShouldBeNumber}`);

    return this.#provider.send(RPCMethod.GetNumTxnsTxEpoch, String(epoch));
  }

  /**
   * getNumTxnsDSEpoch
   *
   * Gets the number of transactions procesed for a given DS Epoch.
   */
  public getNumTxnsDSEpoch(epoch: number) {
    assert(!isNaN(epoch), `epoch ${ErrorMessages.ShouldBeNumber}`);

    return this.#provider.send(RPCMethod.GetNumTxnsDSEpoch, String(epoch));
  }

  /**
   * getMinimumGasPrice
   *
   * Gets the numeric minimum gas price
   */
  public getMinimumGasPrice() {
    return this.#provider.send(RPCMethod.GetMinimumGasPrice);
  }

  /**
   * *@deprecated
   * getPendingTxn
   * See the pending status of transaction
   */
  public getPendingTxn(hash: string) {
    console.warn('Method "getPendingTxn" is deprecated and will be disabled');
    assert(Boolean(hash), `hash ${ErrorMessages.RequiredParam}`);
    const fixedhash = CryptoUtils.toHex(hash);
    return this.#provider.send(RPCMethod.GetPendingTxn, fixedhash);
  }

  /**
   * getPendingTxns
   *@deprecated
   * Returns the pending status of all unvalidated Transactions.
   *
   * For each entry, the possible results are:
   *
   * confirmed	code	     info
   * false	     0	  Txn not pending
   * false	     1	  Nonce too high
   * false	     2	  Could not fit in as microblock gas limit reached
   * false	     3	  Transaction valid but consensus not reached
   */
  public getPendingTxns() {
    console.warn('Method "GetPendingTxns" is deprecated and will be disabled');
    return this.#provider.send(RPCMethod.GetPendingTxns);
  }

  /**
   * getBalance
   *
   * Gets the balance of an account by address
   */
   public getBalance(addr: string) {
    assert(Boolean(addr), `addr ${ErrorMessages.RequiredParam}`);

    const address = CryptoUtils.toHex(CryptoUtils.normaliseAddress(addr));

    return this.#provider.send(RPCMethod.GetBalance, address);
  }

  /**
   * getSmartContractCode - returns the smart contract code of a deployed contract.
   */
  public getSmartContractCode(addr: string) {
    assert(Boolean(addr), `addr ${ErrorMessages.RequiredParam}`);
    const address = CryptoUtils.toHex(CryptoUtils.normaliseAddress(addr));

    return this.#provider.send(RPCMethod.GetSmartContractCode, address);
  }

  /**
   * getSmartContractInit
   *
   * @param {string} address
   * @returns {Promise<RPCResponse<Value[], string>>}
   */
  public async getSmartContractInit(addr: string) {
    assert(Boolean(addr), `addr ${ErrorMessages.RequiredParam}`);

    const address = CryptoUtils.toHex(CryptoUtils.normaliseAddress(addr));

    return this.#provider.send(RPCMethod.GetSmartContractInit, address);
  }

  /**
   * getSmartContractState - retrieves the entire state of a smart contract
   */
  public getSmartContractState(addr: string) {
    assert(Boolean(addr), `addr ${ErrorMessages.RequiredParam}`);

    const address = CryptoUtils.toHex(CryptoUtils.normaliseAddress(addr))

    return this.#provider.send(RPCMethod.GetSmartContractState, address);
  }

  /**
   * getSmartContractSubState - Queries the contract state, filtered by the variable names.
   * This function is the filtered version of `getSmartContractState`.
   * As `getSubState` performs the filtering, `variableName` of a field is required.
   * If the `subState` is not found, this returns a `null` response.
   *
   * @param address - contract address.
   * @param variableName - variable name within the state
   * @param indices - (optional) If the variable is of map type, you can specify an index (or indices)
   */
  public getSmartContractSubState(addr: string, variableName: string, indices = []) {
    assert(Boolean(addr), `addr ${ErrorMessages.RequiredParam}`);
    assert(Boolean(variableName), `variableName ${ErrorMessages.RequiredParam}`);
    assert(Array.isArray(indices), 'indices must be array');

    const address = CryptoUtils.toHex(CryptoUtils.normaliseAddress(addr));

    return this.#provider.send(
      RPCMethod.GetSmartContractSubState,
      address,
      variableName,
      indices
    );
  }

  /**
   * getSmartContracts
   */
  public getSmartContracts(addr: string) {
    assert(Boolean(addr), `addr ${ErrorMessages.RequiredParam}`);

    const address = CryptoUtils.toHex(CryptoUtils.normaliseAddress(addr));

    return this.#provider.send(RPCMethod.GetSmartContracts, address);
  }

  /**
   * getContractAddressFromTransactionID
   */
  public getContractAddressFromTransactionID(hash: string) {
    assert(Boolean(hash), `hash ${ErrorMessages.RequiredParam}`);

    const fixedhash = CryptoUtils.toHex(hash);

    return this.#provider.send(RPCMethod.GetContractAddressFromTransactionID, fixedhash);
  }

  public getTransactionStatus(hash: string) {
    assert(Boolean(hash), `hash ${ErrorMessages.RequiredParam}`);

    const fixedhash = CryptoUtils.toHex(hash);

    return this.#provider.send(RPCMethod.GetTransactionStatus, fixedhash);
  }

  public getStateProof(addr: string, variableHash: string, txBlock: number) {
    assert(Boolean(addr), `addr ${ErrorMessages.RequiredParam}`);
    assert(Boolean(variableHash), `variableHash ${ErrorMessages.RequiredParam}`);
    assert(!isNaN(txBlock), `txBlock ${ErrorMessages.ShouldBeNumber}`);

    const fixedhash = CryptoUtils.toHex(variableHash);
    const address = CryptoUtils.toHex(CryptoUtils.normaliseAddress(addr));

    return this.#provider.send(
      RPCMethod.GetStateProof,
      address,
      fixedhash,
      [String(txBlock)]
    );
  }

  public getNetworkId() {
    return this.#provider.send(RPCMethod.GetNetworkId);
  }
}
