/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { FIELDS, DEFAULT, DEFAULT_TOKEN, SCAM_TOKEN } from 'config'
import { BrowserStorage, BuildObject } from 'lib/storage'
import { TypeChecker } from 'lib/type'
import { AES } from 'lib/crypto'
import { toNodeAddress } from 'lib/utils/to-node-address'

import { Wallet } from '@zilliqa-js/account/dist/wallet'
import { TransactionFactory } from '@zilliqa-js/account/dist/transactionFactory'
import { Account } from '@zilliqa-js/account/dist/account'
import { Blockchain } from '@zilliqa-js/blockchain/dist/chain'
import { RPCMethod } from '@zilliqa-js/core/dist/net'
import { HTTPProvider } from '@zilliqa-js/core/dist/providers/http'
import { fromBech32Address } from '@zilliqa-js/crypto/dist/bech32'
import {
  toChecksumAddress,
  verifyPrivateKey,
  getAddressFromPrivateKey,
  getPubKeyFromPrivateKey
} from '@zilliqa-js/crypto/dist/util'
import {
  Long,
  BN,
  bytes,
  validation
} from '@zilliqa-js/util/dist/index'
import { RPCError, ArgumentError, ERROR_MSGS } from 'packages/background/errors'

import { NotificationsControl } from 'packages/background/services/browser'

export class ZilliqaControl {

  constructor(provider) {
    this.provider = new HTTPProvider(provider)
    this.wallet = new Wallet(this.provider)
    this.blockchain = new Blockchain(this.provider, this.wallet)
  }

  /**
   * Recieve account balance.
   * @param {String} address - Account address.
   */
  async getBalance(address) {
    const method = RPCMethod.GetBalance
    const params = toNodeAddress(address)

    const { result, error } = await this.provider.send(method, params)

    if (error) {
      return {
        balance: '0',
        nonce: 0
      }
    }

    return result
  }

  /**
   * Get the balance of ZRC token.
   * @param {String} proxyAddress - ZRC proxy contract address.
   * @param {Object} account - Default account object.
   */
  async getZRCBalance(proxyAddress, account) {
    const address = String(account.address).toLowerCase()

    try {
      const { balances } = await this.getSmartContractSubState(
        proxyAddress, 'balances', [address]
      )

      return balances[address]
    } catch (err) {
      return '0'
    }
  }

  /**
   * See the pending status of transaction.
   * @param {String} hash Tx id.
   */
  async getPendingTxn(hash) {
    const method = RPCMethod.GetPendingTxn
    const { result, error } = await this.provider.send(method, hash)

    if (error) {
      throw new RPCError(error)
    }

    return result
  }

  /**
   * Queries the contract state, filtered by the variable names.
   * This function is the filtered version of `getSmartContractState`.
   * @param {String} address Zilliqa address.
   * @param {String} variableName Smartcontract field name.
   * @param {Array} indices Variable is of map type, you can specify an index.
   */
  async getSmartContractSubState(address, variableName, indices = []) {
    const method = RPCMethod.GetSmartContractSubState

    address = toNodeAddress(address)

    const { result, error } = await this.provider.send(
      method,
      address,
      variableName,
      indices
    )

    if (error) {
      throw new RPCError(error)
    }

    return result
  }

  async getSmartContractInit(address) {
    const method = RPCMethod.GetSmartContractInit
    let object = {}

    address = toNodeAddress(address)

    const { result, error } = await this.provider.send(
      method,
      address
    )

    if (error) {
      throw new RPCError(error)
    }

    for (let index = 0; index < result.length; index++) {
      const element = result[index]

      object[element.vname] = element.value
    }

    return object
  }

  /**
   * Preparation transaction to send.
   * @param {Object} txData - some tx params.
   * @param {Object} account - Full account object.
   */
  async buildTxParams(txData, account) {
    const transactionFactory = new TransactionFactory(this.provider, this.wallet)
    let {
      amount, // Amount of zil. type Number.
      nonce, // Count of transaction for account.
      code, // Value contract code. type String.
      data, // Call contract transition. type Object.
      gasLimit,
      gasPrice,
      toAddr, // Recipient address. type String.
      version // Netowrk version. type Number.
    } = txData

    await this.checkScam(toAddr)

    if (!version) {
      version = await this.version()
    }

    if (txData.cancel) {
      nonce = txData.nonce - 1
    }

    amount = new BN(amount)
    gasPrice = new BN(gasPrice)
    gasLimit = Long.fromNumber(gasLimit)

    return transactionFactory.new({
      ...txData,
      nonce,
      gasPrice,
      amount,
      gasLimit,
      version,
      toAddr,
      code,
      data,
      pubKey: account.publicKey || account.pubKey
    }, Boolean(txData.priority))
  }

  /**
   * Sign transaction via privateKey.
   * @param {Object} txData - payload without signature.
   * @param {Object} account - Account for sign.
   * @param {Number} index - ID in mnemonic seed phrase.
   */
  async singTransaction(zilTxData, account) {
    const wallet = new Wallet(this.provider)
    const transactionFactory = new TransactionFactory(this.provider, wallet)

    // Singed tx just send.
    if (account && account.hwType && zilTxData.signature) {
      const { txParams } = transactionFactory.new(zilTxData)

      txParams.priority = zilTxData.toDS

      return this.provider.send(RPCMethod.CreateTransaction, txParams)
    }

    // importing account from private key or seed phrase. //
    const address = wallet.addByPrivateKey(account.privateKey)

    wallet.setDefault(address)

    // Sign transaction by current account. //
    const { txParams } = await wallet.sign(zilTxData)

    txParams.priority = zilTxData.toDS

    return this.provider.send(RPCMethod.CreateTransaction, txParams)
  }

  signMessage(message, { privateKey }) {
    const account = new Account(privateKey)
    const hashStr = new AES().hash(message)
    const hashBytes = Buffer.from(hashStr, 'hex')
    const signature = account.signTransaction(hashBytes)

    return {
      signature,
      publicKey: account.publicKey
    }
  }

  /**
   * The decimal conversion of the
   * bitwise concatenation of `CHAIN_ID` and `MSG_VERSION` parameters.
   * @param {Number} msgVerison - `MSG_VERSION` chain.
   */
  async version(msgVerison = 1) {
    const id = await this.getNetworkId()

    return bytes.pack(id, msgVerison)
  }

  async checkScam(address) {
    let isScam = false
    const field = 'balances'

    if (validation.isBech32(address)) {
      address = fromBech32Address(address)
    }

    address = address.toLowerCase()

    try {
      const { result } = await this.blockchain.getSmartContractSubState(
        SCAM_TOKEN,
        field,
        [address]
      )

      if (result && result[field] && result[field][address]) {
        isScam = Number(result[field][address]) > 0
      }
    } catch (err) {
      //
    }

    if (isScam) {
      throw new Error('Scam detected')
    }
  }

  /**
   * Getting netwrok number ID.
   */
  async getNetworkId() {
    const method = RPCMethod.GetNetworkId
    const { result, error } = await this.provider.send(method)

    if (error) {
      throw new RPCError(error)
    }

    return result
  }

  /**
   * Generate account via mnemonic seed phrase.
   * @param {String} seed - mnemonic seed phrase.
   * @param {Number} index - ID in mnemonic seed phrase.
   */
  async getAccountBySeed(seed, index) {
    if (!new TypeChecker(seed).isString) {
      throw new ArgumentError('seed', ERROR_MSGS.MUST_BE_STRING)
    } else if (isNaN(index)) {
      throw new ArgumentError('index', ERROR_MSGS.MUST_BE_INT)
    }

    const wallet = new Wallet(this.provider)

    wallet.addByMnemonic(seed, index)

    const {
      address,
      publicKey,
      privateKey
    } = wallet.defaultAccount
    const { balance } = await this.getBalance(address)

    return {
      index,
      publicKey,
      privateKey,
      balance,
      address: toChecksumAddress(address)
    }
  }

  /**
   * Generate account via imported privateKey.
   * @param {String} importPrivateKey - PrivateKey.
   * @param {Number} index - Imported storage object index.
   */
  async getAccountByPrivateKey(importPrivateKey, index = 0) {
    if (!verifyPrivateKey(importPrivateKey)) {
      throw new ArgumentError('importPrivateKey')
    }

    const account = {
      privateKey: importPrivateKey,
      publicKey: getPubKeyFromPrivateKey(importPrivateKey),
      address: getAddressFromPrivateKey(importPrivateKey)
    }
    const { balance } = await this.getBalance(account.address)

    account.address = toChecksumAddress(account.address)

    return {
      ...account,
      index,
      balance
    }
  }

  /**
   * Set to storage non-sing transaction payload for call popup nad sing it.
   * @param {Object} payload - Tranaction payload "amount, gas, data"...
   */
  async addForSingTransaction(payload) {
    const storage = new BrowserStorage()
    let forConfirm = await storage.get(FIELDS.CONFIRM_TX)

    if (validation.isBech32(payload.toAddr)) {
      payload.toAddr = fromBech32Address(payload.toAddr)
    }

    payload.symbol = DEFAULT_TOKEN.symbol
    payload.toAddr = toChecksumAddress(payload.toAddr)

    try {
      forConfirm.push(payload)
    } catch (err) {
      forConfirm = [payload]
    }

    await storage.set(
      new BuildObject(FIELDS.CONFIRM_TX, forConfirm)
    )

    this.notificationsCounter(forConfirm)
  }

  async addForSignMessage(msg) {
    const storage = new BrowserStorage()
    let forConfirm = await storage.get(FIELDS.CONFIRM_TX)

    try {
      forConfirm.push(msg)
    } catch (err) {
      forConfirm = [msg]
    }

    await storage.set(
      new BuildObject(FIELDS.CONFIRM_TX, forConfirm)
    )

    this.notificationsCounter(forConfirm)
  }

  /**
   * If user confirm or reject tranaction,
   * this method remove it from storage.
   */
  async rmForSingTransaction() {
    const storage = new BrowserStorage()
    let forConfirm = await storage.get(FIELDS.CONFIRM_TX)
    const removedConfirm = forConfirm.pop()

    await storage.set(
      new BuildObject(FIELDS.CONFIRM_TX, forConfirm)
    )

    this.notificationsCounter(forConfirm)

    return removedConfirm
  }

  async cancelTx(txData, net) {
    const storage = new BrowserStorage()
    const from = toChecksumAddress(txData.from)
    const txsList = await storage.get(FIELDS.TRANSACTIONS)

    txsList[from][net] = txsList[from][net].map((txn) => {
      if (txn.nonce === txData.nonce) {
        txn.cancel = true
        txn.TranID = txData.TranID
      }

      return txn
    })

    await storage.set(new BuildObject(FIELDS.TRANSACTIONS, txsList))
  }

  /**
   * When user confirm transaction, it will add to storage.
   * @param {Object} tx - Tranaction payload.
   * @param {String} net - Network name.
   */
  async addTransactionList(tx, net) {
    const storage = new BrowserStorage()
    const from = toChecksumAddress(tx.from)
    let txsList = await storage.get(FIELDS.TRANSACTIONS)
    let type = 0

    if (tx.data) {
      type = 1
    }
    if (tx.code) {
      type = 2
    }

    const data = {
      type,
      Info: tx.Info,
      TranID: tx.TranID,
      confirmed: tx.confirmed,
      amount: tx.amount,
      gasLimit: tx.gasLimit,
      gasPrice: tx.gasPrice,
      toAddr: toChecksumAddress(tx.toAddr),
      nonce: tx.nonce,
      block: tx.block,
      timestamp: new Date().getTime(),
      decimals: tx.decimals,
      symbol: tx.symbol
    }

    if (!net) {
      throw new ArgumentError('net', ERROR_MSGS.REQUIRED)
    }

    try {
      if (!txsList[from]) {
        txsList[from] = {}
        txsList[from][net] = []
      }
      txsList[from][net].push(data)
    } catch (err) {
      txsList = {}
      txsList[from] = {}
      txsList[from][net] = []
      txsList[from][net].push(data)
    }

    if (txsList[from][net].length > DEFAULT.MAX_TX_AMOUNT_LIST) {
      txsList[from][net].shift()
    }

    await storage.set(new BuildObject(FIELDS.TRANSACTIONS, txsList))
  }

  /**
   * Use for transactionHistory status updateing
   * @param {Object} assignData - Any data for add to storage.
   * @param {String} hash - Transaction hash.
   * @param {String} net - Current network.
   * @param {String} from - Sender address.
   */
  async updateTransactionList(assignData, hash, net, from) {
    const storage = new BrowserStorage()
    let txsList = await storage.get(FIELDS.TRANSACTIONS)

    if (!txsList || !txsList[from] || !txsList[from][net]) {
      return null
    } else if (!txsList[from][net].some((tx) => tx.TranID === hash)) {
      return null
    }

    txsList[from][net] = txsList[from][net].map((tx) => {
      if (tx.TranID === hash) {
        return {
          ...tx,
          ...assignData
        }
      }

      return tx
    })

    await storage.set(new BuildObject(FIELDS.TRANSACTIONS, txsList))
  }

  /**
   * Set "BadgeText" for show number of actions.
   * @param {Number} value - Number of action.
   */
  async notificationsCounter(value) {
    let forConfirm = null

    if (!value) {
      const storage = new BrowserStorage()

      forConfirm = await storage.get(FIELDS.CONFIRM_TX)
    } else {
      forConfirm = value
    }

    if (!forConfirm || forConfirm.length === 0) {
      NotificationsControl.counter('')
    } else {
      NotificationsControl.counter(forConfirm.length)
    }
  }

}
