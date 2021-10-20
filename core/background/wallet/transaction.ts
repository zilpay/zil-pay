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
  readonly #core: ZIlPayCore;

  constructor(core: ZIlPayCore) {
    this.#core = core;
  }

  public async addConfirm(params: MinParams, sendResponse: StreamResponse) {
    try {
      await this.#core.transactions.addConfirm(params);

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
      await this.#core.transactions.clearHistory();

      sendResponse({
        resolve: this.#core.transactions.transactions
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  public async rejectAll(sendResponse: StreamResponse) {
    try {
      await this.#core.transactions.clearConfirm();

      sendResponse({
        resolve: this.#core.transactions.forConfirm
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  public async rmConfirm(index: number, sendResponse: StreamResponse) {
    try {
      await this.#core.transactions.rmConfirm(index);

      sendResponse({
        resolve: this.#core.transactions.forConfirm
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  public async signSendTx(accIndex: number, params: MinParams, sendResponse: StreamResponse) {
    try {
      await this.#core.account.select(accIndex);
      await this.#core.transactions.sync();

      let token = {
        decimals: ZIL.decimals,
        symbol: ZIL.symbol
      };
      const account = this.#core.account.selectedAccount;
      const keyPair = await this.#core.account.getKeyPair();
      const nonce = await this.#core.nonceCounter.nextNonce(account);
      const newTx = new Transaction(
        params.amount,
        params.gasLimit,
        params.gasPrice,
        account,
        params.toAddr,
        this.#core.netwrok.selected,
        nonce,
        params.code,
        params.data
      );

      if (!params.version) {
        const version = await this.#core.zilliqa.getNetworkId();
        newTx.setVersion(version, this.#core.netwrok);
      } else {
        newTx.setVersion(params.version, this.#core.netwrok);
      }

      if (newTx.transactionType === TransactionTypes.Transfer) {
        token = await this.#getToken(newTx.toAddr);
      }

      newTx.sign(keyPair.privKey);
      const hash = await this.#core.zilliqa.send(newTx);
      newTx.setHash(hash);
      await this.#core.transactions.addHistory({
        token,
        confirmed: false,
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
        resolve: this.#core.transactions.transactions
      });
    } catch (err) {
      sendResponse({
        reject: err.message || err
      });
    }
  }

  async #getToken(toAddr: string) {
    try {
      const init = await this.#core.zrc2.getZRCInit(toAddr);

      return {
        decimals: init.decimals,
        symbol: init.symbol
      };
    } catch {
      return {
        decimals: ZIL.decimals,
        symbol: ZIL.symbol
      };
    }
  }
}
