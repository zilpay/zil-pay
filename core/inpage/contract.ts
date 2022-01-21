/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type { TransactionParams, TxParams } from 'types/transaction';

import { CryptoUtils } from './crypto';
import assert from 'assert';
import { ErrorMessages } from 'config/errors';
import { Contracts } from 'config/contracts';
import { TransactionFactory, Transaction } from './transaction';
import { TypeOf } from 'lib/type/type-checker';

export class Contract {
  public transaction: TransactionFactory;
  public address?: string;
  public code?: string;
  public init?: object[];

  get contractAddress() {
    return CryptoUtils.toHex(String(this.address));
  }

  constructor(
    transaction: TransactionFactory,
    address?: string,
    code?: string,
    init?: object[]
  ) {
    this.transaction = transaction;
    this.code = code;
    this.init = init;

    if (address) {
      this.address = CryptoUtils.normaliseAddress(address);
    }
  }

  public async deploy(params: TransactionParams, priority = false) {
    assert(Boolean(this.code), `this.code ${ErrorMessages.RequiredParam}`);
    assert(Boolean(this.init), `this.init ${ErrorMessages.RequiredParam}`);

    const { wallet } = this.transaction;
    let tx = this.transaction.new({
      priority,
      toAddr: Contracts.ZERO_ADDRESS,
      code: this.code,
      data: JSON.stringify(this.init),
      ...params
    });
    const result = await wallet.sign(tx);

    tx = new Transaction(result as TxParams);

    this.address = tx.ContractAddress;

    return [tx, this];
  }

  public async call(tag: string, args: object[], params: TransactionParams, priority = false) {
    assert(Boolean(this.address), `this.address ${ErrorMessages.RequiredParam}`);
    assert(Boolean(tag), `tag ${ErrorMessages.RequiredParam}`);

    const { wallet } = this.transaction;
    const data = JSON.stringify({
      _tag: tag,
      params: args
    });
    const tx = this.transaction.new({
      data,
      priority,
      toAddr: this.contractAddress,
      ...params
    });
    const result = await wallet.sign(tx);

    return new Transaction(result as TxParams);
  }

  public async getState() {
    assert(Boolean(this.address), `this.address ${ErrorMessages.RequiredParam}`);

    const { RPCMethod } = this.transaction.provider;
    const { result, error } = await this.transaction.provider.send(
      RPCMethod.GetSmartContractState,
      this.contractAddress
    );

    if (error) {
      throw new Error(String(error));
    }

    return result;
  }

  public async getSubState(variableName: string, indices: string[] = []) {
    assert(Boolean(this.address), `this.address ${ErrorMessages.RequiredParam}`);
    assert(Boolean(variableName), `variableName ${ErrorMessages.RequiredParam}`);
    assert(Array.isArray(indices), `indices ${ErrorMessages.RequiredParam}`);

    const { RPCMethod } = this.transaction.provider;
    const { result, error } = await this.transaction.provider.send(
      RPCMethod.GetSmartContractSubState,
      this.contractAddress,
      variableName,
      indices
    );

    if (error) {
      throw new Error(String(error));
    }

    return result;
  }

  public async getInit(): Promise<object[]> {
    assert(Boolean(this.address), `this.address ${ErrorMessages.RequiredParam}`);

    const { RPCMethod } = this.transaction.provider;
    const { result, error } = await this.transaction.provider.send(
      RPCMethod.GetSmartContractInit,
      this.contractAddress
    );

    if (error) {
      throw new Error(String(error));
    }

    this.init = result as object[];

    return result as object[];
  }

  public async getCode() {
    assert(Boolean(this.address), `this.address ${ErrorMessages.RequiredParam}`);

    const { RPCMethod } = this.transaction.provider;
    const { result, error } = await this.transaction.provider.send(
      RPCMethod.GetSmartContractCode,
      this.contractAddress
    );

    if (TypeOf.isObject(result)) {
      this.code = String(result['code']);
    }

    if (error) {
      throw new Error(String(error));
    }

    return this.code;
  }
}

export class ContractControl {
  public transactions: TransactionFactory;

  constructor(transactions: TransactionFactory) {
    this.transactions = transactions;
  }

  public at(address: string, code: string) {
    return new Contract(this.transactions, address, code);
  }

  public new(code: string, init: object[]) {
    return new Contract(this.transactions, undefined, code, init);
  }
}
