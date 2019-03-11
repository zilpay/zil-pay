import { EncryptedStream } from 'extension-streams'
import uuidv4 from 'uuid/v4'
import { MTypesContent, MTypesPayCall, Message } from '../../content/messages/messageTypes'
import utils from '../../lib/utils'
import { Loger } from '../../lib/logger'
import Config from '../../config/api'


const log = new Loger(Config.PAY_NAME);
var stream = new WeakMap();

export class Stream {

  constructor() {
    this.onEncryptedStream();
  }

  _send(_type, _payload) {
    const id = uuidv4();
    const message = new Message(_type, _payload, id);
    
    stream.send(message, MTypesContent.CONTENT_INIT);
  }

  signOverrided(...args) {
    const id = uuidv4();
    const message = new Message(MTypesPayCall.CALL_SIGN_TX, args[0], id);
    stream.send(message, MTypesContent.CONTENT_INIT);
    return null;
  }

  onEncryptedStream() {
    /**
     * Injecting an encrypted stream into the web application
     */
    stream = new EncryptedStream(MTypesContent.INJECTED, uuidv4());
    stream.listenWith(msg => this._listener(msg));
    stream.sync(MTypesContent.CONTENT_INIT, stream.key);
  }

  _listener(msg) {
    if (!msg) {
      return null;
    }

    msg.domain = utils.strippedHost();

    const tabMSG = Message.fromJson(msg);

    switch (msg.type) {
      case MTypesContent.PAY_OBJECT_INIT:
        window.ZilPay.setDefaultAccount(tabMSG.payload.address);
        window.ZilPay.setProvider(tabMSG.payload.node);
        log.info('INIT');
        break;

      case MTypesContent.SET_NODE:
        window.ZilPay.setProvider(tabMSG.payload.PROVIDER);
        break;
      
      case MTypesContent.SET_ADDRESS:
        window.ZilPay.setDefaultAccount(tabMSG.payload.address);
        break;
      
      case MTypesContent.STATUS_UPDATE:
        window.ZilPay.isReady = tabMSG.payload.isReady;
        window.ZilPay.isEnable = tabMSG.payload.isEnable;
        break;

      default:
        break;
    }
  }

}