/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { normaliseAddress } from '@zilliqa-js/crypto/dist/util'
import { TransactionFactory } from './transaction'
import { CryptoUtils } from './crypto'

import ERRORS from './errors'

const NIL_ADDRESS = '0x0000000000000000000000000000000000000000'

const utils = new CryptoUtils()

export class Contract {

  get _contractAddress() {
    return utils.toHex(this.address)
  }

  constructor(transactions, address, code, init) {
    if (address) {
      this.address = normaliseAddress(address)
    }

    this.transactions = transactions
    this.code = code
    this.init = init
  }

  deploy(params, priority = false) {
    if (!this.code || !this.init) {
      throw ERRORS.InitParams
    }

    const { wallet } = this.transactions
    const tx = this.transactions.new({
      priority,
      toAddr: NIL_ADDRESS,
      code: this.code,
      data: JSON.stringify(this.data),
      ...params
    })

    return wallet.sign(tx)
  }

  call(_tag, args, params, priority = false) {
    if (!this.address) {
      throw ERRORS.ContractHasntDeployed
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

    return wallet.sign(tx)
  }

  async getState() {
    if (!this.address) {
      throw ERRORS.ContractHasntDeployed
    }

    const { RPCMethod } = this.transactions.provider
    const { result, error } = await this.transactions.provider.send(
      RPCMethod.GetSmartContractState,
      this._contractAddress,
    )

    if (error) {
      throw new Error(error)
    }

    return result
  }

  async getSubState(variableName, indices = []) {
    if (!this.address) {
      throw ERRORS.ContractHasntDeployed
    } else if (!variableName) {
      throw ERRORS.VariableNameRequired
    } else if (!Array.isArray(indices)) {
      throw ERRORS.ShouldArray
    }

    const { RPCMethod } = this.transactions.provider
    const { result, error } = await this.transactions.provider.send(
      RPCMethod.GetSmartContractSubState,
      this._contractAddress,
      variableName,
      indices
    )

    if (error) {
      throw new Error(error)
    }

    return result
  }

  async getInit() {
    if (!this.address) {
      throw ERRORS.ContractHasntDeployed
    }

    const { RPCMethod } = this.transactions.provider
    const { result, error } = await this.transactions.provider.send(
      RPCMethod.GetSmartContractInit,
      this._contractAddress
    )

    if (error) {
      throw new Error(error)
    }

    this.init = result

    return result
  }

  async getCode() {
    if (!this.address) {
      throw ERRORS.ContractHasntDeployed
    }

    const { RPCMethod } = this.transactions.provider
    const { result, error } = await this.transactions.provider.send(
      RPCMethod.GetSmartContractCode,
      this._contractAddress
    )

    if (error) {
      throw new Error(error)
    }

    this.code = result.code

    return result
  }
}

export class ContractControl {

  constructor(transactions) {
    if (!(transactions instanceof TransactionFactory)) {
      throw ERRORS.TransactionFactoryInstance
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
