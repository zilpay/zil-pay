import uuid from 'uuid'
import { Subject } from 'rxjs'


var BRIDGE_URL;

// if (process.env.NODE_ENV === 'development') {
  BRIDGE_URL = 'https://localhost:8080?debug=1';
// } else {
//   BRIDGE_URL = 'https://zilpay.xyz/ledger-bridge/';
// }

const subjectStream = new Subject(); // Create event listing.
const TYPES = {
  init: 'ledger_bridge_ready',
  res: 'ledger_bridge_response',
  fail: 'ledger_bridge_reject',
  req: 'ledger_bridge_request'
};
const INS = [
  'getVersion',
  'getPublickKey',
  'getPublicAddress',
  'signHash',
  'signTxn'
];

export default class LedgerControll {

  constructor() {
    this.isBridgeReady = false;
    this.bridge = window.document.createElement('iframe');
    this.bridge.src = BRIDGE_URL;

    window.document.head.appendChild(this.bridge);

    window.addEventListener(
      'message',
      msg => this._messageHandler(msg)
    );
  }

  getAddresses(index=0) {
    return this.message(INS[2], index);
  }

  sendTransaction(index, txParams) {
    if (isNaN(index) || index < 0) {
      throw new Error('index must be number');
    } else if (!txParams || typeof txParams !== 'object') {
      throw new Error('txParams must be object');
    }
    
    return this.message(INS[4], index, txParams);
  }

  message(method, ...args) {
    if (!INS.includes(method)) {
      throw new Error(`Fail method: ${method}`);
    } else if (!this.isBridgeReady) {
      throw new Error('ledger-bridge is not loaded');
    }

    const msg = {
      method, args,
      uuid: uuid(),
      type: TYPES.req
    };

    this.bridge.contentWindow.postMessage(msg, '*');

    return new Promise((resolve, reject) => {
      const result = subjectStream.subscribe(data => {
        if (data.type !== TYPES.res || data.uuid !== msg.uuid) {
          return null;
        } else if (data.method !== method) {
          return null;
        }

        if (data.resolve) {
          resolve(data.resolve);
        } else if (data.reject) {
          reject(new Error(data.reject));
        }
        
        result.unsubscribe();
      });
    });
  }

  _messageHandler({ origin, data }) {
    if (!BRIDGE_URL.includes(origin)) {
      throw new Error(`Does not match base-url: ${BRIDGE_URL}, origin: ${origin}`);
    } else if (!data || typeof data !== 'object') {
      return null;
    } else if (!Object.values(TYPES).includes(data.type)) {
      return null;
    }
    
    switch (data.type) {
      case TYPES.init:
        this.isBridgeReady = data.resolve || data.reject;
        break;

      case TYPES.res:
        subjectStream.next(data);
        break;
      
      default:
        break;
    }
  }

}
