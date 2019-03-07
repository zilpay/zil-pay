import { Zilliqa } from '@zilliqa-js/zilliqa'
import { EncryptedStream } from 'extension-streams'
import randomUUID from 'uuid/v4';
import ExtensionHttpProvider from '../lib/extensionHttpProvider'
import Message from '../lib/messages/message'
import * as MessageTypes from '../lib/messages/messageTypes'
import * as TabMessageTypes from '../lib/messages/tabsMessageTypes'
import utils from '../lib/utils'


class DanglingResolver {
  
  constructor (_id, _resolve, _reject) {
    this.id = _id
    this.resolve = _resolve
    this.reject = _reject
  }

}

const zilliqa = new Zilliqa(
  new ExtensionHttpProvider('http://placeholder.dev')
);

let stream = new WeakMap();
let resolvers = [];

const eventQueue = []

const _sign = zilliqa.wallet.sign.bind(zilliqa);
const _setAddress = zilliqa.wallet.defaultAccount;

const _subscribe = () => {
  stream.listenWith(msg => {
    if (!msg || !msg.hasOwnProperty('type')) return false
    for (let i = 0; i < resolvers.length; i++) {
      if (resolvers[i].id === msg.resolver) {
        if (msg.type === 'error') {
          resolvers[i].reject(msg.payload);
        } else {
          resolvers[i].resolve(msg.payload);
        }

        resolvers = resolvers.slice(i, 1);
      }
    }
  });
}

const _send = (_type, _payload) => {
  return new Promise((resolve, reject) => {
    let id = randomUUID;
    let message = new Message(_type, _payload, id);
    
    resolvers.push(new DanglingResolver(id, resolve, reject));
    stream.send(message, MessageTypes.CONTENT);
  })
}

const customSignFunction = (transaction = false, privateKey = false, callbackFunc = false) => {
  if (utils.isFunction(privateKey)) {
    callbackFunc = privateKey;
    privateKey = false;
  }
  if (!callbackFunc) {
    return utils.injectPromise(customSignFunction, transaction, privateKey);
  }
  if (privateKey) {
    return _sign(transaction, privateKey, callbackFunc)
  }
  if (!transaction) {
    return callbackFunc('ZilPay: Invalid transaction');
  }
  if (!zilPay.ready) {
    return callbackFunc('User has not unlocked ZilPay')
  }

  console.info('request signTransaction: ', transaction);

  _send(MessageTypes.SIGNATURE, {
    transaction,
    domain: utils.strippedHost()
  }).then(transaction => callbackFunc(null, transaction)).catch(err => {
    callbackFunc(err);
  });
}

zilliqa.wallet.sign = customSignFunction;
zilliqa.blockchain.createTransaction = customSignFunction;

export class ZilPay {
  constructor () {
    this.ready = false;
    this.zilliqa = false;
  }
}

const zilPay = new ZilPay();
zilPay.zilliqa = zilliqa;


class Content {
  constructor () {
    // Injecting an encrypted stream into the web application
    stream = new EncryptedStream(MessageTypes.INJECTED, randomUUID());
    stream.listenWith(msg => this.contentListener(msg));
    // Syncing the streams between the extension and the web application
    stream.sync(MessageTypes.CONTENT, stream.key);

    if (window.zilPay !== undefined) {
      return console.warn('Failed to inject ZilPay, The global namespace is exists')
    }
    
    window.zilPay = zilPay;
    window.zilliqa = zilliqa;

    _subscribe();
  }
  contentListener (msg) {
    if (!msg) {
      return null;
    }

    // Always including the domain for every request.
    msg.domain = utils.strippedHost();

    let nonSyncMessage = Message.fromJson(msg);

    switch (msg.type) {
      case MessageTypes.INIT_ZILLIQA:
        this.initZilliqa(nonSyncMessage);
        break;
      case MessageTypes.SET_NODE:
        this.setNode(nonSyncMessage);
        break;
      case MessageTypes.SET_ADDRESS:
        this.setAddress(nonSyncMessage);
        break;
      case TabMessageTypes.LOCK_STAUS:
        this.setlockStatus(nonSyncMessage);
        break;
      case TabMessageTypes.ADDRESS_CHANGED:
        this.setAddress(nonSyncMessage);
        break;
      case TabMessageTypes.NETWORK_CHANGED:
        this.setNetWork(nonSyncMessage);
        break;
    }
  }
  initZilliqa (message) {
    console.log('ZilPay init tronWeb');
    let payload = message.payload;

    this.setNode(message);

    if (payload.address) {
      _setAddress(payload.address);
      zilliqa.ready = true;
      zilliqa.ready = true;
    }

    eventQueue.forEach(({ resolve, reject, args, func }, index) => {
      func(...args)
        .then(resolve)
        .catch(reject)
        .then(() => console.log(`Event request #${index + 1} completed`));
    });
  }
  setNode (message) {
    let payload = message.payload;

    zilliqa.network.provider = new ExtensionHttpProvider(payload.node);
  }
  setAddress (message) {
    let payload = message.payload;

    _setAddress(payload.address);

    zilliqa.ready = true;
    zilliqa.ready = true;
  }
  setNetWork (message) {
    let payload = message.payload;

    console.info('zilPay network changed: ', payload.network);
  }
  setlockStatus (message) {
    let payload = message.payload;

    if (payload.unlocked) {
      console.info('zilPay is unlocked');
    } else {
      zilliqa.ready = true;
      zilliqa.ready = true;

      console.info('zilPay is locked');
    }
  }
}

export default new Content();