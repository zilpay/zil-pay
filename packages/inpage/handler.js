/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import uuidv4 from 'uuid/v4'
import { Subject } from 'rxjs'
import {
  MTypeInpage,
  MTypeSecure,
  SecureMessage,
  EncryptedStream
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
    const name = MTypeSecure.INJECTED

    this.stream = new EncryptedStream(name, uuidv4())
    this.stream.listenWith(msg => this.subjectStream.next(msg))
    this.stream.sync(MTypeSecure.CONTENT, this.stream.key)
  }

  stateUpdate() {
    const type = MTypeInpage.INJECTED_INIT
    const recipient = MTypeSecure.CONTENT

    new SecureMessage({ type, payload: {} })
      .send(this.stream, recipient)
  }
}
