import { LocalStream } from 'extension-streams'
import { MTypesSecure, MTypesTabs } from '../../lib/messages/messageTypes'
import { SecureMessage } from '../../lib/messages/messageCall'
import { Loger } from '../../lib/logger'
import apiConfig from '../../config/api'


const log = new Loger(`${apiConfig.PAY_NAME}.NonSecureStream`);

export class NonSecureStream {

  constructor(SecureStream) {
    this.secureStream = SecureStream;
    this._watchTabMessaging();
  }

  _watchTabMessaging() {
    LocalStream.watch((request, response) => {
      const message = new SecureMessage(request);
      this._dispenseMessage(response, message);
    });
  }


  _dispenseMessage(sendResponse, message) {
    if (!message) {
      return null;
    }

    this._broadcastToSecure(message);
    sendResponse(true);
  }


  _broadcastToSecure(msg) {
    let toSecureMsg = null;

    switch (msg.type) {

      case MTypesTabs.TX_RESULT:
        toSecureMsg = MTypesTabs.TX_RESULT;
        break;

      case MTypesTabs.LOCK_STAUS:
        toSecureMsg = MTypesSecure.STATUS_UPDATE;
        break;
      
      case MTypesTabs.ADDRESS_CHANGED:
        toSecureMsg = MTypesSecure.SET_ADDRESS;
        break;

      case MTypesTabs.NETWORK_CHANGED:
        toSecureMsg = MTypesSecure.SET_NODE;
        break;

      default:
        return null;
    }

    const recipient = MTypesSecure.INJECTED;
    
    new SecureMessage({
      type: toSecureMsg,
      payload: msg.payload
    }).send(this.secureStream, recipient);
  }

}