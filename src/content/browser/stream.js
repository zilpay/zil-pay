import { EncryptedStream, LocalStream } from 'extension-streams'
import uuidv4 from 'uuid/v4'
import { Loger } from '../../lib/logger'
import Config from '../../config/api'
import {
  MTypesContent,
  Message,
  InternalMessage,
  MTypesInternal,
  MTypesPayCall,
  MTypesTabs
} from '../messages/messageTypes'


const log = new Loger(Config.PAY_NAME + ' CONTENT');

export class Stream {

  constructor() {
    this._setEncryptedStream();
    this._watchTabMessaging();
  }

  _watchTabMessaging() {
    LocalStream.watch((request, response) => {
      const message = InternalMessage.fromJson(request)
      this._dispenseMessage(response, message)
    });
  }

  _setEncryptedStream() {
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
      const network = await this.getNetwork();
      const node = network.PROVIDER;

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
    if (!msg) {
      return null;
    }

    switch (msg.type) {

      case MTypesPayCall.CALL_SIGN_TX:
        this.singTx(msg.payload);
        break;

      case MTypesContent.SYNC:
        this.sync(msg);
        break;

      default:
        break;
    }
  }

  _dispenseMessage(sendResponse, message) {
    if (!message) {
      return null;
    }

    switch (message.type) {

      case MTypesTabs.NETWORK_CHANGED:
        this._broadcast(MTypesContent.SET_NODE, message.payload);
        break;
      
      case MTypesTabs.ADDRESS_CHANGED:
        this._broadcast(MTypesContent.SET_ADDRESS, message.payload);
        break;

      case MTypesTabs.LOCK_STAUS:
        this._broadcast(MTypesContent.STATUS_UPDATE, message.payload);
        break;

      default:
        log.info('unknown method');
        break;

    }
    sendResponse(null);
  }

  getNetwork () {
    return InternalMessage.signal(MTypesInternal.GET_NETWORK).send();
  }

  getAddress() {
    return InternalMessage.signal(MTypesInternal.GET_ADDRESS).send();
  }

  singTx(payload) {
    return InternalMessage.widthPayload(
      MTypesPayCall.CALL_SIGN_TX,
      payload
    ).send();
  }

  _broadcast(type, payload) {
    this.stream.send(
      Message.widthPayload(
        type, payload
      ),
      MTypesContent.INJECTED
    );
  }


  sync(message) {
    this.stream.key = message.handshake.length ? message.handshake : null;
    this.stream.send({ type: 'sync' }, MTypesContent.INJECTED);
    this.stream.synced = true;
  }

}
