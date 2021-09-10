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

export class PromptService {
  private readonly _height = Common.POPUP_HEIGHT;
  private readonly _width = Common.POPUP_WIDTH;
  private readonly _type = 'popup';
  private _id: number;

  public openTab() {
    Runtime.tabs.create({
      url: String(Common.PROMT_PAGE)
    });
  }

  public async open() {
    const {
      screenX,
      screenY,
      outerWidth,
      outerHeight
    } = window;
    const notificationTop = Math.round(
      screenY + (outerHeight / 2) - (this._height / 2)
    );
    const notificationLeft = Math.round(
      screenX + (outerWidth / 2) - (this._width / 2)
    );
    const createData = {
      type: this._type,
      url: Common.PROMT_PAGE,
      width: this._width,
      height: this._height + 40,
      top: Math.max(notificationTop, 0),
      left: Math.max(notificationLeft, 0)
    };
    const lastPopups = await this._getPopup();

    if (lastPopups && lastPopups.length > 0) {
      for (let index = 0; index < lastPopups.length; index++) {
        const popup = lastPopups[index];

        Runtime.windows.remove(popup.id, console.error);
      }
    }

    try {
      Runtime.windows.create(createData as any, (tab) => this._id = tab.id);
    } catch (err) {
      console.error(err);
    }
  }

  private _getPopup(): Promise<chrome.windows.Window[]> {
    return new Promise((resolve) => {
      Runtime.windows.getAll({}, (tabs) => {
        const list = tabs.filter(tab => tab.type === this._type);
        resolve(list);
      })
    });
  }
}
