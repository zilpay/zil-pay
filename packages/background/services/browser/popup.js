/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { DEFAULT } from 'config'
import extension from 'extensionizer'

const { window, Promise } = global

export class PromptService {

  constructor() {
    // Height popup window.
    this._height = DEFAULT.POPUP_HEIGHT
    // Width popup window.
    this._width = DEFAULT.POPUP_WIDTH
    this._type = 'popup'
    this.id
  }

  /**
   * Create new window popup for confirm tx or connection dApp.
   */
  async open() {
    const {
      screenX,
      screenY,
      outerWidth,
      outerHeight
    } = window
    const notificationTop = Math.round(
      screenY + (outerHeight / 2) - (this._height / 2)
    )
    const notificationLeft = Math.round(
      screenX + (outerWidth / 2) - (this._width / 2)
    )
    const createData = {
      type: this._type,
      url: DEFAULT.PROMT_PAGE,
      width: this._width,
      height: this._height + 40,
      top: Math.max(notificationTop, 0),
      left: Math.max(notificationLeft, 0)
    }
    const lastPopups = await this._getPopup()

    if (lastPopups && lastPopups.length > 0) {
      for (let index = 0; index < lastPopups.length; index++) {
        const popup = lastPopups[index]

        extension.windows.remove(popup.id, console.error)
      }
    }

    try {
      extension.windows.create(createData, tab => this.id = tab.id)
    } catch (err) {
      console.error(err)
    }
  }

  openTab() {
    extension.tabs.create({ url: DEFAULT.PROMT_PAGE })
  }

  _getPopup() {
    return new Promise(resolve => {
      extension.windows.getAll({}, tabs => {
        resolve(
          tabs.filter(tab => tab.type === this._type)
        )
      })
    })
  }

}
