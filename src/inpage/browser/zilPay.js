import { EncryptedStream } from 'extension-streams'
import { Observable, Subject } from 'rxjs'
import { catchError } from 'rxjs/operators'
import uuidv4 from 'uuid/v4'
import { MTypesSecure, MTypesZilPay, MTypesTabs } from '../../lib/messages/messageTypes'
import { SecureMessage } from '../../lib/messages/messageCall'

import { Zilliqa } from '@zilliqa-js/zilliqa'
import * as zilUtils from '@zilliqa-js/util'
import { validation } from '@zilliqa-js/util'
import zilConf from '../../config/zil'


// create event for listing changer address. //
var onAddressListing = window.document.createEvent('Event');
var stream = new WeakMap(); // Setup background connection.
var subjectStream = new Subject(); // Create event listing.
var ACCOUNT = {}; // Account storage.
var PROVIDER = zilConf[Object.keys(zilConf)[0]]['PROVIDER']; // Network storage.


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

    ACCOUNT = msg.payload.account;
    PROVIDER = msg.payload.provider;
  }

  static onChangeNode(msg) {
    // Any change network.
    window.zilPay.setProvider(msg.payload.PROVIDER);
    PROVIDER = msg.payload.PROVIDER;
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

export class RedefinedZilliqa extends Zilliqa {
  /**
   * Override Zilliqa object for work with background.js
   * @param {provider}: String && url;
   */

  constructor(provider) {
    super(provider || PROVIDER);
    
    // Override some methods by Zilliqa. //
    [
      'addByKeystore',
      'addByMnemonic',
      'addByPrivateKey',
      'create',
      'export',
      'remove',
      'setDefault'
    ].forEach(method => {
      this.wallet.__proto__[method] = () => {
        throw new Error(`${method} is disable in ZilPay`);
      };
    });

    this.wallet.sign = (tx) => {
      // Override sign transaction method //
      if (!window.zilPay.isEnable) {
        throw new Error('ZilPay is disabled.');
      }

      tx.confirm = () => {
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
              reject(new Error(resultTx.reject));
            } else if (resultTx.resolve) {
              result.unsubscribe();
              resolve(
                Object.assign(tx, resultTx.resolve)
              );
            }
            setTimeout(() => {
              result.unsubscribe();
              reject(new Error('waiting time may have problems ZilPay'));
            }, 9000);
          });
        });
      }
      tx.provider.send = () => {
        // Override send to jsonRPC node.
        return { error: null, result: {} };
      };

      return tx;
    };
    this.wallet.signWith = (tx) => {
      return tx;
    };
    console.log('Zilliqa: init');
  }

}

export class ZilPay {
  /**
   * This object connecting background.js with inpage.js.
   * @param {provider}: String && url;
   */

  constructor(provider) {
    this.isEnable = false; // true: unblock or block.
    this.defaultAccount = null;
    this.utils = zilUtils;
    this.nodeURL = provider || PROVIDER; // default nodeURL.

    const type = MTypesSecure.PAY_OBJECT_INIT;
    const recipient = MTypesSecure.CONTENT;

    onAddressListing.initEvent('addressListing');
    new SecureMessage({ type, payload: {} }).send(stream, recipient);
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

    this.defaultAccount = account;
    dispatchEvent(onAddressListing);
  }

  setProvider(provider) {
    if (!provider || typeof provider !== 'string') {
      return null;
    }
    this.nodeURL = provider;
  }

}


export default function run() {
  // Create instance in page. //
  window.Zilliqa = RedefinedZilliqa;

  observableStream(
    MTypesSecure.INJECTED,
    MTypesSecure.CONTENT
  ).subscribe(msg => listener(msg));

  window.zilPay = new ZilPay();
}
