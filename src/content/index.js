import { EncryptedStream, LocalStream } from 'extension-streams'
import extensionizer from 'extensionizer'
import IdGenerator from '../lib/idGenerator'
import Message from '../lib/messages/message'
import InternalMessage from '../lib/messages/internalMessage'
import * as MessageTypes from '../lib/messages/messageTypes'
import * as InternalMessageTypes from '../lib/messages/internalMessageTypes'
import * as TabMessageTypes from '../lib/messages/tabsMessageTypes'
import Error from '../lib/errors/error'
import utils from '../lib/utils'


var stream = new WeakMap();
var isReady = false;

class Inject {
  constructor () {
    this._setEncryptedStream();
    this._injectInteractionScript();
    this._watchTabMessaging();
  }
  /**
   * init EncryptedStream
   * stream object is message fillter with content.js
   */
  _setEncryptedStream () {
    stream = new EncryptedStream(MessageTypes.CONTENT, IdGenerator.text(64));
    stream.listenWith(msg => this._contentListener(msg));
    stream.onSync(() => {
      this.initZilPay();
    });
  }
  /**
   * inject script file to document
   * @param {} scriptsrc
   */
  _injectscript (scriptsrc) {
    let injectionSite = (document.head || document.documentElement);
    let container = document.createElement('script');
  
    try {
      container.setAttribute('async', false);
      container.src = extensionizer.extension.getURL(scriptsrc);
      container.onload = function() {
          this.parentNode.removeChild(this);
      };
  
      injectionSite.insertBefore(
          container,
          injectionSite.children[0]
      );
    } catch (e) {
      console.error('ZilPay script injection failed', e);
    }
  }
  /***
   * Injecting the interaction script into the application.
   * This injects an encrypted stream into the application which will
   * sync up with the one here.
   */
  _injectInteractionScript () {
    this._injectscript('/inpage.js');
  }
  /**
   * watch internal message (LocalStream)
   * waiting message from background or popup
   */
  _watchTabMessaging () {
    LocalStream.watch((request, response) => {
      let message = InternalMessage.fromJson(request);
      this.dispenseMessage(response, message);
    });
  }
  /**
   * handler message by message type
   * @param message
   */
  dispenseMessage (_, message) {
    if (!message) {
      return null;
    }

    switch (message.type) {
      case TabMessageTypes.LOCK_STAUS:
        stream.send(
          Message.widthPayload(
            message.type, message.payload
          ),
          MessageTypes.INJECTED
        );
        if (message.payload.unlocked) {
          this.initZilPay();
        }
        break;
      case TabMessageTypes.ADDRESS_CHANGED: // TODO!
      case TabMessageTypes.NETWORK_CHANGED:
        stream.send(
          Message.widthPayload(
            message.type,
            message.payload
          ),
          MessageTypes.INJECTED
        );
        break;
      default:
        break;
    }
  }
  _contentListener (msg) {
    if (!isReady || !msg) {
      return null;
    }

    // Always including the domain for every request.
    msg.domain = utils.strippedHost();

    let nonSyncMessage = Message.fromJson(msg);

    if (!stream.synced && (!msg.hasOwnProperty('type') || msg.type !== 'sync')) {
      stream.send(
        nonSyncMessage.error(
          Error.maliciousEvent()
        ),
        MessageTypes.INJECTED
      );
      return null;
    }
    switch (msg.type) {
      case 'sync':
        this.sync(msg);
        break;
      case MessageTypes.SIGNATURE:
        this.signature(nonSyncMessage);
        break;
      default:
        stream.send(
          nonSyncMessage.error(
            Error.maliciousEvent()
          ),
          MessageTypes.INJECTED
        );
    }
  }
  respond (message, payload) {
    if (!isReady) {
      return null;
    }

    let response = (!payload || payload.hasOwnProperty('isError'))
        ? message.error(payload) : message.respond(payload);

    stream.send(response, MessageTypes.INJECTED);
  }
  sync (message) {
    stream.key = message.handshake.length ? message.handshake : null;
    stream.send({ type: 'sync' }, MessageTypes.INJECTED);
    stream.synced = true;
  }
  signature (message) {
    InternalMessage.widthPayload(InternalMessageTypes.SIGNATURE, message.payload)
                   .send()
                   .then(res => this.respond(message, res));
  }
  getAddress () {
    return InternalMessage.signal(InternalMessageTypes.GET_ADDRESS)
                          .send();
  }
  getNetwork () {
    return InternalMessage.signal(InternalMessageTypes.GET_NETWORK)
                          .send();
  }
  async initZilPay () {
    try {
      let address = '6c6c52645ca4750a1a64f5a10a123e58449bffa9';//await this.getAddress();
      // let currentNetwork = await this.getNetwork();
      let node = 'https://dev-api.zilliqa.com';

      stream.send(
        Message.widthPayload(
          MessageTypes.INIT_ZILLIQA,
          { address, node }
        ),
        MessageTypes.INJECTED
      );
      // Dispatching the loaded event to the web application.
      isReady = true;
    } catch (e) {
      console.log('ZilPay: INIT');
    }
  }
}

export default new Inject();
