import { EncryptedStream } from 'extension-streams'
import uuidv4 from 'uuid/v4'
import { Message } from '../../lib/messages/message'
import { MTypesContent } from '../../content/messages/messageTypes'
import { Loger } from '../../lib/logger'
import utils from '../../lib/utils'

const log = new Loger('ZilPay inpage');

export class Stream extends Message {

  constructor() {
    super();
    this.stream = new WeakMap();
    this.resolvers = [];
  }

  subscribe() {
    this.stream.listenWith(msg => {
      if (!msg || !msg.hasOwnProperty('type')) {
        return false;
      }

      for (let i = 0; i < this.resolvers.length; i++) {
        if (this.resolvers[i].id === msg.resolver) {
          if (msg.type === 'error') {
            this.resolvers[i].reject(msg.payload);
          } else {
            this.resolvers[i].resolve(msg.payload);
          }
  
          this.resolvers = this.resolvers.slice(i, 1);
        }
      }
    });
  }

  _send(type, payload) {
    return new Promise((resolve, reject) => {
      const id = uuidv4();
      const message = this.messageWidthPayload({
        type, payload, id
      });
      
      this.resolvers.push(this.messageWidthPayload({ id, resolve, reject }));
      this.stream.send(message, MTypesContent.CONTENT_INIT);
    });
  }

  onEncryptedStream() {
    /**
     * Injecting an encrypted stream into the web application
     */
    this.stream = new EncryptedStream(MTypesContent.INJECTED, uuidv4());
    this.stream.listenWith(msg => this._listener(msg));
    this.stream.sync(MTypesContent.CONTENT_INIT, this.stream.key);
  }

  _listener(msg) {
    if (!msg) {
      return null;
    }

    msg.domain = utils.strippedHost();

    const nonSyncMessage = this.messageWidthPayload(msg);
    log.info('nonSyncMessage', nonSyncMessage);
  }

}