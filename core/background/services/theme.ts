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
import { Themes } from 'config/theme';

export class ThemeController {
  #selected: Themes;

  public get selected() {
    return this.#selected;
  }

  public async setTheme(newSelected: Themes) {
    this.#selected = newSelected;

    await BrowserStorage.set(
      buildObject(Fields.THEME, String(this.selected))
    );
  }

  public async sync() {
    const content = await BrowserStorage.get(Fields.THEME);

    if (!content) {
      return this.reset();
    }

    this.#selected = content as Themes;
  }

  public async reset() {
    this.#selected = Themes.Light;

    await BrowserStorage.set(
      buildObject(Fields.THEME, String(Themes.Light))
    );
  }
}
