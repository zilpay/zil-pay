/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2020 ZilPay
 */

import type { SSN } from 'types/ssn';
import type { NetworkControl } from 'core/background/services/network';
import type { Transaction } from 'background/services/transactions/tx-builder';
import type { Balance, RPCResponse, RPCBody } from 'types/zilliqa';

import assert from 'assert';
import { NETWORK, NETWORK_KEYS } from 'config/network';
import { toChecksumAddress, tohexString } from 'lib/utils/address';
import { Methods } from './methods';
import { JsonRPCCodes } from './codes';
import { Contracts } from 'config/contracts';
import { ErrorMessages } from 'config/errors';
import { DEFAULT_SSN } from 'core/background/services/ssn';
import { HttpProvider } from './http-provider';

export class ZilliqaControl {
  #network: NetworkControl;
  public readonly provider = new HttpProvider();

  constructor(network: NetworkControl) {
    this.#network = network;
  }

  /**
   * Getting account balance and nonce.
   * @param address - Account address in base16 format.
   */
  public async getBalance(address: string): Promise<Balance> {
    address = tohexString(address);

    const body = this.provider.buildBody(Methods.getBalance, [address]);
    const request = this.provider.json(body);
    const responce = await fetch(this.#network.provider, request);
    assert(responce.status === 200, ErrorMessages.RequestFailed);
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

    const body = this.provider.buildBody(Methods.GetSmartContractInit, [contract]);
    const { result } = await this.sendJson(body);
    return result;
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

    const body = this.provider.buildBody(
      Methods.GetSmartContractSubState,
      [contract, field, params]
    );
    const { result } = await this.sendJson(body);
    return result;
  }

  public async getLatestTxBlock() {
    const body = this.provider.buildBody(Methods.GetLatestTxBlock, []);
    const { result } = await this.sendJson(body);
    return result;
  }

  public async getRecentTransactions() {
    const body = this.provider.buildBody(Methods.GetRecentTransactions, []);
    const { result } = await this.sendJson(body);
    return result;
  }

  public async getNetworkId() {
    const body = this.provider.buildBody(Methods.GetNetworkId, []);
    const { result } = await this.sendJson(body);

    return Number(result);
  }

  public async detectSacmAddress(address: string) {
    const field = 'balances';
    let isScam = false;

    address = tohexString(address);

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

    assert(!isScam, ErrorMessages.Scam);
  }

  public async send(tx: Transaction) {
    await this.detectSacmAddress(tx.toAddr);

    const body = this.provider.buildBody(
      Methods.CreateTransaction,
      [tx.self]
    );
    const request = this.provider.json(body);
    const responce = await fetch(this.#network.provider, request);
    const { error, result } = await responce.json();

    assert(!error, error);

    return result;
  }

  public async getTransactionStatus(hash: string) {
    hash = tohexString(hash);
    const body = this.provider.buildBody(Methods.GetTransactionStatus, [hash]);
    const { result } = await this.sendJson(body);
    return result;
  }

  public async getMinimumGasPrice() {
    const body = this.provider.buildBody(Methods.GetMinimumGasPrice, []);
    const { result } = await this.sendJson(body);
    return result;
  }

  public async getSSnList(): Promise<SSN[]> {
    const [mainnet] = NETWORK_KEYS;
    assert(this.#network.selected === mainnet, ErrorMessages.SSnAllowNet);

    const field = 'ssnlist';
    const contract = tohexString(Contracts.SSN);
    const http = NETWORK.mainnet.PROVIDER;
    const request = this.provider.json(this.provider.buildBody(
      Methods.GetSmartContractSubState,
      [contract, field, []]
    ));
    const responce = await fetch(http, request);
    const data = await responce.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    const ssnlist = data.result[field];
    const list = Object.keys(ssnlist).map((addr) => ({
      address: addr,
      name: ssnlist[addr].arguments[3],
      api: ssnlist[addr].arguments[5]
    }));
    const ssnList = [DEFAULT_SSN, ...list].map(async(ssn) => {
      const t0 = performance.now();
      try {
        const body = this.provider.buildBody(
          Methods.GetNetworkId,
          []
        );
        const r = this.provider.json(body);
        const res = await fetch(ssn.api, r);
        const { error, result } = await res.json();

        if (error) {
          throw new Error(error.message);
        }

        const id = Number(result);
        const t1 = performance.now();

        return {
          ...ssn,
          id,
          time: t1 - t0,
          ok: res.ok
        };
      } catch {
        const t1 = performance.now();
        return {
          ...ssn,
          id: 0,
          time: t1 - t0,
          ok: false
        };
      }
    });
    const gotSSN = await Promise.all(ssnList);

    return gotSSN.filter((ssn) => ssn.ok);
  }

  public async sendJson(...body: RPCBody[]) {
    const request = this.provider.json(...body);
    const responce = await fetch(this.#network.provider, request);

    assert(responce.status === 200, ErrorMessages.RequestFailed);

    const data = await responce.json();

    if (Array.isArray(data)) {
      return data as RPCResponse[];
    }

    if (data.error && data.error.code === -5) {
      // Account is not created
      data.result = {
        balance: '0',
        nonce: 0
      };
      data.error = undefined;
    }

    if (data.error) {
      throw new Error(data.error.message);
    }

    return data;
  }

  public async sendJsonNative(...body: RPCBody[]) {
    const request = this.provider.json(...body);
    const responce = await fetch(this.#network.nativeHttp, request);

    assert(responce.status === 200, ErrorMessages.RequestFailed);

    const data = await responce.json();

    if (Array.isArray(data)) {
      return data as RPCResponse[];
    }

    if (data.error) {
      throw new Error(data.error.message);
    }

    return data;
  }
}
