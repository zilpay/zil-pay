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
  MTypeInpage,
  MTypeSecure,
  SecureMessage,
  TabStream
} from 'lib/stream'

export default class Handler {

  constructor() {
    // Stream with content.js
    this.stream = new WeakMap()
    // Event listener.
    this.subjectStream = new Subject()

    this._init() // Init stream.
  }

  _init() {
    this.stream = new TabStream(MTypeSecure.INJECTED)
    this.stream.listen().subscribe(msg => console.log('INJECTED', msg))
  }

  stateUpdate() {
    const type = MTypeInpage.INJECTED_INIT
    const recipient = MTypeSecure.CONTENT

    new SecureMessage({ type, payload: {} })
      .send(this.stream, recipient)
  }
}
