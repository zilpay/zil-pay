import { EncryptedStream } from 'extension-streams'
import uuidv4 from 'uuid/v4'
import { Loger } from '../../lib/logger'
import Config from '../../config/api'
import {
  MTypesContent,
  Message,
  InternalMessage,
  MTypesInternal,
  MTypesAuth
} from '../messages/messageTypes'


const log = new Loger(Config.PAY_NAME + ' CONTENT');

export class Stream {

  constructor() {
    this.setEncryptedStream();
  }

  setEncryptedStream() {
    let content = MTypesContent.CONTENT_INIT;
    this.stream = new EncryptedStream(content, uuidv4());
    this.stream.listenWith(msg => this._listener(msg));
    this.stream.onSync(() => this._onSyncAll());
  }

  async _onSyncAll() {
    /**
     * Get state from wallet.
     */
    try {
      const address = await this.getAddress();
      const node = await this.getNetwork();
      
      log.info(address, node);

      if (!address || !node) {
        log.warn(
          `params is not by null or undefined, 
          address: ${address}, node: ${node}`
        );
        return null;
      }

      this.stream.send(
        Message.widthPayload(
          MTypesContent.PAY_OBJECT_INIT,
          { address, node }
        ),
        MTypesContent.INJECTED
      );
    } catch (err) {
      log.error('impossible to get address and node');
    }
  }

  _listener(msg) {
    log.info(msg);
    if (!msg) {
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
      this.stream.send(
        nonSyncMessage.error(
          Error.maliciousEvent()
        ),
        MTypesContent.INJECTED
      );
    }
  }

  getNetwork () {
    return InternalMessage.signal(MTypesInternal.GET_NETWORK).send();
  }

  getAddress() {
    return InternalMessage.signal(MTypesInternal.GET_ADDRESS).send();
  }

  sync(message) {
    this.stream.key = message.handshake.length ? message.handshake : null;
    this.stream.send({ type: 'sync' }, MTypesContent.INJECTED);
    this.stream.synced = true;
  }

}
