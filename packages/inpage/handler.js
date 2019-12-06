import { EncryptedStream } from 'extension-streams'
import uuidv4 from 'uuid/v4'
import { Subject } from 'rxjs'
import { MTypesSecure } from '../../lib/messages/messageTypes'
import { SecureMessage } from '../../lib/messages/messageCall'


export default class Handler {

  constructor() {
    // Stream with content.js
    this.stream = new WeakMap()
    // Event listener.
    this.subjectStream = new Subject()

    this._init() // Init stream.
  }

  _init() {
    const name = MTypesSecure.INJECTED

    this.stream = new EncryptedStream(name, uuidv4())
    this.stream.listenWith(msg => this.subjectStream.next(msg))
    this.stream.sync(MTypesSecure.CONTENT, this.stream.key)
  }

  stateUpdate() {
    const type = MTypesSecure.PAY_OBJECT_INIT
    const recipient = MTypesSecure.CONTENT

    new SecureMessage({ type, payload: {} }).send(this.stream, recipient)
  }
}