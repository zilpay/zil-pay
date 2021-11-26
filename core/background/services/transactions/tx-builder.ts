/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type { NetworkControl } from 'core/background/services/network';
import type { TxParams } from 'types/transaction';
import type { Account } from 'types/account';
import type { GasController } from 'core/background/services/gas';

import { ZilliqaMessage } from '@zilliqa-js/proto';
import { Buffer } from 'buffer';
import BN from 'bn.js';
import Long from 'long';

import {
  pack,
  hexToByteArray,
} from 'lib/utils/bytes';
import {
  toChecksumAddress,
  isAddress,
  tohexString
} from 'lib/utils/address';

import { fromLI } from 'lib/filters/gas-to-fee';
import { SchnorrControl } from 'lib/crypto/elliptic';
import { TransactionTypes } from './types';
import { toBech32Address } from 'lib/utils/bech32';

export interface ContractItemType {
  vname: string;
  type: string;
  value: string;
}

export class Transaction {
  public amount: string;
  public code: string;
  public data: string;
  public gasLimit: Long;
  public gasPrice: number;
  public nonce: number;
  public priority: boolean;
  public pubKey: string;
  public toAddr: string;
  public from: string;
  public net: string;
  public version?: number;
  public signature?: string;
  public hash?: string;
  public direction?: string;
  public timestamp?: number;
  public cancel?: boolean;

  public get transactionType(): TransactionTypes {
    if (this.code) {
      return TransactionTypes.Deploy;
    }

    if (this.data) {
      return TransactionTypes.Triggered;
    }

    return TransactionTypes.Payment;
  }

  public get tag(): string {
    if (this.data && this.code) {
      return TransactionTypes.Deploy;
    }

    if (this.cancel) {
      return TransactionTypes.Cancel;
    }

    if (this.data) {
      const parsed = JSON.parse(this.data);

      return parsed._tag;
    }

    return TransactionTypes.Payment;
  }

  public get tokenAmount() {
    try {
      const parsed = JSON.parse(this.data);

      if (parsed._tag === TransactionTypes.Transfer) {
        const param = parsed.params.find(
          (el: ContractItemType) => el.vname === 'amount'
        );

        if (param.value) {
          return param.value;
        }
      }

      return this.amount;
    } catch {
      return this.amount;
    }
  }

  public get self(): TxParams {
    return {
      amount: this.amount,
      code: this.code,
      data: this.data,
      gasLimit: this.gasLimit.toString(),
      gasPrice: fromLI(this.gasPrice),
      nonce: this.nonce,
      priority: this.priority,
      pubKey: this.pubKey,
      signature: this.signature,
      toAddr: this.toAddr,
      version: this.version,
      hash: this.hash
    };
  }

  public get recipient() {
    try {
      if (this.tag === TransactionTypes.Transfer) {
        const parsed = JSON.parse(this.data);

        return toBech32Address(parsed.params[0].value);
      }
    } catch {
      //
    }

    return toBech32Address(this.toAddr);
  }

  public get fee() {
    return (this.gasPrice * Number(this.gasLimit)) / 10e5;
  }

  constructor(
    amount: string,
    gasLimit: string | number,
    gasPrice: string | number,
    account: Account,
    toAddr: string,
    net: string,
    nonce: number,
    code = '',
    data = '',
    priority = false,
    version?: number,
    signature?: string
  ) {
    isAddress(toAddr);

    this.from = account.bech32;
    this.amount = amount;
    this.code = code;
    this.data = data;
    this.gasLimit = Long.fromNumber(Number(gasLimit));
    this.gasPrice = Number(gasPrice);
    this.priority = priority;
    this.pubKey = account.pubKey;
    this.toAddr = toChecksumAddress(toAddr);
    this.version = version || 0;
    this.signature = signature || '';
    this.net = net;
    this.nonce = nonce;
  }

  public setGas(gas: GasController) {
    this.gasLimit = Long.fromNumber(gas.gasLimit);
    this.gasPrice = gas.gasPrice;
  }

  public setPriority(priority: boolean) {
    this.priority = priority;
  }

  public setHash(hash: string) {
    this.hash = hash;
  }

  public setNonce(nonce: number) {
    this.nonce = nonce;
  }

  public setVersion(chainId: number, net: NetworkControl) {
    const msg = net.version;

    this.version = pack(chainId, msg);

    return this.version;
  }

  public sign(privKey: string) {
    const bytes = this.#encodeTransactionProto();
    const schnorrControl = new SchnorrControl(privKey);

    this.signature = schnorrControl.getSignature(bytes);
  }

  public encodedProto() {
    return this.#encodeTransactionProto();
  }

  #encodeTransactionProto() {
    const amount = new BN(this.amount);
    const gasPrice = new BN(fromLI(this.gasPrice));
    const msg = {
      version: this.version || 0,
      nonce: this.nonce || 0,
      // core protocol Schnorr expects lowercase, non-prefixed address.
      toaddr: hexToByteArray(tohexString(this.toAddr)),
      senderpubkey: ZilliqaMessage.ByteArray.create({
        data: hexToByteArray(this.pubKey || '00'),
      }),
      amount: ZilliqaMessage.ByteArray.create({
        data: Uint8Array.from(amount.toArrayLike(Buffer, undefined, 16)),
      }),
      gasprice: ZilliqaMessage.ByteArray.create({
        data: Uint8Array.from(gasPrice.toArrayLike(Buffer, undefined, 16)),
      }),
      gaslimit: this.gasLimit,
      code:
        this.code && this.code.length
          ? Uint8Array.from([...this.code].map((c) => c.charCodeAt(0)))
          : null,
      data:
        this.data && this.data.length
          ? Uint8Array.from([...this.data].map((c) => c.charCodeAt(0)))
          : null
    };
    const serialised = ZilliqaMessage.ProtoTransactionCoreInfo.create(msg);

    return Buffer.from(
      ZilliqaMessage.ProtoTransactionCoreInfo.encode(serialised).finish()
    );
  }
}
