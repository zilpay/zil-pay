/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { ContentBackgroundStream } from './local-stream'
import { ContentTabStream } from './tab-stream'
import {
  SecureMessage,
  MTypeTabContent
} from 'lib/stream'

export class Stream {

  constructor() {
    this.tabStream = new ContentTabStream()
    this.backgroundStream = new ContentBackgroundStream()

    this.backgroundStream._watchTabMessaging(
      (...args) => this._dispenseMessage(...args)
    )
  }

  _dispenseMessage(sendResponse, message) {
    if (!message) {
      return null
    }

    this._broadcastToSecure(message)

    sendResponse(true)
  }

  _broadcastToSecure(msg) {
    let toSecureMsg = msg.type

    const recipient = MTypeTabContent.INJECTED

    new SecureMessage({
      type: toSecureMsg,
      payload: msg.payload
    }).send(this.secureStream, recipient)
  }

}
