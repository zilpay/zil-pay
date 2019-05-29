import { EncryptedStream } from 'extension-streams'
import { Observable, Subject } from 'rxjs'
import { catchError } from 'rxjs/operators'
import uuidv4 from 'uuid/v4'
import { MTypesSecure, MTypesZilPay, MTypesTabs } from '../../../lib/messages/messageTypes'
import { SecureMessage } from '../../../lib/messages/messageCall'

import { Blockchain } from '@zilliqa-js/blockchain'
import { TransactionFactory } from '@zilliqa-js/account'
import { Contracts } from '@zilliqa-js/contract';
import { HTTPProvider } from '@zilliqa-js/core';
import {
  decodeBase58, encodeBase58,
  fromBech32Address, toBech32Address,
  isValidChecksumAddress, toChecksumAddress
} from '@zilliqa-js/crypto';
import * as zilUtils from '@zilliqa-js/util'
import { validation } from '@zilliqa-js/util'
import zilConf from '../../../config/zil'


// create event for listing changer address. //
var onAddressListing = window.document.createEvent('Event');
var stream = new WeakMap(); // Setup background connection.
var subjectStream = new Subject(); // Create event listing.
var ACCOUNT = {}; // Account storage.
var PROVIDER = zilConf[Object.keys(zilConf)[0]]['PROVIDER']; // Network storage.
var NET = Object.keys(zilConf)[0];


function listener(msg) {
  /**
   * Distribute events by case.
   */
  if (!msg) {
    return null;
  }

  switch (msg.type) {
    
    case MTypesSecure.PAY_OBJECT_INIT:
      Listen.onZilPayInit(msg);
      break;

    case MTypesSecure.SET_NODE:
      Listen.onChangeNode(msg);
      break;
    
    case MTypesSecure.SET_ADDRESS:
      Listen.onChangeAccount(msg);
      break;
    
    case MTypesSecure.STATUS_UPDATE:
      Listen.onChangeStatus(msg);
      break;
    
    case MTypesTabs.TX_RESULT:
      subjectStream.next(msg.payload);
      break;

    case MTypesZilPay.PROXY_RESULT:
      subjectStream.next(msg.payload);
      break;

    default:
      break;
  }
}

function observableStream(name, syncWith) {
  // Create Observable with encrypted stream. //
  return new Observable(subscriber => {
    // Connetc to content.js //
    stream = new EncryptedStream(name, uuidv4());
    stream.listenWith(msg => subscriber.next(msg));
    stream.sync(syncWith, stream.key);
  }).pipe(catchError(console.log));
}

function confirm(tx) {
  // Create payload with random id(uuid). //        
  const type = MTypesZilPay.CALL_SIGN_TX;
  const recipient = MTypesSecure.CONTENT;
  let { payload } = tx;
  payload.uuid = uuidv4(); // Each transaction will assigning random uuid.
  new SecureMessage({ type, payload }).send(stream, recipient);

  return new Promise((resolve, reject) => {
    // Waiting response from background.js //
    const result = subjectStream.subscribe(resultTx => {

      if (resultTx.uuid !== payload.uuid) {
        return null;
      } else if (resultTx.reject) {
        result.unsubscribe();
        reject(resultTx.reject);
      } else if (resultTx.resolve) {
        result.unsubscribe();
        resolve(
          Object.assign(tx, resultTx.resolve)
        );
      }

      // Close stream by time.
      setTimeout(() => {
        result.unsubscribe();
        reject(new Error('waiting time may have problems ZilPay'));
      }, 9000);
    });
  });
}

HTTPProvider.prototype.send = (method, params) => {
  const type = MTypesZilPay.PROXY_MEHTOD;
  const recipient = MTypesSecure.CONTENT;
  const uuid = uuidv4();
  
  new SecureMessage({
    type, payload: { params, method, uuid }
  }).send(stream, recipient);

  return new Promise((resolve, reject) => {
    const proxy = subjectStream.subscribe(result => {

      if (!result.uuid || result.uuid !== uuid) {
        return null;
      } else if (result.error) {
        reject(result.error);
      } else {
        resolve(result);
      }

      proxy.unsubscribe();
    });

    // we save our memory RAM.
    setTimeout(() => proxy.unsubscribe(), 9000);
  });
}

class Listen {
  /**
   * Listen for handlers events from background.
   */

  static onZilPayInit(msg) {
    /**
     * when page was loaded, zilPay is injected.
     */
    window.zilPay.isEnable = msg.payload.isEnable;
    window.zilPay.setProvider(msg.payload.provider);
    window.zilPay.setDefaultAccount(msg.payload.account);
    window.zilPay.net = msg.payload.net;

    ACCOUNT = msg.payload.account;
    PROVIDER = msg.payload.provider;
  }

  static onChangeNode(msg) {
    // Any change network.
    window.zilPay.setProvider(msg.payload.provider);
    window.zilPay.net = msg.payload.net;
    PROVIDER = msg.payload.provider;
  }

  static onChangeAccount(msg) {
    // Any change account.
    window.zilPay.setDefaultAccount(msg.payload);
  }

  static onChangeStatus(msg) {
    // change status wallet.
    window.zilPay.isEnable = msg.payload.isEnable;
    window.zilPay.setDefaultAccount(ACCOUNT);
  }
}

class Zilliqa {
  constructor(node=PROVIDER, provider=new HTTPProvider(PROVIDER)) {
    this.provider = provider || new HTTPProvider(node);
    this.wallet = window.zilPay;
    this.blockchain = new Blockchain(this.provider, this.wallet);
    this.contracts = new Contracts(this.provider, this.wallet);
    this.transactions = new TransactionFactory(this.provider, this.wallet);
    this.utils = zilUtils;
    this.crypto = {
      decodeBase58, encodeBase58,
      fromBech32Address, toBech32Address,
      isValidChecksumAddress, toChecksumAddress
    }
  }
}

class ZilPay {
  /**
   * This object connecting background.js with inpage.js.
   * @param {provider}: String && url;
   */

  constructor(provider, net=NET) {
    this.isEnable = false; // true: unblock or block.
    this.defaultAccount = null;
    this.provider = provider;
    this.net = net;

    onAddressListing.initEvent('addressListing');
  }

  observableAccount() {
    return new Observable(subscriber => {
      addEventListener(
        'addressListing',
        () => subscriber.next(ACCOUNT),
        false
      );
    });
  }

  setDefaultAccount(account) {
    if (!this.isEnable || !account) {
      return null;
    }

    const isAddress = validation.isAddress(account.address);
    
    if (!isAddress) {
      throw new Error('input param is not address type');
    }
    this.defaultAccount = {
      base16: toChecksumAddress(account.address),
      base58: encodeBase58(account.address),
      bech32: toBech32Address(account.address)
    };
    dispatchEvent(onAddressListing);
  }

  setProvider(provider) {
    if (!provider || typeof provider !== 'string') {
      return null;
    }
    this.provider = new HTTPProvider(provider);
  }

  sign(tx) {
    if (!window.zilPay.isEnable) {
      throw new Error('ZilPay is disabled.');
    }
    tx.confirm = () => confirm(tx);
    tx.provider.send = () => {
      return { error: null, result: {} };
    };
    return tx;
  }

}


window.zilPay = new ZilPay(new HTTPProvider(PROVIDER));
window.Zilliqa = Zilliqa;


export default function run() {
  // Create instance in page. //
  
  const type = MTypesSecure.PAY_OBJECT_INIT;
  const recipient = MTypesSecure.CONTENT;

  observableStream(
    MTypesSecure.INJECTED,
    MTypesSecure.CONTENT
  ).subscribe(msg => listener(msg));

  new SecureMessage({ type, payload: {} }).send(stream, recipient);
}
