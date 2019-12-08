/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import config from '../../../../config/api'
import extension from 'extensionizer'

const { Promise, window } = global

export class PromptService {

  constructor() {
    // Height popup window.
    this._height = 600
    // Width popup window.
    this._width = 360
    this._type = 'popup'

    this.id
  }

  async open() {
    /**
     * Create new window popup for confirm tx and connection dApp.
     */
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
      url: config.PROMT_PAGE,
      width: this._width,
      height: this._height,
      top: Math.max(notificationTop, 0),
      left: Math.max(notificationLeft, 0),
    }
    const lastPopups = await this._getPopup()

    if (lastPopups && lastPopups.length > 0) {
      lastPopups.forEach(popup => {
        extension.windows.remove(popup.id, console.error)
      })
    }

    try {
      extension.windows.create(createData, tab => this.id = tab.id)
    } catch (err) {
      console.error(err)
    }
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
