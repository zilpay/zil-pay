/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { DEFAULT_GAS_FEE } from 'config/zilliqa'
import HTTPProvider from './provider'
import { CryptoUtils, ZilliqaUtils } from './crypto'
import Wallet from './wallet'
import ERRORS from './errors'

const utils = new ZilliqaUtils()

export class Transaction {
  get payload() {
    const address = new CryptoUtils().fromBech32Address(this.toAddr)

    return {
      amount: String(this.amount),
      gasPrice: String(this.gasPrice),
      gasLimit: String(this.gasLimit),
      code: this.code,
      data: this.data ? JSON.stringify(this.data) : '',
      nonce: this.nonce,
      priority: this.priority,
      toAddr: new CryptoUtils().toHex(address),
      version: this.version,
      signature: this.signature
    }
  }

  get exceptions() {
    if (!this.receipt || !this.receipt.exceptions) {
      return []
    }

    return this.receipt.exceptions
  }

  get eventLogs() {
    if (!this.receipt || !this.receipt.event_logs) {
      return []
    }

    return this.receipt.event_logs
  }

  constructor(params, priority = false) {
    this.version = params.version
    this.toAddr = params.toAddr
    this.nonce = Number(params.nonce || 0)
    this.amount = new utils.BN(params.amount || 0)
    this.code = params.code || ''
    this.data = params.data || ''
    this.signature = params.signature
    this.ContractAddress = params.ContractAddress
    this.ID = params.TranID || params.ID
    this.TranID = this.ID
    this.from = params.from || params.senderAddress
    this.Info = params.Info
    this.pubKey = params.pubKey

    this.gasPrice = new utils.BN(params.gasPrice || DEFAULT_GAS_FEE.gasPrice ** 3)
    this.gasLimit = utils.Long.fromNumber(params.gasLimit || DEFAULT_GAS_FEE.gasLimit)

    this.priority = params.priority
    this.receipt = params.receipt

    if (!this.toAddr) {
      throw ERRORS.IncorectAddress
    }

    if (utils.validation.isAddress(this.toAddr)) {
      this.toAddr = new CryptoUtils().toChecksumAddress(this.toAddr)
      this.toAddr = new CryptoUtils().toBech32Address(this.toAddr)
    }

    if (priority) {
      this.priority = true
    }

    if (this.data) {
      this.data = JSON.parse(this.data)
    }

    if (this.receipt) {
      this.epoch = this.receipt.epoch_num
      this.cumulativeGas = this.receipt.cumulative_gas
      this.success = this.receipt.success
    }

    this.txParams = this.payload
  }
}

export class TransactionFactory {

  constructor(provider, wallet) {
    if (!(provider instanceof HTTPProvider)) {
      throw ERRORS.HTTPProviderInstance
    } else if (!(wallet instanceof Wallet)) {
      throw ERRORS.WalletInstance
    }
    this.provider = provider
    this.wallet = wallet
  }

  new(...args) {
    return new Transaction(...args)
  }

  payment() {
    throw ERRORS.DisabledMethod
  }
}
