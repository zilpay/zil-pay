import { uuid } from 'uuidv4'
import { Subject, from } from 'rxjs'
import { filter, take, map } from 'rxjs/operators'

const BRIDGE_URL = 'https://zilpay.github.io/ledger-bridge/'
const subjectStream = new Subject() // Create event listing.
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
    this.bridge = global.document.createElement('iframe')
    this.bridge.src = BRIDGE_URL

    global.document.head.appendChild(this.bridge)

    global.addEventListener(
      'message',
      msg => this._messageHandler(msg)
    )
  }

  getAddresses(index = 0) {
    return this.message(INS[2], index)
  }

  sendTransaction(index, txParams) {
    if (isNaN(index) || index < 0) {
      throw new Error('index must be number')
    } else if (!txParams || typeof txParams !== 'object') {
      throw new Error('txParams must be object')
    }

    return this.message(INS[4], index, txParams)
  }

  async message(method, ...args) {
    if (!INS.includes(method)) {
      throw new Error(`Fail method: ${method}`)
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
      // throw new Error(`Does not match base-url: ${BRIDGE_URL}, origin: ${origin}`)
    } else if (!data || typeof data !== 'object') {
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
