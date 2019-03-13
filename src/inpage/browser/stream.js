import { EncryptedStream } from 'extension-streams'
import uuidv4 from 'uuid/v4'
import { MTypesSecure, MTypesZilPay } from '../../lib/messages/messageTypes'
import { SecureMessage } from '../../lib/messages/messageCall'
import { Loger } from '../../lib/logger'
import Config from '../../config/api'


const log = new Loger(Config.PAY_NAME);
var stream = new WeakMap();

export class Stream {

  constructor() {
    this._setEncryptedStream();
  }

  signOverrided(nonSignatureTransaction) {
    log.info(nonSignatureTransaction);
    const type = MTypesZilPay.CALL_SIGN_TX;
    const recipient = MTypesSecure.CONTENT;
    let { payload } = nonSignatureTransaction;

    payload.uuid = uuidv4();
    
    new SecureMessage({ type, payload }).send(stream, recipient);

    return nonSignatureTransaction;
  }

  _setEncryptedStream() {
    stream = new EncryptedStream(MTypesSecure.INJECTED, uuidv4());
    stream.listenWith(msg => this.listener(msg));
    stream.sync(MTypesSecure.CONTENT, stream.key);
  }

  listener(msg) {
    if (!msg) {
      return null;
    }

    switch (msg.type) {
      case MTypesSecure.PAY_OBJECT_INIT:
        log.info(msg);
        window.ZilPay.setDefaultAccount(msg.payload.address);
        window.ZilPay.setProvider(msg.payload.PROVIDER);
        log.info('INIT');
        break;

      case MTypesSecure.SET_NODE:
        window.ZilPay.setProvider(msg.payload.PROVIDER);
        break;
      
      case MTypesSecure.SET_ADDRESS:
        window.ZilPay.setDefaultAccount(msg.payload.address);
        break;
      
      case MTypesSecure.STATUS_UPDATE:
        window.ZilPay.isReady = msg.payload.isReady;
        window.ZilPay.isEnable = msg.payload.isEnable;
        break;

      default:
        break;
    }
  }

}