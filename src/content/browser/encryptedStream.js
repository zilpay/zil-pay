import { EncryptedStream } from 'extension-streams'
import uuidv4 from 'uuid/v4'
import { MTypesSecure, MTypesZilPay, MTypesInternal } from '../../lib/messages/messageTypes'
import { SecureMessage, Message } from '../../lib/messages/messageCall'
import { Loger } from '../../lib/logger'
import apiConfig from '../../config/api'
import errors from '../../config/errors'


const log = new Loger(`${apiConfig.PAY_NAME}.SecureStream`);
var stream = new WeakMap();

export class SecureStream {

  get stream() {
    return stream;
  }

  constructor() {
    stream = new EncryptedStream(MTypesSecure.CONTENT, uuidv4());
    stream.listenWith(msg => this.listener(msg));
    stream.onSync(() => this.onSyncAll());
  }

  _sync(message) {
    stream.key = message.handshake.length ? message.handshake : null;
    stream.send({ type: 'sync' }, MTypesSecure.INJECTED);
    stream.synced = true;
  }


  listener(msg) {
    if (!msg) {
      return null;
    }

    switch (msg.type) {

      case MTypesSecure.PAY_OBJECT_INIT:
        this.onSyncAll();
        break;

      case MTypesZilPay.CALL_SIGN_TX:
        new Message(msg).send();
        break;

      case MTypesSecure.SYNC:
        this._sync(msg);
        break;

      default:
        break;
    }
  }

  async onSyncAll() {
    const recipient = MTypesSecure.INJECTED;

    try {
      const data = await Message.signal(MTypesZilPay.INIT_DATA).send();

      new SecureMessage({
        type: MTypesSecure.PAY_OBJECT_INIT,
        payload: data
      }).send(stream, recipient);
    } catch(err) {
      log.error(err.message, errors.ZILPAY_NOT_SYNC);
    }
  }

}