/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { Subject } from 'rxjs'
import {
  MTypeTabContent,
  SecureMessage,
  MTypeTab,
  TabStream
} from 'lib/stream'

export default class Handler {

  constructor() {
    // Stream with content.js
    this.stream = null
    // Event listener.
    this.subjectStream = new Subject()

    this._init() // Init stream.
  }

  /**
   * Creating `instance observable` for listing event from content.
   */
  _init() {
    this.stream = new TabStream(MTypeTabContent.INJECTED)
    this.stream.listen().subscribe(msg => this.subjectStream.next(msg))
  }

  /**
   * When injected script was initialized
   * for wallet need some data about account and network.
   */
  initialized() {
    const type = MTypeTab.GET_WALLET_DATA
    const recipient = MTypeTabContent.CONTENT

    new SecureMessage({ type, payload: {} })
      .send(this.stream, recipient)
  }
}
