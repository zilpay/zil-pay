/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { TypeChecker } from 'lib/type'
import { TransactionFactory, Transaction } from './transaction'
import { CryptoUtils } from './crypto'

import {
  InstanceError,
  ArgumentError,
  ERROR_MSGS,
  FormatError,
  RPCError,
  ShouldArrayError
} from './errors'

const NIL_ADDRESS = '0x0000000000000000000000000000000000000000'

const utils = new CryptoUtils()

export class Contract {

  get _contractAddress() {
    return utils.toHex(this.address)
  }

  constructor(transactions, address, code, init) {
    if (address) {
      this.address = new CryptoUtils().normaliseAddress(address)
    }

    this.transactions = transactions
    this.code = code
    this.init = init
  }

  async deploy(params, priority = false) {
    if (!this.code || !this.init) {
      throw new ArgumentError('code, init', ERROR_MSGS.INIT_PARAMS)
    }

    const { wallet } = this.transactions
    const tx = this.transactions.new({
      priority,
      toAddr: NIL_ADDRESS,
      code: this.code,
      data: JSON.stringify(this.init),
      ...params
    })

    const result = await wallet.sign(tx)

    this.address = new CryptoUtils().normaliseAddress(result.ContractAddress)

    return [new Transaction(result), this]
  }

  async call(_tag, args, params, priority = false) {
    if (!this.address) {
      throw new ArgumentError('contract', ERROR_MSGS.CONTRACT_HASN_TDEPLOYED)
    } else if (!_tag) {
      throw new ArgumentError('_tag', ERROR_MSGS.REQUIRED)
    } else if (!new TypeChecker(_tag).isString) {
      throw new FormatError('_tag')
    }

    const { wallet } = this.transactions
    const data = JSON.stringify({
      _tag,
      params: args
    })

    const tx = this.transactions.new({
      data,
      priority,
      toAddr: this._contractAddress,
      ...params
    })
    const result = await wallet.sign(tx)

    return new Transaction(result)
  }

  async getState() {
    if (!this.address) {
      throw new ArgumentError('contract', ERROR_MSGS.CONTRACT_HASN_TDEPLOYED)
    }

    const { RPCMethod } = this.transactions.provider
    const { result, error } = await this.transactions.provider.send(
      RPCMethod.GetSmartContractState,
      this._contractAddress,
    )

    if (error) {
      throw new RPCError(error)
    }

    return result
  }

  async getSubState(variableName, indices = []) {
    if (!this.address) {
      throw new ArgumentError('contract', ERROR_MSGS.CONTRACT_HASN_TDEPLOYED)
    } else if (!variableName) {
      throw new ArgumentError('variableName', ERROR_MSGS.REQUIRED)
    } else if (!Array.isArray(indices)) {
      throw new ShouldArrayError('indices')
    }

    const { RPCMethod } = this.transactions.provider
    const { result, error } = await this.transactions.provider.send(
      RPCMethod.GetSmartContractSubState,
      this._contractAddress,
      variableName,
      indices
    )

    if (error) {
      throw new RPCError(error)
    }

    return result
  }

  async getInit() {
    if (!this.address) {
      throw new ArgumentError('contract', ERROR_MSGS.CONTRACT_HASN_TDEPLOYED)
    }

    const { RPCMethod } = this.transactions.provider
    const { result, error } = await this.transactions.provider.send(
      RPCMethod.GetSmartContractInit,
      this._contractAddress
    )

    if (error) {
      throw new RPCError(error)
    }

    this.init = result

    return result
  }

  async getCode() {
    if (!this.address) {
      throw new ArgumentError('contract', ERROR_MSGS.CONTRACT_HASN_TDEPLOYED)
    }

    const { RPCMethod } = this.transactions.provider
    const { result, error } = await this.transactions.provider.send(
      RPCMethod.GetSmartContractCode,
      this._contractAddress
    )

    if (error) {
      throw new RPCError(error)
    }

    this.code = result.code

    return result
  }
}

export class ContractControl {

  constructor(transactions) {
    if (!(transactions instanceof TransactionFactory)) {
      throw new InstanceError('transactions', TransactionFactory)
    }

    this.transactions = transactions
  }

  at(address, code) {
    return new Contract(this.transactions, address, code)
  }

  new(code, init) {
    return new Contract(this.transactions, null, code, init)
  }
}
