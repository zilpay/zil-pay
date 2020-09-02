import { v4 as uuid } from 'uuid'
import { Subject, from } from 'rxjs'
import { filter, take, map } from 'rxjs/operators'
import { TypeChecker } from 'lib/type'
import { ArgumentError } from 'lib/errors'
import { MUST_BE_INT, MUST_BE_OBJECT, MUST_BE_STRING } from 'lib/errors/annotations'

const { window } = global
const BRIDGE_URL = 'https://zilpay.github.io/ledger-bridge/'
// const BRIDGE_URL = 'https://127.0.0.1:8080'
const subjectStream = new Subject()
const TYPES = {
  init: 'ledger_bridge_ready',
  res: 'ledger_bridge_response',
  fail: 'ledger_bridge_reject',
  req: 'ledger_bridge_request'
}
const INS = [
  'getVersion',
  'getPublickKey',
  'getPublicAddress',
  'signHash',
  'signTxn'
]

export class LedgerControll {

  constructor() {
    this.isBridgeReady = false
    this.bridge = window.document.createElement('iframe')
    this.bridge.src = BRIDGE_URL

    window.document.head.appendChild(this.bridge)

    window.addEventListener(
      'message',
      msg => this._messageHandler(msg)
    )
  }

  getAddresses(index = 0) {
    return this.message(INS[2], index)
  }

  sendTransaction(index, txParams) {
    if (isNaN(index) || index < 0) {
      throw new ArgumentError('index', MUST_BE_INT)
    } else if (!txParams || !new TypeChecker(txParams).isObject) {
      throw new ArgumentError('txParams', MUST_BE_OBJECT)
    }

    return this.message(INS[4], index, txParams)
  }

  signMessage(index, message) {
    if (isNaN(index) || index < 0) {
      throw new ArgumentError('index', MUST_BE_INT)
    } else if (!message || !new TypeChecker(message).isString) {
      throw new ArgumentError('message', MUST_BE_STRING)
    }

    return this.message(INS[3], index, message)
  }

  async message(method, ...args) {
    if (!INS.includes(method)) {
      throw new ArgumentError(`Fail method: ${method}`)
    } else if (!this.isBridgeReady) {
      throw new Error('ledger-bridge is not loaded')
    }

    const msg = {
      method, args,
      uuid: uuid(),
      type: TYPES.req
    }

    this.bridge.contentWindow.postMessage(msg, '*')

    return from(subjectStream).pipe(
      filter(res => res.type === TYPES.res || res.uuid === msg.uuid),
      filter(res => res.method === method),
      map(res => {
        if (res.resolve) {
          return res.resolve
        } else if (res.reject) {
          throw res.reject
        }
      }),
      take(1)
    ).toPromise()
  }

  _messageHandler({ origin, data }) {
    if (!BRIDGE_URL.includes(origin)) {
      // throw new AccessError(`Does not match base-url: ${BRIDGE_URL}, origin: ${origin}`)
    } else if (!data || !new TypeChecker(data).isObject) {
      return null
    } else if (!Object.values(TYPES).includes(data.type)) {
      return null
    }

    switch (data.type) {
    case TYPES.init:
      this.isBridgeReady = data.resolve || data.reject
      break

    case TYPES.res:
      subjectStream.next(data)
      break

    default:
      break
    }
  }

}
