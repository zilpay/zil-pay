/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { FIELDS, DEFAULT } from 'config'
import { BrowserStorage, BuildObject } from 'lib/storage'
import { TypeChecker } from 'lib/type'

import { Zilliqa } from '@zilliqa-js/zilliqa'
import { RPCMethod } from '@zilliqa-js/core'
import {
  toChecksumAddress,
  fromBech32Address,
  verifyPrivateKey,
  getAddressFromPrivateKey,
  getPubKeyFromPrivateKey
} from '@zilliqa-js/crypto'
import {
  Long,
  BN,
  bytes,
  validation
} from '@zilliqa-js/util'

import { NotificationsControl } from '../browser/notifications'
import errorsCode from './errors'

export class ZilliqaControl extends Zilliqa {

  constructor(provider) {
    super(provider)
  }

  /**
   * Recieve account balance.
   * @param {String} address - Account address.
   */
  async getBalance(address) {
    // Get the balance by address. //
    let { result } = await this.blockchain.getBalance(
      address.replace('0x', '')
    )
    let nonce = 0

    if (!result) {
      result = 0
    } else {
      nonce = result ? result.nonce : 0
      result = result.balance
    }

    return { result, nonce }
  }

  /**
   * Preparation transaction to send.
   * @param {Object} txData - some tx params.
   * @param {Object} account - Full account object.
   */
  async buildTxParams(txData, account) {
    const storage = new BrowserStorage()
    const transactions = await storage.get(FIELDS.TRANSACTIONS)
    const network = await storage.get(FIELDS.SELECTED_NET)
    const historyTx = transactions && transactions[account.address] && transactions[account.address][network]
    const balance = await this.getBalance(account.address)
    let {
      amount, // Amount of zil. type Number.
      code, // Value contract code. type String.
      data, // Call contract transition. type Object.
      gasLimit,
      gasPrice,
      toAddr, // Recipient address. type String.
      nonce,
      version // Netowrk version. type Number.
    } = txData

    nonce = balance.nonce

    if (!version) {
      version = await this.version()
    }

    if (historyTx) {
      const lastTx = historyTx.pop()
      const { result } = await this.blockchain.getPendingTxn(lastTx.TranID)

      if (!result.confirmed && lastTx.nonce > balance.nonce) {
        nonce = lastTx.nonce
      }
    }

    if (nonce !== 0) {
      nonce++
    }

    amount = new BN(amount)
    gasPrice = new BN(gasPrice)
    gasLimit = Long.fromNumber(gasLimit)

    return this.transactions.new({
      nonce,
      gasPrice,
      amount,
      gasLimit,
      version,
      toAddr,
      code,
      data,
      pubKey: account.publicKey
    })
  }

  /**
   * Sign transaction via privateKey.
   * @param {Object} txData - payload without signature.
   * @param {String} privateKey - PrivateKey for sing.
   * @param {Number} index - ID in mnemonic seed phrase.
   */
  async singTransaction(zilTxData, privateKey) {
    // importing account from private key or seed phrase. //
    const address = this.wallet.addByPrivateKey(privateKey)

    this.wallet.setDefault(address)
    // Sign transaction by current account. //
    const { txParams } = await this.wallet.sign(zilTxData)

    return this.provider.send(RPCMethod.CreateTransaction, txParams)
  }

  /**
   * The decimal conversion of the
   * bitwise concatenation of `CHAIN_ID` and `MSG_VERSION` parameters.
   * @param {Number} msgVerison - `MSG_VERSION` chain.
   */
  async version(msgVerison = 1) {
    const { result } = await this.network.GetNetworkId()

    return bytes.pack(result, msgVerison)
  }

  /**
   * Generate account via mnemonic seed phrase.
   * @param {String} seed - mnemonic seed phrase.
   * @param {Number} index - ID in mnemonic seed phrase.
   */
  async getAccountBySeed(seed, index) {
    if (!new TypeChecker(seed).isString || isNaN(index)) {
      throw new Error(errorsCode.WrongParams)
    }

    this.wallet.addByMnemonic(seed, index)

    const {
      address,
      publicKey,
      privateKey
    } = this.wallet.defaultAccount
    const { result } = await this.getBalance(address)

    return {
      index, publicKey, privateKey,
      balance: result,
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
      throw new Error(errorsCode.WrongPrivateKey)
    }

    const account = {
      privateKey: importPrivateKey,
      publicKey: getPubKeyFromPrivateKey(importPrivateKey),
      address: getAddressFromPrivateKey(importPrivateKey)
    }
    const { result } = await this.getBalance(account.address)

    account.address = toChecksumAddress(account.address)

    return {
      ...account,
      index,
      balance: result
    }
  }

  /**
   * Set to storage non-sing transaction payload for call popup nad sing it.
   * @param {Object} payload - Tranaction payload "amount, gas, data"...
   */
  async addForSingTransaction(payload) {
    const neededParams = [
      'amount',
      'toAddr'
    ]

    for (let index = 0; index < neededParams.length; index++) {
      const param = neededParams[index]

      if (!(param in payload)) {
        throw new Error(
          errorsCode.WrongRequiredparam + param
        )
      }
    }

    const storage = new BrowserStorage()
    let forConfirm = await storage.get(FIELDS.CONFIRM_TX)

    if (validation.isBech32(payload.toAddr)) {
      payload.toAddr = fromBech32Address(payload.toAddr)
    }

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

  /**
   * When user confirm transaction, it will add to storage.
   * @param {Object} tx - Tranaction payload.
   * @param {String} net - Network name.
   */
  async addTransactionList(tx, net) {
    const storage = new BrowserStorage()
    const from = toChecksumAddress(tx.from)
    let txsList = await storage.get(FIELDS.TRANSACTIONS)
    const data = {
      Info: tx.Info,
      TranID: tx.TranID,
      confirmed: tx.confirmed,
      amount: tx.amount,
      toAddr: toChecksumAddress(tx.toAddr),
      nonce: tx.nonce,
      block: tx.block
    }

    if (!net) {
      throw new Error(
        errorsCode.WrongRequiredparam + 'net'
      )
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
