/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import extension from 'extensionizer'

import { TypeChecker } from 'lib/type'

import { messageErrors } from './errors'

/**
 * Message class can send payload or make signal message.
 * @example
 * import { Message } from 'lib/stream/message'
 * const msg = { type: '@example/type', payload: { test: 1} }
 * const message = new Message(msg)
 * message.send().then(() => / Do something... /)
 * or
 * Message.signal('@example/type').send().then(() => / Do something... /)
 */
export class Message {

  /**
   * Make just signal message.
   * @param {String} type - Message id.
   */
  static signal(type) {
    return new Message({
      type,
      payload: {},
      domain: window.document.domain
    })
  }

  /**
   * Recieve msg object.
   * @param {Object} msg - Message for send.
   */
  constructor(msg) {
    if (new TypeChecker(msg).isUndefined) {
      throw new Error(messageErrors.REQUIRED_MSG)
    } else if (!new TypeChecker(msg.type).isString) {
      throw new Error(
        `${messageErrors.MESSAGE_TYPE_ERR}, msg.type is ${typeof msg.type}.`
      )
    } else if (!new TypeChecker(msg.payload).isObject) {
      throw new Error(
        `${messageErrors.PAYLOAD_TYPE_ERR}, msg.payload is ${typeof msg.payload}.`
      )
    }

    for (const key in msg) {
      this[key] = msg[key]
    }
  }

  /**
   * Send MessageSelf object.
   */
  send() {
    return new Promise(resolve => {
      try {
        extension.runtime.sendMessage(this, resolve)
      } catch(err) {
        window.location.reload()
      }
    })
  }

}
