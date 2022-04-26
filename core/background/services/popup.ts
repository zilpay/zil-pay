/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import { Runtime } from 'lib/runtime';
import { Common } from 'config/common';
import { Fields } from 'config/fields';
import { BrowserStorage, buildObject } from 'lib/storage';

export class PromptService {
  readonly #height = Common.POPUP_HEIGHT;
  readonly #width = Common.POPUP_WIDTH;
  readonly #type = 'popup';

  #enabled = true;
  #id: number;

  public get enabled() {
    return this.#enabled;
  }

  public openTab() {
    Runtime.tabs.create({
      url: String(Common.PROMT_PAGE)
    });
  }

  public async open(): Promise<void> {
    if (!this.enabled) {
      return;
    }
    const createData: object = {
      type: this.#type,
      url: `${Common.PROMT_PAGE}?type=popup`,
      width: this.#width,
      height: this.#height,
      focused: true
    };
    try {
      const lastPopups = await this.#getPopup();

      if (lastPopups && lastPopups.length > 0) {
        for (let index = 0; index < lastPopups.length; index++) {
          const popup = lastPopups[index];
  
          Runtime.windows.remove(popup.id, console.error);
        }
      }
  
      Runtime.windows.create(createData, (tab) => {
        this.#id = tab.id;
      });
    } catch (err) {
      console.warn(err);
    }
  }

  public async setEnabled(value: boolean) {
    this.#enabled = Boolean(value);

    await BrowserStorage.set(
      buildObject(Fields.POPUP_ENABLED, String(this.#enabled ? 1 : 0))
    );
  }

  public async sync() {
    const enabled = await BrowserStorage.get(
      Fields.POPUP_ENABLED
    );

    if (!enabled) {
      await this.reset();
    } else {
      this.#enabled = Number(enabled) === 1;
    }
  }

  public async reset() {
    this.#enabled = true;
    await BrowserStorage.set(
      buildObject(Fields.POPUP_ENABLED, String(1))
    );
  }

  #getPopup(): Promise<chrome.windows.Window[]> {
    return new Promise((resolve) => {
      Runtime.windows.getAll({}, (tabs) => {
        const list = tabs.filter(tab => tab.type === this.#type);
        resolve(list);
      })
    });
  }
}
