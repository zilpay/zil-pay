/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import { DEFAULT_CURRENCIES } from 'config/currencies';
import assert from 'assert';
import { BrowserStorage, buildObject } from 'lib/storage';
import { Fields } from 'config/fields';
import { ErrorMessages } from 'config/errors';

export class CurrenciesController {
  private _selected: string;

  public get selected() {
    return this._selected;
  }

  public async update(newSelected: 'usd' | 'btc' | 'eth') {
    assert(
      DEFAULT_CURRENCIES.includes(newSelected),
      `${ErrorMessages.IncorrectParams} newSelected`
    );

    this._selected = newSelected;

    await BrowserStorage.set(
      buildObject(Fields.SELECTED_CURRENCY, this.selected)
    );
  }

  public async sync() {
    const content = await BrowserStorage.get(Fields.SELECTED_CURRENCY);
    const selected = String(content);

    if (!content || !DEFAULT_CURRENCIES.includes(selected)) {
      return this.reset();
    }

    this._selected = selected;
  }

  public async reset() {
    this._selected = DEFAULT_CURRENCIES[0];

    await BrowserStorage.set(
      buildObject(Fields.SELECTED_CURRENCY, this.selected)
    );
  }
}
