import uuid from 'uuid'
import { Subject } from 'rxjs'


const subjectStream = new Subject(); // Create event listing.
const BRIDGE_URL = 'https://localhost:8080';
const TYPES = {
  init: 'ledger_bridge_ready',
  res: 'ledger_bridge_response',
  fail: 'ledger_bridge_reject',
  req: 'ledger_bridge_request'
};
const INS = [
  'getVersion',
  'getAddress',
  'signTransaction',
  'signPersonalMessage',
  'getAppConfiguration'
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
    return this.message('getAddress', index);
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
          reject(data.reject);
        }
        
        result.unsubscribe();
      });
    });
  }

  _messageHandler({ origin, data }) {
    if (origin !== BRIDGE_URL) {
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
