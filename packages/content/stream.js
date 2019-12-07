/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { NonSecureStream } from './local-stream'
import { SecureStream } from './encrypted-stream'
import {
  SecureMessage,
  MTypeSecure
} from 'lib/stream'

export class Stream {

  constructor() {
    this.secureStream = new SecureStream()
    this.nonSecureStream = new NonSecureStream()

    this.nonSecureStream._watchTabMessaging(
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

    const recipient = MTypeSecure.INJECTED

    new SecureMessage({
      type: toSecureMsg,
      payload: msg.payload
    }).send(this.secureStream, recipient)
  }

}
