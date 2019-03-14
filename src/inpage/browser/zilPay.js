import { EncryptedStream } from 'extension-streams'
import { Observable, Subject } from 'rxjs'
import { catchError } from 'rxjs/operators'
import uuidv4 from 'uuid/v4'
import { MTypesSecure, MTypesZilPay } from '../../lib/messages/messageTypes'
import { SecureMessage } from '../../lib/messages/messageCall'

import { Zilliqa } from '@zilliqa-js/zilliqa'
import { HTTPProvider } from '@zilliqa-js/core'
import * as zilUtils from '@zilliqa-js/util'
import { validation } from '@zilliqa-js/util'
import zilConf from '../../config/zil'
import Config from '../../config/api'
import { Loger } from '../../lib/logger'

const log = new Loger(Config.PAY_NAME);

var onAddressListing = window.document.createEvent('Event');
var stream = new WeakMap();
var subjectStream = new Subject();
var ACCOUNT = {};
var PROVIDER = zilConf[Object.keys(zilConf)[0]]['PROVIDER'];


class Listen {
  static onZilPayInit(msg) {
    if (window.zilPay) {
      window.zilPay.isEnable = msg.payload.isEnable;
      window.zilPay.setDefaultAccount(msg.payload.account);
      window.zilPay.setProvider(msg.payload.PROVIDER);
    }
    
    ACCOUNT = msg.payload.account;
    PROVIDER = msg.payload.PROVIDER;
  }

  static onChangeNode(msg) {
    if (window.zilPay) {
      window.zilPay.setProvider(msg.payload.PROVIDER);
    }
  }

  static onChangeAccount(msg) {
    // subjectStream.next('work');
    if (window.zilPay) {
      window.zilPay.setDefaultAccount(msg.payload);
    }
  }

  static onChangeStatus(msg) {
    if (window.zilPay) {
      window.zilPay.isEnable = msg.payload.isEnable;
      window.zilPay.setDefaultAccount(ACCOUNT);
    }
  }
}

function listener(msg) {
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
    
    case MTypesZilPay.CONFIRM_RESULT:
      log.info(msg);
      break;

    default:
      break;
  }
}

function observableStream(name, syncWith) {
  return new Observable(subscriber => {
    stream = new EncryptedStream(name, uuidv4());
    stream.listenWith(msg => subscriber.next(msg));
    stream.sync(syncWith, stream.key);
  }).pipe(catchError(console.log));
}

export class RedefinedZilliqa extends Zilliqa {
  constructor(provider) {
    super(provider || PROVIDER);
    
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
      if (!window.zilPay.isEnable) {
        throw new Error('ZilPay is disabled.');
      }

      tx.confirm = () => {
        const type = MTypesZilPay.CALL_SIGN_TX;
        const recipient = MTypesSecure.CONTENT;
        let { payload } = tx;
        payload.uuid = uuidv4();
        new SecureMessage({ type, payload }).send(stream, recipient);

        return new Promise((resolve, reject) => {
          const result = subjectStream.subscribe(payload => {
            result.unsubscribe();
            resolve(payload);
          });
        });
      }
      tx.provider.send = () => {
        return { error: null, result: {} };
      };

      return tx;
    };
    this.wallet.signWith = (tx) => {
      return tx;
    };
    
  }

}

export class ZilPay extends HTTPProvider {

  constructor() {
    super(PROVIDER);
    this.isEnable = false;
    this.defaultAccount = null;
    this.utils = zilUtils;

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
    Object.assign(this, new HTTPProvider(provider))
  }

}


export default function run() {
  window.Zilliqa = RedefinedZilliqa;
  observableStream(
    MTypesSecure.INJECTED,
    MTypesSecure.CONTENT
  ).subscribe(msg => listener(msg));
  window.zilPay = new ZilPay();
}
