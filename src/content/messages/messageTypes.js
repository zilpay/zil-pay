// import { LocalStream } from 'extension-streams';


export const MTypesContent = {
  SET_NODE:        'set_node',      // Chenge new provider.
  SET_ADDRESS:     'set_address',   // Chenge address.
  INJECTED:        'inject_inpage', // Inpage script injected to page.
  PAY_OBJECT_INIT: 'init_obj',      // Init object for dapp.
  CONTENT_INIT:    'init_content',  // init content script to browser.
  SYNC:            'sync',
  BACKGROUND:      'background',
  ERROR:           'error'
};

export const MTypesAuth = {
  SET_PASSWORD:     'set_password',
  SET_SEED_AND_PWD: 'set_seed_and_pwd',
  LOG_OUT:          'log_out'
}

export const MTypesInternal = {
  INIT:                  'init',
  SET_NET:               'set_net',
  GET_NETWORK:           'get_network',
  GET_ADDRESS:           'get_address',
  GET_DECRYPT_SEED:      'get_d_seed',
  GET_ALL_TX:            'get_all_tx',
  UPDATE_BALANCE:        'update_balance',
  CHANGE_ACCOUNT:        'c_account',
  SIGN_SEND_TRANSACTION: 'sign_send_transaction',

  SET_ENCRYPT_SEED:      'set_seed',
  GET_ENCRYPT_SEED:      'get_seed',
  IS_UNLOCKED:           'is_unlocked',
  SET_PROMPT:            'set_prompt',
  GET_PROMPT:            'get_prompt',
  WAIT_SEND_TRANSACTION: 'wait_send_transaction',
  PASSWORD_HASH:         'password_hash'
};

export class Message {
  constructor (type = '', payload = '', resolver = '') {
    this.type = type;
    this.payload = payload;
    this.resolver = resolver;
  }
  static placeholder () {
    return new Message();
  }
  static fromJson (json) {
    return Object.assign(this.placeholder(), json);
  }
  static widthPayload (type, payload) {
    return new Message(type, payload);
  }
  static signal (type) {
    return new Message(type);
  }
  respond (payload) {
    return new Message(this.type, payload, this.resolver);
  }
  error (payload) {
    return new Message(MTypesContent.ERROR, payload, this.resolver);
  }
}

export class InternalMessage {
  constructor (type = '', payload = '') {
    this.type = type;
    this.payload = payload;
  }
  static placeholder () {
    return new InternalMessage();
  }
  static fromJson (json) {
    return Object.assign(this.placeholder(), json);
  }
  static widthPayload (type, payload) {
    return new InternalMessage(type, payload);
  }
  static signal (type) {
    return new InternalMessage(type);
  }
  send () {
    return new Promise((resolve, reject) => {
      try {
        window.chrome
              .runtime
              .sendMessage(this, (response) => resolve(response));
      } catch(err) {
        reject(err);
      }      
    });
  }
}

export class DanglingResolver {

  constructor (_id, _resolve, _reject) {
    this.id = _id
    this.resolve = _resolve
    this.reject = _reject
  }

}
