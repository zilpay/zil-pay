/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { DEFAULT_GAS_FEE } from 'config/zilliqa'
import { TransactionError } from '@zilliqa-js/core/dist/types'
import HTTPProvider from './provider'
import { CryptoUtils, ZilliqaUtils } from './crypto'
import Wallet from './wallet'
import { FormatError, InstanceError, AccessError, ERROR_MSGS } from './errors'

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

  get errors() {
    if (!this.receipt || !this.receipt.errors) {
      return []
    }
    const errors = []
    const values = Object.values(this.receipt.errors)

    values.forEach((e) => {
      Array.from(e).forEach((n) => errors.push(TransactionError[n]))
    })

    return errors
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
      throw new FormatError('toAddr', ERROR_MSGS)
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

    if (this.data && Array.isArray(this.data)) {
      this.data = this.data.map((arg, index) => {
        try {
          if (arg && arg.type === 'ByStr20' && arg.value && utils.validation.isBech32(arg.value)) {
            arg.value = new CryptoUtils().fromBech32Address(arg.value)
          }

          if (arg && arg.type === 'List (ByStr20)' && Array.isArray(arg.value)) {
            arg.value = arg.value.map((address) => {
              if (!utils.validation.isBech32(address)) {
                return address
              }

              address = new CryptoUtils().fromBech32Address(address)

              return address
            })
          }
        } catch (err) {
          throw new FormatError(`${err.message} in param ${index}, type: ${arg.type}, value: ${arg.value}`)
        }

        return arg
      })
    }

    this.txParams = this.payload
  }
}

export class TransactionFactory {

  constructor(provider, wallet) {
    if (!(provider instanceof HTTPProvider)) {
      throw new InstanceError('provider', HTTPProvider)
    } else if (!(wallet instanceof Wallet)) {
      throw new InstanceError('wallet', Wallet)
    }

    this.provider = provider
    this.wallet = wallet
    this.Transaction = Transaction
  }

  new(...args) {
    return new Transaction(...args)
  }

  payment() {
    throw new AccessError(ERROR_MSGS.DISABLE_DMETHOD)
  }
}
