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
import type { AppConnect } from 'types/app-connect';
import { MTypeTab } from 'lib/streem/stream-keys';
import { TabsMessage } from 'lib/streem/tabs-message';
import { ErrorMessages } from 'config/errors';

export class ZilPayApps {
  readonly #core: ZIlPayCore;

  constructor(core: ZIlPayCore) {
    this.#core = core;
  }

  public showWalletData(domain: string, sendResponse: StreamResponse) {
    try {
      const has = this.#core.apps.isConnected(domain);
      let account = null;

      if (has) {
        account = {
          base16: this.#core.account.selectedAccount.base16,
          bech32: this.#core.account.selectedAccount.bech32
        }
      }

      sendResponse({
        resolve: {
          account,
          netwrok: this.#core.netwrok.selected,
          http: this.#core.netwrok.provider,
          nativeHttp: this.#core.netwrok.nativeHttp,
          isConnect: has,
          isEnable: this.#core.guard.isEnable,
          phishing: this.#core.apps.phishing
        }
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  public async setPhishing(value: boolean, sendResponse: StreamResponse) {
    try {
      this.#core.guard.checkSession();
      await this.#core.apps.setPhishing(value);

      sendResponse({
        resolve: this.#core.state
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  public async userResponse(confiremd: boolean, sendResponse: StreamResponse) {
    try {
      this.#core.guard.checkSession();
      const app = this.#core.apps.confirmApp;
      const uuid = String(app.uuid);

      if (confiremd) {
        const account = {
          base16: this.#core.account.selectedAccount.base16,
          bech32: this.#core.account.selectedAccount.bech32
        };
        await new TabsMessage({
          type: MTypeTab.RESPONSE_TO_DAPP,
          payload: {
            uuid,
            account
          }
        }).send();
        try {
          await this.#core.apps.add(app);
        } catch {
          await this.#core.apps.rejectConfirm();
        }
      } else {
        await new TabsMessage({
          type: MTypeTab.RESPONSE_TO_DAPP,
          payload: {
            uuid,
            reject: ErrorMessages.Rejected
          }
        }).send();
        await this.#core.apps.rejectConfirm();
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

  public async addConfirm(app: AppConnect, sendResponse: StreamResponse) {
    try {
      const has = this.#core.apps.isConnected(app.domain);

      if (has && this.#core.guard.isEnable) {
        const account = {
          base16: this.#core.account.selectedAccount.base16,
          bech32: this.#core.account.selectedAccount.bech32
        };
        await new TabsMessage({
          type: MTypeTab.RESPONSE_TO_DAPP,
          payload: {
            account,
            uuid: app.uuid
          }
        }).send();
      } else {
        await this.#core.apps.addConfirm(app);
        sendResponse({
          resolve: {
            app
          }
        });
        await this.#core.prompt.open();
      }
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  public async removeApp(index: number, sendResponse: StreamResponse) {
    try {
      this.#core.guard.checkSession();
      await this.#core.apps.rm(index);

      sendResponse({
        resolve: this.#core.state
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  public async clearApps(sendResponse: StreamResponse) {
    try {
      this.#core.guard.checkSession();
      await this.#core.apps.reset();

      sendResponse({
        resolve: this.#core.state
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }
}
