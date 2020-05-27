import { DEFAULT_GAS_FEE } from 'config/zilliqa'
import { validation } from '@zilliqa-js/util/dist/index'
import HTTPProvider from './provider'
import Wallet from './wallet'
import ERRORS from './errors'

export class Transaction {
  get _toAddr() {
    return this.toAddr.replace('0x', '').toLowerCase()
  }

  constructor(params, priority = false) {
    this.version = params.version
    this.toAddr = params.toAddr
    this.nonce = params.nonce
    this.amount = String(params.amount || 0)
    this.code = params.code || ''
    this.data = params.data || ''
    this.signature = params.signature
    this.gasPrice = String(params.gasPrice || DEFAULT_GAS_FEE.gasPrice ** 3)
    this.gasLimit = String(params.gasLimit || DEFAULT_GAS_FEE.gasLimit)
    this.priority = params.priority

    if (priority) {
      this.priority = true
    }

    if (!this.toAddr || !validation.isAddress(this.toAddr)) {
      throw ERRORS.IncorectAddress
    }
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
