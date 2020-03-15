/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import {
  TabStream,
  SecureMessage,
  Message,
  MTypeTab,
  MTypeTabContent,
} from 'lib/stream'

import HTTPProvider from './provider'

let stream = null

export class ContentTabStream {

  get stream() {
    return stream
  }

  constructor() {
    stream = new TabStream(MTypeTabContent.CONTENT)
    stream.listen().subscribe(msg => this.listener(msg))
  }

  listener(msg) {
    if (!msg) {
      return null
    }

    msg.domain = global.window.document.domain

    switch (msg.type) {

    case MTypeTab.GET_WALLET_DATA:
      this.onSyncAll()
      break

    case MTypeTab.ADDRESS_CHANGED:
      new Message(msg).send()
      break

    case MTypeTab.CONNECT_APP:
      new Message(msg).send()
      break

    case MTypeTab.CALL_TO_SIGN_TX:
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
    const recipient = MTypeTabContent.INJECTED

    try {
      const data = await Message.signal(
        MTypeTab.GET_WALLET_DATA
      ).send()

      new SecureMessage({
        type: MTypeTab.GET_WALLET_DATA,
        payload: data,
      }).send(stream, recipient)
    } catch (err) {
      console.error(err)
    }
  }

  async proxyMethod(payload) {
    // Proxyed some blockchain method.
    let result = {}
    const { params, method, uuid } = payload
    const recipient = MTypeTabContent.INJECTED

    try {
      const { provider } = await Message.signal(
        MTypeTab.GET_WALLET_DATA
      ).send()
      const httpProvider = new HTTPProvider(provider)

      result = await httpProvider.send(method, params)
    } catch (err) {
      result['error'] = err.message || err
    }

    result.uuid = uuid

    new SecureMessage({
      type: MTypeTab.CONTENT_PROXY_RESULT,
      payload: result,
    }).send(stream, recipient)
  }

}
