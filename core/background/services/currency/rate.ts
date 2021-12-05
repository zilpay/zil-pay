/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type { RateCurrencies } from 'types/zilliqa';
import { APIs } from 'config/api-list';
import { DEFAULT_CURRENCIES } from 'config/currencies';
import { BrowserStorage, buildObject } from 'lib/storage';
import { Runtime } from 'lib/runtime';
import { Fields } from 'config/fields';

export class RateController {
  readonly #name = `rate/${Runtime.runtime.id}/zilpay`;
  readonly #delay = 15; // approximately 15 minuts.

  #rate: RateCurrencies;

  public get rate() {
    return this.#rate;
  }

  public get name() {
    return this.#name;
  }

  constructor() {
    Runtime.alarms.create(this.#name, {
      delayInMinutes: this.#delay,
      periodInMinutes: this.#delay
    });
  }

  public async updateRate() {
    try {
      const currencies = DEFAULT_CURRENCIES.join();
      const url = `${APIs.COIN_GECKO}?ids=zilliqa&vs_currencies=${currencies}`;
  
      const response = await fetch(url);
      const data = await response.json();
      const rate = data.zilliqa as RateCurrencies;
  
      await this.#setRate(rate); 
    } catch (err) {
      console.error('updateRate', err);
    }
  }

  public async reset() {
    this.#rate = {
      btc: 0,
      eth: 0,
      usd: 0
    };

    await this.updateRate();

    await BrowserStorage.set(
      buildObject(Fields.RATE_CURRENCIES, this.rate)
    );
  }

  public async sync() {
    const jsonData = await BrowserStorage.get(Fields.RATE_CURRENCIES);

    try {
      const rate = JSON.parse(String(jsonData));

      this.#rate = rate;
    } catch {
      await this.reset();
    }
  }

  async #setRate(newRate: RateCurrencies) {
    this.#rate = newRate;

    await BrowserStorage.set(
      buildObject(Fields.RATE_CURRENCIES, this.rate)
    );
  }
}
