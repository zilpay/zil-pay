/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import { Runtime } from 'lib/runtime';

export class NotificationsControl {

  /**
   * Create text on icon bar-extensions of browser.
   * @param number - counter.
   */
  static counter(number: number) {
    Runtime.browserAction.setBadgeText({
      text: `${number === 0 ? '' : number}`
    });
  }

  readonly #url: string;
  readonly #title: string;
  readonly #message: string;

  constructor(url: string, title: string, message: string) {
    this.#url = url;
    this.#title = title;
    this.#message = message;
  }

  /**
   * Create popUp window for confirm transaction.
   */
  create() {
    try {
      const data: chrome.notifications.NotificationOptions<true> = {
        type: 'basic',
        title: this.#title,
        iconUrl: Runtime.extension.getURL('/icons/icon128.png'),
        message: this.#message
      };
      Runtime.notifications.create(this.#url, data);

      this._notificationClicked();
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * OS notification.
   */
  _notificationClicked() {
    if (!Runtime.notifications.onClicked.hasListener(this._viewOnViewBlock)) {
      Runtime.notifications.onClicked.addListener(this._viewOnViewBlock);
    }
  }

  /**
   * Action when click to OS notification.
   * @param url - url to viewblock block explore.
   */
  _viewOnViewBlock(url: string) {
    Runtime.tabs.create({ url });
  }

}