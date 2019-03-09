import { EncryptedStream, LocalStream } from 'extension-streams'
import uuidv4 from 'uuid/v4'
import { Loger } from '../../lib/logger'
import Config from '../../config/api'
import {
  MTypesContent,
  Message,
  InternalMessage,
  MTypesInternal
} from '../messages/messageTypes'


const log = new Loger(Config.PAY_NAME);

export class Stream {

  constructor() {
    this.stream = new WeakMap();
    this.isReady = false;
    this._initStream();
  }

  _initStream() {
    let content = MTypesContent.CONTENT_INIT;
    this.stream = new EncryptedStream(content, uuidv4());
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
        let message = InternalMessage.fromJson(req);
        this.dispenseMessage(res, message);
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

    this.stream.send(
      Message.widthPayload(
        MTypesContent.PAY_OBJECT_INIT,
        { address, node }
      ),
      MTypesContent.INJECTED
    );
    this.isReady = true;
  }

  _listener(msg) {
    if (!this.isReady || !msg) {
      return null;
    } else if (!msg.hasOwnProperty('type') || msg.type !== 'sync') {
      log.warn(`type: ${msg.type}, resync`);
    }

    let nonSyncMessage = Message.fromJson(msg);

    switch (msg.type) {
      case MTypesContent.SYNC:
        this.sync(msg);
        break;
      
      default:
      stream.send(
        nonSyncMessage.error(
          Error.maliciousEvent()
        ),
        MTypesContent.INJECTED
      );
    }
  }

  _dispenseMessage(res, message) {
    log.info('local stream', res, message);
    if (!message) {
      return null;
    }

    switch (message.type) {
      case MTypesInternal.IS_UNLOCKED:
        log.info(MTypesInternal.IS_UNLOCKED);
        break;
      
      case MTypesInternal.SET_ENCRYPT_SEED:
        log.info(MTypesInternal.SET_ENCRYPT_SEED);
        break;

      case MTypesInternal.GET_ENCRYPT_SEED:
        log.info(MTypesInternal.GET_ENCRYPT_SEED);
        break;

      case MTypesInternal.GET_ADDRESS:
        log.info(MTypesInternal.GET_ADDRESS);
        break;

    }
  }

  sync(message) {
    this.stream.key = message.handshake.length ? message.handshake : null;
    this.stream.send({ type: 'sync' }, MTypesContent.INJECTED);
    this.stream.synced = true;
  }

}
