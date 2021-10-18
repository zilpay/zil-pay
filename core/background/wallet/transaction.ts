/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type { StreamResponse } from 'types/stream';
import type { ZIlPayCore } from './core';
import type { MinParams } from 'types/transaction';
import { Transaction } from 'background/services/transactions/tx-builder';
import { StatusCodes, TransactionTypes } from 'background/services/transactions';
import { ZIL } from 'background/services/token';

export class ZilPayTransaction {
  private readonly _core: ZIlPayCore;

  constructor(core: ZIlPayCore) {
    this._core = core;
  }

  public async addConfirm(params: MinParams, sendResponse: StreamResponse) {
    try {
      await this._core.transactions.addConfirm(params);

      sendResponse({
        resolve: params
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  public async clearHistory(sendResponse: StreamResponse) {
    try {
      await this._core.transactions.clearHistory();

      sendResponse({
        resolve: this._core.transactions.transactions
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  public async rejectAll(sendResponse: StreamResponse) {
    try {
      await this._core.transactions.clearConfirm();

      sendResponse({
        resolve: this._core.transactions.forConfirm
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  public async rmConfirm(index: number, sendResponse: StreamResponse) {
    try {
      await this._core.transactions.rmConfirm(index);

      sendResponse({
        resolve: this._core.transactions.forConfirm
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  public async signSendTx(params: MinParams, sendResponse: StreamResponse) {
    try {
      let token = {
        decimals: ZIL.decimals,
        symbol: ZIL.symbol
      };
      const account = this._core.account.selectedAccount;
      const keyPair = await this._core.account.getKeyPair();
      const nonce = await this._core.nonceCounter.getNonce(account);
      const newTx = new Transaction(
        params.amount,
        params.gasLimit,
        params.gasPrice,
        account,
        params.toAddr,
        this._core.netwrok.selected,
        nonce + 1,
        params.code,
        params.data
      );

      if (!params.version) {
        const version = await this._core.zilliqa.getNetworkId();
        newTx.setVersion(version, this._core.netwrok);
      } else {
        newTx.setVersion(params.version, this._core.netwrok);
      }

      if (newTx.transactionType === TransactionTypes.Transfer) {
        const init = await this._core.zrc2.getZRCInit(newTx.toAddr);

        token.decimals = init.decimals;
        token.symbol = init.symbol;
      }

      newTx.sign(keyPair.privKey);
      const hash = await this._core.zilliqa.send(newTx);
      newTx.setHash(hash);
      await this._core.transactions.addHistory({
        token,
        timestamp: new Date().getTime(),
        toAddr: newTx.toAddr,
        recipient: newTx.recipient,
        status: StatusCodes.Pending,
        teg: newTx.tag,
        amount: newTx.tokenAmount,
        type: newTx.transactionType,
        fee: newTx.fee,
        nonce: newTx.nonce,
        from: account.bech32,
        hash: newTx.hash
      });

      sendResponse({
        resolve: this._core.transactions.transactions
      });
    } catch (err) {
      sendResponse({
        reject: err.message || err
      });
    }
  }
}
