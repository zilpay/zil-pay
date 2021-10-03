/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2020 ZilPay
 */

import type { NetworkControl } from 'core/background/services/network';
import type { TxParams } from 'types/transaction';
import type { Transaction } from 'lib/utils/tx-builder';

import { toChecksumAddress, tohexString } from 'lib/utils/address';
import { Methods } from './methods';
import { JsonRPCCodes } from './codes';
import { Contracts } from 'config/contracts';

type Params = TxParams[] | string[] | number[] | (string | string[] | number[])[];
type Balance = {
  nonce: number;
  balance: string;
};

export class ZilliqaControl {
  private _network: NetworkControl;

  constructor(network: NetworkControl) {
    this._network = network;
  }

  /**
   * Getting account balance and nonce.
   * @param address - Account address in base16 format.
   */
  public async getBalance(address: string): Promise<Balance> {
    address = tohexString(address);

    const request = this._json(Methods.getBalance, [address]);
    const responce = await fetch(this._network.provider, request);

    if (responce.status !== 200) {
      throw new Error('Something Wrong with node.');
    }

    const data = await responce.json();

    if (data && data.result && data.result.balance) {
      return data.result;
    }

    if (data.error && data.error.code === JsonRPCCodes.AccountIsMotCreated) {
      return {
        balance: '0',
        nonce: 0
      };
    }

    throw new Error(data.error.message);
  }

  /**
   * Getting contract init(constructor).
   * @param contract - Contract address in base16 format.
   */
  public async getSmartContractInit(contract: string) {
    contract = tohexString(contract);

    const request = this._json(Methods.GetSmartContractInit, [contract]);
    const responce = await fetch(this._network.provider, request);
    const data = await responce.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    return data.result;
  }

  /**
   * Get Field information of contract.
   * @param contract - Contract address in base16 format.
   * @param field - Field of smart contract.
   * @param params - Params of contract Map field.
   */
  public async getSmartContractSubState(
    contract: string,
    field: string,
    params: string[] | number[] = []
  ) {
    contract = tohexString(contract);

    const request = this._json(
      Methods.GetSmartContractSubState,
      [contract, field, params]
    );
    const responce = await fetch(this._network.provider, request);

    if (responce.status !== 200) {
      throw new Error('Something wrong with node.');
    }

    const data = await responce.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    return data.result;
  }

  public async getLatestTxBlock() {
    const request = this._json(Methods.GetLatestTxBlock, []);
    const responce = await fetch(this._network.provider, request);
    const data = await responce.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    return data.result;
  }

  public async getRecentTransactions() {
    const request = this._json(Methods.GetRecentTransactions, []);
    const responce = await fetch(this._network.provider, request);
    const data = await responce.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    return data.result;
  }

  public async getNetworkId() {
    const request = this._json(Methods.GetNetworkId, []);
    const responce = await fetch(this._network.provider, request);
    const data = await responce.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    return Number(data.result);
  }

  public async detectSacmAddress(address: string) {
    const field = 'balances';
    let isScam = false;

    address = toChecksumAddress(address).toLowerCase();

    try {
      const result = await this.getSmartContractSubState(
        Contracts.SCAM,
        field,
        [address]
      );

      if (result && result[field] && result[field][address]) {
        isScam = Number(result[field][address]) > 0;
      }

    } catch {
      //
    }

    if (isScam) {
      throw new Error('Scam detected');
    }
  }

  public async send(tx: Transaction): Promise<string> {
    await this.detectSacmAddress(tx.toAddr);

    const request = this._json(Methods.CreateTransaction, [
      tx.self
    ]);
    const responce = await fetch(this._network.provider, request);
    const { error, result } = await responce.json();

    if (error && error.message) {
      throw new Error(error.message);
    }

    if (result && result.TranID) {
      return result.TranID;
    }

    throw new Error('Netwrok fail');
  }

  public async getTransactionStatus(hash: string) {
    hash = tohexString(hash);

    const request = this._json(Methods.GetTransactionStatus, [hash]);
    const responce = await fetch(this._network.nativeHttp, request);

    if (responce.status !== 200) {
      throw new Error('Something Wrong with node');
    }

    const data = await responce.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    return data.result;
  }

  public async getMinimumGasPrice() {
    const request = this._json(Methods.GetMinimumGasPrice, []);
    const responce = await fetch(this._network.provider, request);
    const data = await responce.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    return data.result;
  }

  public async getTransaction(hash: string) {
    hash = tohexString(hash);

    const request = this._json(Methods.GetTransaction, [hash]);
    const responce = await fetch(this._network.provider, request);
    const data = await responce.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    return data.result;
  }

  private _json(method: string, params: Params) {
    return {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        method,
        params,
        id: 1,
        jsonrpc: '2.0'
      })
    };
  }
}
