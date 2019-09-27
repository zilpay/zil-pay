import { EncryptedStream } from 'extension-streams'
import uuidv4 from 'uuid/v4'
import fetch from 'cross-fetch'
import { HTTPProvider, composeMiddleware } from '@zilliqa-js/core'

import { MTypesSecure, MTypesZilPay } from '../../../lib/messages/messageTypes'
import { SecureMessage, Message } from '../../../lib/messages/messageCall'

import { Loger } from '../../../lib/logger'
import apiConfig from '../../../config/api'
import errors from '../../../config/errors'

const DEFAULT_HEADERS = { 'Content-Type': 'application/json' };
const log = new Loger(`${apiConfig.PAY_NAME}.SecureStream`);
var stream = new WeakMap();


HTTPProvider.prototype.send = async function(method, ...params) {
  const [tReq, tRes] = this.getMiddleware(method);
  const reqMiddleware = composeMiddleware(...tReq);
  const resMiddleware = composeMiddleware(...tRes);

  const req = reqMiddleware(this.buildPayload(method, params));
  const response = await fetch(req.url, {
    method: 'POST',
    cache: 'no-cache',
    mode: 'cors',
    redirect: 'follow',
    body: JSON.stringify(req.payload),
    headers: {
      ...DEFAULT_HEADERS,
      ...((req.options && req.options.headers) || {}),
    }
  });
  const body = await response.json();
  const result = {
    ...body,
    req
  };

  return resMiddleware(result);
}

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

    msg.domain = window.document.domain;

    switch (msg.type) {

      case MTypesSecure.PAY_OBJECT_INIT:
        this.onSyncAll();
        break;
      
      case MTypesSecure.CONNECT:
        new Message(msg).send();
        break;

      case MTypesZilPay.CALL_SIGN_TX:
        new Message(msg).send();
        break;

      case MTypesSecure.SYNC:
        this._sync(msg);
        break;
        
      case MTypesZilPay.PROXY_MEHTOD:
        this.proxyMethod(msg.payload);
        break;

      default:
        break;
    }
  }

  async onSyncAll() {
    // Get the some data { address, net, nodeURL }.
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

  async proxyMethod(payload) {
    // Proxyed some blockchain method.
    let result = {};
    const { params, method, uuid } = payload;
    const recipient = MTypesSecure.INJECTED;

    try {
      const { provider } = await Message.signal(MTypesZilPay.INIT_DATA).send();    
      const httpProvider = new HTTPProvider(provider);

      result = await httpProvider.send(method, params);
    } catch(err) {
      result['error'] = err.message || err;
    }

    result.uuid = uuid;

    new SecureMessage({
      type: MTypesZilPay.PROXY_RESULT,
      payload: result
    }).send(stream, recipient);
  }

}