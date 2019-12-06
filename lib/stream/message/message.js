import extension from 'extensionizer'

import { TypeChecker } from 'lib/type'

import { messageErrors } from './errors'

export class Message {

  static signal(type) {
    return new Message({
      type,
      payload: {},
      domain: window.document.domain
    })
  }

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
