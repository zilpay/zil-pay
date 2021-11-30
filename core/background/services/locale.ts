/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import { BrowserStorage, buildObject } from 'lib/storage';
import { Fields } from 'config/fields';
import { Locales } from 'config/locale';

export class LocalesController {
  #selected: Locales;

  public get selected() {
    return this.#selected;
  }

  public async setLocale(newSelected: Locales) {
    this.#selected = newSelected;

    await BrowserStorage.set(
      buildObject(Fields.THEME, String(this.selected))
    );
  }

  public async sync() {
    const content = await BrowserStorage.get(Fields.LOCALE);

    if (!content) {
      return this.reset();
    }

    this.#selected = content as Locales;
  }

  public async reset() {
    this.#selected = Locales.Auto;

    await BrowserStorage.set(
      buildObject(Fields.LOCALE, String(this.selected))
    );
  }
}
