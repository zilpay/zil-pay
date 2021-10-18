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
import type { TxParams } from 'types/transaction';
import { Transaction } from 'lib/utils/tx-builder';

export class ZilPayTransaction {
  private readonly _core: ZIlPayCore;

  constructor(core: ZIlPayCore) {
    this._core = core;
  }

  public async addConfirm(params: TxParams, sendResponse: StreamResponse) {
    try {
      await this._core.transactions.addConfirm(params);

      sendResponse({
        resolve: this._core.state
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  public async signSendTx(params: TxParams, sendResponse: StreamResponse) {
    try {
      const account = this._core.account.selectedAccount;
      const keyPair = await this._core.account.getKeyPair();
      const newTx = new Transaction(
        params.amount,
        params.gasLimit,
        params.gasPrice,
        account,
        params.toAddr,
        this._core.netwrok.selected,
        0,
        params.code,
        params.data
      );

      if (!params.version) {
        const version = await this._core.zilliqa.getNetworkId();
        newTx.setVersion(version, this._core.netwrok);
      } else {
        newTx.setVersion(params.version, this._core.netwrok);
      }

      newTx.sign(keyPair.privKey);

      sendResponse({
        resolve: newTx
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }
}
