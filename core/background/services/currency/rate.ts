/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import { APIs } from 'config/api-list';
import { DEFAULT_CURRENCIES } from 'config/currencies';
import { BrowserStorage, buildObject } from 'lib/storage';
import { Fields } from 'config/fields';

export interface RateCurrencies {
  btc: number;
  eth: number;
  usd: number;
}

export class RateController {
  private _rate: RateCurrencies;

  public get rate() {
    return this._rate;
  }

  public async updateRate() {
    const currencies = DEFAULT_CURRENCIES.join();
    const url = `${APIs.COIN_GECKO}?ids=zilliqa&vs_currencies=${currencies}`;

    const response = await fetch(url);
    const data = await response.json();
    const rate = data.zilliqa as RateCurrencies;

    await this._setRate(rate);
  }

  public async reset() {
    this._rate = {
      btc: 0,
      eth: 0,
      usd: 0
    };

    await BrowserStorage.set(
      buildObject(Fields.RATE_CURRENCIES, this.rate)
    );
  }

  public async sync() {
    const jsonData = await BrowserStorage.get(Fields.RATE_CURRENCIES);

    try {
      const rate = JSON.parse(String(jsonData));

      this._rate = rate;
    } catch {
      await this.reset();
    }
  }

  private async _setRate(newRate: RateCurrencies) {
    this._rate = newRate;

    await BrowserStorage.set(
      buildObject(Fields.RATE_CURRENCIES, this.rate)
    );
  }
}
