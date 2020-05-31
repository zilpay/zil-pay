/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { fromEvent } from 'rxjs'
import { map } from 'rxjs/operators'
import { TypeChecker } from 'lib/type'
import { MUST_BE_OBJECT } from 'lib/errors/annotations'

const { document, CustomEvent } = global


// Helper methods for building and sending events.
/**
 * @param {String} encryptedData - Modifly data before dispatch.
 */
function _getEventInit(encryptedData) {
  return {
    detail: encryptedData
  }
}

/**
 * No modifly data
 * @param {String} encryptedData - No modifly data
 * @param {String} to - Event name.
 */
function _getEvent(encryptedData, to) {
  return new CustomEvent(to, _getEventInit(encryptedData))
}

function _dispatch(encryptedData, to) {
  document.dispatchEvent(_getEvent(encryptedData, to))
}

/**
 * Used for communication between a web page and an extension's content script.
 */
export class TabStream {

  /**
   * Creates a new TabStream.
   * @param {String} eventName - Event type.
   */
  constructor(eventName) {
    this._eventName = eventName
  }

  /**
   * Message listener that returns decrypted messages when synced
   */
  listen() {
    return fromEvent(document, this._eventName).pipe(
      map(event => JSON.parse(event.detail))
    )
  }

  /**
   * Message sender which encrypts messages and adds the sender.
   * @param {Object, Array, String} data - The payload to send.
   * @param {String} to - The stream to send messages to.
   */
  send(data, to) {
    if (!new TypeChecker(data).isObject) {
      throw new TypeError(`data ${MUST_BE_OBJECT}`)
    }

    data.from = this._eventName

    _dispatch(JSON.stringify(data), to)
  }
}
