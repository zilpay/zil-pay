import uuidv4 from 'uuid/v4'
import { filter, take, map } from 'rxjs/operators'
import { from } from 'rxjs'
import {
  MTypesSecure,
  MTypesZilPay,
  MTypesTabs
} from '../../lib/messages/messageTypes'
import { SecureMessage } from '../../lib/messages/messageCall'
import { getFavicon, toAccountFormat } from './utils'

// Private variables. //
let _stream = new WeakMap(); // Stream instance.
let _subject = new WeakMap(); // Listener instance.
let _defaultAccount = null;
let _isConnect = false;
let _isEnable = false;
let _net = null;
let _broadcastingTransaction =false;
// Private variables. //


export default class Wallet {

  get isConnect() {
    return _isConnect;
  }

  get isEnable() {
    return _isEnable;
  }

  get net() {
    return _net;
  }

  get defaultAccount() {
    return _defaultAccount;
  }

  get broadcasting() {
    return _broadcastingTransaction;
  }

  set broadcasting(value) {
    if (typeof value !== 'boolean') {
      throw new Error('value must be boolean type');
    }
    _broadcastingTransaction = value;
  }

  constructor(subjectStream, stream) {
    _stream = stream;
    _subject = subjectStream;

    _subject.subscribe(msg => {
      switch (msg.type) {
        
        case MTypesSecure.STATUS_UPDATE:
          _isEnable = msg.payload.isEnable;
          break;

        case MTypesSecure.PAY_OBJECT_INIT:
          this._setDefaultAccount(msg.payload.account);
          _isEnable = msg.payload.isEnable;
          _isConnect = msg.payload.isConnect;
          _net = msg.payload.net;
          break;

        case MTypesSecure.SET_ADDRESS:
          this._setDefaultAccount(msg.payload);
          break;

        case MTypesSecure.SET_NODE:
          _net = msg.payload.net;
          break;

        default:
          break;
      }
    });
  }

  observableAccount() {
    /**
     * Subscribe on all account change.
     */
    if (!this.isConnect) {
      throw "ZilPay is't connection to dApp";
    }
    let lastAccount = null;
    return from(_subject).pipe(
      map(msg => {
        if (lastAccount === null) {
          return _defaultAccount;
        }
        switch (msg.type) {
          case MTypesSecure.PAY_OBJECT_INIT:
            return toAccountFormat(msg.payload.account.address);
          case MTypesSecure.SET_ADDRESS:
            return toAccountFormat(msg.payload.address);
        }
      }),
      filter(account => account && lastAccount !== account.base16),
      map(account => {
        lastAccount = account.base16
        return account;
      })
    );
  }

  observableNetwork() {
    /**
     * Subscribe on all network change.
     */
    return from(_subject).pipe(
      filter(msg => msg && msg.type === MTypesSecure.SET_NODE),
      map(msg => msg.payload.net)
    );
  }

  sign(tx) {
    /**
     * Call popup for confirm Transaction.
     */
    if (!this.isEnable) {
      throw "ZilPay is disabled.";
    } else if (!this.isConnect) {
      throw "User is't connections.";
    }

    const type = MTypesZilPay.CALL_SIGN_TX;
    const recipient = MTypesSecure.CONTENT;
    const uuid = uuidv4();
    let { payload } = tx;

    console.log(_broadcastingTransaction);
    
    // Transaction id.
    payload.uuid = uuid;
    // Current tab title.
    payload.title = window.document.title;
    // Url on favicon by current tab.
    payload.icon = getFavicon();
    // if true then ZilPay will not send to blockchain this tx.
    payload.isBroadcast = _broadcastingTransaction;

    // Send transaction to content.js > background.js.
    new SecureMessage({ type, payload }).send(_stream, recipient);

    tx.confirm = () => from(_subject).pipe(
      // Waiting an answer by uuid.
      filter(res => res.type === MTypesTabs.TX_RESULT),
      map(res => res.payload),
      filter(res => res.uuid && res.uuid === uuid),
      map(res => {
        if (res.reject) {
          throw res.reject;
        } else if (res.resolve) {
          return Object.assign(tx, res.resolve);
        }
      }),
      take(1)
    ).toPromise();

    return tx;
  }

  async connect() {
    /**
     * Call popup for the get access from user.
     * this method need for show user info such as your address.
     */
    const type = MTypesSecure.CONNECT;
    const recipient = MTypesSecure.CONTENT;
    const uuid = uuidv4();
    const title = window.document.title;
    const domain = window.document.domain;
    const icon = getFavicon();
    const payload = { title, domain, icon, uuid };

    if (this.isConnect) {
      return Promise.resolve(this.isConnect);
    }

    new SecureMessage({ type, payload }).send(_stream, recipient);

    const confirmPayload = await from(_subject).pipe(
      filter(msg => msg.type === MTypesTabs.CONNECT_TO_DAPP),
      map(res => res.payload),
      filter(res => res.uuid && res.uuid === uuid),
      take(1)
    ).toPromise();

    _isConnect = confirmPayload.isConfirm;
    this._setDefaultAccount(confirmPayload.account);

    return confirmPayload.isConfirm;
  }

  _setDefaultAccount(account) {
    if (!this.isEnable || !account || !this.isConnect) {
      return null;
    } else if (_defaultAccount && account.address === _defaultAccount.base16) {
      return _defaultAccount;
    }
      
    _defaultAccount = toAccountFormat(account.address);
  
    return _defaultAccount;
  }

}