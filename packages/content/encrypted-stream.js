/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import uuidv4 from 'uuid/v4'

import {
  EncryptedStream,
  SecureMessage,
  Message,
  MTypeTab,
  MTypeSecure,
  MTypeInpage,
  MTypeBackground,
  TYPES
} from 'lib/stream'

import HTTPProvider from './provider'

let stream = new WeakMap()

export class SecureStream {

  get stream() {
    return stream
  }

  constructor() {
    stream = new EncryptedStream(MTypeSecure.CONTENT, uuidv4())
    stream.listenWith(msg => this.listener(msg))
    stream.onSync(() => this.onSyncAll())
  }

  _sync(message) {
    stream.key = message.handshake.length ? message.handshake : null
    stream.send({ type: TYPES.sync }, MTypeSecure.INJECTED)
    stream.synced = true
  }

  listener(msg) {
    if (!msg) {
      return null
    }

    msg.domain = window.document.domain

    switch (msg.type) {

    case MTypeInpage.INJECTED_INIT:
      this.onSyncAll()
      break
      
    case MTypeTab.CONNECT_APP:
      new Message(msg).send()
      break

    case MTypeTab.CALL_SIGN_TX:
      new Message(msg).send()
      break
        
    case MTypeTab.CONTENT_PROXY_MEHTOD:
      this.proxyMethod(msg.payload)
      break

    default:
      break
    }
  }

  async onSyncAll() {
    // Get the some data { address, net, nodeURL }.
    const recipient = MTypeSecure.INJECTED

    try {
      const data = await Message.signal(
        MTypeBackground.CONTENT_GET_WALLET_DATA
      ).send()

      new SecureMessage({
        type: MTypeInpage.INJECTED_INIT,
        payload: data
      }).send(stream, recipient)
    } catch(err) {
      console.error(err)
    }
  }

  async proxyMethod(payload) {
    // Proxyed some blockchain method.
    let result = {}
    const { params, method, uuid } = payload
    const recipient = MTypeSecure.INJECTED

    try {
      const { provider } = await Message.signal(
        MTypeBackground.CONTENT_GET_WALLET_DATA
      ).send()
      const httpProvider = new HTTPProvider(provider)

      result = await httpProvider.send(method, params)
    } catch(err) {
      result['error'] = err.message || err
    }

    result.uuid = uuid

    new SecureMessage({
      type: MTypeTab.CONTENT_PROXY_RESULT,
      payload: result
    }).send(stream, recipient)
  }

}