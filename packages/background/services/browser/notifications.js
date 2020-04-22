/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { TypeChecker } from 'lib/type'

import extension from 'extensionizer'

export class NotificationsControl {

  /**
   * Create text on icon bar-extensions of browser.
   * @param {Number} number - counter.
   */
  static counter(number) {
    extension.browserAction.setBadgeText({
      text: `${number}`
    })
  }

  constructor({ url, title, message }) {
    if (!new TypeChecker(url, title, message).isString) {
      throw new Error(
        `url, title, message most be string.
        url: ${typeof url}, 
        title: ${typeof title}, 
        message: ${typeof message}`
      )
    }

    this.url = url
    this.title = title
    this.message = message
  }

  /**
   * Create popUp window for confirm transaction.
   */
  create() {
    const data = {
      type: 'basic',
      title: this.title,
      iconUrl: extension.extension.getURL('icons/icon128.png'),
      message: this.message
    }

    extension.notifications.create(this.url, data)

    this._notificationClicked()
  }

  /**
   * OS notification.
   */
  _notificationClicked() {
    if (!extension.notifications.onClicked.hasListener(this._viewOnViewBlock)) {
      extension.notifications.onClicked.addListener(this._viewOnViewBlock)
    }
  }

  /**
   * Action when click to OS notification.
   * @param {String} url - url to viewblock block explore.
   */
  _viewOnViewBlock(url) {
    extension.tabs.create({ url })
  }

}
