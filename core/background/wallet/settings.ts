/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type { Locales } from 'config/locale';
import type { Themes } from 'config/theme';
import type { StreamResponse } from 'types/stream';
import type { ZIlPayCore } from './core';

export class ZilPaySettings {
  readonly #core: ZIlPayCore;

  constructor(core: ZIlPayCore) {
    this.#core = core;
  }

  public async changeLocale(locale: Locales, sendResponse: StreamResponse) {
    try {
      await this.#core.locale.setLocale(locale);

      sendResponse({
        resolve: this.#core.state
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  public async resetLocale(sendResponse: StreamResponse) {
    try {
      await this.#core.locale.reset();

      sendResponse({
        resolve: this.#core.state
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  public async changeTheme(theme: Themes, sendResponse: StreamResponse) {
    try {
      await this.#core.theme.setTheme(theme);

      sendResponse({
        resolve: this.#core.state
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  public async resetTheme(sendResponse: StreamResponse) {
    try {
      await this.#core.theme.reset();

      sendResponse({
        resolve: this.#core.state
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  public async changeCurrency(currecny: string, sendResponse: StreamResponse) {
    try {
      await this.#core.currencies.update(currecny);

      sendResponse({
        resolve: this.#core.state
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  public async resetCurrency(sendResponse: StreamResponse) {
    try {
      await this.#core.currencies.reset();

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
