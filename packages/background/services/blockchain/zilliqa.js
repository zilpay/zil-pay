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
  fromBech32Address
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
   * @param {String} from - Sender address.
   * @param {Number} currentNonce - Transaction nonce.
   * @param {String} pubKey - Sender publicKey.
   */
  async buildTxParams(txData, from, currentNonce, pubKey) {
    const balance = await this.getBalance(from)
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

    if (!version) {
      version = await this.version()
    }

    if (isNaN(nonce)) {
      nonce = balance.nonce
    }

    if (currentNonce > balance.nonce) {
      nonce = currentNonce
    }

    amount = new BN(amount)
    gasPrice = new BN(gasPrice)
    gasLimit = Long.fromNumber(gasLimit)

    nonce++

    return this.transactions.new({
      nonce,
      gasPrice,
      amount,
      gasLimit,
      version,
      toAddr,
      pubKey,
      code,
      data
    })
  }

  /**
   * Send sing transaction to node via JsonRPC.
   * @param {Object} payload - Signed transaction payload for send to node.
   */
  signedTxSend(payload) {
    return this.provider.send(
      RPCMethod.CreateTransaction, payload
    )
  }

  /**
   * Sign transaction via privateKey.
   * @param {Object} txData - payload without signature.
   * @param {String} seedOrPrivateKey - PrivateKey for sing.
   * @param {Number} index - ID in mnemonic seed phrase.
   * @param {Number} currentNonce - Transaction nonce from storage.
   */
  async singTransaction(txData, seedOrPrivateKey, index, currentNonce) {
    // importing account from private key or seed phrase. //
    if (validation.isPrivateKey(seedOrPrivateKey)) {
      this.wallet.addByPrivateKey(seedOrPrivateKey)
    } else {
      this.wallet.addByMnemonic(seedOrPrivateKey, index)
    }

    const zilTxData = await this.buildTxParams(
      txData,
      this.wallet.defaultAccount.address,
      currentNonce,
      this.wallet.defaultAccount.publicKey
    )
    // Sign transaction by current account. //
    const { txParams, payload } = await this.wallet.sign(zilTxData)

    if (new TypeChecker(txData.isBroadcast).isBoolean) {
      payload.Info = 'Non-broadcast'
      payload.TranID = 'none'
      payload.version = txParams.version

      return { result: payload, req: null }
    }

    return await this.signedTxSend(txParams)
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
    this.wallet.addByPrivateKey(importPrivateKey)

    const account = this.wallet.defaultAccount
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
      amount: tx.amount,
      toAddr: toChecksumAddress(tx.toAddr),
      nonce: tx.nonce
    }

    if (!net) {
      throw new Error(
        errorsCode.WrongRequiredparam + 'net'
      )
    }

    Object.keys(data).forEach(key => {
      if (!data[key]) {
        throw new Error(
          errorsCode.WrongRequiredparam + key
        )
      }
    })

    try {
      txsList = txsList[FIELDS.TRANSACTIONS]
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

    await storage.set(
      new BuildObject(FIELDS.TRANSACTIONS, txsList)
    )
  }

  /**
   * Clear tranaction from storage.
   */
  async rmAllTransactionList() {
    const storage = new BrowserStorage()

    await storage.set(
      new BuildObject(FIELDS.TRANSACTIONS, {})
    )
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
