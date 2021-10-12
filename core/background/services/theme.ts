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

export enum Themes {
  Light,
  Dark
}

export class ThemeController {
  private _selected: Themes;

  public get selected() {
    return this._selected;
  }

  public async update(newSelected: Themes) {
    this._selected = newSelected;

    await BrowserStorage.set(
      buildObject(Fields.SELECTED_CURRENCY, String(this.selected))
    );
  }

  public async sync() {
    const content = await BrowserStorage.get(Fields.THEME);
    const theme = Number(content);

    if (!content || isNaN(theme)) {
      return this.reset();
    }

    this._selected = Number(content);
  }

  public async reset() {
    this._selected = Themes.Light;

    await BrowserStorage.set(
      buildObject(Fields.THEME, String(Themes.Light))
    );
  }
}
