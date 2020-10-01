/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */

import HTTPProvider from './provider'
import { Transaction } from './transaction'
import Wallet from './wallet'
import { CryptoUtils } from './crypto'

import {
  ShouldArrayError,
  RPCError,
  InstanceError,
  ArgumentError,
  ERROR_MSGS
} from './errors'

const cryptoUtils = new CryptoUtils()

export class Blockchain {
  constructor(provider, wallet) {
    if (!(provider instanceof HTTPProvider)) {
      throw new InstanceError('provider', HTTPProvider)
    } else if (!(wallet instanceof Wallet)) {
      throw new InstanceError('wallet', Wallet)
    }

    this.provider = provider
    this.wallet = wallet
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

  /**
   * getTransaction
   *
   * Retrieves a transaction from the blockchain by its hash. If the result
   * contains an Error, a rejected Promise is returned with the erorr message.
   * If it does not contained an error, but `receipt.success` is `false`, then
   * a rejected Transaction instance is returned.
   *
   * @param {string} txHash
   * @returns {Promise<Transaction>}
   */
  async getTransaction(hash) {
    if (!hash) {
      throw new ArgumentError('hash', ERROR_MSGS.REQUIRED)
    }

    const fixedhash = cryptoUtils.toHex(hash)
    const { RPCMethod } = this.provider

    const { error, result } = await this.provider.send(
      RPCMethod.GetTransaction,
      String(fixedhash)
    )

    if (error) {
      throw new RPCError(error)
    }

    return new Transaction(result)
  }

  /**
   * getRecentTransactions
   *
   * Gets a list of recent transactions
   *
   * @returns {Promise<RPCResponse<TxList, never>>}
   */
  getRecentTransactions() {
    const { RPCMethod } = this.provider

    return this.provider.send(RPCMethod.GetRecentTransactions)
  }

  /**
   * getTransactionsForTxBlock
   *
   * Gets all transactions for a given TxBlock, grouped by shard id
   *
   * @param {number} txBlock
   * @returns {Promise<RPCResponse<string[][], string>>}
   */
  getTransactionsForTxBlock(txBlock) {
    if (isNaN(txBlock)) {
      throw new ArgumentError('txBlock', ERROR_MSGS.REQUIRED)
    }

    const { RPCMethod } = this.provider

    return this.provider.send(
      RPCMethod.GetTransactionsForTxBlock,
      String(txBlock)
    )
  }

  /**
   * getBlockChainInfo
   *
   * @returns {Promise<RPCResponse<BlockchainInfo, string>>}
   */
  getBlockChainInfo() {
    const { RPCMethod } = this.provider

    return this.provider.send(RPCMethod.GetBlockchainInfo)
  }

  /**
   * getShardingStructure
   *
   * @returns {Promise<RPCResponse<ShardingStructure, string>>}
   */
  getShardingStructure() {
    const { RPCMethod } = this.provider

    return this.provider.send(RPCMethod.GetShardingStructure)
  }

  /**
   * getDSBlock
   *
   * Get details of a Directory Service block by block number.
   *
   * @param {number} blockNum
   * @returns {Promise<RPCResponse<DsBlockObj, string>>}
   */
  getDSBlock(blockNum) {
    if (isNaN(blockNum)) {
      throw new ArgumentError('blockNum', ERROR_MSGS.REQUIRED)
    }

    const { RPCMethod } = this.provider

    return this.provider.send(RPCMethod.GetDSBlock, String(blockNum))
  }

  /**
   * getLatestDSBlock
   *
   * Get details of the most recent Directory Service block.
   *
   * @returns {Promise<RPCResponse<DsBlockObj, string>>}
   */
  getLatestDSBlock() {
    const { RPCMethod } = this.provider

    return this.provider.send(RPCMethod.GetLatestDSBlock)
  }

  /**
   * getNumDSBlocks
   *
   * Gets the number of DS blocks that the network has processed.
   *
   * @returns {Promise<RPCResponse<string, string>>}
   */
  getNumDSBlocks() {
    const { RPCMethod } = this.provider

    return this.provider.send(RPCMethod.GetNumDSBlocks)
  }

  /**
   * getDSBlockRate
   *
   * Gets the average rate of DS blocks processed per second
   *
   * @returns {Promise<RPCResponse<number, string>>}
   */
  getDSBlockRate() {
    const { RPCMethod } = this.provider

    return this.provider.send(RPCMethod.GetDSBlockRate)
  }

  /**
   * getDSBlockListing
   *
   * Get a paginated list of Directory Service blocks. Pass in page number as
   * parameter. Returns a maxPages variable that specifies the max number of
   * pages. 1 - latest blocks, maxPages - oldest blocks.
   *
   * @param {number} max
   * @returns {Promise<RPCResponse<BlockList, string>>}
   */
  getDSBlockListing(max) {
    if (isNaN(max)) {
      throw new ArgumentError('max', ERROR_MSGS.REQUIRED)
    }

    const { RPCMethod } = this.provider

    return this.provider.send(RPCMethod.DSBlockListing, String(max))
  }

  /**
   * getTxBlock
   *
   * Get details of a Transaction block by block number.
   *
   * @param {number} blockNum
   * @returns {Promise<RPCResponse<TxBlockObj, string>>}
   */
  getTxBlock(blockNum) {
    if (isNaN(blockNum)) {
      throw new ArgumentError('blockNum', ERROR_MSGS.REQUIRED)
    }

    const { RPCMethod } = this.provider

    return this.provider.send(RPCMethod.GetTxBlock, String(blockNum))
  }

  /**
   * getLatestTxBlock
   *
   * Get details of the most recent Transaction block.
   *
   * @returns {Promise<RPCResponse<TxBlockObj, string>>}
   */
  getLatestTxBlock() {
    const { RPCMethod } = this.provider

    return this.provider.send(RPCMethod.GetLatestTxBlock)
  }

  /**
   * getNumTxBlocks
   *
   * Gets the total number of TxBlocks.
   *
   * @returns {Promise<RPCResponse<string, string>>}
   */
  getNumTxBlocks() {
    const { RPCMethod } = this.provider

    return this.provider.send(RPCMethod.GetNumTxBlocks)
  }

  /**
   * getTxBlockRate
   *
   * Gets the average number of Tx blocks per second.
   *
   * @returns {Promise<RPCResponse<number, string>>}
   */
  getTxBlockRate() {
    const { RPCMethod } = this.provider

    return this.provider.send(RPCMethod.GetTxBlockRate)
  }

  /**
   * getTxBlockListing
   *
   * Get a paginated list of Transaction blocks. Takes a page number as
   * parameter, where each page contains a list of 10 blocks (max). Returns
   * a maxPages variable that specifies the max number of pages. 1 - latest
   * blocks, maxPages - oldest blocks.
   *
   * @param {number} max
   * @returns {Promise<RPCResponse<BlockList, string>>}
   */
  getTxBlockListing(max) {
    if (isNaN(max)) {
      throw new ArgumentError('max', ERROR_MSGS.REQUIRED)
    }

    const { RPCMethod } = this.provider

    return this.provider.send(RPCMethod.TxBlockListing, String(max))
  }

  /**
   * getNumTransactions
   *
   * Gets the number of transactions processed by the network so far.
   *
   * @returns {Promise<RPCResponse<string, string>>}
   */
  getNumTransactions() {
    const { RPCMethod } = this.provider

    return this.provider.send(RPCMethod.GetNumTransactions)
  }

  /**
   * getTransactionRate
   *
   * Gets the number of transactions processed per second
   *
   * @returns {Promise<RPCResponse<number, string>>}
   */
  getTransactionRate() {
    const { RPCMethod } = this.provider

    return this.provider.send(RPCMethod.GetTransactionRate)
  }

  /**
   * getCurrentMiniEpoch
   *
   * Gets the current Tx Epoch.
   *
   * @returns {Promise<RPCResponse<string, string>>}
   */
  getCurrentMiniEpoch() {
    const { RPCMethod } = this.provider

    return this.provider.send(RPCMethod.GetCurrentMiniEpoch)
  }

  /**
   * getCurrentDSEpoch
   *
   * Gets the current DS Epoch.
   *
   * @returns {Promise<RPCResponse<any, string>>}
   */
  getCurrentDSEpoch() {
    const { RPCMethod } = this.provider

    return this.provider.send(RPCMethod.GetCurrentDSEpoch)
  }

  /**
   * getPrevDifficulty
   *
   * Gets shard difficulty for previous PoW round
   *
   * @returns {Promise<RPCResponse<number, string>>}
   */
  getPrevDifficulty() {
    const { RPCMethod } = this.provider

    return this.provider.send(RPCMethod.GetPrevDifficulty)
  }

  /**
   * getPrevDSDifficulty
   *
   * Gets DS difficulty for previous PoW round
   *
   * @returns {Promise<RPCResponse<number, string>>}
   */
  getPrevDSDifficulty() {
    const { RPCMethod } = this.provider

    return this.provider.send(RPCMethod.GetPrevDSDifficulty)
  }

  /**
   * getTotalCoinSupply
   *
   * Returns the total supply (ZIL) of coins in the network.
   */
  getTotalCoinSupply() {
    const { RPCMethod } = this.provider

    return this.provider.send(RPCMethod.GetTotalCoinSupply)
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
   *
   */
  getMinerInfo(dsBlockNumber) {
    if (isNaN(dsBlockNumber)) {
      throw new ArgumentError('dsBlockNumber', ERROR_MSGS.REQUIRED)
    }

    const { RPCMethod } = this.provider

    return this.provider.send(RPCMethod.GetMinerInfo, String(dsBlockNumber))
  }

  /**
   * getNumTxnsTxEpoch
   *
   * Gets the number of transactions procesed for a given Tx Epoch.
   *
   * @param {number} epoch
   * @returns {Promise<RPCResponse<number, never>>}
   */
  getNumTxnsTxEpoch(epoch) {
    if (isNaN(epoch)) {
      throw new ArgumentError('epoch', ERROR_MSGS.REQUIRED)
    }

    const { RPCMethod } = this.provider

    return this.provider.send(RPCMethod.GetNumTxnsTxEpoch, String(epoch))
  }

  /**
   * getNumTxnsDSEpoch
   *
   * Gets the number of transactions procesed for a given DS Epoch.
   *
   * @param {number} epoch
   * @returns {Promise<any>}
   */
  getNumTxnsDSEpoch(epoch) {
    if (isNaN(epoch)) {
      throw new ArgumentError('epoch', ERROR_MSGS.REQUIRED)
    }

    const { RPCMethod } = this.provider

    return this.provider.send(RPCMethod.GetNumTxnsDSEpoch, String(epoch))
  }

  /**
   * getMinimumGasPrice
   *
   * Gets the numeric minimum gas price
   *
   * @returns {Promise<RPCResponse<string, string>>}
   */
  getMinimumGasPrice() {
    const { RPCMethod } = this.provider

    return this.provider.send(RPCMethod.GetMinimumGasPrice)
  }

  /**
   * getPendingTxn
   * See the pending status of transaction
   * @param hash
   */
  getPendingTxn(hash) {
    if (!hash) {
      throw new ArgumentError('hash', ERROR_MSGS.REQUIRED)
    }

    const { RPCMethod } = this.provider
    const fixedhash = cryptoUtils.toHex(hash)

    return this.provider.send(RPCMethod.GetPendingTxn, fixedhash)
  }

  /**
   * getPendingTxns
   *
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
  getPendingTxns() {
    const { RPCMethod } = this.provider

    return this.provider.send(RPCMethod.GetPendingTxns)
  }

  /**
   * getBalance
   *
   * Gets the balance of an account by address
   *
   * @param {string} address
   * @returns {Promise<RPCResponse<any, string>>}
   */
  getBalance(addr) {
    if (!addr) {
      throw new ArgumentError('addr', ERROR_MSGS.REQUIRED)
    }

    const address = cryptoUtils.toHex(cryptoUtils.normaliseAddress(addr))
    const { RPCMethod } = this.provider

    return this.provider.send(RPCMethod.GetBalance, address)
  }

  /**
   * getSmartContractCode - returns the smart contract code of a deployed contract.
   *
   * @param {string} address
   * @returns {Promise<RPCResponse<{code: string }, string>>}
   */
  getSmartContractCode(addr) {
    if (!addr) {
      throw new ArgumentError('addr', ERROR_MSGS.REQUIRED)
    }

    const address = cryptoUtils.toHex(cryptoUtils.normaliseAddress(addr))
    const { RPCMethod } = this.provider

    return this.provider.send(RPCMethod.GetSmartContractCode, address)
  }

  /**
   * getSmartContractInit
   *
   * @param {string} address
   * @returns {Promise<RPCResponse<Value[], string>>}
   */
  async getSmartContractInit(addr) {
    if (!addr) {
      throw new ArgumentError('addr', ERROR_MSGS.REQUIRED)
    }

    const address = cryptoUtils.toHex(cryptoUtils.normaliseAddress(addr))
    const { RPCMethod } = this.provider
    const result = await this.provider.send(RPCMethod.GetSmartContractInit, address)

    return result
  }

  /**
   * getSmartContractState - retrieves the entire state of a smart contract
   *
   * @param {string} address
   * @returns {Promise<RPCResponse<any, string>>}
   */
  getSmartContractState(addr) {
    if (!addr) {
      throw new ArgumentError('addr', ERROR_MSGS.REQUIRED)
    }

    const address = cryptoUtils.toHex(cryptoUtils.normaliseAddress(addr))
    const { RPCMethod } = this.provider

    return this.provider.send(RPCMethod.GetSmartContractState, address)
  }

  /**
   * getSmartContractSubState - Queries the contract state, filtered by the variable names.
   * This function is the filtered version of `getSmartContractState`.
   * As `getSubState` performs the filtering, `variableName` of a field is required.
   * If the `subState` is not found, this returns a `null` response.
   *
   * @param {string} address
   * @param { string } variableName - variable name within the state
   * @param { string[] } indices - (optional) If the variable is of map type, you can specify an index (or indices)
   * @returns {Promise<RPCResponse<any, string>>}
   */
  getSmartContractSubState(addr, variableName, indices = []) {
    if (!addr) {
      throw new ArgumentError('addr', ERROR_MSGS.REQUIRED)
    } else if (!variableName) {
      throw new ArgumentError('variableName', ERROR_MSGS.REQUIRED)
    } else if (!Array.isArray(indices)) {
      throw new ShouldArrayError('indices')
    }

    const address = cryptoUtils.toHex(cryptoUtils.normaliseAddress(addr))
    const { RPCMethod } = this.provider

    return this.provider.send(
      RPCMethod.GetSmartContractSubState,
      address,
      variableName,
      indices
    )
  }

  /**
   * getSmartContracts
   *
   * @param {string} address
   * @returns {Promise<RPCResponse<Omit<ContractObj, 'init' | 'abi'>, string>>}
   */
  getSmartContracts(addr) {
    if (!addr) {
      throw new ArgumentError('addr', ERROR_MSGS.REQUIRED)
    }

    const address = cryptoUtils.toHex(cryptoUtils.normaliseAddress(addr))
    const { RPCMethod } = this.provider

    return this.provider.send(RPCMethod.GetSmartContracts, address)
  }

  /**
   * getContractAddressFromTransactionID
   *
   * @param {string} txHash
   * @returns {Promise<RPCResponse<string, string>>}
   */
  getContractAddressFromTransactionID(hash) {
    if (!hash) {
      throw new ArgumentError('hash', ERROR_MSGS.REQUIRED)
    }

    const { RPCMethod } = this.provider
    const fixedhash = cryptoUtils.toHex(hash)

    return this.provider.send(RPCMethod.GetContractAddressFromTransactionID, fixedhash)
  }

}
