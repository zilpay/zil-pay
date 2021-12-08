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
import type {
  MessageParams,
  MessagePayload,
  MinParams,
  TransactionForConfirm
} from 'types/transaction';

import { Transaction } from 'background/services/transactions/tx-builder';
import { StatusCodes, TransactionTypes } from 'background/services/transactions';
import { ZIL } from 'background/services/token';
import { MTypeTab } from 'lib/streem/stream-keys';
import { TabsMessage } from 'lib/streem/tabs-message';
import { ErrorMessages } from 'config/errors';
import { Aes } from 'lib/crypto/aes';
import { SchnorrControl } from 'lib/crypto/elliptic';
import { Buffer } from 'buffer';
import { AccountTypes } from 'config/account-type';
import { toBech32Address } from 'lib/utils/bech32';
import { Methods } from 'background/services/blockchain';
import { tohexString } from 'lib/utils/address';
import { toLi } from 'lib/filters/gas-to-fee';
import { TypeOf } from 'lib/type/type-checker';

export class ZilPayTransaction {

  readonly #core: ZIlPayCore;

  constructor(core: ZIlPayCore) {
    this.#core = core;
  }

  public async getCurrentNonce(sendResponse: StreamResponse) {
    try {
      const account = this.#core.account.selectedAccount;
      const nonce = await this.#core.nonceCounter.nextNonce(account);

      sendResponse({
        resolve: nonce
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  public async resetNonce(sendResponse: StreamResponse) {
    try {
      this.#core.guard.checkSession();
      const account = this.#core.account.selectedAccount;
      const nonce = await this.#core.nonceCounter.resetNonce(account);

      sendResponse({
        resolve: nonce
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  public async addConfirm(params: MinParams, sendResponse: StreamResponse) {
    let token = {
      decimals: ZIL.decimals,
      symbol: ZIL.symbol,
      bech32: ZIL.bech32
    };

    try {
      const payload = new Transaction(
        params.amount,
        params.gasLimit,
        params.cancel ? params.gasPrice : this.#core.gas.gasPrice,
        this.#core.account.selectedAccount,
        params.toAddr,
        this.#core.netwrok.selected,
        0,
        params.code,
        params.data,
        params.priority
      );

      payload.cancel = params.cancel;

      if (payload.tag === TransactionTypes.Transfer) {
        token = await this.#getToken(payload.toAddr);
      }

      await this.#core.transactions.addConfirm({
        token,
        ...params,
        toAddr: payload.toAddr,
        teg: payload.tag,
        tokenAmount: payload.tokenAmount,
        amount: payload.amount,
        fee: payload.fee,
        recipient: payload.recipient,
        gasLimit: Number(params.gasLimit),
        gasPrice: payload.gasPrice
      });

      if (params.uuid) {
        await this.#core.prompt.open();
      }

      sendResponse({
        resolve: this.#core.state
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  public async clearHistory(sendResponse: StreamResponse) {
    try {
      this.#core.guard.checkSession();
      await this.#core.transactions.clearHistory();

      sendResponse({
        resolve: this.#core.state
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  public async rejectAll(sendResponse: StreamResponse) {
    try {
      this.#core.guard.checkSession();
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
      this.#core.guard.checkSession();
      const tx = this.#core.transactions.forConfirm[index];

      await new TabsMessage({
        type: MTypeTab.TX_RESULT,
        payload: {
          uuid: tx.uuid,
          reject: ErrorMessages.Rejected
        }
      }).send();

      await this.#core.transactions.rmConfirm(index);

      sendResponse({
        resolve: this.#core.state
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  public async getRequiredParams(accIndex: number, sendResponse: StreamResponse) {
    try {
      const account = this.#core.account.getAccount(accIndex);
      const identities = [
        this.#core.zilliqa.provider.buildBody(
          Methods.GetNetworkId,
          []
        ),
        this.#core.zilliqa.provider.buildBody(
          Methods.getBalance,
          [tohexString(account.base16)]
        ),
        this.#core.zilliqa.provider.buildBody(
          Methods.GetMinimumGasPrice,
          []
        )
      ];
      const [netIdRes, accountRes, gasRes] = await this.#core.zilliqa.sendJson(...identities);
      const version = netIdRes.result;
      const currentNonce = Boolean(accountRes.result) ? accountRes.result.nonce : 0;
      const minGasPrice = Number(toLi(gasRes.result));
      const nonce = this.#core.nonceCounter.calcNextNonce(currentNonce);

      sendResponse({
        resolve: {
          version,
          nonce,
          minGasPrice
        }
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  public async signSendTx(txIndex: number, accIndex: number, params: TransactionForConfirm, sendResponse: StreamResponse) {
    let token = {
      decimals: ZIL.decimals,
      symbol: ZIL.symbol,
      bech32: ZIL.bech32
    };

    try {
      await this.#core.account.select(accIndex);
      await this.#core.transactions.sync();

      const account = this.#core.account.selectedAccount;
      const nonce = isNaN(params.nonce) ?
        await this.#core.nonceCounter.nextNonce(account) : params.nonce;
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

      newTx.cancel = params.cancel;

      if (!params.version) {
        const version = await this.#core.zilliqa.getNetworkId();
        newTx.setVersion(version, this.#core.netwrok);
      } else {
        newTx.setVersion(params.version, this.#core.netwrok);
      }

      if (newTx.tag === TransactionTypes.Transfer) {
        token = await this.#getToken(newTx.toAddr);
      }

      if (account.type === AccountTypes.Ledger) {
        const transport = await this.#core.ledger.init(account.productId);
        newTx.signature = await transport.signTxn(account.index, newTx);
      } else {
        const keyPair = await this.#core.account.getKeyPair(accIndex);
        newTx.sign(keyPair.privKey);
      }

      const result = await this.#core.zilliqa.send(newTx);
      newTx.setHash(result.TranID);
      await this.#core.transactions.addHistory({
        token,
        confirmed: false,
        timestamp: new Date().getTime(),
        toAddr: newTx.toAddr,
        recipient: newTx.recipient,
        status: StatusCodes.Pending,
        teg: newTx.tag,
        tokenAmount: newTx.tokenAmount,
        amount: newTx.amount,
        type: newTx.transactionType,
        fee: newTx.fee,
        nonce: newTx.nonce,
        from: account.bech32,
        hash: newTx.hash,
        data: newTx.data,
        code: newTx.code,
        gasLimit: params.gasLimit,
        gasPrice: params.gasPrice,
        title: params.title,
        icon: params.icon
      });
      await this.#core.transactions.rmConfirm(txIndex);
      await new TabsMessage({
        type: MTypeTab.TX_RESULT,
        payload: {
          uuid: params.uuid,
          resolve: {
            ...newTx.self,
            ContractAddress: result.ContractAddress,
            Info: result.Info,
            from: account.base16
          }
        }
      }).send();
      sendResponse({
        resolve: this.#core.state
      });
    } catch (err) {
      let message = TypeOf.isObject(err.message) ?
        err.message.message : err.message;
      sendResponse({
        reject: message
      });
    }
  }

  public async checkProcessedHistory(sendResponse: StreamResponse) {
    try {
      this.#core.guard.checkSession();
      await this.#core.transactionsQueue.checkProcessedTx();

      sendResponse({
        resolve: this.#core.state
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  public async confirmSignMessage(index: number, sendResponse: StreamResponse) {
    try {
      const account = this.#core.account.wallet.identities[index];
      const message = this.#core.transactions.message;
      let signature: string;

      if (account.type === AccountTypes.Ledger) {
        const transport = await this.#core.ledger.init(account.productId);
        signature = await transport.signHash(account.index, message);
      } else {
        const keyPair = await this.#core.account.getKeyPair(index);
        const schnorrControl = new SchnorrControl(keyPair.privKey);
        const bytes = Buffer.from(message.hash, 'hex');
        signature = schnorrControl.getSignature(bytes);
      }

      await new TabsMessage({
        type: MTypeTab.SING_MESSAGE_RES,
        payload: {
          uuid: this.#core.transactions.message.uuid,
          resolve: {
            signature,
            message: message.content,
            publicKey: account.pubKey
          }
        }
      }).send();
      await this.#core.transactions.rmMessage();

      sendResponse({
        resolve: null
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  public async addMessage(params: MessageParams, sendResponse: StreamResponse) {
    try {
      const message: MessagePayload = {
        ...params,
        hash: Aes.hash(params.content)
      };
      await this.#core.transactions.addMessage(message);
      await this.#core.prompt.open();

      sendResponse({
        resolve: null
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  public async rejectMessage(sendResponse: StreamResponse) {
    try {
      this.#core.guard.checkSession();
      await new TabsMessage({
        type: MTypeTab.SING_MESSAGE_RES,
        payload: {
          uuid: this.#core.transactions.message.uuid,
          reject: ErrorMessages.Rejected
        }
      }).send();
      await this.#core.transactions.rmMessage();

      sendResponse({
        resolve: null
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  async #getToken(toAddr: string) {
    const foundToken = this.#core.zrc2.identities.find(
      (t) => String(t.base16).toLowerCase() === String(toAddr).toLowerCase()
    );

    if (foundToken) {
      return {
        decimals: foundToken.decimals,
        symbol: foundToken.symbol,
        bech32: foundToken.bech32
      };
    }
    try {
      const init = await this.#core.zrc2.getZRCInit(toAddr);

      return {
        decimals: init.decimals,
        symbol: init.symbol,
        bech32: toBech32Address(toAddr)
      };
    } catch {
      return {
        decimals: ZIL.decimals,
        symbol: ZIL.symbol,
        bech32: ZIL.bech32
      };
    }
  }
}
