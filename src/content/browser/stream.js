import { EncryptedStream, LocalStream } from 'extension-streams'
import uuidv4 from 'uuid/v4'
import { Loger } from '../../lib/logger'
import Config from '../../config/api'
import { MTypesContent } from '../messages/messageTypes'
import { Message } from '../../lib/messages/message'

const log = new Loger(Config.PAY_NAME);

export class Stream extends Message {

  constructor() {
    super();
    this.stream = new WeakMap();
    this.isReady = false;
    this._initStream();
  }


  _initStream() {
    let initMsg = MTypesContent.CONTENT_INIT;
    this.stream = new EncryptedStream(initMsg, uuidv4());
    this.stream.listenWith(msg => this._listener(msg));
    this.stream.onSync(() => this._onSyncAll());
  }

  watchTabMessaging() {
    /**
     * watch internal message (LocalStream);
     * waiting message from background or popup.
     */
    try {
      LocalStream.watch((req, res) => {
        log.warn('LocalStream msg', req, res);
      });
    } catch(err) {
      log.error('Fail watch the LocalStream!', err);
    }
  }

  _onSyncAll() {
    /**
     * Get state from wallet.
     */
    const address = '6c6c52645ca4750a1a64f5a10a123e58449bffa9';
    const node = 'https://dev-api.zilliqa.com';
    const msg = this.messageWidthPayload({
      type: MTypesContent.PAY_OBJECT_INIT,
      payload: { address, node }
    });
    this.stream.send(msg, MTypesContent.INJECTED);
    this.isReady = true;
  }

  _listener(msg) {
    if (!this.isReady || !msg) {
      return null;
    } else if (!msg.hasOwnProperty('type') || msg.type !== 'sync') {
      log.warn(`type: ${msg.type}, resync`);
    }
  }

  _dispenseMessage(message) {
    if (!message) {
      return null;
    }

    // switch (message.type) { }
  }

}
